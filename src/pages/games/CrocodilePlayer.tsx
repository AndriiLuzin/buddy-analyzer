import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/audio";
import { Home } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useStableConnection } from "@/hooks/useStableConnection";

interface Game {
  id: string;
  code: string;
  player_count: number;
  current_word_id: string | null;
  showing_player: number;
  round: number;
  status: string;
}

const CrocodilePlayer = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [game, setGame] = useState<Game | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWord, setShowWord] = useState(false);

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

    const { data: players } = await supabase
      .from("crocodile_players")
      .select("player_index")
      .eq("game_id", gameData.id)
      .order("player_index", { ascending: true });

    const existingIndices = new Set(players?.map((p) => p.player_index) || []);
    let nextIndex = 0;
    while (existingIndices.has(nextIndex) && nextIndex < gameData.player_count) {
      nextIndex++;
    }

    if (nextIndex >= gameData.player_count) {
      nextIndex = players?.length || 0;
    }

    const storedIndex = localStorage.getItem(`crocodile-${gameData.id}`);
    if (storedIndex) {
      setPlayerIndex(parseInt(storedIndex));
    } else {
      const { error: joinError } = await supabase
        .from("crocodile_players")
        .insert({
          game_id: gameData.id,
          player_index: nextIndex,
        });

      if (!joinError) {
        localStorage.setItem(`crocodile-${gameData.id}`, nextIndex.toString());
        setPlayerIndex(nextIndex);
      }
    }

    if (gameData.current_word_id) {
      const { data: wordData } = await supabase
        .from("crocodile_words")
        .select("word")
        .eq("id", gameData.current_word_id)
        .single();
      setWord(wordData?.word || null);
    }

    setIsLoading(false);
  }, [code, navigate, t]);

  // Stable connection with auto-reconnect
  useStableConnection({
    channelName: `crocodile-player-${code}`,
    onReconnect: fetchGame,
  });

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    if (!game) return;

    const channel = supabase
      .channel(`crocodile-player-updates-${code}`)
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
              setShowWord(false);
              playNotificationSound();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, game?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">{t('games.loading')}</div>
      </div>
    );
  }

  if (!game || playerIndex === null) return null;

  const isShowing = game.showing_player === playerIndex;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/games")}
        className="absolute top-4 left-4"
      >
        <Home className="w-5 h-5" />
      </Button>

      <div className="w-full max-w-sm animate-fade-in text-center">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {t('games.you')}
          </p>
          <h1 className="text-4xl font-bold text-foreground">
            {t('games.player')} #{playerIndex + 1}
          </h1>
        </div>

        <div className="bg-secondary p-6 rounded-lg mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {t('games.round')} {game.round}
          </p>
          <p className="text-xl font-bold text-foreground">
            {isShowing ? t('games.crocodile.your_turn') : `${t('games.crocodile.showing')}: ${t('games.player')} #${game.showing_player + 1}`}
          </p>
        </div>

        {isShowing ? (
          showWord ? (
            <div className="animate-scale-in">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                {t('games.crocodile.show_this')}
              </p>
              <h2 className="text-4xl font-bold text-foreground mb-6">{word}</h2>
              <Button onClick={() => setShowWord(false)} variant="outline">
                {t('games.hide')}
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowWord(true)}
              className="w-full h-14 text-lg font-bold uppercase tracking-wider"
            >
              {t('games.crocodile.show_word')}
            </Button>
          )
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">
              {t('games.crocodile.watch_and_guess')}
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            {t('games.crocodile.waiting_next')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrocodilePlayer;