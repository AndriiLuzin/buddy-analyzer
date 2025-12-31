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
    <nav className="fixed bottom-0 left-0 right-0 glass-strong rounded-t-3xl px-6 py-4 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Chats */}
        <button
          onClick={handleChatsClick}
          className={`flex flex-col items-center gap-1 p-2 transition-colors relative ${
            isActive('/chats') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
        >
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center text-[10px] px-1"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          <span className="text-xs font-medium">Чаты</span>
        </button>

        {/* Groups */}
        <button
          className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Группы</span>
        </button>

        {/* Analyze - Main action */}
        <button
          onClick={handleAnalyzeClick}
          className="flex flex-col items-center gap-1 -mt-6"
        >
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-card">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-primary mt-1">Анализ</span>
        </button>

        {/* Meetings */}
        <button
          className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Calendar className="w-6 h-6" />
          <span className="text-xs font-medium">Встречи</span>
        </button>

        {/* Profile */}
        <button
          onClick={handleProfileClick}
          className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Профиль</span>
        </button>
      </div>
    </nav>
  );
};
