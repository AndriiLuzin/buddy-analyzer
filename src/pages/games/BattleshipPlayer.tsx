import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useStableConnection } from "@/hooks/useStableConnection";
import { playNotificationSound } from "@/lib/audio";

interface Ship {
  x: number;
  y: number;
  size: number;
  cells: { x: number; y: number }[];
}

interface BattleshipGame {
  id: string;
  code: string;
  player_count: number;
  status: string;
  current_player_index: number;
  grid_size: number;
}

interface BattleshipPlayer {
  id: string;
  game_id: string;
  player_index: number;
  ships: Ship[];
  hits_received: { x: number; y: number }[];
  is_eliminated: boolean;
}

interface BattleshipShot {
  shooter_index: number;
  target_index: number;
  x: number;
  y: number;
  is_hit: boolean;
}

const BattleshipPlayer = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [game, setGame] = useState<BattleshipGame | null>(null);
  const [players, setPlayers] = useState<BattleshipPlayer[]>([]);
  const [myPlayer, setMyPlayer] = useState<BattleshipPlayer | null>(null);
  const [shots, setShots] = useState<BattleshipShot[]>([]);
  const [playerIndex, setPlayerIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [showMyShips, setShowMyShips] = useState(true);

  const gameStarted = game?.status === 'playing';
  const gameEnded = game?.status === 'finished';
  const isMyTurn = game?.current_player_index === playerIndex;
  const isEliminated = myPlayer?.is_eliminated || false;

  const activePlayers = players.filter(p => !p.is_eliminated);
  const winner = gameEnded && activePlayers.length === 1 ? activePlayers[0] : null;

  const generateShips = (gridSize: number): Ship[] => {
    const ships: Ship[] = [];
    const occupied = new Set<string>();
    const sizes = [1, 2, 3];

    for (const size of sizes) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        attempts++;
        const horizontal = Math.random() > 0.5;
        const maxX = horizontal ? gridSize - size : gridSize - 1;
        const maxY = horizontal ? gridSize - 1 : gridSize - size;
        const x = Math.floor(Math.random() * (maxX + 1));
        const y = Math.floor(Math.random() * (maxY + 1));

        const cells: { x: number; y: number }[] = [];
        let valid = true;

        for (let i = 0; i < size; i++) {
          const cx = horizontal ? x + i : x;
          const cy = horizontal ? y : y + i;
          const key = `${cx},${cy}`;

          if (occupied.has(key)) {
            valid = false;
            break;
          }
          cells.push({ x: cx, y: cy });
        }

        if (valid) {
          cells.forEach(c => occupied.add(`${c.x},${c.y}`));
          ships.push({ x, y, size, cells });
          placed = true;
        }
      }
    }

    return ships;
  };

  const initGame = useCallback(async () => {
    if (!code) return;

    const { data: gameData, error: gameError } = await supabase
      .from("battleship_games")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (gameError || !gameData) {
      setError(t("games.not_found"));
      setIsLoading(false);
      return;
    }

    setGame(gameData);

    const { data: playersData } = await supabase
      .from("battleship_players")
      .select("*")
      .eq("game_id", gameData.id)
      .order("player_index");

    const parsedPlayers = (playersData || []).map(p => ({
      ...p,
      ships: (p.ships as unknown as Ship[]) || [],
      hits_received: (p.hits_received as unknown as { x: number; y: number }[]) || [],
    }));

    setPlayers(parsedPlayers);

    const existingIndex = searchParams.get("p");

    if (existingIndex !== null) {
      const idx = parseInt(existingIndex);
      const existingPlayer = parsedPlayers.find(p => p.player_index === idx);
      if (existingPlayer) {
        setPlayerIndex(idx);
        setMyPlayer(existingPlayer);
        setIsLoading(false);

        // Fetch shots
        const { data: shotsData } = await supabase
          .from("battleship_shots")
          .select("*")
          .eq("game_id", gameData.id);
        setShots(shotsData || []);
        return;
      }
    }

    // Assign new player index
    const usedIndices = parsedPlayers.map(p => p.player_index);
    // Admin is player_count - 1, so we assign from 0 to player_count - 2
    let availableIndex = -1;
    for (let i = 0; i < gameData.player_count - 1; i++) {
      if (!usedIndices.includes(i)) {
        availableIndex = i;
        break;
      }
    }

    if (availableIndex === -1) {
      setError(t("games.all_slots_taken"));
      setIsLoading(false);
      return;
    }

    const ships = generateShips(gameData.grid_size);

    const { data: newPlayer, error: insertError } = await supabase
      .from("battleship_players")
      .insert({
        game_id: gameData.id,
        player_index: availableIndex,
        ships: ships as unknown as any,
      })
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      setError(t("games.registration_error"));
      setIsLoading(false);
      return;
    }

    setSearchParams({ p: String(availableIndex) });
    setPlayerIndex(availableIndex);
    setMyPlayer({
      ...newPlayer,
      ships,
      hits_received: [],
    });

    // Fetch shots
    const { data: shotsData } = await supabase
      .from("battleship_shots")
      .select("*")
      .eq("game_id", gameData.id);
    setShots(shotsData || []);

    setIsLoading(false);
  }, [code, searchParams, setSearchParams, t]);

  useStableConnection({
    channelName: `battleship-player-${code}`,
    onReconnect: initGame,
  });

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (!game) return;

    const channel = supabase
      .channel(`battleship-player-updates-${code}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "battleship_players" },
        async () => {
          const { data: playersData } = await supabase
            .from("battleship_players")
            .select("*")
            .eq("game_id", game.id)
            .order("player_index");

          const parsedPlayers = (playersData || []).map(p => ({
            ...p,
            ships: (p.ships as unknown as Ship[]) || [],
            hits_received: (p.hits_received as unknown as { x: number; y: number }[]) || [],
          }));

          setPlayers(parsedPlayers);

          if (playerIndex !== null) {
            const myP = parsedPlayers.find(p => p.player_index === playerIndex);
            if (myP) setMyPlayer(myP);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "battleship_shots" },
        async () => {
          const { data: shotsData } = await supabase
            .from("battleship_shots")
            .select("*")
            .eq("game_id", game.id);
          setShots(shotsData || []);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "battleship_games", filter: `id=eq.${game.id}` },
        (payload) => {
          const newGame = payload.new as BattleshipGame;
          const wasMyTurn = game.current_player_index === playerIndex;
          const isNowMyTurn = newGame.current_player_index === playerIndex;

          if (!wasMyTurn && isNowMyTurn) {
            playNotificationSound();
          }

          setGame(newGame);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game?.id, code, playerIndex]);

  const handleShoot = async (targetIndex: number, x: number, y: number) => {
    if (!game || !isMyTurn || isEliminated || playerIndex === null || targetIndex === playerIndex) return;

    const targetPlayer = players.find(p => p.player_index === targetIndex);
    if (!targetPlayer || targetPlayer.is_eliminated) return;

    // Check if already shot there
    const alreadyShot = shots.some(
      s => s.shooter_index === playerIndex && s.target_index === targetIndex && s.x === x && s.y === y
    );
    if (alreadyShot) return;

    // Check if hit
    const isHit = targetPlayer.ships.some(ship =>
      ship.cells.some(cell => cell.x === x && cell.y === y)
    );

    // Record shot
    await supabase.from("battleship_shots").insert({
      game_id: game.id,
      shooter_index: playerIndex,
      target_index: targetIndex,
      x,
      y,
      is_hit: isHit,
    });

    if (isHit) {
      // Update target's hits_received
      const newHits = [...targetPlayer.hits_received, { x, y }];
      await supabase
        .from("battleship_players")
        .update({ hits_received: newHits as unknown as any })
        .eq("id", targetPlayer.id);

      // Check if all ships destroyed
      const allShipCells = targetPlayer.ships.flatMap(s => s.cells);
      const allDestroyed = allShipCells.every(cell =>
        newHits.some(h => h.x === cell.x && h.y === cell.y)
      );

      if (allDestroyed) {
        await supabase
          .from("battleship_players")
          .update({ is_eliminated: true })
          .eq("id", targetPlayer.id);

        // Check if game over
        const remainingPlayers = players.filter(
          p => !p.is_eliminated && p.player_index !== targetIndex
        );

        if (remainingPlayers.length === 1) {
          await supabase
            .from("battleship_games")
            .update({ status: 'finished' })
            .eq("id", game.id);
          return;
        }
      }
    }

    // Next player's turn
    let nextPlayer = (game.current_player_index + 1) % game.player_count;
    const currentPlayers = players.map(p =>
      p.player_index === targetIndex && isHit
        ? { ...p, hits_received: [...p.hits_received, { x, y }] }
        : p
    );

    while (true) {
      const np = currentPlayers.find(p => p.player_index === nextPlayer);
      if (np && !np.is_eliminated) break;
      nextPlayer = (nextPlayer + 1) % game.player_count;
      if (nextPlayer === game.current_player_index) break;
    }

    await supabase
      .from("battleship_games")
      .update({ current_player_index: nextPlayer })
      .eq("id", game.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground animate-pulse">{t("games.loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <p className="text-foreground font-bold mb-2">{error}</p>
          <p className="text-muted-foreground text-sm">{t("games.ask_link")}</p>
        </div>
      </div>
    );
  }

  if (!game || !myPlayer || playerIndex === null) return null;

  // Waiting for game to start
  if (!gameStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/games")}
          className="absolute top-4 left-4"
        >
          <Home className="w-5 h-5" />
        </Button>
        <div className="text-center animate-fade-in">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
            {t("games.player")} #{playerIndex + 1}
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t("games.battleship.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("games.waiting_players")}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {players.length} / {game.player_count}
          </p>
        </div>
      </div>
    );
  }

  const myShipCells = new Set(
    myPlayer.ships.flatMap(s => s.cells.map(c => `${c.x},${c.y}`))
  );
  const myHits = new Set(
    myPlayer.hits_received.map(h => `${h.x},${h.y}`)
  );

  const targetPlayer = selectedTarget !== null
    ? players.find(p => p.player_index === selectedTarget)
    : null;

  const getShotsAtTarget = (targetIndex: number) => {
    return shots.filter(s => s.shooter_index === playerIndex && s.target_index === targetIndex);
  };

  const renderMyGrid = () => {
    const cells = [];
    for (let y = 0; y < game.grid_size; y++) {
      for (let x = 0; x < game.grid_size; x++) {
        const key = `${x},${y}`;
        const isShip = myShipCells.has(key);
        const isHit = myHits.has(key);

        cells.push(
          <div
            key={key}
            className={`aspect-square border border-border/50 flex items-center justify-center text-xs ${
              isHit
                ? isShip
                  ? "bg-destructive"
                  : "bg-muted"
                : isShip && showMyShips
                ? "bg-primary"
                : "bg-background"
            }`}
          >
            {isHit && isShip && "💥"}
            {isHit && !isShip && "•"}
          </div>
        );
      }
    }
    return cells;
  };

  const renderTargetGrid = () => {
    if (!targetPlayer || selectedTarget === null) return null;

    const myShots = getShotsAtTarget(selectedTarget);
    const shotMap = new Map(myShots.map(s => [`${s.x},${s.y}`, s.is_hit]));

    const cells = [];
    for (let y = 0; y < game.grid_size; y++) {
      for (let x = 0; x < game.grid_size; x++) {
        const key = `${x},${y}`;
        const hasShot = shotMap.has(key);
        const isHit = shotMap.get(key);

        cells.push(
          <div
            key={key}
            onClick={() => !hasShot && isMyTurn && handleShoot(selectedTarget, x, y)}
            className={`aspect-square border border-border/50 flex items-center justify-center text-xs cursor-pointer transition-colors ${
              hasShot
                ? isHit
                  ? "bg-destructive"
                  : "bg-muted-foreground/30"
                : isMyTurn
                ? "bg-background hover:bg-accent"
                : "bg-background"
            }`}
          >
            {hasShot && isHit && "💥"}
            {hasShot && !isHit && "•"}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-background relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate("/games")}
        className="absolute top-4 left-4"
      >
        <Home className="w-5 h-5" />
      </Button>

      <div className="w-full max-w-md pt-16 animate-fade-in">
        {winner ? (
          <div className="text-center mb-6 p-4 bg-primary/20 border border-primary/40 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              🏆 {winner.player_index === playerIndex
                ? t("games.battleship.you_won")
                : `${t("games.player")} #${winner.player_index + 1} ${t("games.battleship.won")}`}!
            </p>
          </div>
        ) : isEliminated ? (
          <div className="text-center mb-6 p-4 bg-destructive/20 border border-destructive/40 rounded-lg">
            <p className="text-xl font-bold text-destructive">
              {t("games.battleship.you_eliminated")}
            </p>
          </div>
        ) : isMyTurn ? (
          <div className="text-center mb-4 p-3 bg-primary/20 border border-primary/40 rounded-lg animate-pulse">
            <p className="text-lg font-bold text-primary">
              🎯 {t("games.battleship.your_turn")}
            </p>
          </div>
        ) : (
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              {t("games.battleship.current_turn")}: {t("games.player")} #{game.current_player_index + 1}
            </p>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mb-4">
          {t("games.player")} #{playerIndex + 1}
        </p>

        {/* Target selection */}
        {!isEliminated && !gameEnded && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {players
              .filter(p => p.player_index !== playerIndex && !p.is_eliminated)
              .map(p => (
                <Button
                  key={p.player_index}
                  variant={selectedTarget === p.player_index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTarget(p.player_index)}
                >
                  {t("games.player")} #{p.player_index + 1}
                </Button>
              ))}
          </div>
        )}

        {/* Target grid */}
        {selectedTarget !== null && targetPlayer && !isEliminated && !gameEnded && (
          <div className="mb-6">
            <p className="text-sm font-bold text-center mb-2">
              {t("games.battleship.attacking")}: {t("games.player")} #{selectedTarget + 1}
            </p>
            <div
              className="grid gap-0.5 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${game.grid_size}, 1fr)`,
                maxWidth: "300px",
              }}
            >
              {renderTargetGrid()}
            </div>
          </div>
        )}

        {/* My ships */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold">{t("games.battleship.my_ships")}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMyShips(!showMyShips)}
            >
              {showMyShips ? t("games.hide") : t("games.battleship.show")}
            </Button>
          </div>
          <div
            className="grid gap-0.5 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${game.grid_size}, 1fr)`,
              maxWidth: "250px",
            }}
          >
            {renderMyGrid()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleshipPlayer;
