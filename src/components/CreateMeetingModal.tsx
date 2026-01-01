import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isTomorrow, addMonths, subMonths, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Check,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TimeWheelPicker } from './TimeWheelPicker';

interface Friend {
  id: string;
  friend_name: string;
  friend_last_name: string;
}

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedFriendId?: string | null;
  preselectedFriendName?: string | null;
  preselectedDate?: Date | null;
  onSuccess?: () => void;
}

type Step = 'type' | 'datetime' | 'friends' | 'location';

const meetingTypes = [
  { id: 'coffee', label: 'Кофе', emoji: '☕' },
  { id: 'lunch', label: 'Обед', emoji: '🍽️' },
  { id: 'movie', label: 'Кино', emoji: '🎬' },
  { id: 'sport', label: 'Спорт', emoji: '🏃' },
  { id: 'shopping', label: 'Шоппинг', emoji: '🛍️' },
  { id: 'party', label: 'Вечеринка', emoji: '🎉' },
  { id: 'work', label: 'Работа', emoji: '💼' },
  { id: 'walk', label: 'Прогулка', emoji: '🚶' },
  { id: 'bar', label: 'Бар', emoji: '🍺' },
  { id: 'restaurant', label: 'Ресторан', emoji: '🍴' },
  { id: 'concert', label: 'Концерт', emoji: '🎵' },
  { id: 'game', label: 'Игры', emoji: '🎮' },
  { id: 'travel', label: 'Поездка', emoji: '✈️' },
  { id: 'study', label: 'Учёба', emoji: '📚' },
  { id: 'other', label: 'Другое', emoji: '📌' },
];


