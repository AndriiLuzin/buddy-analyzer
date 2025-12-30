import { Friend, FriendCategory } from '../types';
import { Bell, MessageCircle, Clock } from 'lucide-react';

interface ContactReminderProps {
  friends: Friend[];
}

// Интервалы напоминаний в днях для каждой категории
const REMINDER_INTERVALS: Record<FriendCategory, number> = {
  soul_mate: 3,        // Каждые 3 дня
  close_friend: 7,     // Раз в неделю
  good_buddy: 14,      // Раз в 2 недели
  situational: 30,     // Раз в месяц
  distant: 60          // Раз в 2 месяца
};

const CATEGORY_MESSAGES: Record<FriendCategory, string[]> = {
  soul_mate: [
    'Пора созвониться!',
    'Напишите что-нибудь тёплое',
    'Поделитесь новостями'
  ],
  close_friend: [
    'Давно не общались!',
    'Спросите как дела',
    'Предложите встретиться'
  ],
  good_buddy: [
    'Напомните о себе',
    'Отправьте смешное видео',
    'Пригласите на мероприятие'
  ],
  situational: [
    'Поддержите связь',
    'Напишите по делу',
    'Поинтересуйтесь успехами'
  ],
  distant: [
    'Поздравьте с праздником',
    'Напишите формальное сообщение',
    'Напомните о себе'
  ]
};

const getDaysSinceLastContact = (lastInteraction?: string): number => {
  if (!lastInteraction) return 999; // Если нет данных, считаем что давно
  const lastDate = new Date(lastInteraction);
  const today = new Date();
  return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
};

const getRandomMessage = (category: FriendCategory): string => {
  const messages = CATEGORY_MESSAGES[category];
  return messages[Math.floor(Math.random() * messages.length)];
};

const getUrgencyLevel = (daysSince: number, interval: number): 'low' | 'medium' | 'high' => {
  const ratio = daysSince / interval;
  if (ratio >= 2) return 'high';
  if (ratio >= 1.5) return 'medium';
  return 'low';
};

export const ContactReminder = ({ friends }: ContactReminderProps) => {
  const reminders = friends
    .filter(friend => friend.category)
    .map(friend => {
      const daysSince = getDaysSinceLastContact(friend.lastInteraction);
      const interval = REMINDER_INTERVALS[friend.category!];
      const needsReminder = daysSince >= interval;
      const urgency = getUrgencyLevel(daysSince, interval);
      
      return {
        ...friend,
        daysSince,
        interval,
        needsReminder,
        urgency,
        message: getRandomMessage(friend.category!)
      };
    })
    .filter(friend => friend.needsReminder)
    .sort((a, b) => {
      // Сортируем по срочности и уровню дружбы
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      const categoryOrder: Record<FriendCategory, number> = {
        soul_mate: 0,
        close_friend: 1,
        good_buddy: 2,
        situational: 3,
        distant: 4
      };
      
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return categoryOrder[a.category!] - categoryOrder[b.category!];
    })
    .slice(0, 3); // Не более 3 напоминаний, чтобы не перегружать

  if (reminders.length === 0) return null;

  const urgencyStyles = {
    high: 'bg-destructive/10 border-destructive/30',
    medium: 'bg-amber-500/10 border-amber-500/30',
    low: 'bg-primary/10 border-primary/30'
  };

  const urgencyIconStyles = {
    high: 'text-destructive',
    medium: 'text-amber-500',
    low: 'text-primary'
  };

  return (
    <div className="glass rounded-2xl p-4 mb-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Bell className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Напоминания</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          Сбалансированный график
        </span>
      </div>

      <div className="space-y-2">
        {reminders.map(friend => (
          <div 
            key={friend.id} 
            className={`flex items-center gap-3 p-3 rounded-xl border ${urgencyStyles[friend.urgency]}`}
          >
            <div className={`shrink-0 ${urgencyIconStyles[friend.urgency]}`}>
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{friend.name}</p>
              <p className="text-xs text-muted-foreground">{friend.message}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Clock className="w-3 h-3" />
              <span>{friend.daysSince}д</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        💡 Показаны только приоритетные контакты
      </p>
    </div>
  );
};
