import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const BattleshipCreate = () => {
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

  // Grid is 8 wide, height = 8 + (players - 2) * 3
  // 2 players: 8x8, 3 players: 8x11, 4 players: 8x14, etc.
  const getGridHeight = (players: number) => {
    return 8 + (players - 2) * 3;
  };

  const createGame = async () => {
    const count = parseInt(playerCount);
    if (isNaN(count) || count < 2 || count > 10) {
      toast.error(t("games.battleship.players_range"));
      return;
    }

    setIsCreating(true);

    try {
      const code = generateCode();
      const gridHeight = getGridHeight(count);

      const { error: gameError } = await supabase
        .from("battleship_games")
        .insert({
          code,
          player_count: count,
          grid_size: gridHeight, // This now represents height, width is always 8
          status: "waiting",
        });

      if (gameError) throw gameError;

      navigate(`/games/battleship/${code}`);
    } catch (error) {
      console.error(error);
      toast.error(t("games.create_error"));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-6 bg-background overflow-y-auto">
      <Link
        to="/games"
        className="absolute top-4 left-4 p-2 hover:opacity-70 transition-opacity"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </Link>

      <div className="w-full max-w-sm animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 text-center">
          {t("games.battleship.title")}
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-12">
          {t("games.battleship.description")}
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("games.player_count")}
            </label>
            <Input
              type="number"
              min={2}
              max={10}
              value={playerCount}
              onChange={(e) => setPlayerCount(e.target.value)}
              placeholder="2-10"
              className="text-center text-2xl h-16 font-bold"
            />
          </div>

          <Button
            onClick={createGame}
            disabled={isCreating || !playerCount}
            className="w-full h-14 text-lg font-bold uppercase tracking-wider"
          >
            {isCreating ? t("games.creating") : t("games.create_game")}
          </Button>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground">
            {t("games.battleship.instruction")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BattleshipCreate;