export const CreateMeetingModal = ({ 
  isOpen, 
  onClose, 
  preselectedFriendId,
  preselectedFriendName,
  preselectedDate,
  onSuccess
}: CreateMeetingModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('type');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

  const today = new Date();
  const tomorrow = addDays(today, 1);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('type');
      setCurrentMonth(preselectedDate || new Date());
      setSelectedDate(preselectedDate || undefined);
      setSelectedTime('');
      setSelectedType('');
      setLocation('');
      setShowCalendar(false);
      
      if (preselectedFriendId) {
        setSelectedFriends([preselectedFriendId]);
      } else {
        setSelectedFriends([]);
      }
      
      fetchFriends();
    }
  }, [isOpen, preselectedFriendId, preselectedDate]);

  const fetchFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('friends')
      .select('id, friend_name, friend_last_name')
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
    if (!selectedDate || !selectedType || selectedFriends.length === 0) return;

    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    const typeInfo = meetingTypes.find(t => t.id === selectedType);
    const title = typeInfo ? `${typeInfo.emoji} ${typeInfo.label}` : 'Встреча';

    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        owner_id: user.id,
        title,
        meeting_date: format(selectedDate, 'yyyy-MM-dd'),
        meeting_time: selectedTime || null,
        location: location.trim() || null,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать встречу', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    if (selectedFriends.length > 0 && meeting) {
      await supabase.from('meeting_participants').insert(
        selectedFriends.map(friendId => ({
          meeting_id: meeting.id,
          friend_id: friendId,
        }))
      );
    }

    toast({ title: 'Готово', description: 'Встреча создана' });
    setIsSubmitting(false);
    onSuccess?.();
    onClose();
  };

  const getStepTitle = () => {
    switch (step) {
      case 'type': return 'Что планируете?';
      case 'datetime': return 'Когда?';
      case 'friends': return 'С кем?';
      case 'location': return 'Где?';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'type': return !!selectedType;
      case 'datetime': return !!selectedDate;
      case 'friends': return selectedFriends.length > 0;
      case 'location': return true; // Location is optional
    }
  };

  const goNext = () => {
    switch (step) {
      case 'type': setStep('datetime'); break;
      case 'datetime': setStep('friends'); break;
      case 'friends': setStep('location'); break;
      case 'location': handleSubmit(); break;
    }
  };

  const goBack = () => {
    switch (step) {
      case 'datetime': setStep('type'); break;
      case 'friends': setStep('datetime'); break;
      case 'location': setStep('friends'); break;
      default: onClose(); break;
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getSelectedFriendsNames = () => {
    return friends
      .filter(f => selectedFriends.includes(f.id))
      .map(f => f.friend_name)
      .join(', ');
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Radix calls onOpenChange for both open/close. We only want to close when it becomes false.
        if (!open) onClose();
      }}
    >
      <DialogContent 
        className="max-w-full w-full h-[100dvh] sm:h-[90vh] sm:max-w-md p-0 gap-0 bg-background border-0 sm:border sm:rounded-3xl flex flex-col overflow-hidden"
        hideClose
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={goBack}
              className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">Новая встреча</h2>
              <p className="text-sm text-muted-foreground">{getStepTitle()}</p>
            </div>
            <div className="flex gap-1.5">
              {['type', 'datetime', 'friends', 'location'].map((s, i) => (
                <div 
                  key={s}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    step === s ? "bg-primary scale-110" : 
                    ['type', 'datetime', 'friends', 'location'].indexOf(step) > i ? "bg-primary/50" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
          
          {/* Step 1: Meeting Type */}
          {step === 'type' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-3 gap-3">
                {meetingTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200",
                      selectedType === type.id 
                        ? "bg-primary text-primary-foreground scale-105" 
                        : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                    )}
                  >
                    <span className="text-3xl">{type.emoji}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
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
                    <span>Календарь</span>
                  </button>
                </div>
                
                {/* Show selected date if from calendar */}
                {selectedDate && !isSameDay(selectedDate, today) && !isSameDay(selectedDate, tomorrow) && !showCalendar && (
                  <div className="p-3 rounded-xl bg-primary/10 text-center">
                    <span className="font-medium">{format(selectedDate, 'd MMMM yyyy', { locale: ru })}</span>
                  </div>
                )}
              </div>

              {/* Calendar */}
              {showCalendar && (
                <div className="glass rounded-2xl p-4 animate-fade-in">
                  {/* Month navigation */}
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

                  {/* Week days */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days grid */}
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
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Время
                </p>
                <TimeWheelPicker
                  value={selectedTime ? { 
                    hours: parseInt(selectedTime.split(':')[0]), 
                    minutes: parseInt(selectedTime.split(':')[1]) 
                  } : undefined}
                  onChange={useCallback((val: { hours: number; minutes: number }) => {
                    setSelectedTime(`${val.hours.toString().padStart(2, '0')}:${val.minutes.toString().padStart(2, '0')}`);
                  }, [])}
                />
              </div>
            </div>
          )}

          {/* Step 3: Friends */}
          {step === 'friends' && (
            <div className="space-y-6 animate-fade-in">
              {/* Summary */}
              <div className="p-4 rounded-2xl glass flex items-center gap-3 flex-wrap">
                <span className="text-xl">{meetingTypes.find(t => t.id === selectedType)?.emoji}</span>
                <span className="font-medium">{meetingTypes.find(t => t.id === selectedType)?.label}</span>
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
                Выберите друзей
              </p>
              
              {preselectedFriendName && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{preselectedFriendName}</span>
                </div>
              )}
              
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
                    const isPreselected = preselectedFriendId === friend.id;
                    const isSelected = selectedFriends.includes(friend.id);
                    
                    if (isPreselected) return null;
                    
                    return (
                      <button
                        key={friend.id}
                        onClick={() => toggleFriend(friend.id)}
                        className={cn(
                          "px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                        )}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                        {friend.friend_name} {friend.friend_last_name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Location (optional) */}
          {step === 'location' && (
            <div className="space-y-6 animate-fade-in">
              {/* Summary */}
              <div className="p-4 rounded-2xl glass space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl">{meetingTypes.find(t => t.id === selectedType)?.emoji}</span>
                  <span className="font-medium">{meetingTypes.find(t => t.id === selectedType)?.label}</span>
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>с {getSelectedFriendsNames()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Место (необязательно)
                </p>
                <Input
                  placeholder="Где встречаемся?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-14 rounded-2xl text-base"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  Можете пропустить и добавить позже
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-5 pt-0">
          <Button 
            onClick={goNext}
            disabled={!canProceed() || isSubmitting}
            className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg"
          >
            {step === 'location' ? (
              isSubmitting ? 'Создание...' : 'Создать встречу'
            ) : (
              'Далее'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
