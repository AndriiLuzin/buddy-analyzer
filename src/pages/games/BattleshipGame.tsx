import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/audio";
import { Home, Settings, User, Share2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useStableConnection } from "@/hooks/useStableConnection";
import { useBattleshipPresence } from "@/hooks/useBattleshipPresence";
import { GameShareModal } from "@/components/GameShareModal";

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

const BattleshipGame = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [game, setGame] = useState<BattleshipGame | null>(null);
  const [players, setPlayers] = useState<BattleshipPlayer[]>([]);
  const [shots, setShots] = useState<BattleshipShot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'admin' | 'player'>('admin');
  const [showShareModal, setShowShareModal] = useState(false);

  const gameUrl = `${window.location.origin}/games/battleship-play/${code}`;
  const adminIndex = game ? game.player_count - 1 : 0;
  const allJoined = game ? players.length >= game.player_count : false;
  const gameStarted = game?.status === 'playing';
  const gameEnded = game?.status === 'finished';

  const adminPlayer = players.find(p => p.player_index === adminIndex);
  const isAdminTurn = game?.current_player_index === adminIndex;
  const isAdminEliminated = adminPlayer?.is_eliminated || false;

  const activePlayers = players.filter(p => !p.is_eliminated);
  const winner = gameEnded && activePlayers.length === 1 ? activePlayers[0] : null;

  const fetchGame = useCallback(async () => {
    if (!code) return;

    const { data: gameData, error } = await supabase
      .from("battleship_games")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (error || !gameData) {
      toast.error(t("games.not_found"));
      navigate("/games");
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

    // Register admin as last player if not exists
    const adminExists = parsedPlayers.some(p => p.player_index === gameData.player_count - 1);
    if (!adminExists && parsedPlayers.length < gameData.player_count) {
      // Generate unique ships for admin
      const ships = generateShips(gameData.grid_size);
      const { data: newPlayer, error: insertError } = await supabase
        .from("battleship_players")
        .insert({
          game_id: gameData.id,
          player_index: gameData.player_count - 1,
          ships: ships as unknown as any,
        })
        .select()
        .single();

      if (!insertError && newPlayer) {
        parsedPlayers.push({
          ...newPlayer,
          ships: ships,
          hits_received: [],
        });
      }
    }

    setPlayers(parsedPlayers);

    // Check if all players joined and start game
    if (parsedPlayers.length >= gameData.player_count && gameData.status === 'waiting') {
      await supabase
        .from("battleship_games")
        .update({ status: 'playing' })
        .eq("id", gameData.id);
      setGame({ ...gameData, status: 'playing' });
      playNotificationSound();
    }

    const { data: shotsData } = await supabase
      .from("battleship_shots")
      .select("*")
      .eq("game_id", gameData.id);

    setShots(shotsData || []);

    setIsLoading(false);
  }, [code, navigate, t]);
  // Handle player disconnection - eliminate them
  const handlePlayerDisconnect = useCallback(async (disconnectedPlayerIndex: number, disconnectedPlayerId: string) => {
    if (!game || game.status !== 'playing') return;
    
    // Find the player
    const disconnectedPlayer = players.find(p => p.id === disconnectedPlayerId);
    if (!disconnectedPlayer || disconnectedPlayer.is_eliminated) return;
    
    console.log(`[Battleship Admin] Player ${disconnectedPlayerIndex} disconnected, eliminating...`);
    
    // Mark all their ships as hit and eliminate them
    const allShipCells = disconnectedPlayer.ships.flatMap(s => s.cells);
    const newHits = allShipCells.map(cell => ({ x: cell.x, y: cell.y }));
    
    await supabase
      .from("battleship_players")
      .update({ 
        hits_received: newHits as unknown as any,
        is_eliminated: true 
      })
      .eq("id", disconnectedPlayerId);
    
    // Check if only one player remains
    const remainingPlayers = players.filter(
      p => !p.is_eliminated && p.id !== disconnectedPlayerId
    );
    
    if (remainingPlayers.length === 1) {
      await supabase
        .from("battleship_games")
        .update({ status: 'finished' })
        .eq("id", game.id);
    } else if (game.current_player_index === disconnectedPlayerIndex) {
      // If it was the disconnected player's turn, skip to next
      let nextPlayer = (disconnectedPlayerIndex + 1) % game.player_count;
      while (true) {
        const np = players.find(p => p.player_index === nextPlayer);
        if (np && !np.is_eliminated && np.id !== disconnectedPlayerId) break;
        nextPlayer = (nextPlayer + 1) % game.player_count;
        if (nextPlayer === disconnectedPlayerIndex) break;
      }
      
      await supabase
        .from("battleship_games")
        .update({ current_player_index: nextPlayer })
        .eq("id", game.id);
    }
  }, [game, players]);

  useStableConnection({
    channelName: `battleship-game-${code}`,
    onReconnect: fetchGame,
  });

  // Track presence for disconnection detection (admin perspective)
  useBattleshipPresence({
    gameId: game?.id,
    playerIndex: adminIndex,
    playerId: adminPlayer?.id || null,
    isGameActive: gameStarted && !gameEnded,
    onPlayerDisconnect: handlePlayerDisconnect,
  });

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  useEffect(() => {
    if (!game) return;

    const channel = supabase
      .channel(`battleship-updates-${code}`)
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

          if (parsedPlayers.length >= game.player_count && game.status === 'waiting') {
            await supabase
              .from("battleship_games")
              .update({ status: 'playing' })
              .eq("id", game.id);
            setGame({ ...game, status: 'playing' });
            playNotificationSound();
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
          setGame(payload.new as BattleshipGame);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game?.id, game?.player_count, game?.status, code]);

  // Generate ships with unique random placement for each player
  const generateShips = (gridHeight: number): Ship[] => {
    const ships: Ship[] = [];
    const occupied = new Set<string>();
    const sizes = [1, 2, 3];

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

  const handleShoot = async (x: number, y: number) => {
    if (!game || !isAdminTurn || isAdminEliminated) return;

    // Check if already shot at this cell (by anyone)
    const alreadyShot = shots.some(s => s.x === x && s.y === y);
    if (alreadyShot) return;

    // Check if it's my own ship
    const myShips = adminPlayer?.ships || [];
    const isMyShip = myShips.some(ship =>
      ship.cells.some(cell => cell.x === x && cell.y === y)
    );
    if (isMyShip) return;

    // Check if we hit any player's ship at this cell
    let targetIndex = -1;
    let isHit = false;
    for (const p of players) {
      if (p.player_index === adminIndex) continue;
      const hasShipHere = p.ships.some(ship =>
        ship.cells.some(cell => cell.x === x && cell.y === y)
      );
      if (hasShipHere) {
        targetIndex = p.player_index;
        isHit = true;
        break;
      }
    }

    // Record shot
    await supabase.from("battleship_shots").insert({
      game_id: game.id,
      shooter_index: adminIndex,
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

  const startNewGame = async () => {
    if (!game) return;

    try {
      // Delete old data
      await supabase.from("battleship_shots").delete().eq("game_id", game.id);
      await supabase.from("battleship_players").delete().eq("game_id", game.id);

      // Reset game
      await supabase
        .from("battleship_games")
        .update({ status: 'waiting', current_player_index: 0 })
        .eq("id", game.id);

      // Re-register admin with fresh ships
      const ships = generateShips(game.grid_size);
      await supabase.from("battleship_players").insert({
        game_id: game.id,
        player_index: game.player_count - 1,
        ships: ships as unknown as any,
      });

      setPlayers([]);
      setShots([]);
      setViewMode('admin');

      toast.success(t("games.battleship.new_game_started"));
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

  // Player view mode
  if (viewMode === 'player' && gameStarted && adminPlayer) {
    return (
      <BattleshipPlayerView
        game={game}
        adminPlayer={adminPlayer}
        players={players}
        shots={shots}
        adminIndex={adminIndex}
        isAdminTurn={isAdminTurn}
        isAdminEliminated={isAdminEliminated}
        handleShoot={handleShoot}
        setViewMode={setViewMode}
        winner={winner}
        t={t}
        navigate={navigate}
      />
    );
  }

  // Admin panel view
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative">
      <div className="absolute top-4 left-4 flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/games")}>
          <Home className="w-5 h-5" />
        </Button>
        {gameStarted && !isAdminEliminated && (
          <Button variant="outline" size="icon" onClick={() => setViewMode('player')}>
            <User className="w-5 h-5" />
          </Button>
        )}
      </div>
      
      <GameShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        gameCode={code || ''}
        gameName={t("games.battleship.title")}
        gamePath="/games/battleship-play"
      />

      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            {t("games.game")} {code}
          </h1>
          <p className="text-muted-foreground text-sm">
            {players.length} / {game.player_count} {t("games.players_viewed")}
          </p>
          <p className="text-xs text-primary mt-2">
            {t('games.you')}: {t('games.player')} #{adminIndex + 1}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('games.battleship.grid_size')}: {GRID_WIDTH}x{game.grid_size}
          </p>
        </div>

        {gameStarted && !isAdminEliminated && (
          <Button
            onClick={() => setViewMode('player')}
            className="w-full h-14 text-lg font-bold uppercase tracking-wider mb-6"
          >
            {t("games.battleship.go_to_game")}
          </Button>
        )}

        {winner && (
          <div className="text-center mb-6 p-4 bg-primary/20 border border-primary/40 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              🏆 {t("games.player")} #{winner.player_index + 1} {t("games.battleship.won")}!
            </p>
          </div>
        )}

        {!gameStarted && (
          <>
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
              <Button 
                onClick={() => setShowShareModal(true)}
                variant="outline"
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {t("games.share.title")}
              </Button>
            </div>

            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground">
                {t("games.waiting_players")}
              </p>
            </div>
          </>
        )}

        <div className="space-y-2 mb-8">
          {Array.from({ length: game.player_count }).map((_, i) => {
            const player = players.find(p => p.player_index === i);
            const hasJoined = !!player;
            const isEliminated = player?.is_eliminated;
            const isAdmin = i === adminIndex;
            const displayName = isAdmin 
              ? t("games.you") 
              : player?.player_name || `${t("games.player")} #${i + 1}`;
            const colorIndex = i % PLAYER_COLORS.length;
            
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isEliminated
                    ? "opacity-50 line-through"
                    : hasJoined
                    ? ""
                    : "bg-secondary text-muted-foreground"
                } ${hasJoined ? PLAYER_COLORS[colorIndex].bg : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  hasJoined 
                    ? `${PLAYER_COLORS[colorIndex].bg} ${PLAYER_COLORS[colorIndex].text} border-2 border-white/30`
                    : "bg-muted"
                }`}>
                  {i + 1}
                </div>
                <span className={`font-medium truncate ${hasJoined ? PLAYER_COLORS[colorIndex].text : ""}`}>
                  {hasJoined ? displayName : t("games.waiting_player")}
                </span>
                {hasJoined && !isAdmin && (
                  <span className={`ml-auto text-xs ${PLAYER_COLORS[colorIndex].text} opacity-70`}>✓</span>
                )}
              </div>
            );
          })}
        </div>

        <Button
          onClick={startNewGame}
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

// Player view component - unified grid like BattleshipPlayer
interface BattleshipPlayerViewProps {
  game: BattleshipGame;
  adminPlayer: BattleshipPlayer;
  players: BattleshipPlayer[];
  shots: BattleshipShot[];
  adminIndex: number;
  isAdminTurn: boolean;
  isAdminEliminated: boolean;
  handleShoot: (x: number, y: number) => void;
  setViewMode: (mode: 'admin' | 'player') => void;
  winner: BattleshipPlayer | null;
  t: (key: string) => string;
  navigate: (path: string) => void;
}

const BattleshipPlayerView = ({
  game,
  adminPlayer,
  players,
  shots,
  adminIndex,
  isAdminTurn,
  isAdminEliminated,
  handleShoot,
  setViewMode,
  winner,
  t,
  navigate,
}: BattleshipPlayerViewProps) => {
  const [showTurnNotification, setShowTurnNotification] = useState(false);
  const gameEnded = game.status === 'finished';

  // Show turn notification when it becomes my turn
  useEffect(() => {
    if (isAdminTurn && !gameEnded && !isAdminEliminated) {
      setShowTurnNotification(true);
      const timer = setTimeout(() => setShowTurnNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isAdminTurn, gameEnded, isAdminEliminated]);

  const myShipCells = new Set(
    adminPlayer.ships.flatMap(s => s.cells.map(c => `${c.x},${c.y}`))
  );
  const myHits = new Set(
    adminPlayer.hits_received.map(h => `${h.x},${h.y}`)
  );

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
          bgClass = isAdminTurn ? "bg-muted-foreground/50" : "bg-primary";
        }
        // Enemy ships stay hidden (bg-background) until hit

        // Can only shoot at cells that don't have my ships and weren't shot yet
        const canShoot = isAdminTurn && !cellWasShot && !isMyShip && !isAdminEliminated && !gameEnded;

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

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-background relative">
      <div className="absolute top-4 left-4 flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/games")}>
          <Home className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setViewMode('admin')}>
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="w-full max-w-md pt-16 animate-fade-in">
        {/* Turn notification banner */}
        {showTurnNotification && isAdminTurn && !isAdminEliminated && !gameEnded && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg font-bold">
              🎯 {t("games.battleship.your_turn")}!
            </div>
          </div>
        )}

        {winner ? (
          <div className="text-center mb-6 p-4 bg-primary/20 border border-primary/40 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              🏆 {winner.player_index === adminIndex
                ? t("games.battleship.you_won")
                : `${t("games.player")} #${winner.player_index + 1} ${t("games.battleship.won")}`}!
            </p>
          </div>
        ) : isAdminEliminated ? (
          <div className="text-center mb-6 p-4 bg-destructive/20 border border-destructive/40 rounded-lg">
            <p className="text-xl font-bold text-destructive">
              {t("games.battleship.you_eliminated")}
            </p>
          </div>
        ) : isAdminTurn ? (
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
          {t("games.player")} #{adminIndex + 1}
        </p>

        {/* Players display with colors */}
        {!gameEnded && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {players
              .sort((a, b) => a.player_index - b.player_index)
              .map(p => {
                const colorIndex = p.player_index % PLAYER_COLORS.length;
                const isMe = p.player_index === adminIndex;
                const isElim = p.is_eliminated;
                
                return (
                  <div
                    key={p.player_index}
                    className={`text-xs px-2 py-1 rounded ${PLAYER_COLORS[colorIndex].bg} ${PLAYER_COLORS[colorIndex].text} ${
                      isElim ? "opacity-50 line-through" : ""
                    }`}
                  >
                    {p.player_name || `${t("games.player")} #${p.player_index + 1}`}
                    {isMe && " (Вы)"}
                  </div>
                );
              })}
          </div>
        )}

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs mb-4">
          <div className="flex items-center gap-1">
            <div className={`w-4 h-4 rounded ${isAdminTurn ? "bg-muted-foreground/50" : "bg-primary"}`}></div>
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
            {isAdminTurn ? t("games.battleship.tap_to_shoot") : t("games.battleship.wait_turn")}
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

export default BattleshipGame;
