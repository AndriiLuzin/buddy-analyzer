import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/audio";
import { Home, Check, RotateCcw, Settings, User, Share2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useStableConnection } from "@/hooks/useStableConnection";
import { GameShareModal } from "@/components/GameShareModal";

interface Game {
  id: string;
  code: string;
  player_count: number;
  current_word_id: string | null;
  current_player: number;
  showing_player: number;
  current_guesser: number;
  round: number;
  status: string;
}

const CrocodileGame = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [game, setGame] = useState<Game | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWord, setShowWord] = useState(false);
  const [playersJoined, setPlayersJoined] = useState(0);
  const [viewMode, setViewMode] = useState<'admin' | 'player'>('admin');
  const [showShareModal, setShowShareModal] = useState(false);

  const gameUrl = `${window.location.origin}/games/crocodile-play/${code}`;
  const adminIndex = game ? game.player_count - 1 : 0;
  const isAdminShowing = game ? game.showing_player === adminIndex : false;

  const fetchGame = useCallback(async () => {
    if (!code) return;

    const { data: gameData, error } = await supabase
      .from("crocodile_games")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error || !gameData) {
      toast.error(t('games.not_found'));
      navigate("/games");
      return;
    }

    setGame(gameData);

    if (gameData.current_word_id) {
      const { data: wordData } = await supabase
        .from("crocodile_words")
        .select("word")
        .eq("id", gameData.current_word_id)
        .single();
      setWord(wordData?.word || null);
    }

    const { count } = await supabase
      .from("crocodile_players")
      .select("*", { count: "exact", head: true })
      .eq("game_id", gameData.id);

    setPlayersJoined(count || 0);
    setIsLoading(false);
  }, [code, navigate, t]);

  // Stable connection with auto-reconnect
  useStableConnection({
    channelName: `crocodile-game-${code}`,
    onReconnect: fetchGame,
  });

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    if (!game) return;

    const channel = supabase
      .channel(`crocodile-updates-${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "crocodile_games",
          filter: `code=eq.${code}`,
        },
        async (payload) => {
          if (payload.new) {
            const newGame = payload.new as Game;
            setGame(newGame);

            if (newGame.current_word_id) {
              const { data: wordData } = await supabase
                .from("crocodile_words")
                .select("word")
                .eq("id", newGame.current_word_id)
                .single();
              setWord(wordData?.word || null);
              playNotificationSound();
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "crocodile_players",
        },
        async () => {
          if (!game) return;
          const { count } = await supabase
            .from("crocodile_players")
            .select("*", { count: "exact", head: true })
            .eq("game_id", game.id);
          setPlayersJoined(count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, game?.id]);

  const handleCorrectGuess = async () => {
    if (!game) return;

    try {
      const { data: words } = await supabase
        .from("crocodile_words")
        .select("id");

      if (!words?.length) throw new Error("No words");

      const randomWord = words[Math.floor(Math.random() * words.length)];
      const nextPlayer = (game.showing_player + 1) % game.player_count;

      await supabase
        .from("crocodile_games")
        .update({
          current_word_id: randomWord.id,
          showing_player: nextPlayer,
          round: game.round + 1,
        })
        .eq("id", game.id);

      setShowWord(false);
      playNotificationSound();
      toast.success(t('games.crocodile.word_guessed'));
    } catch (error) {
      toast.error(t('games.error'));
    }
  };

  const handleSkipWord = async () => {
    if (!game) return;

    try {
      const { data: words } = await supabase
        .from("crocodile_words")
        .select("id");

      if (!words?.length) throw new Error("No words");

      const randomWord = words[Math.floor(Math.random() * words.length)];

      await supabase
        .from("crocodile_games")
        .update({
          current_word_id: randomWord.id,
        })
        .eq("id", game.id);

      setShowWord(false);
      toast.info(t('games.crocodile.new_word'));
    } catch (error) {
      toast.error(t('games.error'));
    }
  };

  const startNewGame = async () => {
    if (!game) return;

    try {
      const { data: words } = await supabase
        .from("crocodile_words")
        .select("id");

      if (!words?.length) throw new Error("No words");

      const randomWord = words[Math.floor(Math.random() * words.length)];

      await supabase
        .from("crocodile_games")
        .update({
          current_word_id: randomWord.id,
          showing_player: 0,
          round: 1,
          status: "playing",
        })
        .eq("id", game.id);

      setShowWord(false);
      setViewMode('admin');
      toast.success(t('games.crocodile.new_game_started'));
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
              {t('games.crocodile.title')}
            </h1>
            <p className="text-muted-foreground text-sm">{t('games.round')}: {game.round}</p>
          </div>

          {isAdminShowing ? (
            <div className="text-center">
              <div className="p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30 mb-6">
                <p className="text-lg font-bold text-foreground">
                  {t('games.crocodile.your_turn')}
                </p>
              </div>

              {showWord ? (
                <div className="animate-scale-in mb-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    {t('games.crocodile.word_to_show')}
                  </p>
                  <h2 className="text-4xl font-bold text-foreground">{word}</h2>
                  <Button
                    onClick={() => setShowWord(false)}
                    variant="outline"
                    className="mt-6"
                  >
                    {t('games.hide')}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowWord(true)}
                  className="w-full h-14 text-lg font-bold uppercase tracking-wider mb-6"
                >
                  {t('games.crocodile.show_word')}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-secondary p-6 rounded-lg mb-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {t('games.crocodile.now_showing')}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {t('games.player')} #{game.showing_player + 1}
                </p>
              </div>
              <p className="text-muted-foreground text-sm">
                {t('games.crocodile.watch_and_guess')}
              </p>
            </div>
          )}
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
            {t('games.crocodile.title')}
          </h1>
          <p className="text-muted-foreground text-sm">{t('games.code')}: {code}</p>
          <p className="text-muted-foreground text-sm">{t('games.round')}: {game.round}</p>
          <p className="text-xs text-primary mt-2">
            {t('games.you')}: {t('games.player')} #{adminIndex + 1}
          </p>
        </div>

        <div className="bg-secondary p-6 rounded-lg mb-6 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {t('games.crocodile.now_showing')}
          </p>
          <p className="text-3xl font-bold text-foreground">
            {t('games.player')} #{game.showing_player + 1}
            {game.showing_player === adminIndex && (
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

        {showWord ? (
          <div className="text-center animate-scale-in mb-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              {t('games.crocodile.word_to_show')}
            </p>
            <h2 className="text-4xl font-bold text-foreground">{word}</h2>
            <Button
              onClick={() => setShowWord(false)}
              variant="outline"
              className="mt-6"
            >
              {t('games.hide')}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setShowWord(true)}
            variant="outline"
            className="w-full h-12 mb-6"
          >
            {t('games.crocodile.show_word')}
          </Button>
        )}

        <div className="flex gap-4 mb-6">
          <Button
            onClick={handleCorrectGuess}
            className="flex-1 h-12 font-bold"
            variant="default"
          >
            <Check className="w-5 h-5 mr-2" />
            {t('games.crocodile.guessed')}
          </Button>
          <Button
            onClick={handleSkipWord}
            className="flex-1 h-12 font-bold"
            variant="outline"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {t('games.crocodile.skip')}
          </Button>
        </div>

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
            {t('games.players')}: {playersJoined} / {game.player_count}
          </p>
        </div>

        <Button
          onClick={startNewGame}
          variant="outline"
          className="w-full h-12 font-bold uppercase tracking-wider"
        >
          {t('games.crocodile.start_over')}
        </Button>
      </div>

      <GameShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        gameCode={code || ''}
        gameName={t("games.crocodile.title")}
        gamePath="/games/crocodile-play"
      />
    </div>
  );
};

export default CrocodileGame;