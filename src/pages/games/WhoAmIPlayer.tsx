import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/audio";
import { Home, Eye, EyeOff } from "lucide-react";

interface Game {
  id: string;
  code: string;
  player_count: number;
  guesser_index: number;
  status: string;
}

interface Player {
  id: string;
  player_index: number;
  character_id: string;
  guessed: boolean;
}

const WhoAmIPlayer = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [characters, setCharacters] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showOthers, setShowOthers] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    if (!code) return;

    const fetchGame = async () => {
      const { data: gameData, error } = await supabase
        .from("whoami_games")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error || !gameData) {
        toast.error("Игра не найдена");
        navigate("/games");
        return;
      }

      setGame(gameData);

      // Check if already joined via localStorage
      const storedIndex = localStorage.getItem(`whoami-${gameData.id}`);
      let myIndex: number;

      if (storedIndex) {
        myIndex = parseInt(storedIndex);
        setPlayerIndex(myIndex);
      } else {
        // Get next available index
        const { data: existingPlayers } = await supabase
          .from("whoami_players")
          .select("player_index")
          .eq("game_id", gameData.id);

        const takenIndices = new Set(existingPlayers?.map((p) => p.player_index) || []);
        myIndex = 0;
        while (takenIndices.has(myIndex) && myIndex < gameData.player_count) {
          myIndex++;
        }

        localStorage.setItem(`whoami-${gameData.id}`, myIndex.toString());
        setPlayerIndex(myIndex);
      }

      // Fetch all players
      const { data: playersData } = await supabase
        .from("whoami_players")
        .select("*")
        .eq("game_id", gameData.id)
        .order("player_index", { ascending: true });

      setPlayers(playersData || []);

      // Fetch characters
      const charIds = playersData?.map((p) => p.character_id).filter(Boolean) || [];
      if (charIds.length > 0) {
        const { data: charsData } = await supabase
          .from("whoami_characters")
          .select("id, name")
          .in("id", charIds);

        const charMap: Record<string, string> = {};
        charsData?.forEach((c) => {
          charMap[c.id] = c.name;
        });
        setCharacters(charMap);
      }

      // Check if already viewed
      const { data: viewData } = await supabase
        .from("whoami_views")
        .select("id")
        .eq("game_id", gameData.id)
        .eq("player_index", myIndex)
        .maybeSingle();

      setHasViewed(!!viewData);
      setIsLoading(false);
    };

    fetchGame();

    const channel = supabase
      .channel(`whoami-player-${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "whoami_games",
          filter: `code=eq.${code}`,
        },
        async (payload) => {
          if (payload.new) {
            setGame(payload.new as Game);
            playNotificationSound();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "whoami_players",
        },
        async () => {
          if (!game) return;
          const { data: playersData } = await supabase
            .from("whoami_players")
            .select("*")
            .eq("game_id", game.id)
            .order("player_index", { ascending: true });
          setPlayers(playersData || []);

          // Refetch characters
          const charIds = playersData?.map((p) => p.character_id).filter(Boolean) || [];
          if (charIds.length > 0) {
            const { data: charsData } = await supabase
              .from("whoami_characters")
              .select("id, name")
              .in("id", charIds);

            const charMap: Record<string, string> = {};
            charsData?.forEach((c) => {
              charMap[c.id] = c.name;
            });
            setCharacters(charMap);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, navigate, game?.id]);

  const handleView = async () => {
    if (!game || playerIndex === null || hasViewed) return;

    await supabase.from("whoami_views").insert({
      game_id: game.id,
      player_index: playerIndex,
    });

    setHasViewed(true);
    setShowOthers(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!game || playerIndex === null) return null;

  const otherPlayers = players.filter((p) => p.player_index !== playerIndex);

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

        {!hasViewed ? (
          <Button
            onClick={handleView}
            className="w-full h-14 text-lg font-bold uppercase tracking-wider"
          >
            <Eye className="w-5 h-5 mr-2" />
            Посмотреть персонажей
          </Button>
        ) : (
          <>
            <Button
              onClick={() => setShowOthers(!showOthers)}
              variant="outline"
              className="w-full h-12 mb-6"
            >
              {showOthers ? (
                <EyeOff className="w-5 h-5 mr-2" />
              ) : (
                <Eye className="w-5 h-5 mr-2" />
              )}
              {showOthers ? "Скрыть" : "Показать персонажей"}
            </Button>

            {showOthers && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                  Персонажи других игроков
                </p>
                {otherPlayers.map((player) => (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg ${
                      player.guessed ? "bg-primary/20" : "bg-secondary"
                    }`}
                  >
                    <p className="font-bold text-foreground">
                      Игрок #{player.player_index + 1}
                    </p>
                    <p className="text-lg text-muted-foreground">
                      {characters[player.character_id] || "—"}
                    </p>
                  </div>
                ))}
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mt-4">
                  <p className="font-bold text-foreground">Твой персонаж</p>
                  <p className="text-lg text-primary">???</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Задавай вопросы, чтобы угадать!
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            Ты видишь персонажей всех, кроме себя.
            <br />
            Задавай вопросы "Да/Нет", чтобы угадать своего.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhoAmIPlayer;
