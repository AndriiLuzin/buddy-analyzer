import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseStableConnectionOptions {
  channelName: string;
  onReconnect?: () => void;
  heartbeatInterval?: number;
}

export const useStableConnection = ({
  channelName,
  onReconnect,
  heartbeatInterval = 15000, // 15 seconds
}: UseStableConnectionOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectedRef = useRef(false);
  const lastActivityRef = useRef<number>(Date.now());

  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(() => {
      if (channelRef.current) {
        // Send a presence heartbeat to keep connection alive
        channelRef.current.track({
          online_at: new Date().toISOString(),
          heartbeat: true,
        }).catch(console.error);
        
        lastActivityRef.current = Date.now();
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  const reconnect = useCallback(async () => {
    console.log('[StableConnection] Attempting reconnect...');
    
    if (channelRef.current) {
      try {
        await supabase.removeChannel(channelRef.current);
      } catch (e) {
        console.error('[StableConnection] Error removing channel:', e);
      }
    }

    // Create new channel with presence
    const channel = supabase.channel(`${channelName}-presence`, {
      config: {
        presence: {
          key: `user-${Date.now()}`,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('[StableConnection] Presence synced');
        isConnectedRef.current = true;
      })
      .subscribe(async (status) => {
        console.log('[StableConnection] Channel status:', status);
        
        if (status === 'SUBSCRIBED') {
          isConnectedRef.current = true;
          startHeartbeat();
          
          await channel.track({
            online_at: new Date().toISOString(),
            connected: true,
          });
          
          onReconnect?.();
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          isConnectedRef.current = false;
          stopHeartbeat();
        }
      });

    channelRef.current = channel;
    return channel;
  }, [channelName, onReconnect, startHeartbeat, stopHeartbeat]);

  // Handle visibility change (wake from sleep)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[StableConnection] App became visible');
        
        const timeSinceLastActivity = Date.now() - lastActivityRef.current;
        
        // If more than 30 seconds have passed, reconnect
        if (timeSinceLastActivity > 30000 || !isConnectedRef.current) {
          console.log('[StableConnection] Reconnecting after sleep...');
          reconnect();
        } else {
          // Just send a heartbeat to verify connection
          if (channelRef.current) {
            channelRef.current.track({
              online_at: new Date().toISOString(),
              wakeup: true,
            }).catch(() => {
              console.log('[StableConnection] Heartbeat failed, reconnecting...');
              reconnect();
            });
          }
        }
      } else {
        console.log('[StableConnection] App became hidden');
        lastActivityRef.current = Date.now();
      }
    };

    // Handle page focus (alternative to visibility)
    const handleFocus = () => {
      console.log('[StableConnection] Window focused');
      if (!isConnectedRef.current) {
        reconnect();
      }
    };

    // Handle online/offline events
    const handleOnline = () => {
      console.log('[StableConnection] Device came online');
      reconnect();
    };

    const handleOffline = () => {
      console.log('[StableConnection] Device went offline');
      isConnectedRef.current = false;
      stopHeartbeat();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection
    reconnect();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopHeartbeat();
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [reconnect, stopHeartbeat]);

  return {
    isConnected: isConnectedRef.current,
    reconnect,
  };
};
