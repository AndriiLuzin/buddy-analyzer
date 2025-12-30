import { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Friend, FriendCategory } from '../types';
import { 
  ArrowLeft, 
  MessageCircle, 
  Cake, 
  Clock, 
  Sparkles, 
  Send, 
  Gift, 
  Phone, 
  Coffee, 
  PartyPopper,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Notification {
  id: string;
  type: 'contact' | 'birthday';
  friend: Friend;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  daysInfo: string;
}

interface NotificationDetailModalProps {
  notification: Notification | null;
  onClose: () => void;
  onMarkAsContacted: () => void;
}

interface ActionOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  messages?: string[];
}

const CONTACT_ACTIONS: ActionOption[] = [
  {
    id: 'casual',
    icon: <MessageCircle className="w-5 h-5" />,
    label: 'Написать привет',
    description: 'Простое приветствие',
    messages: [
      'Привет! Как дела? Давно не общались 😊',
      'Эй, как ты? Что нового?',
      'Привет! Вспомнил(а) о тебе, решил(а) написать',
    ]
  },
  {
    id: 'meetup',
    icon: <Coffee className="w-5 h-5" />,
    label: 'Предложить встречу',
    description: 'Пригласить на кофе',
    messages: [
      'Привет! Может встретимся на кофе на этой неделе?',
      'Эй! Давно не виделись. Как насчет посидеть где-нибудь?',
      'Привет! Есть время на выходных? Давай встретимся!',
    ]
  },
  {
    id: 'call',
    icon: <Phone className="w-5 h-5" />,
    label: 'Позвонить',
    description: 'Голосовой звонок',
    messages: [
      'Привет! Можешь говорить? Хотел(а) позвонить',
      'Эй, есть минутка? Хочу услышать тебя!',
    ]
  },
  {
    id: 'generate',
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Сгенерировать сообщение',
    description: 'AI подберёт слова',
    messages: []
  },
];

const BIRTHDAY_ACTIONS: ActionOption[] = [
  {
    id: 'congrats',
    icon: <PartyPopper className="w-5 h-5" />,
    label: 'Поздравить',
    description: 'Тёплое поздравление',
    messages: [
      'С Днём Рождения! 🎂 Желаю счастья, здоровья и исполнения всех желаний!',
      'Поздравляю с Днём Рождения! 🎉 Пусть этот год принесёт много радости!',
      'Happy Birthday! 🎈 Желаю всего самого лучшего!',
    ]
  },
  {
    id: 'gift',
    icon: <Gift className="w-5 h-5" />,
    label: 'Подобрать подарок',
    description: 'Идеи подарков',
    messages: [
      'Идеи подарков: книга, гаджет, подарочный сертификат, опыт (мастер-класс)',
    ]
  },
  {
    id: 'plan',
    icon: <Coffee className="w-5 h-5" />,
    label: 'Запланировать встречу',
    description: 'Отметить вместе',
    messages: [
      'Привет! Хочу поздравить тебя лично! Когда удобно встретиться?',
      'Эй! Давай отметим твой день рождения вместе? Что скажешь?',
    ]
  },
  {
    id: 'generate',
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Сгенерировать поздравление',
    description: 'AI напишет уникальное',
    messages: []
  },
];

export const NotificationDetailModal = ({ 
  notification, 
  onClose, 
  onMarkAsContacted 
}: NotificationDetailModalProps) => {
  const { toast } = useToast();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!notification) return null;

  const actions = notification.type === 'birthday' ? BIRTHDAY_ACTIONS : CONTACT_ACTIONS;
  const selectedActionData = actions.find(a => a.id === selectedAction);

  const handleCopyMessage = async (message: string, index: number) => {
    await navigator.clipboard.writeText(message);
    setCopiedIndex(index);
    toast({
      title: "Скопировано!",
      description: "Сообщение скопировано в буфер обмена",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleMarkAndClose = () => {
    onMarkAsContacted();
    onClose();
  };

  return (
    <Dialog open={!!notification} onOpenChange={() => onClose()}>
      <DialogContent 
        className="sm:max-w-md h-[100dvh] sm:h-auto sm:max-h-[90vh] p-0 gap-0 bg-background border-0 sm:border sm:rounded-2xl flex flex-col"
        hideClose
      >
        {/* Header */}
        <div className="shrink-0 bg-background border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">{notification.friend.name}</h2>
              <p className="text-sm text-muted-foreground">{notification.message}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              {notification.type === 'birthday' ? (
                <Cake className="w-6 h-6 text-destructive" />
              ) : (
                <MessageCircle className="w-6 h-6 text-destructive" />
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {/* Days info */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {notification.type === 'birthday' 
                ? `День рождения ${notification.daysInfo === 'Сегодня' ? 'сегодня' : `через ${notification.daysInfo}`}`
                : `Последний контакт: ${notification.daysInfo} назад`
              }
            </span>
          </div>

          {/* Action Selection */}
          {!selectedAction ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Что хотите сделать?</h3>
              <div className="grid gap-2">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-muted transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{action.label}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button 
                onClick={() => setSelectedAction(null)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад к действиям
              </button>

              <h3 className="font-semibold text-foreground flex items-center gap-2">
                {selectedActionData?.icon}
                {selectedActionData?.label}
              </h3>

              {selectedAction === 'generate' ? (
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">AI генерация</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Для генерации уникальных сообщений с помощью AI требуется подключение к облаку.
                  </p>
                  <button className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                    Подключить Cloud
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Выберите готовое сообщение:</p>
                  {selectedActionData?.messages?.map((message, index) => (
                    <button
                      key={index}
                      onClick={() => handleCopyMessage(message, index)}
                      className="w-full p-4 rounded-xl bg-card border border-border hover:bg-muted transition-all text-left group"
                    >
                      <p className="text-foreground text-sm">{message}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3 h-3" />
                            Скопировано
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Нажмите чтобы скопировать
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-background border-t border-border p-4">
          <button
            onClick={handleMarkAndClose}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Отметить как выполнено
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
