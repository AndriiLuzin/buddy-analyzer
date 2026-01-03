import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Users, 
  Check,
  MapPin,
  Link as LinkIcon,
  Copy,
  Share2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TimeWheelPicker } from '@/components/TimeWheelPicker';
import { partyTypeIcons } from '@/components/icons/PartyTypeIcons';
import { toast } from 'sonner';

interface Friend {
  id: string;
  friend_name: string;
  friend_last_name: string;
  friend_user_id: string;
}

type Step = 'type' | 'details' | 'datetime' | 'friends' | 'share';

const partyTypes = [
  { id: 'birthday', label: 'День рождения', emoji: '🎂' },
  { id: 'party', label: 'Вечеринка', emoji: '🎉' },
  { id: 'bbq', label: 'Барбекю', emoji: '🍖' },
  { id: 'wedding', label: 'Свадьба', emoji: '💒' },
  { id: 'newyear', label: 'Новый год', emoji: '🎄' },
  { id: 'corporate', label: 'Корпоратив', emoji: '🏢' },
  { id: 'other', label: 'Другое', emoji: '🎊' },
];

// Generate a short random invite code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function PartyCreate() {
  const navigate = useNavigate();
  const { toast: showToast } = useToast();

  const [step, setStep] = useState<Step>('type');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [partyTitle, setPartyTitle] = useState('');
  const [partyLocation, setPartyLocation] = useState('');
  const [partyDescription, setPartyDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const handleTimeChange = useCallback((val: { hours: number; minutes: number }) => {
    setSelectedTime(`${val.hours.toString().padStart(2, '0')}:${val.minutes.toString().padStart(2, '0')}`);
  }, []);

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

  const today = new Date();
  const tomorrow = addDays(today, 1);

  useEffect(() => {
    fetchFriends();
  }, []);

  // Auto-fill title based on type
  useEffect(() => {
    if (selectedType && !partyTitle) {
      const typeInfo = partyTypes.find(t => t.id === selectedType);
      if (typeInfo) {
        setPartyTitle(typeInfo.label);
      }
    }
  }, [selectedType]);

  const fetchFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }

    const { data, error } = await supabase
      .from('friends')
      .select('id, friend_name, friend_last_name, friend_user_id')
      .eq('owner_id', user.id);

    if (!error && data) {
      setFriends(data);
    }
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedType || selectedFriends.length === 0 || !partyTitle.trim()) return;

    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    // Get user's profile for the invitation message
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const userName = userProfile 
      ? `${userProfile.first_name} ${userProfile.last_name}`.trim() 
      : 'Друг';

    const typeInfo = partyTypes.find(t => t.id === selectedType);
    const emoji = typeInfo?.emoji || '🎊';

    const { data: party, error } = await supabase
      .from('parties')
      .insert({
        owner_id: user.id,
        title: partyTitle.trim(),
        party_type: selectedType,
        party_date: format(selectedDate, 'yyyy-MM-dd'),
        party_time: selectedTime || null,
        location: partyLocation.trim() || null,
        description: partyDescription.trim() || null,
      })
      .select()
      .single();

    if (error) {
      showToast({ title: 'Ошибка', description: 'Не удалось создать мероприятие', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    // Generate invite link for external guests
    const inviteCode = generateInviteCode();
    const { error: inviteError } = await supabase
      .from('party_external_invites')
      .insert({
        party_id: party.id,
        invite_code: inviteCode,
      });

    if (!inviteError) {
      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/invite/${inviteCode}`);
    }

    if (selectedFriends.length > 0 && party) {
      // Add participants
      await supabase.from('party_participants').insert(
        selectedFriends.map(friendId => ({
          party_id: party.id,
          friend_id: friendId,
          status: 'pending',
        }))
      );

      // Get friend details to find those with user accounts
      const { data: friendsWithAccounts } = await supabase
        .from('friends')
        .select('id, friend_user_id, friend_name')
        .in('id', selectedFriends);

      // Send notifications to friends who have accounts
      if (friendsWithAccounts && friendsWithAccounts.length > 0) {
        const dateFormatted = format(selectedDate, 'd MMMM', { locale: ru });
        const timeStr = selectedTime ? ` в ${selectedTime}` : '';
        const locationStr = partyLocation.trim() ? ` • ${partyLocation.trim()}` : '';
        
        const notifications = friendsWithAccounts
          .filter(f => f.friend_user_id && f.friend_user_id !== user.id)
          .map(friend => ({
            user_id: friend.friend_user_id,
            type: 'party_invite',
            title: `${emoji} Приглашение на ${partyTitle}`,
            message: `${userName} приглашает вас: ${partyTitle} — ${dateFormatted}${timeStr}${locationStr}`,
            data: {
              party_id: party.id,
              inviter_id: user.id,
              inviter_name: userName,
              party_title: partyTitle,
              party_type: selectedType,
              party_date: format(selectedDate, 'yyyy-MM-dd'),
              party_time: selectedTime || null,
              location: partyLocation.trim() || null,
            },
          }));

        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications);
        }
      }
    }

    showToast({ title: 'Готово!', description: 'Приглашения отправлены' });
    setIsSubmitting(false);
    setStep('share');
  };

  const getStepTitle = () => {
    switch (step) {
      case 'type': return 'Тип мероприятия';
      case 'details': return 'Детали';
      case 'datetime': return 'Когда?';
      case 'friends': return 'Кого пригласить?';
      case 'share': return 'Ссылка для гостей';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'type': return !!selectedType;
      case 'details': return !!partyTitle.trim();
      case 'datetime': return !!selectedDate;
      case 'friends': return selectedFriends.length > 0 || true; // Allow proceeding even without friends
      case 'share': return true;
    }
  };

  const goNext = () => {
    switch (step) {
      case 'type': setStep('details'); break;
      case 'details': setStep('datetime'); break;
      case 'datetime': setStep('friends'); break;
      case 'friends': handleSubmit(); break;
      case 'share': navigate('/parties'); break;
    }
  };

  const goBack = () => {
    switch (step) {
      case 'details': setStep('type'); break;
      case 'datetime': setStep('details'); break;
      case 'friends': setStep('datetime'); break;
      case 'share': navigate('/parties'); break;
      default: navigate('/parties'); break;
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Ссылка скопирована!');
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const shareInviteLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: partyTitle,
          text: `Приглашаю вас на ${partyTitle}!`,
          url: inviteLink,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      copyInviteLink();
    }
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {step === 'share' ? 'Мероприятие создано!' : 'Новое мероприятие'}
            </h2>
            <p className="text-sm text-muted-foreground">{getStepTitle()}</p>
          </div>
          {step !== 'share' && (
            <div className="flex gap-1.5">
              {['type', 'details', 'datetime', 'friends'].map((s, i) => (
                <div 
                  key={s}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    step === s ? "bg-primary scale-110" : 
                    ['type', 'details', 'datetime', 'friends'].indexOf(step as Step) > i ? "bg-primary/50" : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
        
        {/* Step 1: Party Type */}
        {step === 'type' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              {partyTypes.map(type => {
                const IconComponent = partyTypeIcons[type.id];
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "aspect-[4/3] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200",
                      selectedType === type.id 
                        ? "bg-primary/20 ring-2 ring-primary scale-105" 
                        : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                    )}
                  >
                    {IconComponent && <IconComponent size={48} />}
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 'details' && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Название</label>
              <Input
                value={partyTitle}
                onChange={(e) => setPartyTitle(e.target.value)}
                placeholder="Название мероприятия"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Место
              </label>
              <Input
                value={partyLocation}
                onChange={(e) => setPartyLocation(e.target.value)}
                placeholder="Адрес или название места"
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Описание (необязательно)</label>
              <Textarea
                value={partyDescription}
                onChange={(e) => setPartyDescription(e.target.value)}
                placeholder="Дополнительная информация..."
                className="min-h-[100px] rounded-xl resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick date buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedDate(today);
                    setShowCalendar(false);
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-medium transition-all duration-200",
                    selectedDate && isSameDay(selectedDate, today)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                  )}
                >
                  Сегодня
                </button>
                <button
                  onClick={() => {
                    setSelectedDate(tomorrow);
                    setShowCalendar(false);
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-medium transition-all duration-200",
                    selectedDate && isSameDay(selectedDate, tomorrow)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                  )}
                >
                  Завтра
                </button>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2",
                    showCalendar || (selectedDate && !isSameDay(selectedDate, today) && !isSameDay(selectedDate, tomorrow))
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Дата</span>
                </button>
              </div>
              
              {selectedDate && !isSameDay(selectedDate, today) && !isSameDay(selectedDate, tomorrow) && !showCalendar && (
                <div className="p-3 rounded-xl bg-primary/10 text-center">
                  <span className="font-medium">{format(selectedDate, 'd MMMM yyyy', { locale: ru })}</span>
                </div>
              )}
            </div>

            {/* Calendar */}
            {showCalendar && (
              <div className="glass rounded-2xl p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-base font-semibold capitalize">
                    {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors rotate-180"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: paddingDays }).map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square" />
                  ))}
                  {daysInMonth.map(day => {
                    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          if (!isPast) {
                            setSelectedDate(day);
                            setShowCalendar(false);
                          }
                        }}
                        disabled={isPast}
                        className={cn(
                          "aspect-square rounded-2xl flex items-center justify-center text-sm font-medium transition-all duration-200",
                          isToday(day) && !isSelected && "bg-accent text-accent-foreground",
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : isPast
                              ? "text-muted-foreground/30"
                              : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Time Selection */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Время</p>
              <TimeWheelPicker
                value={selectedTime ? { 
                  hours: parseInt(selectedTime.split(':')[0]), 
                  minutes: parseInt(selectedTime.split(':')[1]) 
                } : undefined}
                onChange={handleTimeChange}
              />
            </div>
          </div>
        )}

        {/* Step 4: Friends */}
        {step === 'friends' && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary */}
            <div className="p-4 rounded-2xl glass flex items-center gap-3 flex-wrap">
              <span className="text-xl">{partyTypes.find(t => t.id === selectedType)?.emoji}</span>
              <span className="font-medium">{partyTitle}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm">
                {selectedDate && (isSameDay(selectedDate, today) ? 'Сегодня' : isSameDay(selectedDate, tomorrow) ? 'Завтра' : format(selectedDate, 'd MMM', { locale: ru }))}
              </span>
              {selectedTime && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm">{selectedTime}</span>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Пригласить друзей
            </p>
            
            {friends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 opacity-50" />
                </div>
                <p className="font-medium">Нет добавленных друзей</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {friends.map(friend => {
                  const isSelected = selectedFriends.includes(friend.id);
                  
                  return (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={cn(
                        "px-4 py-2.5 rounded-full flex items-center gap-2 transition-all duration-200",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 hover:bg-secondary"
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                      <span className="font-medium">{friend.friend_name} {friend.friend_last_name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedFriends.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Выбрано: {selectedFriends.length}
              </p>
            )}
          </div>
        )}

        {/* Step 5: Share Link */}
        {step === 'share' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{partyTitle}</h3>
              <p className="text-muted-foreground">
                {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                {selectedTime && ` в ${selectedTime}`}
              </p>
            </div>

            <div className="bg-secondary/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Ссылка для гостей</p>
                  <p className="text-sm text-muted-foreground">Отправьте людям без аккаунта</p>
                </div>
              </div>

              <div className="bg-background rounded-xl p-3 flex items-center gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-foreground truncate outline-none"
                />
                <button
                  onClick={copyInviteLink}
                  className="shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Copy className="w-4 h-4 text-foreground" />
                </button>
              </div>

              <Button
                onClick={shareInviteLink}
                variant="outline"
                className="w-full h-12 rounded-xl gap-2"
              >
                <Share2 className="w-4 h-4" />
                Поделиться ссылкой
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Когда гости откроют ссылку и ответят, вы получите уведомление
            </p>
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="shrink-0 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 bg-background border-t border-border/50">
        <Button 
          onClick={goNext}
          disabled={!canProceed() || isSubmitting}
          className="w-full h-14 rounded-2xl text-base font-semibold"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
              <span>Создание...</span>
            </div>
          ) : step === 'friends' ? (
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>Создать мероприятие</span>
            </div>
          ) : step === 'share' ? (
            'Готово'
          ) : (
            'Далее'
          )}
        </Button>
      </div>
    </div>
  );
}
