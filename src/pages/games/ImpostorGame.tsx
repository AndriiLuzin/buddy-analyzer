import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/audio";
import { Home } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Game {
  id: string;
  code: string;
  player_count: number;
  word_id: string;
  impostor_index: number;
  status: string;
  views_count: number;
  starting_player: number | null;
}

interface PlayerView {
  player_index: number;
}

const ImpostorGame = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [game, setGame] = useState<Game | null>(null);
  const [word, setWord] = useState<string | null>(null);
  const [views, setViews] = useState<PlayerView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [startingPlayer, setStartingPlayer] = useState<number | null>(null);
  const [showMyRole, setShowMyRole] = useState(false);

  const gameUrl = `${window.location.origin}/games/impostor-play/${code}`;

  useEffect(() => {
    if (!code) return;

    const fetchGame = async () => {
      const { data: gameData, error } = await supabase
        .from("games")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error || !gameData) {
        toast.error(t("games.not_found"));
        navigate("/games");
        return;
      }

      setGame(gameData);

      const { data: viewsData } = await supabase
        .from("player_views")
        .select("player_index")
        .eq("game_id", gameData.id);

      const adminIndex = gameData.player_count - 1;
      const adminViewed = viewsData?.some((v) => v.player_index === adminIndex);
      if (!adminViewed) {
        await supabase.from("player_views").insert({
          game_id: gameData.id,
          player_index: adminIndex,
        });
        const { data: updatedViews } = await supabase
          .from("player_views")
          .select("player_index")
          .eq("game_id", gameData.id);
        setViews(updatedViews || []);

        if (updatedViews && updatedViews.length >= gameData.player_count) {
          const { data: wordData } = await supabase
            .from("game_words")
            .select("word")
            .eq("id", gameData.word_id)
            .single();

          setWord(wordData?.word || null);
          setIsRevealed(true);
          const validPlayers = Array.from({ length: gameData.player_count }, (_, i) => i)
            .filter(i => i !== gameData.impostor_index);
          const selectedPlayer = validPlayers[Math.floor(Math.random() * validPlayers.length)];
          setStartingPlayer(selectedPlayer);
          await supabase
            .from("games")
            .update({ starting_player: selectedPlayer })
            .eq("id", gameData.id);
          playNotificationSound();
        }
      } else {
        setViews(viewsData || []);

        if (viewsData && viewsData.length >= gameData.player_count) {
          const { data: wordData } = await supabase
            .from("game_words")
            .select("word")
            .eq("id", gameData.word_id)
            .single();

          setWord(wordData?.word || null);
          setIsRevealed(true);
          const validPlayers = Array.from({ length: gameData.player_count }, (_, i) => i)
            .filter(i => i !== gameData.impostor_index);
          const selectedPlayer = validPlayers[Math.floor(Math.random() * validPlayers.length)];
          setStartingPlayer(selectedPlayer);
          await supabase
            .from("games")
            .update({ starting_player: selectedPlayer })
            .eq("id", gameData.id);
          playNotificationSound();
        }
      }

      setIsLoading(false);
    };

    fetchGame();

    const channel = supabase
      .channel(`game-${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "player_views",
        },
        async () => {
          if (!game) return;
          const { data: viewsData } = await supabase
            .from("player_views")
            .select("player_index")
            .eq("game_id", game.id);

          setViews(viewsData || []);

          if (viewsData && game && viewsData.length >= game.player_count) {
            const { data: wordData } = await supabase
              .from("game_words")
              .select("word")
              .eq("id", game.word_id)
              .single();

            setWord(wordData?.word || null);
            setIsRevealed(true);
            const validPlayers = Array.from({ length: game.player_count }, (_, i) => i)
              .filter(i => i !== game.impostor_index);
            const selectedPlayer = validPlayers[Math.floor(Math.random() * validPlayers.length)];
            setStartingPlayer(selectedPlayer);
            await supabase
              .from("games")
              .update({ starting_player: selectedPlayer })
              .eq("id", game.id);
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, navigate, game?.id, game?.player_count, game?.word_id, game?.impostor_index, t]);

  const startNewRound = async () => {
    if (!game) return;

    try {
      const { data: words } = await supabase.from("game_words").select("id");

      if (!words?.length) throw new Error("No words");

      const randomWord = words[Math.floor(Math.random() * words.length)];
      const newImpostorIndex = Math.floor(Math.random() * game.player_count);

      await supabase.from("player_views").delete().eq("game_id", game.id);

      await supabase
        .from("games")
        .update({
          word_id: randomWord.id,
          impostor_index: newImpostorIndex,
          views_count: 0,
          starting_player: null,
        })
        .eq("id", game.id);

      setWord(null);
      setViews([]);
      setIsRevealed(false);
      setStartingPlayer(null);
      setGame({ ...game, word_id: randomWord.id, impostor_index: newImpostorIndex });

      toast.success(t("games.impostor.round_started"));
    } catch (error) {
      toast.error(t("games.error"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">{t("games.loading")}</div>
      </div>
    );
  }

  if (!game) return null;

  const allViewed = views.length >= game.player_count;
  const adminIndex = game.player_count - 1;
  const isAdminImpostor = game.impostor_index === adminIndex;

  if (allViewed && isRevealed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/games")}
          className="absolute top-4 left-4"
        >
          <Home className="w-5 h-5" />
        </Button>
        <div className="text-center animate-scale-in">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
            {isAdminImpostor ? t("games.impostor.your_role") : t("games.impostor.secret_word")}
          </p>
          <h1 className="text-4xl font-bold text-foreground">
            {isAdminImpostor ? t("games.impostor.impostor") : word}
          </h1>
          <p className="text-muted-foreground text-sm mt-6">
            {isAdminImpostor ? (
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

          {startingPlayer !== null && (
            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">{t("games.impostor.starts_first")}</p>
              <p className="text-2xl font-bold text-primary">
                {t("games.player")} #{startingPlayer + 1}
              </p>
            </div>
          )}

          <Button
            onClick={() => setIsRevealed(false)}
            variant="outline"
            className="mt-12"
          >
            {t("games.hide")}
          </Button>

          <Button
            onClick={startNewRound}
            variant="outline"
            className="w-full mt-4 h-12 font-bold uppercase tracking-wider"
          >
            {t("games.new_round")}
          </Button>
        </div>
      </div>
    );
  }

  if (showMyRole) {
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
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
            {isAdminImpostor ? t("games.impostor.your_role") : t("games.impostor.secret_word")}
          </p>
          <h1 className="text-4xl font-bold text-foreground">
            {isAdminImpostor ? t("games.impostor.impostor") : word}
          </h1>
          <p className="text-muted-foreground text-sm mt-6">
            {isAdminImpostor ? (
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
            onClick={() => setShowMyRole(false)}
            variant="outline"
            className="mt-12"
          >
            {t("games.hide")}
          </Button>
        </div>
      </div>
    );
  }

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
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            {t("games.game")} {code}
          </h1>
          <p className="text-muted-foreground text-sm">
            {views.length} / {game.player_count} {t("games.players_viewed")}
          </p>
        </div>

        <Button
          onClick={() => setShowMyRole(true)}
          className="w-full h-14 text-lg font-bold uppercase tracking-wider mb-6"
        >
          {t("games.show_my_role")}
        </Button>

        <div className="bg-secondary p-6 flex items-center justify-center mb-6">
          <QRCodeSVG
            value={gameUrl}
            size={200}
            bgColor="transparent"
            fgColor="hsl(var(--foreground))"
            level="M"
          />
        </div>

        <div className="text-center mb-8">
          <p className="text-xs text-muted-foreground break-all">{gameUrl}</p>
        </div>

        {!allViewed && (
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground">
              {t("games.waiting_players")}
            </p>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 mb-8">
          {Array.from({ length: game.player_count }).map((_, i) => {
            const hasViewed = views.some((v) => v.player_index === i);
            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center text-sm font-bold transition-colors ${
                  hasViewed
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        <Button
          onClick={startNewRound}
          variant="outline"
          className="w-full h-12 font-bold uppercase tracking-wider"
        >
          {t("games.new_round")}
        </Button>

        <Button
          onClick={() => navigate("/games")}
          variant="ghost"
          className="w-full mt-4 text-muted-foreground"
        >
          {t("games.new_game")}
        </Button>
      </div>
    </div>
  );
};

export default ImpostorGame;