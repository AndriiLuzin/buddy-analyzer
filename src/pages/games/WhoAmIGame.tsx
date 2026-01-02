import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/audio";
import { Home, Check, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

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

interface Character {
  id: string;
  name: string;
}

const WhoAmIGame = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [characters, setCharacters] = useState<Record<string, string>>({});
  const [views, setViews] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const gameUrl = `${window.location.origin}/games/whoami-play/${code}`;

  useEffect(() => {
    if (!code) return;

    const fetchGame = async () => {
      const { data: gameData, error } = await supabase
        .from("whoami_games")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error || !gameData) {
        toast.error(t('games.not_found'));
        navigate("/games");
        return;
      }

      setGame(gameData);

      const { data: playersData } = await supabase
        .from("whoami_players")
        .select("*")
        .eq("game_id", gameData.id)
        .order("player_index", { ascending: true });

      setPlayers(playersData || []);

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

      const { data: viewsData } = await supabase
        .from("whoami_views")
        .select("player_index")
        .eq("game_id", gameData.id);

      setViews(viewsData?.map((v) => v.player_index) || []);
      setIsLoading(false);
    };

    fetchGame();

    const channel = supabase
      .channel(`whoami-${code}`)
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
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "whoami_views",
        },
        async () => {
          if (!game) return;
          const { data: viewsData } = await supabase
            .from("whoami_views")
            .select("player_index")
            .eq("game_id", game.id);
          setViews(viewsData?.map((v) => v.player_index) || []);
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, navigate, game?.id, t]);

  const markGuessed = async (playerIndex: number) => {
    if (!game) return;

    const player = players.find((p) => p.player_index === playerIndex);
    if (!player) return;

    await supabase
      .from("whoami_players")
      .update({ guessed: !player.guessed })
      .eq("id", player.id);

    toast.success(player.guessed ? t('games.whoami.canceled') : t('games.whoami.player_guessed'));
  };

  const startNewGame = async () => {
    if (!game) return;

    try {
      const { data: characters } = await supabase
        .from("whoami_characters")
        .select("id");

      if (!characters?.length) throw new Error("No characters");

      const shuffled = [...characters].sort(() => Math.random() - 0.5);
      const newGuesser = Math.floor(Math.random() * game.player_count);

      await supabase.from("whoami_views").delete().eq("game_id", game.id);

      for (let i = 0; i < players.length; i++) {
        await supabase
          .from("whoami_players")
          .update({
            character_id: shuffled[i % shuffled.length].id,
            guessed: false,
          })
          .eq("id", players[i].id);
      }

      await supabase
        .from("whoami_games")
        .update({ guesser_index: newGuesser })
        .eq("id", game.id);

      setViews([]);
      toast.success(t('games.impostor.round_started'));
    } catch (error) {
      toast.error(t('games.error'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">{t('games.loading')}</div>
      </div>
    );
  }

  if (!game) return null;

  const allViewed = views.length >= game.player_count;

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
            {t('games.whoami.title')}
          </h1>
          <p className="text-muted-foreground text-sm">{t('games.code')}: {code}</p>
          <p className="text-muted-foreground text-sm">
            {views.length} / {game.player_count} {t('games.whoami.viewed')}
          </p>
        </div>

        <Button
          onClick={() => setShowAll(!showAll)}
          variant="outline"
          className="w-full h-12 mb-6"
        >
          {showAll ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
          {showAll ? t('games.whoami.hide_characters') : t('games.whoami.show_all')}
        </Button>

        {showAll && (
          <div className="space-y-2 mb-6">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  player.guessed ? "bg-primary/20" : "bg-secondary"
                }`}
              >
                <div>
                  <p className="font-bold text-foreground">
                    {t('games.player')} #{player.player_index + 1}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {characters[player.character_id] || "—"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={player.guessed ? "default" : "outline"}
                  onClick={() => markGuessed(player.player_index)}
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-secondary p-6 flex items-center justify-center mb-6">
          <QRCodeSVG
            value={gameUrl}
            size={180}
            bgColor="transparent"
            fgColor="hsl(var(--foreground))"
            level="M"
          />
        </div>

        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground break-all">{gameUrl}</p>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-8">
          {Array.from({ length: game.player_count }).map((_, i) => {
            const hasViewed = views.includes(i);
            const player = players.find((p) => p.player_index === i);
            const hasGuessed = player?.guessed;
            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center text-sm font-bold transition-colors ${
                  hasGuessed
                    ? "bg-primary text-primary-foreground"
                    : hasViewed
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
          onClick={startNewGame}
          variant="outline"
          className="w-full h-12 font-bold uppercase tracking-wider"
        >
          {t('games.new_game')}
        </Button>
      </div>
    </div>
  );
};

export default WhoAmIGame;