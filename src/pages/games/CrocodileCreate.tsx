import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const CrocodileCreate = () => {
  const [playerCount, setPlayerCount] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const createGame = async () => {
    const count = parseInt(playerCount);
    if (isNaN(count) || count < 2 || count > 20) {
      toast.error("Укажите от 2 до 20 игроков");
      return;
    }

    setIsCreating(true);

    try {
      const { data: words, error: wordsError } = await supabase
        .from("crocodile_words")
        .select("id");

      if (wordsError || !words?.length) {
        throw new Error("Не удалось загрузить слова");
      }

      const randomWord = words[Math.floor(Math.random() * words.length)];
      const code = generateCode();

      const { data: game, error: gameError } = await supabase
        .from("crocodile_games")
        .insert({
          code,
          player_count: count,
          current_word_id: randomWord.id,
          current_player: 0,
          showing_player: 0,
          current_guesser: 1,
          round: 1,
          status: "waiting",
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Create players
      const players = Array.from({ length: count }, (_, i) => ({
        game_id: game.id,
        player_index: i,
      }));

      const { error: playersError } = await supabase
        .from("crocodile_players")
        .insert(players);

      if (playersError) throw playersError;

      navigate(`/games/crocodile/${code}`);
    } catch (error) {
      console.error(error);
      toast.error("Ошибка создания игры");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <Link
        to="/games"
        className="absolute top-4 left-4 p-2 hover:opacity-70 transition-opacity"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </Link>

      <div className="w-full max-w-sm animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 text-center">
          КРОКОДИЛ
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-12">
          Покажи слово без слов
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Количество игроков
            </label>
            <Input
              type="number"
              min={2}
              max={20}
              value={playerCount}
              onChange={(e) => setPlayerCount(e.target.value)}
              placeholder="2-20"
              className="text-center text-2xl h-16 font-bold"
            />
          </div>

          <Button
            onClick={createGame}
            disabled={isCreating || !playerCount}
            className="w-full h-14 text-lg font-bold uppercase tracking-wider"
          >
            {isCreating ? "Создание..." : "Создать игру"}
          </Button>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground">
            Один показывает слово жестами,
            <br />
            остальные угадывают.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CrocodileCreate;
