import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PlayerPresence {
  playerIndex: number;
  lastSeen: number;
  playerId: string;
}

interface UseBattleshipPresenceOptions {
  gameId: string | undefined;
  playerIndex: number | null;
  playerId: string | null;
  isGameActive: boolean;
  onPlayerDisconnect?: (playerIndex: number, playerId: string) => void;
}

const PRESENCE_TIMEOUT = 30000; // 30 seconds without heartbeat = disconnected
const HEARTBEAT_INTERVAL = 10000; // 10 seconds

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

  // Check for disconnected players (only admin/host should do this)
  const checkDisconnectedPlayers = useCallback(() => {
    const now = Date.now();
    
    presenceMapRef.current.forEach((presence, idx) => {
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
              presenceMapRef.current.set(presence.playerIndex, {
                playerIndex: presence.playerIndex,
                playerId: presence.playerId,
                lastSeen: presence.lastSeen || Date.now(),
              });
            }
          });
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('[BattleshipPresence] Player left:', leftPresences);
        
        leftPresences.forEach((presence: any) => {
          if (presence.playerIndex !== undefined && presence.playerId) {
            // Player explicitly left - trigger disconnect
            onPlayerDisconnect?.(presence.playerIndex, presence.playerId);
            presenceMapRef.current.delete(presence.playerIndex);
          }
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          sendHeartbeat();
          
          // Start heartbeat interval
          heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
          
          // Start checking for disconnected players
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
