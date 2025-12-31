import { useNavigate, useLocation } from 'react-router-dom';
import { Users, MessageCircle, Sparkles, User } from 'lucide-react';

interface BottomNavBarProps {
  onFriendsClick?: () => void;
  onAnalyzeClick?: () => void;
  onProfileClick?: () => void;
}

export const BottomNavBar = ({ onFriendsClick, onAnalyzeClick, onProfileClick }: BottomNavBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const handleFriendsClick = () => {
    if (onFriendsClick) {
      onFriendsClick();
    } else {
      navigate('/');
    }
  };

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
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${
            isActive('/chats') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs font-medium">Чаты</span>
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
