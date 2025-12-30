import { useNavigate } from 'react-router-dom';
import { Friend, FriendCategory } from '../types';
import { ArrowLeft, Bell, MessageCircle, Cake, Clock, UserCheck } from 'lucide-react';
import { CATEGORY_INFO } from '../constants';

interface NotificationsPageProps {
  friends: Friend[];
}

// Интервалы напоминаний в днях для каждой категории
const REMINDER_INTERVALS: Record<FriendCategory, number> = {
  soul_mate: 3,
  close_friend: 7,
  good_buddy: 14,
  situational: 30,
  distant: 60
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

interface Notification {
  id: string;
  type: 'contact' | 'birthday';
  friend: Friend;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  daysInfo: string;
}

const getDaysSinceLastContact = (lastInteraction?: string): number => {
  if (!lastInteraction) return 999;
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

const getUpcomingBirthdays = (friends: Friend[]) => {
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  return friends
    .filter(friend => friend.birthday)
    .map(friend => {
      const birthday = new Date(friend.birthday!);
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
      
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }

      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return { friend, daysUntil };
    })
    .filter(item => item.daysUntil <= 30 && item.daysUntil >= 0);
};

export const NotificationsPage = ({ friends }: NotificationsPageProps) => {
  const navigate = useNavigate();

  // Генерируем уведомления о контактах
  const contactNotifications: Notification[] = friends
    .filter(friend => friend.category)
    .map(friend => {
      const daysSince = getDaysSinceLastContact(friend.lastInteraction);
      const interval = REMINDER_INTERVALS[friend.category!];
      const needsReminder = daysSince >= interval;
      const urgency = getUrgencyLevel(daysSince, interval);
      
      return {
        id: `contact-${friend.id}`,
        type: 'contact' as const,
        friend,
        message: getRandomMessage(friend.category!),
        urgency,
        daysInfo: `${daysSince} дн. без общения`,
        needsReminder
      };
    })
    .filter(n => n.needsReminder)
    .sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });

  // Генерируем уведомления о днях рождения
  const birthdayNotifications: Notification[] = getUpcomingBirthdays(friends)
    .map(({ friend, daysUntil }) => ({
      id: `birthday-${friend.id}`,
      type: 'birthday' as const,
      friend,
      message: daysUntil === 0 ? 'День рождения сегодня! 🎉' : 
               daysUntil === 1 ? 'День рождения завтра!' : 
               `День рождения через ${daysUntil} дней`,
      urgency: daysUntil <= 1 ? 'high' as const : daysUntil <= 7 ? 'medium' as const : 'low' as const,
      daysInfo: daysUntil === 0 ? 'Сегодня' : `Через ${daysUntil} дн.`
    }));

  const allNotifications = [...birthdayNotifications, ...contactNotifications];

  const urgencyStyles = {
    high: 'bg-destructive/10 border-destructive/30',
    medium: 'bg-amber-500/10 border-amber-500/30',
    low: 'bg-secondary border-border'
  };

  const urgencyBadgeStyles = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-amber-500 text-white',
    low: 'bg-muted text-muted-foreground'
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-strong px-4 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Уведомления</h1>
            <p className="text-sm text-muted-foreground">
              {allNotifications.length} {allNotifications.length === 1 ? 'напоминание' : 'напоминаний'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 space-y-6">
        {/* Priority Section */}
        {allNotifications.filter(n => n.urgency === 'high').length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <h2 className="text-sm font-semibold text-foreground">Срочные</h2>
            </div>
            <div className="space-y-2">
              {allNotifications.filter(n => n.urgency === 'high').map(notification => (
                <NotificationCard key={notification.id} notification={notification} urgencyStyles={urgencyStyles} urgencyBadgeStyles={urgencyBadgeStyles} />
              ))}
            </div>
          </section>
        )}

        {/* Medium Priority */}
        {allNotifications.filter(n => n.urgency === 'medium').length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">На этой неделе</h2>
            </div>
            <div className="space-y-2">
              {allNotifications.filter(n => n.urgency === 'medium').map(notification => (
                <NotificationCard key={notification.id} notification={notification} urgencyStyles={urgencyStyles} urgencyBadgeStyles={urgencyBadgeStyles} />
              ))}
            </div>
          </section>
        )}

        {/* Low Priority */}
        {allNotifications.filter(n => n.urgency === 'low').length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Позже</h2>
            </div>
            <div className="space-y-2">
              {allNotifications.filter(n => n.urgency === 'low').map(notification => (
                <NotificationCard key={notification.id} notification={notification} urgencyStyles={urgencyStyles} urgencyBadgeStyles={urgencyBadgeStyles} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {allNotifications.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Всё под контролем!</h3>
            <p className="text-sm text-muted-foreground">
              Нет срочных напоминаний о друзьях
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="glass rounded-2xl p-4 mt-6">
          <h3 className="font-semibold text-foreground mb-2">💡 Как это работает</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Душа в душу — напоминание каждые 3 дня</li>
            <li>• Близкий друг — раз в неделю</li>
            <li>• Хороший приятель — раз в 2 недели</li>
            <li>• Ситуативный знакомый — раз в месяц</li>
            <li>• Дальний знакомый — раз в 2 месяца</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

interface NotificationCardProps {
  notification: Notification;
  urgencyStyles: Record<string, string>;
  urgencyBadgeStyles: Record<string, string>;
}

const NotificationCard = ({ notification, urgencyStyles, urgencyBadgeStyles }: NotificationCardProps) => {
  const categoryInfo = notification.friend.category ? CATEGORY_INFO[notification.friend.category] : null;
  
  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${urgencyStyles[notification.urgency]} transition-all hover:scale-[1.01]`}>
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
        {notification.type === 'birthday' ? (
          <Cake className="w-6 h-6 text-primary" />
        ) : (
          <MessageCircle className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-semibold text-foreground truncate">{notification.friend.name}</p>
          {categoryInfo && (
            <span className="text-sm">{categoryInfo.emoji}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyBadgeStyles[notification.urgency]}`}>
          {notification.daysInfo}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{notification.type === 'birthday' ? 'ДР' : 'Связь'}</span>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
