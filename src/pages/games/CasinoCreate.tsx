import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "7️⃣", "🎰"];

const CasinoCreate = () => {
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
    if (isNaN(count) || count < 3 || count > 20) {
      toast.error("Укажите от 3 до 20 игроков");
      return;
    }

    setIsCreating(true);

    try {
      const code = generateCode();
      
      // Shuffle symbols and assign to players
      const shuffledSymbols = shuffleArray(SYMBOLS);
      const playerSymbols = Array.from({ length: count }, (_, i) => 
        shuffledSymbols[i % shuffledSymbols.length]
      );

      // Create secret combination (3 symbols from assigned player symbols)
      const combination = [
        playerSymbols[Math.floor(Math.random() * count)],
        playerSymbols[Math.floor(Math.random() * count)],
        playerSymbols[Math.floor(Math.random() * count)],
      ];

      const { data: game, error: gameError } = await supabase
        .from("casino_games")
        .insert({
          code,
          player_count: count,
          current_combination: combination,
          guesser_index: 0,
          current_round: 1,
          guesses_in_round: 0,
          status: "waiting",
        })
        .select()
        .single();

      if (gameError) throw gameError;

      // Create players with symbols
      const players = playerSymbols.map((symbol, index) => ({
        game_id: game.id,
        player_index: index,
        symbol,
      }));

      const { error: playersError } = await supabase
        .from("casino_players")
        .insert(players);

      if (playersError) throw playersError;

      navigate(`/games/casino/${code}`);
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
          КАЗИНО
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-12">
          Угадай комбинацию символов
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Количество игроков
            </label>
            <Input
              type="number"
              min={3}
              max={20}
              value={playerCount}
              onChange={(e) => setPlayerCount(e.target.value)}
              placeholder="3-20"
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
            Каждый знает свой символ.
            <br />
            Угадайте секретную комбинацию вместе!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CasinoCreate;
