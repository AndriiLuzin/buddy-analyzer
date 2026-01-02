import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/audio";
import { Home, RotateCcw, Eye, EyeOff } from "lucide-react";

interface Game {
  id: string;
  code: string;
  player_count: number;
  current_combination: string[];
  guesser_index: number;
  current_round: number;
  guesses_in_round: number;
  status: string;
}

interface Player {
  id: string;
  player_index: number;
  symbol: string;
}

const SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "⭐", "💎", "7️⃣", "🎰"];

const CasinoGame = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCombination, setShowCombination] = useState(false);
  const [showAllSymbols, setShowAllSymbols] = useState(false);

  const gameUrl = `${window.location.origin}/games/casino-play/${code}`;

  useEffect(() => {
    if (!code) return;

    const fetchGame = async () => {
      const { data: gameData, error } = await supabase
        .from("casino_games")
        .select("*")
        .eq("code", code)
        .maybeSingle();

      if (error || !gameData) {
        toast.error("Игра не найдена");
        navigate("/games");
        return;
      }

      setGame(gameData);

      const { data: playersData } = await supabase
        .from("casino_players")
        .select("*")
        .eq("game_id", gameData.id)
        .order("player_index", { ascending: true });

      setPlayers(playersData || []);
      setIsLoading(false);
    };

    fetchGame();

    const channel = supabase
      .channel(`casino-${code}`)
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
          if (!game) return;
          const { data: playersData } = await supabase
            .from("casino_players")
            .select("*")
            .eq("game_id", game.id)
            .order("player_index", { ascending: true });
          setPlayers(playersData || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, navigate, game?.id]);

  const nextGuesser = async () => {
    if (!game) return;

    const nextIndex = (game.guesser_index + 1) % game.player_count;
    const newGuessCount = game.guesses_in_round + 1;
    const newRound = newGuessCount >= game.player_count 
      ? game.current_round + 1 
      : game.current_round;
    const resetGuesses = newGuessCount >= game.player_count ? 0 : newGuessCount;

    await supabase
      .from("casino_games")
      .update({
        guesser_index: nextIndex,
        guesses_in_round: resetGuesses,
        current_round: newRound,
      })
      .eq("id", game.id);
  };

  const startNewGame = async () => {
    if (!game) return;

    try {
      const shuffledSymbols = [...SYMBOLS].sort(() => Math.random() - 0.5);
      const playerSymbols = Array.from({ length: game.player_count }, (_, i) =>
        shuffledSymbols[i % shuffledSymbols.length]
      );

      const combination = [
        playerSymbols[Math.floor(Math.random() * game.player_count)],
        playerSymbols[Math.floor(Math.random() * game.player_count)],
        playerSymbols[Math.floor(Math.random() * game.player_count)],
      ];

      // Update players with new symbols
      for (let i = 0; i < players.length; i++) {
        await supabase
          .from("casino_players")
          .update({ symbol: playerSymbols[i] })
          .eq("id", players[i].id);
      }

      await supabase
        .from("casino_games")
        .update({
          current_combination: combination,
          guesser_index: 0,
          current_round: 1,
          guesses_in_round: 0,
        })
        .eq("id", game.id);

      setShowCombination(false);
      toast.success("Новая игра начата!");
    } catch (error) {
      toast.error("Ошибка");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!game) return null;

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
            КАЗИНО
          </h1>
          <p className="text-muted-foreground text-sm">Код: {code}</p>
          <p className="text-muted-foreground text-sm">Раунд: {game.current_round}</p>
        </div>

        <div className="bg-secondary p-6 rounded-lg mb-6 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Сейчас угадывает
          </p>
          <p className="text-3xl font-bold text-foreground">
            Игрок #{game.guesser_index + 1}
          </p>
        </div>

        <Button
          onClick={() => setShowCombination(!showCombination)}
          variant="outline"
          className="w-full h-12 mb-4"
        >
          {showCombination ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
          {showCombination ? "Скрыть комбинацию" : "Показать комбинацию"}
        </Button>

        {showCombination && (
          <div className="text-center mb-6 animate-scale-in">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Секретная комбинация
            </p>
            <div className="flex justify-center gap-4 text-5xl">
              {game.current_combination.map((symbol, i) => (
                <span key={i}>{symbol}</span>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={() => setShowAllSymbols(!showAllSymbols)}
          variant="outline"
          className="w-full h-12 mb-4"
        >
          {showAllSymbols ? "Скрыть символы" : "Показать все символы"}
        </Button>

        {showAllSymbols && (
          <div className="grid grid-cols-4 gap-2 mb-6 animate-fade-in">
            {players.map((player) => (
              <div
                key={player.id}
                className="aspect-square flex flex-col items-center justify-center bg-secondary rounded-lg p-2"
              >
                <span className="text-2xl">{player.symbol}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  #{player.player_index + 1}
                </span>
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
          <p className="text-sm text-muted-foreground mt-2">
            Игроков: {players.length} / {game.player_count}
          </p>
        </div>

        <div className="flex gap-4 mb-4">
          <Button
            onClick={nextGuesser}
            className="flex-1 h-12 font-bold"
          >
            Следующий
          </Button>
        </div>

        <Button
          onClick={startNewGame}
          variant="outline"
          className="w-full h-12 font-bold uppercase tracking-wider"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Новая игра
        </Button>
      </div>
    </div>
  );
};

export default CasinoGame;
