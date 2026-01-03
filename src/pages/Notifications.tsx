import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Friend, FriendCategory } from '../types';
import { ArrowLeft, UserCheck, UserPlus, Check, X, Calendar, PartyPopper } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { NotificationDetailModal } from '../components/NotificationDetailModal';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface NotificationsPageProps {
  friends: Friend[];
  onUpdateFriend: (friendId: string, updates: Partial<Friend>) => void;
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

export interface Notification {
  id: string;
  type: 'contact' | 'birthday' | 'new_friend' | 'party_invite' | 'meeting_invite';
  friend?: Friend;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  daysInfo: string;
  title?: string;
  data?: Record<string, unknown>;
}

interface DBNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
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

export const NotificationsPage = ({ friends, onUpdateFriend }: NotificationsPageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dbNotifications, setDbNotifications] = useState<DBNotification[]>([]);

  // Load notifications from database
  useEffect(() => {
    const loadNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (data) {
        setDbNotifications(data as DBNotification[]);
      }
    };

    loadNotifications();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          setDbNotifications(prev => [payload.new as DBNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markDbNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    setDbNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleMarkAsContacted = (notification: Notification) => {
    if (!notification.friend) return;
    const today = new Date().toISOString().split('T')[0];
    onUpdateFriend(notification.friend.id, { lastInteraction: today });
    setDismissedIds(prev => new Set(prev).add(notification.id));
    toast({
      title: "Отмечено!",
      description: `Дата контакта с ${notification.friend.name} обновлена`,
    });
  };

  const handleDismissDbNotification = async (notificationId: string) => {
    await markDbNotificationAsRead(notificationId);
    toast({
      title: "Прочитано",
      description: "Уведомление отмечено как прочитанное",
    });
  };

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
        daysInfo: `${daysSince}д`,
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
      daysInfo: daysUntil === 0 ? 'Сегодня' : `${daysUntil}д`
    }));

  // Convert DB notifications to Notification format
  const newFriendNotifications: Notification[] = dbNotifications
    .filter(n => n.type === 'new_friend')
    .map(n => ({
      id: n.id,
      type: 'new_friend' as const,
      message: n.message,
      urgency: 'low' as const,
      daysInfo: 'Новый',
      title: n.title,
      data: n.data
    }));

  // Party invite notifications
  const partyInviteNotifications: Notification[] = dbNotifications
    .filter(n => n.type === 'party_invite')
    .map(n => ({
      id: n.id,
      type: 'party_invite' as const,
      message: n.message,
      urgency: 'medium' as const,
      daysInfo: n.data?.party_date ? format(new Date(n.data.party_date as string), 'd MMM', { locale: ru }) : '',
      title: n.title,
      data: n.data
    }));

  // Meeting invite notifications
  const meetingInviteNotifications: Notification[] = dbNotifications
    .filter(n => n.type === 'meeting_invite')
    .map(n => ({
      id: n.id,
      type: 'meeting_invite' as const,
      message: n.message,
      urgency: 'medium' as const,
      daysInfo: n.data?.meeting_date ? format(new Date(n.data.meeting_date as string), 'd MMM', { locale: ru }) : '',
      title: n.title,
      data: n.data
    }));

  const visibleNotifications = [...partyInviteNotifications, ...meetingInviteNotifications, ...newFriendNotifications, ...birthdayNotifications, ...contactNotifications]
    .filter(n => !dismissedIds.has(n.id));

  const handleRespondToInvite = async (notificationId: string, partyId: string | undefined, accept: boolean, type: 'party' | 'meeting') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Find the participant record via friend relationship
    const { data: friendRecord } = await supabase
      .from('friends')
      .select('id')
      .eq('friend_user_id', user.id)
      .maybeSingle();

    if (friendRecord && partyId) {
      if (type === 'party') {
        await supabase
          .from('party_participants')
          .update({ 
            status: accept ? 'accepted' : 'declined',
            responded_at: new Date().toISOString()
          })
          .eq('party_id', partyId)
          .eq('friend_id', friendRecord.id);
      } else {
        await supabase
          .from('meeting_participants')
          .update({ 
            status: accept ? 'accepted' : 'declined'
          })
          .eq('meeting_id', partyId)
          .eq('friend_id', friendRecord.id);
      }
    }

    // Mark notification as read
    await markDbNotificationAsRead(notificationId);

    toast({
      title: accept ? 'Принято!' : 'Отклонено',
      description: accept ? 'Вы подтвердили участие' : 'Вы отклонили приглашение',
    });
  };

  return (
    <div className="h-[100dvh] bg-background animate-fade-in flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 z-20 glass-strong px-4 pt-8 pb-4">
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
              {visibleNotifications.length} {visibleNotifications.length === 1 ? 'напоминание' : 'напоминаний'}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {/* Notification Items */}
        {visibleNotifications.length > 0 ? (
          <>
            {visibleNotifications.map(notification => (
              <NotificationCard 
                key={notification.id} 
                notification={notification}
                onClick={() => !['new_friend', 'party_invite', 'meeting_invite'].includes(notification.type) && setSelectedNotification(notification)}
                onDismiss={notification.type === 'new_friend' ? () => handleDismissDbNotification(notification.id) : undefined}
                onRespond={(accept) => {
                  if (notification.type === 'party_invite') {
                    handleRespondToInvite(notification.id, notification.data?.party_id as string, accept, 'party');
                  } else if (notification.type === 'meeting_invite') {
                    handleRespondToInvite(notification.id, notification.data?.meeting_id as string, accept, 'meeting');
                  }
                }}
              />
            ))}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Всё под контролем!</h3>
            <p className="text-sm text-muted-foreground">
              Нет срочных напоминаний о друзьях
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="glass rounded-2xl p-4">
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

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onMarkAsContacted={() => {
          if (selectedNotification) {
            handleMarkAsContacted(selectedNotification);
          }
        }}
      />
    </div>
  );
};

interface NotificationCardProps {
  notification: Notification;
  onClick: () => void;
  onDismiss?: () => void;
  onRespond?: (accept: boolean) => void;
}

const categoryBgStyles: Record<FriendCategory, string> = {
  soul_mate: 'bg-amber-500',
  close_friend: 'bg-orange-500',
  good_buddy: 'bg-teal-500',
  situational: 'bg-blue-500',
  distant: 'bg-slate-400'
};

const NotificationCard = ({ notification, onClick, onDismiss, onRespond }: NotificationCardProps) => {
  const { friend } = notification;

  // For party_invite and meeting_invite notifications
  if (notification.type === 'party_invite' || notification.type === 'meeting_invite') {
    const isParty = notification.type === 'party_invite';
    const inviterName = notification.data?.inviter_name as string || '';
    const eventTitle = (notification.data?.party_title || notification.data?.meeting_title) as string || '';
    const location = notification.data?.location as string;
    const time = (notification.data?.party_time || notification.data?.meeting_time) as string;
    
    return (
      <div className="w-full glass rounded-2xl p-4 space-y-3 animate-slide-up">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary/10 text-primary shrink-0">
            {isParty ? <PartyPopper className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{notification.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
            {location && (
              <p className="text-xs text-muted-foreground mt-1">📍 {location}</p>
            )}
          </div>

          {/* Date badge */}
          <div className="shrink-0">
            <div className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/30 bg-primary/10 text-primary">
              {notification.daysInfo}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onRespond?.(false)}
            className="flex-1 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Отклонить
          </button>
          <button
            onClick={() => onRespond?.(true)}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            Принять
          </button>
        </div>
      </div>
    );
  }
  
  
  // For new_friend notifications, use data from the notification
  if (notification.type === 'new_friend') {
    const friendName = (notification.data?.friend_name as string) || 'Новый друг';
    const matchScore = notification.data?.match_score as number;
    const initials = friendName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    return (
      <button
        onClick={onDismiss || onClick}
        className="w-full glass rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-card hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-primary text-primary-foreground font-bold text-lg">
            {initials}
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <UserPlus className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{notification.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
          {matchScore !== undefined && (
            <p className="text-xs text-primary mt-1">Совместимость: {matchScore}%</p>
          )}
        </div>

        {/* Badge */}
        <div className="shrink-0">
          <div className="px-3 py-1.5 rounded-full text-xs font-medium border border-green-500/30 bg-green-500/10 text-green-500">
            {notification.daysInfo}
          </div>
        </div>
      </button>
    );
  }

  if (!friend) return null;
  
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
        {notification.type === 'birthday' && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
            <span className="text-xs">🎂</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground truncate">{friend.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
      </div>

      {/* Days Badge */}
      <div className="shrink-0">
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
          notification.urgency === 'high' ? 'border-destructive/30 bg-destructive/10 text-destructive' :
          notification.urgency === 'medium' ? 'border-amber-500/30 bg-amber-500/10 text-amber-500' :
          'border-primary/30 bg-primary/10 text-primary'
        }`}>
          {notification.daysInfo}
        </div>
      </div>
    </button>
  );
};

export default NotificationsPage;
