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

const BattleshipGame = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [game, setGame] = useState<BattleshipGame | null>(null);
  const [players, setPlayers] = useState<BattleshipPlayer[]>([]);
  const [shots, setShots] = useState<BattleshipShot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'admin' | 'player'>('admin');
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
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

  useStableConnection({
    channelName: `battleship-game-${code}`,
    onReconnect: fetchGame,
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

  const handleShoot = async (targetIndex: number, x: number, y: number) => {
    if (!game || !isAdminTurn || isAdminEliminated || targetIndex === adminIndex) return;

    const targetPlayer = players.find(p => p.player_index === targetIndex);
    if (!targetPlayer || targetPlayer.is_eliminated) return;

    // Check if already shot there
    const alreadyShot = shots.some(
      s => s.shooter_index === adminIndex && s.target_index === targetIndex && s.x === x && s.y === y
    );
    if (alreadyShot) return;

    // Check if hit
    const isHit = targetPlayer.ships.some(ship =>
      ship.cells.some(cell => cell.x === x && cell.y === y)
    );

    // Record shot
    await supabase.from("battleship_shots").insert({
      game_id: game.id,
      shooter_index: adminIndex,
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

      // Re-register admin
      const ships = generateShips(game.grid_size);
      await supabase.from("battleship_players").insert({
        game_id: game.id,
        player_index: game.player_count - 1,
        ships: ships as unknown as any,
      });

      setPlayers([]);
      setShots([]);
      setSelectedTarget(null);
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
        selectedTarget={selectedTarget}
        setSelectedTarget={setSelectedTarget}
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
        <Button variant="outline" size="icon" onClick={() => setShowShareModal(true)}>
          <Share2 className="w-5 h-5" />
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
            {t('games.battleship.grid_size')}: {game.grid_size}x{game.grid_size}
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

        <div className="grid grid-cols-5 gap-2 mb-8">
          {Array.from({ length: game.player_count }).map((_, i) => {
            const player = players.find(p => p.player_index === i);
            const hasJoined = !!player;
            const isEliminated = player?.is_eliminated;
            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center text-sm font-bold transition-colors ${
                  isEliminated
                    ? "bg-destructive/30 text-destructive line-through"
                    : hasJoined
                    ? i === adminIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground text-background"
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

// Player view component
interface BattleshipPlayerViewProps {
  game: BattleshipGame;
  adminPlayer: BattleshipPlayer;
  players: BattleshipPlayer[];
  shots: BattleshipShot[];
  adminIndex: number;
  isAdminTurn: boolean;
  isAdminEliminated: boolean;
  selectedTarget: number | null;
  setSelectedTarget: (index: number | null) => void;
  handleShoot: (targetIndex: number, x: number, y: number) => void;
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
  selectedTarget,
  setSelectedTarget,
  handleShoot,
  setViewMode,
  winner,
  t,
  navigate,
}: BattleshipPlayerViewProps) => {
  const [showMyShips, setShowMyShips] = useState(true);

  const myShipCells = new Set(
    adminPlayer.ships.flatMap(s => s.cells.map(c => `${c.x},${c.y}`))
  );
  const myHits = new Set(
    adminPlayer.hits_received.map(h => `${h.x},${h.y}`)
  );

  const targetPlayer = selectedTarget !== null
    ? players.find(p => p.player_index === selectedTarget)
    : null;

  const getShotsAtTarget = (targetIndex: number) => {
    return shots.filter(s => s.shooter_index === adminIndex && s.target_index === targetIndex);
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
            onClick={() => !hasShot && isAdminTurn && handleShoot(selectedTarget, x, y)}
            className={`aspect-square border border-border/50 flex items-center justify-center text-xs cursor-pointer transition-colors ${
              hasShot
                ? isHit
                  ? "bg-destructive"
                  : "bg-muted-foreground/30"
                : isAdminTurn
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
      <div className="absolute top-4 left-4 flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/games")}>
          <Home className="w-5 h-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setViewMode('admin')}>
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      <div className="w-full max-w-md pt-16 animate-fade-in">
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
          {t("games.player")} #{adminIndex + 1}
        </p>

        {/* Target selection */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {players
            .filter(p => p.player_index !== adminIndex && !p.is_eliminated)
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

        {/* Target grid */}
        {selectedTarget !== null && targetPlayer && (
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

export default BattleshipGame;
