import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "7️⃣", "🎰"];

const CasinoCreate = () => {
  const [playerCount, setPlayerCount] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

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
      toast.error(t('games.error'));
      return;
    }

    setIsCreating(true);

    try {
      const code = generateCode();
      
      const shuffledSymbols = shuffleArray(SYMBOLS);
      const playerSymbols = Array.from({ length: count }, (_, i) => 
        shuffledSymbols[i % shuffledSymbols.length]
      );

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
      toast.error(t('games.create_error'));
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
          {t('games.casino.title')}
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-12">
          {t('games.casino.description')}
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t('games.player_count')}
            </label>
            <Input
              type="number"
              min={3}
              max={20}
              value={playerCount}
              onChange={(e) => setPlayerCount(e.target.value)}
              placeholder={t('games.casino.players_range')}
              className="text-center text-2xl h-16 font-bold"
            />
          </div>

          <Button
            onClick={createGame}
            disabled={isCreating || !playerCount}
            className="w-full h-14 text-lg font-bold uppercase tracking-wider"
          >
            {isCreating ? t('games.creating') : t('games.create_game')}
          </Button>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground">
            {t('games.casino.instruction')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CasinoCreate;