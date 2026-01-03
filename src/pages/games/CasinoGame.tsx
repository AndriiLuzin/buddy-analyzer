import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/audio";
import { Home, RotateCcw, Eye, EyeOff, Settings, User, Share2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useStableConnection } from "@/hooks/useStableConnection";
import { GameShareModal } from "@/components/GameShareModal";

interface Game {
  id: string;
  code: string;
  player_count: number;
  current_combination: string[];
  guesser_index: number;
  current_round: number;
  guesses_in_round: number;
  status: string;
}

interface Player {
  id: string;
  player_index: number;
  symbol: string;
}

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "7️⃣", "🎰"];

const CasinoGame = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCombination, setShowCombination] = useState(false);
  const [showAllSymbols, setShowAllSymbols] = useState(false);
  const [viewMode, setViewMode] = useState<'admin' | 'player'>('admin');
  const [showMySymbol, setShowMySymbol] = useState(false);
  const [showOthers, setShowOthers] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const gameUrl = `${window.location.origin}/games/casino-play/${code}`;
  const adminIndex = game ? game.player_count - 1 : 0;
  const adminPlayer = players.find(p => p.player_index === adminIndex);
  const isAdminGuessing = game ? game.guesser_index === adminIndex : false;
  const otherPlayers = players.filter(p => p.player_index !== adminIndex);

  const fetchGame = useCallback(async () => {
    if (!code) return;

    const { data: gameData, error } = await supabase
      .from("casino_games")
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
      .from("casino_players")
      .select("*")
      .eq("game_id", gameData.id)
      .order("player_index", { ascending: true });

    setPlayers(playersData || []);
    setIsLoading(false);
  }, [code, navigate, t]);

  // Stable connection with auto-reconnect
  useStableConnection({
    channelName: `casino-game-${code}`,
    onReconnect: fetchGame,
  });

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    if (!game) return;

    const channel = supabase
      .channel(`casino-updates-${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "casino_games",
          filter: `code=eq.${code}`,
        },
        async (payload) => {
          if (payload.new) {
            setGame(payload.new as Game);
            playNotificationSound();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "casino_players",
        },
        async () => {
          if (!game) return;
          const { data: playersData } = await supabase
            .from("casino_players")
            .select("*")
            .eq("game_id", game.id)
            .order("player_index", { ascending: true });
          setPlayers(playersData || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, game?.id]);

  const nextGuesser = async () => {
    if (!game) return;

    const nextIndex = (game.guesser_index + 1) % game.player_count;
    const newGuessCount = game.guesses_in_round + 1;
    const newRound = newGuessCount >= game.player_count 
      ? game.current_round + 1 
      : game.current_round;
    const resetGuesses = newGuessCount >= game.player_count ? 0 : newGuessCount;

    await supabase
      .from("casino_games")
      .update({
        guesser_index: nextIndex,
        guesses_in_round: resetGuesses,
        current_round: newRound,
      })
      .eq("id", game.id);
  };

  const startNewGame = async () => {
    if (!game) return;

    try {
      const shuffledSymbols = [...SYMBOLS].sort(() => Math.random() - 0.5);
      const playerSymbols = Array.from({ length: game.player_count }, (_, i) =>
        shuffledSymbols[i % shuffledSymbols.length]
      );

      const combination = [
        playerSymbols[Math.floor(Math.random() * game.player_count)],
        playerSymbols[Math.floor(Math.random() * game.player_count)],
        playerSymbols[Math.floor(Math.random() * game.player_count)],
      ];

      for (let i = 0; i < players.length; i++) {
        await supabase
          .from("casino_players")
          .update({ symbol: playerSymbols[i] })
          .eq("id", players[i].id);
      }

      await supabase
        .from("casino_games")
        .update({
          current_combination: combination,
          guesser_index: 0,
          current_round: 1,
          guesses_in_round: 0,
        })
        .eq("id", game.id);

      setShowCombination(false);
      setShowAllSymbols(false);
      setShowMySymbol(false);
      setShowOthers(false);
      setViewMode('admin');
      toast.success(t('games.impostor.round_started'));
    } catch (error) {
      toast.error(t('games.error'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">{t('games.loading')}</div>
      </div>
    );
  }

  if (!game) return null;

  // Player view mode
  if (viewMode === 'player') {
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

        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {t('games.player')} #{adminIndex + 1}
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t('games.casino.title')}
            </h1>
            <p className="text-muted-foreground text-sm">{t('games.round')}: {game.current_round}</p>
          </div>

          {isAdminGuessing && (
            <div className="p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30 mb-6 text-center">
              <p className="text-lg font-bold text-foreground">
                {t('games.casino.your_turn')}
              </p>
            </div>
          )}

          <div className="bg-secondary p-6 rounded-lg mb-6 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {t('games.casino.now_guessing')}
            </p>
            <p className="text-3xl font-bold text-foreground">
              {t('games.player')} #{game.guesser_index + 1}
            </p>
          </div>

          <Button
            onClick={() => setShowMySymbol(!showMySymbol)}
            className="w-full h-12 mb-4"
          >
            {showMySymbol ? t('games.casino.hide_my_symbol') : t('games.casino.show_my_symbol')}
          </Button>

          {showMySymbol && adminPlayer && (
            <div className="text-center mb-6 animate-scale-in">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {t('games.casino.your_symbol')}
              </p>
              <p className="text-6xl">{adminPlayer.symbol}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {t('games.casino.dont_show')}
              </p>
            </div>
          )}

          <Button
            onClick={() => setShowOthers(!showOthers)}
            variant="outline"
            className="w-full h-12 mb-4"
          >
            {showOthers ? t('games.casino.hide_others') : t('games.casino.show_others')}
          </Button>

          {showOthers && (
            <div className="grid grid-cols-4 gap-2 mb-6 animate-fade-in">
              {otherPlayers.map((player) => (
                <div
                  key={player.id}
                  className="aspect-square flex flex-col items-center justify-center bg-secondary rounded-lg p-2"
                >
                  <span className="text-2xl">❓</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    #{player.player_index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p>{t('games.casino.combination_info')}</p>
            <p>{t('games.casino.can_repeat')}</p>
          </div>
        </div>
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
            {t('games.casino.title')}
          </h1>
          <p className="text-muted-foreground text-sm">{t('games.code')}: {code}</p>
          <p className="text-muted-foreground text-sm">{t('games.round')}: {game.current_round}</p>
          <p className="text-xs text-primary mt-2">
            {t('games.you')}: {t('games.player')} #{adminIndex + 1}
          </p>
        </div>

        <div className="bg-secondary p-6 rounded-lg mb-6 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {t('games.casino.now_guessing')}
          </p>
          <p className="text-3xl font-bold text-foreground">
            {t('games.player')} #{game.guesser_index + 1}
            {game.guesser_index === adminIndex && (
              <span className="text-lg text-primary ml-2">({t('games.you')})</span>
            )}
          </p>
        </div>

        <Button
          onClick={() => setViewMode('player')}
          className="w-full h-14 text-lg font-bold uppercase tracking-wider mb-6"
        >
          {t('games.show_my_role')}
        </Button>

        <Button
          onClick={() => setShowCombination(!showCombination)}
          variant="outline"
          className="w-full h-12 mb-4"
        >
          {showCombination ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
          {showCombination ? t('games.casino.hide_combination') : t('games.casino.show_combination')}
        </Button>

        {showCombination && (
          <div className="text-center mb-6 animate-scale-in">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              {t('games.casino.secret_combination')}
            </p>
            <div className="flex justify-center gap-4 text-5xl">
              {game.current_combination.map((symbol, i) => (
                <span key={i}>{symbol}</span>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => setShowAllSymbols(!showAllSymbols)}
          variant="outline"
          className="w-full h-12 mb-4"
        >
          {showAllSymbols ? t('games.casino.hide_symbols') : t('games.casino.show_symbols')}
        </Button>

        {showAllSymbols && (
          <div className="grid grid-cols-4 gap-2 mb-6 animate-fade-in">
            {players.map((player) => (
              <div
                key={player.id}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg p-2 ${
                  player.player_index === adminIndex
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-secondary"
                }`}
              >
                <span className="text-2xl">{player.symbol}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  #{player.player_index + 1}
                </span>
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
            className="h-12 px-6 font-bold mb-2"
          >
            <Share2 className="w-5 h-5 mr-2" />
            {t('games.share.invite')}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            {t('games.players')}: {players.length} / {game.player_count}
          </p>
        </div>

        <div className="flex gap-4 mb-4">
          <Button
            onClick={nextGuesser}
            className="flex-1 h-12 font-bold"
          >
            {t('games.casino.next')}
          </Button>
        </div>

        <Button
          onClick={startNewGame}
          variant="outline"
          className="w-full h-12 font-bold uppercase tracking-wider"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          {t('games.new_game')}
        </Button>
      </div>

      <GameShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        gameCode={code || ''}
        gameName={t("games.casino.title")}
        gamePath="/games/casino-play"
      />
    </div>
  );
};

export default CasinoGame;