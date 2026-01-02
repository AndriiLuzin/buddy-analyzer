import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const WhoAmICreate = () => {
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

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const createGame = async () => {
    const count = parseInt(playerCount);
    if (isNaN(count) || count < 2 || count > 20) {
      toast.error("Укажите от 2 до 20 игроков");
      return;
    }

    setIsCreating(true);

    try {
      const { data: characters, error: charsError } = await supabase
        .from("whoami_characters")
        .select("id");

      if (charsError || !characters?.length) {
        throw new Error("Не удалось загрузить персонажей");
      }

      const shuffledChars = shuffleArray(characters);
      const code = generateCode();
      const guesserIndex = Math.floor(Math.random() * count);

      const { data: game, error: gameError } = await supabase
        .from("whoami_games")
        .insert({
          code,
          player_count: count,
          guesser_index: guesserIndex,
          status: "waiting",
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Create players with assigned characters
      const players = Array.from({ length: count }, (_, i) => ({
        game_id: game.id,
        player_index: i,
        character_id: shuffledChars[i % shuffledChars.length].id,
        guessed: false,
      }));

      const { error: playersError } = await supabase
        .from("whoami_players")
        .insert(players);

      if (playersError) throw playersError;

      navigate(`/games/whoami/${code}`);
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
          КТО Я?
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-12">
          Угадай своего персонажа
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
            Каждый видит персонажей других,
            <br />
            но не знает своего.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhoAmICreate;
