import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/audio";
import { Home, Eye, EyeOff } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Game {
  id: string;
  code: string;
  player_count: number;
  current_combination: string[];
  guesser_index: number;
  current_round: number;
  status: string;
}

interface Player {
  id: string;
  player_index: number;
  symbol: string;
}

const CasinoPlayer = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [game, setGame] = useState<Game | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [mySymbol, setMySymbol] = useState<string | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSymbol, setShowSymbol] = useState(false);
  const [showOthers, setShowOthers] = useState(false);

  useEffect(() => {
    if (!code) return;

    const fetchGame = async () => {
      const { data: gameData, error } = await supabase
        .from("casino_games")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error || !gameData) {
        toast.error(t('games.not_found'));
        navigate("/games");
        return;
      }

      setGame(gameData);

      const storedIndex = localStorage.getItem(`casino-${gameData.id}`);
      let myIndex: number;

      if (storedIndex) {
        myIndex = parseInt(storedIndex);
      } else {
        const { data: existingPlayers } = await supabase
          .from("casino_players")
          .select("player_index")
          .eq("game_id", gameData.id);

        const takenIndices = new Set(existingPlayers?.map((p) => p.player_index) || []);
        myIndex = 0;
        while (takenIndices.has(myIndex) && myIndex < gameData.player_count) {
          myIndex++;
        }

        localStorage.setItem(`casino-${gameData.id}`, myIndex.toString());
      }

      setPlayerIndex(myIndex);

      const { data: playersData } = await supabase
        .from("casino_players")
        .select("*")
        .eq("game_id", gameData.id)
        .order("player_index", { ascending: true });

      const myPlayer = playersData?.find((p) => p.player_index === myIndex);
      setMySymbol(myPlayer?.symbol || null);
      setOtherPlayers(playersData?.filter((p) => p.player_index !== myIndex) || []);

      setIsLoading(false);
    };

    fetchGame();

    const channel = supabase
      .channel(`casino-player-${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "casino_games",
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
          table: "casino_players",
        },
        async () => {
          if (!game || playerIndex === null) return;
          const { data: playersData } = await supabase
            .from("casino_players")
            .select("*")
            .eq("game_id", game.id)
            .order("player_index", { ascending: true });

          const myPlayer = playersData?.find((p) => p.player_index === playerIndex);
          setMySymbol(myPlayer?.symbol || null);
          setOtherPlayers(playersData?.filter((p) => p.player_index !== playerIndex) || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, navigate, game?.id, playerIndex, t]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">{t('games.loading')}</div>
      </div>
    );
  }

  if (!game || playerIndex === null) return null;

  const isMyTurn = game.guesser_index === playerIndex;

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
            {t('games.you')}
          </p>
          <h1 className="text-4xl font-bold text-foreground">
            {t('games.player')} #{playerIndex + 1}
          </h1>
        </div>

        <div className={`p-6 rounded-lg mb-6 ${isMyTurn ? "bg-primary/20 border-2 border-primary" : "bg-secondary"}`}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {t('games.round')} {game.current_round}
          </p>
          <p className="text-xl font-bold text-foreground">
            {isMyTurn ? t('games.casino.your_turn') : `${t('games.casino.guessing')}: ${t('games.player')} #${game.guesser_index + 1}`}
          </p>
        </div>

        <Button
          onClick={() => setShowSymbol(!showSymbol)}
          className="w-full h-14 text-lg font-bold mb-6"
        >
          {showSymbol ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
          {showSymbol ? t('games.casino.hide_my_symbol') : t('games.casino.show_my_symbol')}
        </Button>

        {showSymbol && (
          <div className="animate-scale-in mb-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              {t('games.casino.your_symbol')}
            </p>
            <span className="text-7xl">{mySymbol}</span>
            <p className="text-sm text-muted-foreground mt-4">
              {t('games.casino.dont_show')}
            </p>
          </div>
        )}

        <Button
          onClick={() => setShowOthers(!showOthers)}
          variant="outline"
          className="w-full h-12 mb-4"
        >
          {showOthers ? t('games.casino.hide_others') : t('games.casino.show_others')}
        </Button>

        {showOthers && (
          <div className="grid grid-cols-4 gap-2 mb-6 animate-fade-in">
            {otherPlayers.map((player) => (
              <div
                key={player.id}
                className="aspect-square flex flex-col items-center justify-center bg-secondary rounded-lg p-2"
              >
                <span className="text-2xl">❓</span>
                <span className="text-xs text-muted-foreground mt-1">
                  #{player.player_index + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            {t('games.casino.combination_info')}
            <br />
            {t('games.casino.can_repeat')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CasinoPlayer;