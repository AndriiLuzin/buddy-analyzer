import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Home, Settings, User, Share2 } from "lucide-react";
import { playNotificationSound } from "@/lib/audio";
import { useLanguage } from "@/i18n/LanguageContext";
import { useStableConnection } from "@/hooks/useStableConnection";
import { GameShareModal } from "@/components/GameShareModal";

interface MafiaGame {
  id: string;
  code: string;
  player_count: number;
  mafia_count: number;
  status: string;
}

interface MafiaPlayer {
  id: string;
  player_index: number;
  role: string;
  viewed_at: string | null;
}

const MafiaGame = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [game, setGame] = useState<MafiaGame | null>(null);
  const [players, setPlayers] = useState<MafiaPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showMyRole, setShowMyRole] = useState(false);
  const [viewMode, setViewMode] = useState<'admin' | 'player'>('admin');
  const [showShareModal, setShowShareModal] = useState(false);

  const adminIndex = game ? game.player_count - 1 : 0;
  const adminPlayer = players.find((p) => p.player_index === adminIndex);
  const isAdminMafia = adminPlayer?.role === "mafia";
  const mafiaPlayers = players.filter((p) => p.role === "mafia");
  const viewedCount = players.filter((p) => p.viewed_at).length;
  const allViewed = game ? viewedCount >= game.player_count : false;

  const fetchGame = useCallback(async () => {
    if (!code) return;

    const { data: gameData, error: gameError } = await supabase
      .from("mafia_games")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (gameError || !gameData) {
      toast.error(t('games.not_found'));
      navigate("/games");
      return;
    }

    setGame(gameData);

    const { data: playersData } = await supabase
      .from("mafia_players")
      .select("*")
      .eq("game_id", gameData.id)
      .order("player_index", { ascending: true });

    if (playersData) {
      setPlayers(playersData);

      const adminIdx = gameData.player_count - 1;
      const adminP = playersData.find((p) => p.player_index === adminIdx);

      if (adminP && !adminP.viewed_at) {
        await supabase
          .from("mafia_players")
          .update({ viewed_at: new Date().toISOString() })
          .eq("id", adminP.id);

        const { data: updatedPlayers } = await supabase
          .from("mafia_players")
          .select("*")
          .eq("game_id", gameData.id)
          .order("player_index", { ascending: true });

        if (updatedPlayers) {
          setPlayers(updatedPlayers);

          const viewedCnt = updatedPlayers.filter((p) => p.viewed_at).length;
          if (viewedCnt >= gameData.player_count) {
            setIsRevealed(true);
            playNotificationSound();
          }
        }
      } else {
        const viewedCnt = playersData.filter((p) => p.viewed_at).length;
        if (viewedCnt >= gameData.player_count) {
          setIsRevealed(true);
        }
      }
    }

    setLoading(false);
  }, [code, navigate, t]);

  // Stable connection with auto-reconnect
  useStableConnection({
    channelName: `mafia-game-${code}`,
    onReconnect: fetchGame,
  });

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    if (!game) return;

    const channel = supabase
      .channel("mafia-players")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mafia_players",
          filter: `game_id=eq.${game.id}`,
        },
        (payload) => {
          setPlayers((prev) =>
            prev.map((p) =>
              p.id === payload.new.id ? (payload.new as MafiaPlayer) : p
            )
          );
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game]);

  useEffect(() => {
    if (game && viewedCount >= game.player_count && !isRevealed) {
      setIsRevealed(true);
      playNotificationSound();
    }
  }, [players, game, isRevealed, viewedCount]);

  const startNewGame = async () => {
    if (!game) return;

    try {
      const { error: resetError } = await supabase
        .from("mafia_players")
        .delete()
        .eq("game_id", game.id);

      if (resetError) throw resetError;

      const roles: string[] = [];
      for (let i = 0; i < game.mafia_count; i++) {
        roles.push("mafia");
      }
      for (let i = 0; i < game.player_count - game.mafia_count; i++) {
        roles.push("civilian");
      }

      const shuffled = [...roles].sort(() => Math.random() - 0.5);

      const newPlayers = shuffled.map((role, index) => ({
        game_id: game.id,
        player_index: index,
        role,
      }));

      const { error: insertError } = await supabase
        .from("mafia_players")
        .insert(newPlayers);

      if (insertError) throw insertError;

      const { data: playersData } = await supabase
        .from("mafia_players")
        .select("*")
        .eq("game_id", game.id)
        .order("player_index", { ascending: true });

      if (playersData) {
        setPlayers(playersData);
      }

      setIsRevealed(false);
      setShowMyRole(false);
      setViewMode('admin');
      toast.success(t('games.impostor.round_started'));
    } catch (error) {
      console.error(error);
      toast.error(t('games.mafia.round_error'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">{t('games.loading')}</p>
      </div>
    );
  }

  if (!game) return null;

  const playerUrl = `${window.location.origin}/games/mafia-play/${code}`;

  // Player view (after all viewed or when toggled)
  if (viewMode === 'player' && allViewed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative">
        <div className="absolute top-4 left-4 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/games")}
          >
            <Home className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode('admin')}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {showMyRole ? (
          <div className="text-center animate-scale-in">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {t('games.player')} #{adminIndex + 1}
            </p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              {t('games.mafia.your_role')}
            </p>
            <h1 className="text-4xl font-bold text-foreground">
              {isAdminMafia ? t('games.mafia.mafia') : t('games.mafia.civilian')}
            </h1>
            <p className="text-muted-foreground text-sm mt-6">
              {isAdminMafia ? (
                <>
                  {t('games.mafia.you_know_team')}
                  <br />
                  {t('games.mafia.kill_civilians')}
                </>
              ) : (
                <>
                  {t('games.mafia.find_mafia')}
                  <br />
                  {t('games.mafia.dont_be_fooled')}
                </>
              )}
            </p>

            {isAdminMafia && (
              <div className="mt-6 p-4 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">
                  {t('games.mafia.your_team')}:
                </p>
                <p className="text-sm font-medium">
                  {mafiaPlayers.map((p) => `${t('games.player')} #${p.player_index + 1}`).join(", ")}
                </p>
              </div>
            )}

            <Button
              onClick={() => setShowMyRole(false)}
              variant="outline"
              className="mt-8"
            >
              {t('games.hide')}
            </Button>
          </div>
        ) : (
          <div className="text-center animate-fade-in">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              {t('games.player')} #{adminIndex + 1}
            </p>
            <Button
              onClick={() => setShowMyRole(true)}
              className="h-20 px-12 text-xl font-bold uppercase tracking-wider"
            >
              {t('games.show_role')}
            </Button>
            <p className="text-xs text-muted-foreground mt-6">
              {t('games.dont_show_screen')}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Admin panel view
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative">
      <div className="absolute top-4 left-4 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/games")}
        >
          <Home className="w-5 h-5" />
        </Button>
        {allViewed && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode('player')}
          >
            <User className="w-5 h-5" />
          </Button>
        )}
      </div>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            {t('games.mafia.title')} {code}
          </h1>
          <p className="text-muted-foreground text-sm">
            {viewedCount} / {game.player_count} {t('games.players_viewed')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('games.mafia.mafia_count')}: {game.mafia_count} | {t('games.mafia.civilians_count')}: {game.player_count - game.mafia_count}
          </p>
          <p className="text-xs text-primary mt-2">
            {t('games.you')}: {t('games.player')} #{adminIndex + 1}
          </p>
        </div>

        {allViewed && (
          <Button
            onClick={() => setViewMode('player')}
            className="w-full h-14 text-lg font-bold uppercase tracking-wider mb-6"
          >
            {t('games.show_my_role')}
          </Button>
        )}

        <div className="bg-secondary p-6 flex items-center justify-center mb-6">
          <QRCodeSVG
            value={playerUrl}
            size={200}
            bgColor="transparent"
            fgColor="hsl(var(--foreground))"
            level="M"
          />
        </div>

        <div className="text-center mb-8">
          <Button 
            onClick={() => setShowShareModal(true)}
            className="h-12 px-6 font-bold"
          >
            <Share2 className="w-5 h-5 mr-2" />
            {t('games.share.invite')}
          </Button>
        </div>

        {!allViewed && (
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground">
              {t('games.waiting_players')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 mb-8">
          {players.map((player) => (
            <div
              key={player.id}
              className={`aspect-square flex items-center justify-center text-sm font-bold transition-colors ${
                player.viewed_at
                  ? player.player_index === adminIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {player.player_index + 1}
            </div>
          ))}
        </div>

        <Button
          onClick={startNewGame}
          variant="outline"
          className="w-full h-12 font-bold uppercase tracking-wider"
        >
          {t('games.new_round')}
        </Button>

        <Button
          onClick={() => navigate("/games")}
          variant="ghost"
          className="w-full mt-4 text-muted-foreground"
        >
          {t('games.new_game')}
        </Button>
      </div>

      <GameShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        gameCode={code || ''}
        gameName={t("games.mafia.title")}
        gamePath="/games/mafia-play"
      />
    </div>
  );
};

export default MafiaGame;