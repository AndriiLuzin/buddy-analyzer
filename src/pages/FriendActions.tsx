import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Friend, FriendCategory } from '../types';
import { CATEGORY_INFO } from '../constants';
import { 
  ArrowLeft, 
  MessageCircle, 
  Sparkles, 
  Phone, 
  Coffee, 
  Copy,
  Check,
  Loader2,
  Calendar
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { CreateMeetingModal } from '@/components/CreateMeetingModal';

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
    id: 'create_meeting',
    icon: <Calendar className="w-5 h-5" />,
    label: 'Создать встречу',
    description: 'Запланировать встречу',
    messages: []
  },
  {
    id: 'generate',
    icon: <Sparkles className="w-5 h-5" />,
    label: 'Сгенерировать сообщение',
    description: 'AI подберёт слова',
    messages: []
  },
];

const categoryGradients: Record<FriendCategory, string> = {
  soul_mate: 'from-amber-400 to-orange-500',
  close_friend: 'from-orange-400 to-rose-500',
  good_buddy: 'from-teal-400 to-cyan-500',
  situational: 'from-blue-400 to-indigo-500',
  distant: 'from-slate-400 to-gray-500'
};

export default function FriendActions() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [friend, setFriend] = useState<Friend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);

  useEffect(() => {
    const fetchFriend = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('id', friendId)
        .eq('owner_id', session.user.id)
        .single();

      if (error || !data) {
        navigate('/');
        return;
      }

      setFriend({
        id: data.id,
        name: `${data.friend_name} ${data.friend_last_name}`,
        category: data.friend_category as FriendCategory,
        description: data.friend_description || undefined,
        birthday: data.friend_birthday || undefined,
        lastInteraction: data.last_interaction || undefined,
        matchScore: data.match_score || undefined,
        friendUserId: data.friend_user_id,
      });
      setIsLoading(false);
    };

    fetchFriend();
  }, [friendId, navigate]);

  const selectedActionData = CONTACT_ACTIONS.find(a => a.id === selectedAction);

  const getCategoryLabel = (category?: FriendCategory): string => {
    if (!category) return 'друг';
    return CATEGORY_INFO[category]?.label || 'друг';
  };

  const handleGenerateMessage = async () => {
    if (!friend?.category) return;
    
    setIsGenerating(true);
    setGeneratedMessage(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-message', {
        body: {
          friendName: friend.name,
          category: getCategoryLabel(friend.category),
          messageType: 'contact',
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

  const handleCopyGenerated = async () => {
    if (!generatedMessage) return;
    await navigator.clipboard.writeText(generatedMessage);
    toast({
      title: "Скопировано!",
      description: "Сообщение скопировано в буфер обмена",
    });
  };

  if (isLoading || !friend) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  const gradient = friend.category ? categoryGradients[friend.category] : 'from-gray-400 to-gray-500';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className={`shrink-0 bg-gradient-to-br ${gradient} px-4 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]`}>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{friend.name}</h2>
            <p className="text-sm text-white/70">Написать сообщение</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Action Selection */}
        {!selectedAction ? (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Что хотите сделать?</h3>
            <div className="grid gap-2">
              {CONTACT_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    if (action.id === 'create_meeting') {
                      setShowCreateMeeting(true);
                      return;
                    }
                    setSelectedAction(action.id);
                    if (action.id === 'generate') {
                      setTimeout(() => handleGenerateMessage(), 100);
                    }
                  }}
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
                {isGenerating ? (
                  <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                    <p className="font-medium text-foreground">Генерация сообщения...</p>
                    <p className="text-sm text-muted-foreground">AI подбирает слова для {friend.name}</p>
                  </div>
                ) : generatedMessage ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">Готово!</span>
                      </div>
                      <p className="text-foreground">{generatedMessage}</p>
                    </div>
                    
                    <button
                      onClick={handleCopyGenerated}
                      className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy className="w-5 h-5" />
                      Скопировать сообщение
                    </button>
                    
                    <button
                      onClick={handleGenerateMessage}
                      className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Сгенерировать другое
                    </button>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-muted/50 border border-border flex flex-col items-center justify-center">
                    <p className="text-muted-foreground">Что-то пошло не так</p>
                    <button
                      onClick={handleGenerateMessage}
                      className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
                    >
                      Попробовать снова
                    </button>
                  </div>
                )}
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
                    <p className="text-foreground text-base leading-relaxed">{message}</p>
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

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={showCreateMeeting}
        onClose={() => setShowCreateMeeting(false)}
        preselectedFriendId={friend.id}
        preselectedFriendName={friend.name}
        onSuccess={() => {
          setShowCreateMeeting(false);
          navigate(`/friend/${friend.id}`);
        }}
      />
    </div>
  );
}