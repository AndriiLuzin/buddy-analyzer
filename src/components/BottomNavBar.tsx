import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, Sparkles, User, Users, Calendar } from 'lucide-react';
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

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border/50 px-4 py-3 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Chats */}
        <button
          onClick={handleChatsClick}
          className={`p-3 rounded-full transition-all ${
            isActive('/chats') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
            )}
          </div>
        </button>

        {/* Groups */}
        <button
          onClick={() => navigate('/groups')}
          className={`p-3 rounded-full transition-all ${
            isActive('/groups') ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Analyze - Main action */}
        <button
          onClick={handleAnalyzeClick}
          className="-mt-4"
        >
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </div>
        </button>

        {/* Meetings */}
        <button
          className="p-3 rounded-full text-muted-foreground hover:text-foreground transition-all"
        >
          <Calendar className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Profile */}
        <button
          onClick={handleProfileClick}
          className="p-3 rounded-full text-muted-foreground hover:text-foreground transition-all"
        >
          <User className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>
    </nav>
  );
};
