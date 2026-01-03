import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const ImpostorCreate = () => {
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

  const createGame = async () => {
    const count = parseInt(playerCount);
    if (isNaN(count) || count < 3 || count > 20) {
      toast.error(t("games.impostor.players_range"));
      return;
    }

    setIsCreating(true);

    try {
      const { data: words, error: wordsError } = await supabase
        .from("game_words")
        .select("id");

      if (wordsError || !words?.length) {
        throw new Error(t("games.error"));
      }

      const randomWord = words[Math.floor(Math.random() * words.length)];
      const impostorIndex = Math.floor(Math.random() * count);
      const code = generateCode();

      const { error: gameError } = await supabase
        .from("games")
        .insert({
          code,
          player_count: count,
          word_id: randomWord.id,
          impostor_index: impostorIndex,
          status: "waiting",
        });

      if (gameError) throw gameError;

      navigate(`/games/impostor/${code}`);
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
          {t("games.impostor.title")}
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-12">
          {t("games.impostor.description")}
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("games.player_count")}
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
            {isCreating ? t("games.creating") : t("games.create_game")}
          </Button>
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground">
            {t("games.impostor.instruction")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImpostorCreate;