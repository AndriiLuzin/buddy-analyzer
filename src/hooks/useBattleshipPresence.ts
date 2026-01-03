import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PlayerPresence {
  playerIndex: number;
  lastSeen: number;
  playerId: string;
  wasOnline: boolean; // Only trigger disconnect for players who were online
}

interface UseBattleshipPresenceOptions {
  gameId: string | undefined;
  playerIndex: number | null;
  playerId: string | null;
  isGameActive: boolean;
  onPlayerDisconnect?: (playerIndex: number, playerId: string) => void;
}

const PRESENCE_TIMEOUT = 45000; // 45 seconds without heartbeat = disconnected
const HEARTBEAT_INTERVAL = 10000; // 10 seconds
const GRACE_PERIOD = 60000; // 60 seconds grace period after game starts

export const useBattleshipPresence = ({
  gameId,
  playerIndex,
  playerId,
  isGameActive,
  onPlayerDisconnect,
}: UseBattleshipPresenceOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const presenceMapRef = useRef<Map<number, PlayerPresence>>(new Map());
  const gameStartTimeRef = useRef<number>(0);

  // Send heartbeat to track presence
  const sendHeartbeat = useCallback(() => {
    if (channelRef.current && playerIndex !== null && playerId) {
      channelRef.current.track({
        playerIndex,
        playerId,
        lastSeen: Date.now(),
      }).catch(console.error);
    }
  }, [playerIndex, playerId]);

  // Check for disconnected players - only for those who were online and now gone
  const checkDisconnectedPlayers = useCallback(() => {
    const now = Date.now();
    
    // Don't check during grace period
    if (now - gameStartTimeRef.current < GRACE_PERIOD) {
      console.log('[BattleshipPresence] Still in grace period, skipping disconnect check');
      return;
    }
    
    presenceMapRef.current.forEach((presence, idx) => {
      // Only check players who were actually online at some point
      if (!presence.wasOnline) return;
      
      const timeSinceLastSeen = now - presence.lastSeen;
      
      if (timeSinceLastSeen > PRESENCE_TIMEOUT) {
        console.log(`[BattleshipPresence] Player ${idx} disconnected (${timeSinceLastSeen}ms since last seen)`);
        onPlayerDisconnect?.(idx, presence.playerId);
        presenceMapRef.current.delete(idx);
      }
    });
  }, [onPlayerDisconnect]);

  useEffect(() => {
    if (!gameId || !isGameActive) return;

    // Record game start time for grace period
    gameStartTimeRef.current = Date.now();
    console.log('[BattleshipPresence] Game started, grace period active');

    const channel = supabase.channel(`battleship-presence-${gameId}`, {
      config: {
        presence: {
          key: playerIndex !== null ? `player-${playerIndex}` : `spectator-${Date.now()}`,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        
        // Update presence map
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.playerIndex !== undefined && presence.playerId) {
              const existing = presenceMapRef.current.get(presence.playerIndex);
              presenceMapRef.current.set(presence.playerIndex, {
                playerIndex: presence.playerIndex,
                playerId: presence.playerId,
                lastSeen: presence.lastSeen || Date.now(),
                wasOnline: true, // Mark as was online since we see them now
              });
            }
          });
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const now = Date.now();
        
        // Don't trigger disconnects during grace period
        if (now - gameStartTimeRef.current < GRACE_PERIOD) {
          console.log('[BattleshipPresence] Player left during grace period, ignoring:', leftPresences);
          return;
        }
        
        console.log('[BattleshipPresence] Player left:', leftPresences);
        
        leftPresences.forEach((presence: any) => {
          if (presence.playerIndex !== undefined && presence.playerId) {
            const trackedPlayer = presenceMapRef.current.get(presence.playerIndex);
            
            // Only trigger disconnect if this player was tracked and was online
            if (trackedPlayer && trackedPlayer.wasOnline) {
              onPlayerDisconnect?.(presence.playerIndex, presence.playerId);
            }
            presenceMapRef.current.delete(presence.playerIndex);
          }
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          sendHeartbeat();
          
          // Start heartbeat interval
          heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
          
          // Start checking for disconnected players after grace period
          checkIntervalRef.current = setInterval(checkDisconnectedPlayers, PRESENCE_TIMEOUT / 2);
        }
      });

    channelRef.current = channel;

    // Handle visibility change for heartbeat
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [gameId, playerIndex, isGameActive, sendHeartbeat, checkDisconnectedPlayers, onPlayerDisconnect]);

  return {
    sendHeartbeat,
  };
};
