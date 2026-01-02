import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Sparkles, Gamepad2, Users, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface BottomNavBarProps {
  onFriendsClick?: () => void;
  onAnalyzeClick?: () => void;
  onProfileClick?: () => void;
}

export const BottomNavBar = ({ onFriendsClick, onAnalyzeClick, onProfileClick }: BottomNavBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to message changes
    const channel = supabase
      .channel('unread-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleChatsClick = () => {
    navigate('/chats');
  };

  const handleAnalyzeClick = () => {
    if (onAnalyzeClick) {
      onAnalyzeClick();
    }
  };

  const handleGamesClick = () => {
    navigate('/games');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/50 px-2 sm:px-4 py-2 sm:py-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] sm:pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Chats */}
        <button
          onClick={handleChatsClick}
          className={`p-2 sm:p-3 rounded-full transition-all ${
            isActive('/chats') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
            )}
          </div>
        </button>

        {/* Groups */}
        <button
          onClick={() => navigate('/groups')}
          className={`p-2 sm:p-3 rounded-full transition-all ${
            isActive('/groups') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={1.5} />
        </button>

        {/* Analyze - Main action */}
        <button
          onClick={handleAnalyzeClick}
          className="-mt-3 sm:-mt-4"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </button>

        {/* Meetings */}
        <button
          onClick={() => navigate('/meetings')}
          className={`p-2 sm:p-3 rounded-full transition-all ${
            isActive('/meetings') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={1.5} />
        </button>

        {/* Games */}
        <button
          onClick={handleGamesClick}
          className={`p-2 sm:p-3 rounded-full transition-all ${
            isActive('/games') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Gamepad2 className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  );
};
