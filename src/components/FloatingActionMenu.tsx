import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  MessageCircle, 
  Sparkles, 
  User, 
  Users, 
  Calendar, 
  Bell,
  Plus,
  X,
  Home
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FloatingActionMenuProps {
  onAnalyzeClick?: () => void;
  onProfileClick?: () => void;
}

export const FloatingActionMenu = ({ onAnalyzeClick, onProfileClick }: FloatingActionMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
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

    const channel = supabase
      .channel('unread-count-fab')
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

  const menuItems = [
    {
      icon: Home,
      label: 'Главная',
      onClick: () => navigate('/'),
      active: isActive('/')
    },
    {
      icon: MessageCircle,
      label: 'Чаты',
      onClick: () => navigate('/chats'),
      active: isActive('/chats'),
      badge: unreadCount > 0
    },
    {
      icon: Users,
      label: 'Группы',
      onClick: () => navigate('/groups'),
      active: isActive('/groups')
    },
    {
      icon: Bell,
      label: 'Уведомления',
      onClick: () => navigate('/notifications'),
      active: isActive('/notifications')
    },
    {
      icon: Calendar,
      label: 'Встречи',
      onClick: () => navigate('/meetings'),
      active: isActive('/meetings')
    },
    {
      icon: Sparkles,
      label: 'Анализ',
      onClick: () => {
        if (onAnalyzeClick) onAnalyzeClick();
        setIsOpen(false);
      },
      primary: true
    },
    {
      icon: User,
      label: 'Профиль',
      onClick: () => {
        if (onProfileClick) onProfileClick();
        setIsOpen(false);
      }
    }
  ];

  const handleItemClick = (item: typeof menuItems[0]) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 ${
          isOpen 
            ? 'bg-muted rotate-45' 
            : 'bg-primary hover:bg-primary/90'
        }`}
        style={{ bottom: `calc(1.5rem + env(safe-area-inset-bottom))` }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Plus className="w-6 h-6 text-primary-foreground" />
        )}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-destructive rounded-full border-2 border-background" />
        )}
      </button>

      {/* Menu Portal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Panel */}
          <div 
            className="absolute bottom-24 right-6 w-[calc(100%-3rem)] max-w-sm bg-card rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-border"
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Grid of actions */}
            <div className="p-4 grid grid-cols-3 gap-3">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all opacity-0 animate-fade-in ${
                    item.active 
                      ? 'bg-primary/10 text-primary' 
                      : item.primary
                        ? 'bg-primary/5 text-primary hover:bg-primary/10'
                        : 'bg-secondary/50 text-foreground hover:bg-secondary'
                  }`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.active 
                      ? 'bg-primary text-primary-foreground' 
                      : item.primary
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    <item.icon className="w-5 h-5" strokeWidth={1.5} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
                    )}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
