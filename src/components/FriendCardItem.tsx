import { Friend, FriendCategory } from '../types';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface FriendCardItemProps {
  friend: Friend;
  onClick: () => void;
  isMatch?: boolean;
  animationDelay?: number;
}

const categoryBgStyles: Record<FriendCategory, string> = {
  soul_mate: 'bg-amber-500',
  close_friend: 'bg-orange-500',
  good_buddy: 'bg-teal-500',
  situational: 'bg-blue-500',
  distant: 'bg-slate-400'
};

export const FriendCardItem = ({ friend, onClick, isMatch, animationDelay = 0 }: FriendCardItemProps) => {
  const { t, language } = useLanguage();
  const initials = friend.name.split(' ').map(n => n[0]).join('').toUpperCase();
  
  const getCategoryLabel = (category: FriendCategory) => t(`category.${category}`);

  const getLastContactText = () => {
    if (!friend.lastInteraction) {
      return t('friends.no_contact_yet') || 'Ещё не общались';
    }
    try {
      const date = new Date(friend.lastInteraction);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: language === 'ru' ? ru : undefined 
      });
    } catch {
      return t('friends.no_contact_yet') || 'Ещё не общались';
    }
  };

  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${animationDelay}s` }}
      className="w-full p-4 flex items-center gap-4 transition-all duration-200 hover:bg-secondary/50 active:bg-secondary/70 animate-slide-up"
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
      </div>

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground truncate">{friend.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {getLastContactText()}
        </p>
      </div>

      {/* Category Badge */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        {friend.category && (
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium border category-${friend.category.replace('_', '-')}`}>
            {getCategoryLabel(friend.category).split(' ')[0]}
          </div>
        )}
      </div>
    </button>
  );
};
