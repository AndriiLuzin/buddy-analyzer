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
      return t('friends.no_contact_yet') || 'Нет данных';
    }
    try {
      const date = new Date(friend.lastInteraction);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: language === 'ru' ? ru : undefined 
      });
    } catch {
      return t('friends.no_contact_yet') || 'Нет данных';
    }
  };

  const getShortDate = () => {
    if (!friend.lastInteraction) {
      return '—';
    }
    try {
      const date = new Date(friend.lastInteraction);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return language === 'ru' ? 'Сегодня' : 'Today';
      if (diffDays === 1) return language === 'ru' ? 'Вчера' : 'Yesterday';
      if (diffDays < 7) return `${diffDays} ${language === 'ru' ? 'дн.' : 'd'}`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${language === 'ru' ? 'нед.' : 'w'}`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${language === 'ru' ? 'мес.' : 'mo'}`;
      return `${Math.floor(diffDays / 365)} ${language === 'ru' ? 'г.' : 'y'}`;
    } catch {
      return '—';
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

      {/* Last Contact Date */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        <div className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-secondary/50 text-muted-foreground">
          {getShortDate()}
        </div>
      </div>
    </button>
  );
};
