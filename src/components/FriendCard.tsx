import { Friend, FriendCategory } from '../types';
import { CATEGORY_INFO } from '../constants';

interface FriendCardProps {
  friend: Friend;
  onClick: () => void;
  isMatch?: boolean;
}

const categoryBgStyles: Record<FriendCategory, string> = {
  soul_mate: 'bg-amber-500',
  close_friend: 'bg-orange-500',
  good_buddy: 'bg-teal-500',
  situational: 'bg-blue-500',
  distant: 'bg-slate-400'
};

export const FriendCard = ({ friend, onClick, isMatch }: FriendCardProps) => {
  const categoryInfo = friend.category ? CATEGORY_INFO[friend.category] : null;
  const initials = friend.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <button
      onClick={onClick}
      className="w-full glass rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-card hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
    >
      {/* Avatar */}
      <div className="relative">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${
          friend.category ? categoryBgStyles[friend.category] : 'bg-muted'
        }`}>
          {friend.avatar ? (
            <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        {isMatch && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center animate-pulse-glow">
            <span className="text-xs">✨</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground truncate">{friend.name}</h3>
          {categoryInfo && (
            <span className="text-lg">{categoryInfo.emoji}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {friend.description || (categoryInfo ? categoryInfo.label : 'Ожидает анализа')}
        </p>
      </div>

      {/* Category Badge */}
      {categoryInfo && (
        <div className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border category-${friend.category?.replace('_', '-')}`}>
          {categoryInfo.label.split(' ')[0]}
        </div>
      )}
    </button>
  );
};
