import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/audio";
import { Home } from "lucide-react";

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
  const [game, setGame] = useState<Game | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWord, setShowWord] = useState(false);

  useEffect(() => {
    if (!code) return;

    const fetchGame = async () => {
      const { data: gameData, error } = await supabase
        .from("crocodile_games")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error || !gameData) {
        toast.error("Игра не найдена");
        navigate("/games");
        return;
      }

      setGame(gameData);

      // Get next available player index
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
        // All slots taken, find a free one
        nextIndex = players?.length || 0;
      }

      // Check if already joined via localStorage
      const storedIndex = localStorage.getItem(`crocodile-${gameData.id}`);
      if (storedIndex) {
        setPlayerIndex(parseInt(storedIndex));
      } else {
        // Join as new player
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
    };

    fetchGame();

    const channel = supabase
      .channel(`crocodile-player-${code}`)
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
  }, [code, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Загрузка...</div>
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
            Ты
          </p>
          <h1 className="text-4xl font-bold text-foreground">
            Игрок #{playerIndex + 1}
          </h1>
        </div>

        <div className="bg-secondary p-6 rounded-lg mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Раунд {game.round}
          </p>
          <p className="text-xl font-bold text-foreground">
            {isShowing ? "Твоя очередь показывать!" : `Показывает: Игрок #${game.showing_player + 1}`}
          </p>
        </div>

        {isShowing ? (
          showWord ? (
            <div className="animate-scale-in">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                Покажи это слово
              </p>
              <h2 className="text-4xl font-bold text-foreground mb-6">{word}</h2>
              <Button onClick={() => setShowWord(false)} variant="outline">
                Скрыть
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowWord(true)}
              className="w-full h-14 text-lg font-bold uppercase tracking-wider"
            >
              Показать слово
            </Button>
          )
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">
              Смотри на показывающего и угадывай слово!
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Ожидание следующего раунда...
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrocodilePlayer;
