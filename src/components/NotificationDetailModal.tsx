import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Dialog, DialogContent } from './ui/dialog';
import { Friend, FriendCategory } from '../types';
import { CATEGORY_INFO } from '../constants';
import { 
  ArrowLeft, 
  MessageCircle, 
  Cake, 
  Clock, 
  Sparkles, 
  Gift, 
  Phone, 
  Coffee, 
  PartyPopper,
  Copy,
  Check,
  Loader2,
  Send,
  X,
  Share2,
  Users
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';

interface Notification {
  id: string;
  type: 'contact' | 'birthday' | 'new_friend';
  friend?: Friend;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  daysInfo: string;
  title?: string;
  data?: Record<string, unknown>;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isSendingInApp, setIsSendingInApp] = useState(false);

  if (!notification) return null;

  const actions = notification.type === 'birthday' ? BIRTHDAY_ACTIONS : CONTACT_ACTIONS;
  const selectedActionData = actions.find(a => a.id === selectedAction);

  const getCategoryLabel = (category?: FriendCategory): string => {
    if (!category) return 'друг';
    return CATEGORY_INFO[category]?.label || 'друг';
  };

  const handleGenerateMessage = async () => {
    if (!notification.friend.category) return;
    
    setIsGenerating(true);
    setGeneratedMessage(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: {
          friendName: notification.friend.name,
          category: getCategoryLabel(notification.friend.category),
          messageType: notification.type,
          actionType: selectedAction || 'casual'
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        toast({
          title: "Ошибка",
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      setGeneratedMessage(data.message);
    } catch (error) {
      console.error('Error generating message:', error);
      toast({
        title: "Ошибка генерации",
        description: "Не удалось сгенерировать сообщение. Попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMessage = async (message: string, index: number) => {
    await navigator.clipboard.writeText(message);
    setCopiedIndex(index);
    toast({
      title: "Скопировано!",
      description: "Сообщение скопировано в буфер обмена",
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleShareClick = (message: string) => {
    setShareMessage(message);
    setShowShareMenu(true);
  };

  const handleShareVia = async (platform: 'telegram' | 'whatsapp' | 'viber' | 'sms' | 'copy' | 'native' | 'inapp') => {
    if (!shareMessage) return;
    
    const encodedMessage = encodeURIComponent(shareMessage);
    
    switch (platform) {
      case 'inapp':
        // Send via in-app chat
        setIsSendingInApp(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            toast({
              title: "Ошибка",
              description: "Необходимо войти в аккаунт",
              variant: "destructive"
            });
            setIsSendingInApp(false);
            return;
          }

          // Get the friend's user_id from the friends table
          const { data: friendData, error: friendError } = await supabase
            .from('friends')
            .select('friend_user_id')
            .eq('id', notification.friend.id)
            .single();

          if (friendError || !friendData) {
            toast({
              title: "Ошибка",
              description: "Не удалось найти друга",
              variant: "destructive"
            });
            setIsSendingInApp(false);
            return;
          }

          // Send the message
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              sender_id: user.id,
              receiver_id: friendData.friend_user_id,
              content: shareMessage
            });

          if (messageError) {
            console.error('Error sending message:', messageError);
            toast({
              title: "Ошибка",
              description: "Не удалось отправить сообщение",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Отправлено!",
              description: `Сообщение отправлено ${notification.friend.name}`,
            });
          }
        } catch (error) {
          console.error('Error sending in-app message:', error);
          toast({
            title: "Ошибка",
            description: "Произошла ошибка при отправке",
            variant: "destructive"
          });
        }
        setIsSendingInApp(false);
        break;
      case 'telegram':
        // tg:// opens mobile app directly
        window.location.href = `tg://msg?text=${encodedMessage}`;
        break;
      case 'whatsapp':
        // whatsapp:// opens mobile app directly
        window.location.href = `whatsapp://send?text=${encodedMessage}`;
        break;
      case 'viber':
        window.location.href = `viber://forward?text=${encodedMessage}`;
        break;
      case 'sms':
        window.location.href = `sms:?body=${encodedMessage}`;
        break;
      case 'copy':
        await navigator.clipboard.writeText(shareMessage);
        toast({
          title: "Скопировано!",
          description: "Сообщение скопировано в буфер обмена",
        });
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              text: shareMessage,
            });
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              await navigator.clipboard.writeText(shareMessage);
              toast({
                title: "Скопировано!",
                description: "Сообщение скопировано в буфер обмена",
              });
            }
          }
        } else {
          await navigator.clipboard.writeText(shareMessage);
          toast({
            title: "Скопировано!",
            description: "Сообщение скопировано в буфер обмена",
          });
        }
        break;
    }
    
    setShowShareMenu(false);
    setShareMessage(null);
  };

  const handleCopyGenerated = async () => {
    if (!generatedMessage) return;
    await navigator.clipboard.writeText(generatedMessage);
    toast({
      title: "Скопировано!",
      description: "Сообщение скопировано в буфер обмена",
    });
  };

  const handleMarkAndClose = () => {
    onMarkAsContacted();
    onClose();
  };

  const handleClose = () => {
    setSelectedAction(null);
    setGeneratedMessage(null);
    onClose();
  };

  return (
    <Dialog open={!!notification} onOpenChange={() => handleClose()}>
      <DialogContent 
        className="max-w-full w-full h-[100dvh] sm:max-w-md sm:h-auto sm:max-h-[90vh] p-0 gap-0 bg-background border-0 sm:border sm:rounded-2xl flex flex-col"
        hideClose
      >
        {/* Header */}
        <div className="shrink-0 bg-background border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleClose}
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
              <div className="space-y-3">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className="w-full glass rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-card hover:scale-[1.02] active:scale-[0.98] text-left"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{action.label}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setSelectedAction(null);
                  setGeneratedMessage(null);
                }}
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
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">AI генерация</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      AI сгенерирует персонализированное сообщение для {notification.friend.name}
                    </p>
                    <button 
                      onClick={handleGenerateMessage}
                      disabled={isGenerating}
                      className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Генерация...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Сгенерировать
                        </>
                      )}
                    </button>
                  </div>

                  {generatedMessage && (
                    <button
                      onClick={() => handleShareClick(generatedMessage)}
                      className="w-full p-4 rounded-xl bg-card border border-primary/30 hover:bg-muted transition-all text-left group"
                    >
                      <p className="text-foreground text-sm">{generatedMessage}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                        <Send className="w-3 h-3" />
                        Нажмите чтобы отправить
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Выберите готовое сообщение:</p>
                  {selectedActionData?.messages?.map((message, index) => (
                    <button
                      key={index}
                      onClick={() => handleShareClick(message)}
                      className="w-full p-4 rounded-xl bg-card border border-border hover:bg-muted transition-all text-left group"
                    >
                      <p className="text-foreground text-sm">{message}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                        <Send className="w-3 h-3" />
                        Нажмите чтобы отправить
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

      {/* Share Menu Modal - rendered via portal to avoid z-index issues with Dialog */}
      {showShareMenu && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowShareMenu(false);
              setShareMessage(null);
            }}
          />
          
          {/* Share Menu */}
          <div className="relative z-10 w-full max-w-md mx-4 mb-4 sm:mb-0 bg-card rounded-2xl shadow-xl animate-slide-up overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Отправить через</h3>
              <button
                onClick={() => {
                  setShowShareMenu(false);
                  setShareMessage(null);
                }}
                className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Message Preview */}
            <div className="px-4 py-3 bg-muted/50">
              <p className="text-sm text-muted-foreground line-clamp-2">{shareMessage}</p>
            </div>

            {/* Share Options */}
            <div className="p-4 grid grid-cols-3 gap-2">
              {/* In-App Chat - First option */}
              <button
                onClick={() => handleShareVia('inapp')}
                disabled={isSendingInApp}
                className="flex flex-col items-center gap-2 p-3 bg-gradient-to-br from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 rounded-xl transition-colors border border-primary/20"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  {isSendingInApp ? (
                    <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
                  ) : (
                    <Users className="w-6 h-6 text-primary-foreground" />
                  )}
                </div>
                <span className="font-medium text-foreground text-xs">В чат</span>
              </button>

              {/* Telegram */}
              <button
                onClick={() => handleShareVia('telegram')}
                className="flex flex-col items-center gap-2 p-3 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-foreground text-xs">Telegram</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShareVia('whatsapp')}
                className="flex flex-col items-center gap-2 p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-foreground text-xs">WhatsApp</span>
              </button>

              {/* Viber */}
              <button
                onClick={() => handleShareVia('viber')}
                className="flex flex-col items-center gap-2 p-3 bg-[#7360F2]/10 hover:bg-[#7360F2]/20 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#7360F2] flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-foreground text-xs">Viber</span>
              </button>

              {/* SMS */}
              <button
                onClick={() => handleShareVia('sms')}
                className="flex flex-col items-center gap-2 p-3 bg-[#34C759]/10 hover:bg-[#34C759]/20 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#34C759] flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-foreground text-xs">SMS</span>
              </button>

              {/* Copy */}
              <button
                onClick={() => handleShareVia('copy')}
                className="flex flex-col items-center gap-2 p-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                  <Copy className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground text-xs">Копировать</span>
              </button>

              {/* Native Share */}
              <button
                onClick={() => handleShareVia('native')}
                className="flex flex-col items-center gap-2 p-3 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-medium text-foreground text-xs">Ещё...</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </Dialog>
  );
};
