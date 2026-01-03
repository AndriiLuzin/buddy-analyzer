import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useStableConnection } from "@/hooks/useStableConnection";

interface Game {
  id: string;
  code: string;
  player_count: number;
  word_id: string;
  impostor_index: number;
  starting_player: number | null;
}

const ImpostorPlayer = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [game, setGame] = useState<Game | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [isImpostor, setIsImpostor] = useState(false);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const assignRole = useCallback(async (gameData: Game) => {
    const { data: existingViews } = await supabase
      .from("player_views")
      .select("player_index")
      .eq("game_id", gameData.id);

    const usedIndices = existingViews?.map((v) => v.player_index) || [];

    if (usedIndices.length >= gameData.player_count) {
      setError(t("games.all_slots_taken"));
      setIsLoading(false);
      return null;
    }

    let availableIndex = -1;
    for (let i = 0; i < gameData.player_count; i++) {
      if (!usedIndices.includes(i)) {
        availableIndex = i;
        break;
      }
    }

    if (availableIndex === -1) {
      setError(t("games.all_slots_taken"));
      setIsLoading(false);
      return null;
    }

    const { error: insertError } = await supabase
      .from("player_views")
      .insert({
        game_id: gameData.id,
        player_index: availableIndex,
      });

    if (insertError) {
      console.error(insertError);
      setError(t("games.registration_error"));
      setIsLoading(false);
      return null;
    }

    setSearchParams({ p: String(availableIndex) });
    return availableIndex;
  }, [setSearchParams, t]);

  const fetchRole = useCallback(async (gameData: Game, idx: number) => {
    setPlayerIndex(idx);

    if (idx === gameData.impostor_index) {
      setIsImpostor(true);
      setWord(null);
    } else {
      setIsImpostor(false);
      const { data: wordData } = await supabase
        .from("game_words")
        .select("word")
        .eq("id", gameData.word_id)
        .single();

      setWord(wordData?.word || null);
    }

    setIsLoading(false);
  }, []);

  const initGame = useCallback(async () => {
    if (!code) return;

    const { data: gameData, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (gameError || !gameData) {
      setError(t("games.not_found"));
      setIsLoading(false);
      return;
    }

    setGame(gameData);

    const existingIndex = searchParams.get("p");

    if (existingIndex !== null) {
      const idx = parseInt(existingIndex);
      const { data: view } = await supabase
        .from("player_views")
        .select("player_index")
        .eq("game_id", gameData.id)
        .eq("player_index", idx)
        .maybeSingle();

      if (view) {
        await fetchRole(gameData, idx);
        return;
      }
    }

    const newIndex = await assignRole(gameData);
    if (newIndex !== null) {
      await fetchRole(gameData, newIndex);
    }
  }, [code, searchParams, assignRole, fetchRole, t]);

  // Stable connection with auto-reconnect
  useStableConnection({
    channelName: `impostor-player-${code}`,
    onReconnect: initGame,
  });

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (!game) return;

    const channel = supabase
      .channel(`player-${code}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${game.id}`,
        },
        async (payload) => {
          const newGame = payload.new as Game;
          setGame(newGame);
          setIsRevealed(false);

          const existingIndex = searchParams.get("p");
          if (existingIndex !== null) {
            const idx = parseInt(existingIndex);

            const { data: view } = await supabase
              .from("player_views")
              .select("player_index")
              .eq("game_id", newGame.id)
              .eq("player_index", idx)
              .maybeSingle();

            if (!view) {
              await supabase
                .from("player_views")
                .insert({
                  game_id: newGame.id,
                  player_index: idx,
                });
            }

            await fetchRole(newGame, idx);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game, code, searchParams, fetchRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">{t("games.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <p className="text-foreground font-bold mb-2">{error}</p>
          <p className="text-muted-foreground text-sm">{t("games.ask_link")}</p>
        </div>
      </div>
    );
  }

  if (!isRevealed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/games")}
          className="absolute top-4 left-4"
        >
          <Home className="w-5 h-5" />
        </Button>
        <div className="text-center animate-fade-in">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
            {t("games.player")} #{playerIndex !== null ? playerIndex + 1 : "?"}
          </p>
          <Button
            onClick={() => setIsRevealed(true)}
            className="h-20 px-12 text-xl font-bold uppercase tracking-wider"
          >
            {t("games.show_role")}
          </Button>
          <p className="text-xs text-muted-foreground mt-6">
            {t("games.dont_show_screen")}
          </p>
        </div>
      </div>
    );
  }

  const isStartingPlayer = game && playerIndex !== null && game.starting_player === playerIndex;

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
      <div className="text-center animate-scale-in">
        {isStartingPlayer && (
          <div className="mb-6 p-4 bg-primary/20 border border-primary/40 rounded-lg animate-pulse">
            <p className="text-2xl font-bold text-primary">
              🎯 {t("games.you_start")}
            </p>
          </div>
        )}

        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
          {isImpostor ? t("games.impostor.your_role") : t("games.impostor.secret_word")}
        </p>
        <h1 className="text-4xl font-bold text-foreground">
          {isImpostor ? t("games.impostor.impostor") : word}
        </h1>
        <p className="text-muted-foreground text-sm mt-6">
          {isImpostor ? (
            <>
              {t("games.impostor.you_dont_know")}
              <br />
              {t("games.impostor.pretend")}
            </>
          ) : (
            <>
              {t("games.impostor.find_impostor")}
              <br />
              {t("games.impostor.doesnt_know")}
            </>
          )}
        </p>

        <Button
          onClick={() => setIsRevealed(false)}
          variant="outline"
          className="mt-12"
        >
          {t("games.hide")}
        </Button>
      </div>
    </div>
  );
};

export default ImpostorPlayer;