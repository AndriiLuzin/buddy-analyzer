import { Users, Sparkles, User } from 'lucide-react';

interface BottomNavBarProps {
  onFriendsClick: () => void;
  onAnalyzeClick: () => void;
  onProfileClick: () => void;
}

export const BottomNavBar = ({ onFriendsClick, onAnalyzeClick, onProfileClick }: BottomNavBarProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong rounded-t-3xl px-6 py-4 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Friends */}
        <button
          onClick={onFriendsClick}
          className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Users className="w-6 h-6" />
          <span className="text-xs font-medium">Друзья</span>
        </button>

        {/* Analyze - Main action */}
        <button
          onClick={onAnalyzeClick}
          className="flex flex-col items-center gap-1 -mt-6"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow animate-pulse-glow">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-xs font-medium text-primary mt-1">Анализ</span>
        </button>

        {/* Profile */}
        <button
          onClick={onProfileClick}
          className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-medium">Профиль</span>
        </button>
      </div>
    </nav>
  );
};
