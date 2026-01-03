import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { 
  MessageCircle, 
  PartyPopper,
  Calendar, 
  Home,
  Share2,
  Gamepad2,
  LayoutGrid
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
      icon: Calendar,
      label: 'Встречи',
      onClick: () => navigate('/meetings'),
      active: isActive('/meetings')
    },
    {
      icon: Share2,
      label: 'Анализ',
      onClick: () => {
        navigate('/share');
        setIsOpen(false);
      },
      active: isActive('/share')
    },
    {
      icon: PartyPopper,
      label: 'Parties',
      onClick: () => {
        navigate('/parties');
        setIsOpen(false);
      },
      active: isActive('/parties')
    },
    {
      icon: Gamepad2,
      label: 'Игры',
      onClick: () => {
        navigate('/games');
        setIsOpen(false);
      },
      active: isActive('/games')
    }
  ];

  const handleItemClick = (item: typeof menuItems[0]) => {
    item.onClick();
    setIsOpen(false);
  };

  return (
    <>
      {/* FAB Button - hidden when menu is open */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed right-6 w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 z-50 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 hover:scale-105 active:scale-95"
          style={{ bottom: `calc(1.5rem + env(safe-area-inset-bottom))` }}
        >
          <LayoutGrid className="w-7 h-7 text-white" strokeWidth={2} />
        </button>
      )}

      {/* Bottom Sheet Menu */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Bottom Sheet */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl animate-slide-up"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>
            
            {/* Grid of actions */}
            <div className="px-4 pb-6 pt-2 grid grid-cols-3 gap-3">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className={`aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all ${
                    item.active 
                      ? 'bg-primary/10 border-primary/20 text-primary' 
                      : 'bg-secondary/50 border-border hover:bg-secondary'
                  }`}
                >
                  <div className={`relative flex items-center justify-center ${
                    item.active 
                      ? 'text-primary' 
                      : 'text-foreground'
                  }`}>
                    <item.icon className="w-6 h-6" strokeWidth={1.5} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-foreground">{item.label}</span>
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
