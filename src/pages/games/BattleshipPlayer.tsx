import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  player_name: string | null;
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

const GRID_WIDTH = 8; // Grid width is always 8, height varies by player count

// Player colors for destroyed ships
const PLAYER_COLORS = [
  { bg: "bg-blue-500", text: "text-white" },
  { bg: "bg-green-500", text: "text-white" },
  { bg: "bg-yellow-500", text: "text-black" },
  { bg: "bg-purple-500", text: "text-white" },
  { bg: "bg-orange-500", text: "text-white" },
  { bg: "bg-pink-500", text: "text-white" },
  { bg: "bg-cyan-500", text: "text-black" },
  { bg: "bg-red-500", text: "text-white" },
];

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
  
  const [showTurnNotification, setShowTurnNotification] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const gameStarted = game?.status === 'playing';
  const gameEnded = game?.status === 'finished';
  const isMyTurn = game?.current_player_index === playerIndex;
  const isEliminated = myPlayer?.is_eliminated || false;

  const activePlayers = players.filter(p => !p.is_eliminated);
  const winner = gameEnded && activePlayers.length === 1 ? activePlayers[0] : null;

  // Show turn notification when it becomes my turn
  useEffect(() => {
    if (isMyTurn && gameStarted && !gameEnded && !isEliminated) {
      setShowTurnNotification(true);
      const timer = setTimeout(() => setShowTurnNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isMyTurn, gameStarted, gameEnded, isEliminated]);

  // Generate ships with unique random placement for each player
  // Uses timestamp + random seed to ensure different placements even with same link
  const generateShips = (gridHeight: number): Ship[] => {
    const ships: Ship[] = [];
    const myOccupied = new Set<string>();
    const sizes = [1, 2, 3];
    
    // Use current timestamp + Math.random for unique seed
    const seed = Date.now() + Math.random() * 1000000;
    const seededRandom = () => {
      const x = Math.sin(seed + ships.length * 100 + myOccupied.size) * 10000;
      return x - Math.floor(x);
    };

    for (const size of sizes) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        attempts++;
        const horizontal = Math.random() > 0.5;
        const maxX = horizontal ? GRID_WIDTH - size : GRID_WIDTH - 1;
        const maxY = horizontal ? gridHeight - 1 : gridHeight - size;
        const x = Math.floor(Math.random() * (maxX + 1));
        const y = Math.floor(Math.random() * (maxY + 1));

        const cells: { x: number; y: number }[] = [];
        let valid = true;

        for (let i = 0; i < size; i++) {
          const cx = horizontal ? x + i : x;
          const cy = horizontal ? y : y + i;
          const key = `${cx},${cy}`;

          if (myOccupied.has(key)) {
            valid = false;
            break;
          }
          cells.push({ x: cx, y: cy });
        }

        if (valid) {
          cells.forEach(c => myOccupied.add(`${c.x},${c.y}`));
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

        const { data: shotsData } = await supabase
          .from("battleship_shots")
          .select("*")
          .eq("game_id", gameData.id);
        setShots(shotsData || []);
        return;
      }
    }

    // Check for available slot
    const usedIndices = parsedPlayers.map(p => p.player_index);
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

    // Show name input screen instead of auto-joining
    setPendingIndex(availableIndex);
    setShowNameInput(true);
    setIsLoading(false);
  }, [code, searchParams, t]);

  const handleJoinGame = async () => {
    if (!game || pendingIndex === null || !playerName.trim()) return;
    
    setIsJoining(true);
    
    // Generate unique ships for this player - each player gets their own random placement
    const ships = generateShips(game.grid_size);

    const { data: newPlayer, error: insertError } = await supabase
      .from("battleship_players")
      .insert({
        game_id: game.id,
        player_index: pendingIndex,
        player_name: playerName.trim(),
        ships: ships as unknown as any,
      })
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      setError(t("games.registration_error"));
      setIsJoining(false);
      return;
    }

    setSearchParams({ p: String(pendingIndex) });
    setPlayerIndex(pendingIndex);
    setMyPlayer({
      ...newPlayer,
      ships,
      hits_received: [],
    });
    setShowNameInput(false);

    const { data: shotsData } = await supabase
      .from("battleship_shots")
      .select("*")
      .eq("game_id", game.id);
    setShots(shotsData || []);
    
    setIsJoining(false);
  };

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

  const handleShoot = async (x: number, y: number) => {
    if (!game || !isMyTurn || isEliminated || playerIndex === null || gameEnded) return;

    // Check if it's my ship cell - can't shoot there
    const key = `${x},${y}`;
    if (myShipCells.has(key)) return;

    // Check if already shot at this cell by me
    const alreadyShot = shots.some(
      s => s.shooter_index === playerIndex && s.x === x && s.y === y
    );
    if (alreadyShot) return;

    // Find which player (if any) has a ship at this cell
    let targetIndex = -1;
    let isHit = false;
    
    for (const p of players) {
      if (p.player_index === playerIndex) continue;
      const hasShipHere = p.ships.some(ship =>
        ship.cells.some(cell => cell.x === x && cell.y === y)
      );
      if (hasShipHere) {
        targetIndex = p.player_index;
        isHit = true;
        break;
      }
    }

    // If no ship at this cell, it's a miss - target_index can be -1 for misses
    await supabase.from("battleship_shots").insert({
      game_id: game.id,
      shooter_index: playerIndex,
      target_index: targetIndex,
      x,
      y,
      is_hit: isHit,
    });

    if (isHit && targetIndex >= 0) {
      const targetPlayer = players.find(p => p.player_index === targetIndex);
      if (targetPlayer) {
        const newHits = [...targetPlayer.hits_received, { x, y }];
        await supabase
          .from("battleship_players")
          .update({ hits_received: newHits as unknown as any })
          .eq("id", targetPlayer.id);

        const allShipCells = targetPlayer.ships.flatMap(s => s.cells);
        const allDestroyed = allShipCells.every(cell =>
          newHits.some(h => h.x === cell.x && h.y === cell.y)
        );

        if (allDestroyed) {
          await supabase
            .from("battleship_players")
            .update({ is_eliminated: true })
            .eq("id", targetPlayer.id);

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
    }

    // Move to next player
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

  // Name input screen
  if (showNameInput && game) {
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
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
            {t("games.battleship.title")}
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            {t("games.enter_name")}
          </p>
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder={t("games.your_name")}
            className="mb-4 h-12 text-center text-lg"
            maxLength={20}
            autoFocus
          />
          <Button
            onClick={handleJoinGame}
            disabled={!playerName.trim() || isJoining}
            className="w-full h-12 text-lg font-bold"
          >
            {isJoining ? t("games.loading") : t("games.join_game")}
          </Button>
        </div>
      </div>
    );
  }

  if (!game || !myPlayer || playerIndex === null) return null;

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

  // All ships from all players on the same board
  const allShipCells = new Map<string, number>(); // key -> player_index
  players.forEach(p => {
    p.ships.forEach(ship => {
      ship.cells.forEach(cell => {
        allShipCells.set(`${cell.x},${cell.y}`, p.player_index);
      });
    });
  });

  // All shots on the board - key is just coordinates for all players to see
  const allShotsMap = new Map<string, { shooter: number; isHit: boolean }>();
  shots.forEach(s => {
    const key = `${s.x},${s.y}`;
    allShotsMap.set(key, { shooter: s.shooter_index, isHit: s.is_hit });
  });

  // Check if a ship is fully destroyed
  const getDestroyedShips = () => {
    const destroyedCells = new Map<string, number>(); // cell key -> owner player_index
    
    players.forEach(p => {
      const hitsSet = new Set(p.hits_received.map(h => `${h.x},${h.y}`));
      
      p.ships.forEach(ship => {
        const allCellsHit = ship.cells.every(cell => hitsSet.has(`${cell.x},${cell.y}`));
        if (allCellsHit) {
          // This ship is destroyed - mark all its cells
          ship.cells.forEach(cell => {
            destroyedCells.set(`${cell.x},${cell.y}`, p.player_index);
          });
        }
      });
    });
    
    return destroyedCells;
  };

  const destroyedShipCells = getDestroyedShips();

  // Unified grid: shows ALL ships from ALL players, player shoots at cells WITHOUT their own ships
  // All players see the same shots (hits and misses)
  const renderUnifiedGrid = () => {
    const gridHeight = game.grid_size;
    const cells = [];
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const key = `${x},${y}`;
        const isMyShip = myShipCells.has(key);
        const isMyShipHit = myHits.has(key);
        
        // Check if anyone shot at this cell
        const shotData = allShotsMap.get(key);
        const cellWasShot = shotData !== undefined;
        const wasHit = cellWasShot && shotData.isHit;
        const wasMiss = cellWasShot && !shotData.isHit;

        // Check if this cell belongs to a destroyed ship
        const destroyedOwner = destroyedShipCells.get(key);
        const isDestroyed = destroyedOwner !== undefined;

        let bgClass = "bg-background";
        let content = null;

        // Priority: destroyed ship (player color) > hit > miss > my ship > empty
        if (isDestroyed) {
          // Destroyed ship - show in player's color
          const colorIndex = destroyedOwner % PLAYER_COLORS.length;
          bgClass = PLAYER_COLORS[colorIndex].bg;
          content = <span className={`${PLAYER_COLORS[colorIndex].text} text-xs`}>✕</span>;
        } else if (isMyShip && isMyShipHit) {
          // My ship was hit but not destroyed yet - red
          bgClass = "bg-destructive";
          content = <span className="text-destructive-foreground text-xs">💥</span>;
        } else if (wasHit) {
          // Someone hit a ship here but not destroyed yet - red
          bgClass = "bg-destructive";
          content = <span className="text-destructive-foreground text-xs">💥</span>;
        } else if (wasMiss) {
          // Someone missed here - gray dot
          bgClass = "bg-muted";
          content = <span className="text-muted-foreground">•</span>;
        } else if (isMyShip) {
          // My ship - gray during my turn, blue otherwise
          bgClass = isMyTurn ? "bg-muted-foreground/50" : "bg-primary";
        }
        // Enemy ships stay hidden (bg-background) until hit

        // Can only shoot at cells that don't have my ships and weren't shot yet
        const canShoot = isMyTurn && !cellWasShot && !isMyShip && !isEliminated && !gameEnded;

        cells.push(
          <div
            key={key}
            onClick={() => {
              if (canShoot) {
                handleShoot(x, y);
              }
            }}
            className={`aspect-square border border-border/50 flex items-center justify-center transition-all ${bgClass} ${
              canShoot ? "cursor-pointer hover:bg-accent" : ""
            }`}
          >
            {content}
          </div>
        );
      }
    }
    return cells;
  };

  // No longer need separate grid - we use unified grid always

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
        {/* Turn notification banner */}
        {showTurnNotification && isMyTurn && !isEliminated && !gameEnded && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg font-bold">
              🎯 {t("games.battleship.your_turn")}!
            </div>
          </div>
        )}

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
          <div className="text-center mb-4 p-3 bg-primary/20 border border-primary/40 rounded-lg">
            <p className="text-lg font-bold text-primary">
              🎯 {t("games.battleship.your_turn")}
            </p>
          </div>
        ) : (
          <div className="text-center mb-4 p-2 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              {t("games.battleship.current_turn")}: {t("games.player")} #{game.current_player_index + 1}
            </p>
          </div>
        )}

        <p className="text-xs text-center text-muted-foreground mb-4">
          {t("games.player")} #{playerIndex + 1}
        </p>

        {/* Active players display */}
        {!isEliminated && !gameEnded && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            <span className="text-xs text-muted-foreground self-center mr-2">
              {t("games.battleship.active_players")}:
            </span>
            {players
              .filter(p => !p.is_eliminated)
              .map(p => (
                <div
                  key={p.player_index}
                  className={`text-xs px-2 py-1 rounded ${
                    p.player_index === playerIndex 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {p.player_name || `${t("games.player")} #${p.player_index + 1}`}
                  {p.player_index === playerIndex && " (Вы)"}
                </div>
              ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs mb-4">
          <div className="flex items-center gap-1">
            <div className={`w-4 h-4 rounded ${isMyTurn ? "bg-muted-foreground/50" : "bg-primary"}`}></div>
            <span className="text-muted-foreground">{t("games.battleship.my_ships")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-destructive"></div>
            <span className="text-muted-foreground">{t("games.battleship.hit")}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-muted flex items-center justify-center">•</div>
            <span className="text-muted-foreground">{t("games.battleship.miss")}</span>
          </div>
        </div>

        {/* Unified Grid - all ships on one board */}
        <div className="mb-6">
          <p className="text-sm font-bold text-center mb-2">
            {isMyTurn ? t("games.battleship.tap_to_shoot") : t("games.battleship.wait_turn")}
          </p>
          <div 
            className="overflow-y-auto overflow-x-hidden pb-8"
            style={{ 
              maxWidth: "298px", 
              margin: "0 auto",
              maxHeight: "calc(100vh - 280px)",
            }}
          >
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
                width: "100%",
              }}
            >
              {renderUnifiedGrid()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleshipPlayer;
