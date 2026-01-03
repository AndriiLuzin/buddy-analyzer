import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/audio";
import { Home, Check, Eye, EyeOff, SkipForward, Settings, User, Share2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useStableConnection } from "@/hooks/useStableConnection";
import { GameShareModal } from "@/components/GameShareModal";

interface Game {
  id: string;
  code: string;
  player_count: number;
  guesser_index: number;
  status: string;
}

interface Player {
  id: string;
  player_index: number;
  character_id: string;
  guessed: boolean;
}

interface Character {
  id: string;
  name: string;
}

const WhoAmIGame = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [characters, setCharacters] = useState<Record<string, string>>({});
  const [views, setViews] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [guessedOrder, setGuessedOrder] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'admin' | 'player'>('admin');
  const [showGuesserCharacter, setShowGuesserCharacter] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const gameUrl = `${window.location.origin}/games/whoami-play/${code}`;
  const adminIndex = game ? game.player_count - 1 : 0;
  const adminPlayer = players.find(p => p.player_index === adminIndex);
  const isAdminGuesser = game ? game.guesser_index === adminIndex : false;
  const currentGuesser = game ? players.find(p => p.player_index === game.guesser_index) : null;
  const currentGuesserCharacter = currentGuesser ? characters[currentGuesser.character_id] : null;
  const allGuessed = players.every(p => p.guessed);

  const fetchGame = useCallback(async () => {
    if (!code) return;

    const { data: gameData, error } = await supabase
      .from("whoami_games")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error || !gameData) {
      toast.error(t('games.not_found'));
      navigate("/games");
      return;
    }

    setGame(gameData);

    const { data: playersData } = await supabase
      .from("whoami_players")
      .select("*")
      .eq("game_id", gameData.id)
      .order("player_index", { ascending: true });

    setPlayers(playersData || []);

    const charIds = playersData?.map((p) => p.character_id).filter(Boolean) || [];
    if (charIds.length > 0) {
      const { data: charsData } = await supabase
        .from("whoami_characters")
        .select("id, name")
        .in("id", charIds);

      const charMap: Record<string, string> = {};
      charsData?.forEach((c) => {
        charMap[c.id] = c.name;
      });
      setCharacters(charMap);
    }

    const { data: viewsData } = await supabase
      .from("whoami_views")
      .select("player_index")
      .eq("game_id", gameData.id);

    setViews(viewsData?.map((v) => v.player_index) || []);
    
    const guessed = playersData?.filter(p => p.guessed).map(p => p.player_index) || [];
    setGuessedOrder(guessed);
    
    setIsLoading(false);
  }, [code, navigate, t]);

  // Stable connection with auto-reconnect
  useStableConnection({
    channelName: `whoami-game-${code}`,
    onReconnect: fetchGame,
  });

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    if (!game) return;

    const channel = supabase
      .channel(`whoami-updates-${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "whoami_games",
          filter: `code=eq.${code}`,
        },
        async (payload) => {
          if (payload.new) {
            setGame(payload.new as Game);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "whoami_players",
        },
        async () => {
          if (!game) return;
          const { data: playersData } = await supabase
            .from("whoami_players")
            .select("*")
            .eq("game_id", game.id)
            .order("player_index", { ascending: true });
          setPlayers(playersData || []);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "whoami_views",
        },
        async () => {
          if (!game) return;
          const { data: viewsData } = await supabase
            .from("whoami_views")
            .select("player_index")
            .eq("game_id", game.id);
          setViews(viewsData?.map((v) => v.player_index) || []);
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, game?.id]);

  const markGuessedAndNextRound = async () => {
    if (!game) return;

    const guesser = players.find((p) => p.player_index === game.guesser_index);
    if (!guesser) return;

    await supabase
      .from("whoami_players")
      .update({ guessed: true })
      .eq("id", guesser.id);

    const newGuessedOrder = [...guessedOrder, game.guesser_index];
    setGuessedOrder(newGuessedOrder);

    const notGuessed = players
      .filter(p => !p.guessed && p.player_index !== game.guesser_index)
      .map(p => p.player_index);

    if (notGuessed.length === 0) {
      toast.success(t('games.whoami.game_complete'));
      return;
    }

    const nextGuesser = Math.min(...notGuessed);

    await supabase.from("whoami_views").delete().eq("game_id", game.id);

    await supabase
      .from("whoami_games")
      .update({ guesser_index: nextGuesser })
      .eq("id", game.id);

    setViews([]);
    setShowGuesserCharacter(false);
    toast.success(t('games.whoami.next_round'));
  };

  const startNewGame = async () => {
    if (!game) return;

    try {
      const { data: chars } = await supabase
        .from("whoami_characters")
        .select("id");

      if (!chars?.length) throw new Error("No characters");

      const shuffled = [...chars].sort(() => Math.random() - 0.5);
      const newGuesser = 0;

      await supabase.from("whoami_views").delete().eq("game_id", game.id);

      for (let i = 0; i < players.length; i++) {
        await supabase
          .from("whoami_players")
          .update({
            character_id: shuffled[i % shuffled.length].id,
            guessed: false,
          })
          .eq("id", players[i].id);
      }

      await supabase
        .from("whoami_games")
        .update({ guesser_index: newGuesser })
        .eq("id", game.id);

      setViews([]);
      setGuessedOrder([]);
      setViewMode('admin');
      setShowGuesserCharacter(false);
      toast.success(t('games.impostor.round_started'));
    } catch (error) {
      toast.error(t('games.error'));
    }
  };

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background overflow-hidden">
        <div className="text-muted-foreground">{t('games.loading')}</div>
      </div>
    );
  }

  if (!game) return null;

  // Player view mode
  if (viewMode === 'player') {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center p-6 bg-background relative overflow-y-auto">
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

        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {t('games.player')} #{adminIndex + 1}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t('games.whoami.title')}
            </h1>
          </div>

          {isAdminGuesser ? (
            <div className="text-center">
              <div className="p-6 rounded-lg bg-yellow-500/20 border border-yellow-500/30 mb-6">
                <p className="text-lg font-bold text-foreground">
                  {t('games.whoami.you_are_guessing')}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('games.whoami.ask_yes_no')}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                  {t('games.whoami.current_guesser')}
                </p>
                <p className="text-xl font-bold text-foreground">
                  {t('games.player')} #{game.guesser_index + 1}
                </p>
              </div>

              {showGuesserCharacter ? (
                <div className="animate-scale-in">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    {t('games.whoami.guesser_character')}
                  </p>
                  <h2 className="text-3xl font-bold text-foreground mb-6">
                    {currentGuesserCharacter || '—'}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    {t('games.whoami.help_guess')}
                  </p>
                  <Button
                    onClick={() => setShowGuesserCharacter(false)}
                    variant="outline"
                  >
                    {t('games.hide')}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowGuesserCharacter(true)}
                  className="h-14 px-8 text-lg font-bold uppercase tracking-wider"
                >
                  {t('games.whoami.view_character')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Admin panel view
  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-6 bg-background relative overflow-y-auto">
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
          onClick={() => setViewMode('player')}
        >
          <User className="w-5 h-5" />
        </Button>
      </div>

      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            {t('games.whoami.title')}
          </h1>
          <p className="text-muted-foreground text-sm">{t('games.code')}: {code}</p>
          <p className="text-muted-foreground text-sm">
            {views.length} / {game.player_count - 1} {t('games.whoami.viewed')}
          </p>
          <p className="text-xs text-primary mt-2">
            {t('games.you')}: {t('games.player')} #{adminIndex + 1}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            {t('games.whoami.current_guesser')}
          </p>
          <p className="text-xl font-bold text-foreground">
            {t('games.player')} #{game.guesser_index + 1}
          </p>
          {showAll && currentGuesserCharacter && (
            <p className="text-sm text-primary mt-1">
              {currentGuesserCharacter}
            </p>
          )}
        </div>

        <Button
          onClick={() => setViewMode('player')}
          className="w-full h-14 text-lg font-bold uppercase tracking-wider mb-4"
        >
          {t('games.show_my_role')}
        </Button>

        <Button
          onClick={() => setShowAll(!showAll)}
          variant="outline"
          className="w-full h-12 mb-4"
        >
          {showAll ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
          {showAll ? t('games.whoami.hide_characters') : t('games.whoami.show_all')}
        </Button>

        {showAll && (
          <div className="space-y-2 mb-6">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.guessed 
                    ? "bg-primary/20" 
                    : player.player_index === game.guesser_index
                    ? "bg-yellow-500/20 border border-yellow-500/30"
                    : player.player_index === adminIndex
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-secondary"
                }`}
              >
                <div>
                  <p className="font-bold text-foreground">
                    {t('games.player')} #{player.player_index + 1}
                    {player.player_index === adminIndex && (
                      <span className="ml-2 text-xs text-primary">({t('games.you')})</span>
                    )}
                    {player.player_index === game.guesser_index && (
                      <span className="ml-2 text-xs text-yellow-600">
                        ({t('games.whoami.guessing')})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {characters[player.character_id] || "—"}
                  </p>
                </div>
                {player.guessed && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-secondary p-6 flex items-center justify-center mb-6">
          <QRCodeSVG
            value={gameUrl}
            size={180}
            bgColor="transparent"
            fgColor="hsl(var(--foreground))"
            level="M"
          />
        </div>

        <div className="text-center mb-6">
          <Button 
            onClick={() => setShowShareModal(true)}
            className="h-12 px-6 font-bold"
          >
            <Share2 className="w-5 h-5 mr-2" />
            {t('games.share.invite')}
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-8">
          {Array.from({ length: game.player_count }).map((_, i) => {
            const hasViewed = views.includes(i);
            const player = players.find((p) => p.player_index === i);
            const hasGuessed = player?.guessed;
            const isCurrentGuesser = i === game.guesser_index;
            const isAdmin = i === adminIndex;
            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center text-sm font-bold transition-colors ${
                  hasGuessed
                    ? "bg-primary text-primary-foreground"
                    : isCurrentGuesser
                    ? "bg-yellow-500 text-yellow-950"
                    : isAdmin
                    ? "bg-primary/60 text-primary-foreground"
                    : hasViewed
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {!allGuessed ? (
          <Button
            onClick={markGuessedAndNextRound}
            className="w-full h-12 font-bold uppercase tracking-wider mb-3"
          >
            <SkipForward className="w-5 h-5 mr-2" />
            {t('games.whoami.player_guessed_next')}
          </Button>
        ) : (
          <div className="p-4 rounded-lg bg-primary/20 text-center mb-3">
            <p className="font-bold text-foreground">{t('games.whoami.all_guessed')}</p>
          </div>
        )}

        <Button
          onClick={startNewGame}
          variant="outline"
          className="w-full h-12 font-bold uppercase tracking-wider"
        >
          {t('games.new_game')}
        </Button>
      </div>

      <GameShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        gameCode={code || ''}
        gameName={t("games.whoami.title")}
        gamePath="/games/whoami-play"
      />
    </div>
  );
};

export default WhoAmIGame;