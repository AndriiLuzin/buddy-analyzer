import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Check,
  MapPin,
  Coffee,
  Utensils,
  Film,
  Dumbbell,
  ShoppingBag,
  PartyPopper,
  Briefcase,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  onSuccess?: () => void;
}

const meetingTypes = [
  { id: 'coffee', label: 'Кофе', icon: Coffee, emoji: '☕' },
  { id: 'lunch', label: 'Обед', icon: Utensils, emoji: '🍽️' },
  { id: 'movie', label: 'Кино', icon: Film, emoji: '🎬' },
  { id: 'sport', label: 'Спорт', icon: Dumbbell, emoji: '🏃' },
  { id: 'shopping', label: 'Шоппинг', icon: ShoppingBag, emoji: '🛍️' },
  { id: 'party', label: 'Вечеринка', icon: PartyPopper, emoji: '🎉' },
  { id: 'work', label: 'Работа', icon: Briefcase, emoji: '💼' },
  { id: 'chat', label: 'Прогулка', icon: MessageCircle, emoji: '🚶' },
];

const quickTimes = [
  { label: 'Утро', times: ['09:00', '10:00', '11:00'] },
  { label: 'День', times: ['12:00', '13:00', '14:00', '15:00'] },
  { label: 'Вечер', times: ['17:00', '18:00', '19:00', '20:00', '21:00'] },
];

export const CreateMeetingModal = ({ 
  isOpen, 
  onClose, 
  preselectedFriendId,
  preselectedFriendName,
  onSuccess
}: CreateMeetingModalProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date()); // Default to today
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
  }, [isOpen, preselectedFriendId]);

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

    // Add participants
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

  const canSubmit = selectedDate && selectedType && selectedFriends.length > 0;

  const getSelectedFriendsNames = () => {
    return friends
      .filter(f => selectedFriends.includes(f.id))
      .map(f => f.friend_name)
      .join(', ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-full w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md p-0 gap-0 bg-background border-0 sm:border sm:rounded-3xl flex flex-col overflow-hidden"
        hideClose
      >
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-xl font-bold text-foreground flex-1">Новая встреча</h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Date Selection */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Когда</p>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full p-4 rounded-2xl glass flex items-center gap-3"
            >
              <CalendarIcon className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: ru }) : 'Выбрать дату'}
              </span>
            </button>
            
            {showCalendar && (
              <div className="animate-fade-in">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setShowCalendar(false);
                  }}
                  locale={ru}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className={cn("p-3 pointer-events-auto rounded-2xl glass w-full")}
                />
              </div>
            )}
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Время</p>
            <div className="space-y-2">
              {quickTimes.map(group => (
                <div key={group.label} className="space-y-2">
                  <p className="text-xs text-muted-foreground">{group.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.times.map(time => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(selectedTime === time ? '' : time)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                          selectedTime === time 
                            ? "bg-primary text-primary-foreground" 
                            : "glass hover:scale-[1.02]"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Type */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Тип встречи</p>
            <div className="grid grid-cols-4 gap-2">
              {meetingTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all duration-200",
                    selectedType === type.id 
                      ? "bg-primary text-primary-foreground scale-105" 
                      : "glass hover:scale-[1.02]"
                  )}
                >
                  <span className="text-xl">{type.emoji}</span>
                  <span className="text-xs font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Friends Selection */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              С кем
            </p>
            
            {preselectedFriendName && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{preselectedFriendName}</span>
              </div>
            )}
            
            {friends.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Нет добавленных друзей</p>
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
                        "px-3 py-2 rounded-xl text-sm transition-all duration-200 flex items-center gap-2",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "glass hover:scale-[1.02]"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {friend.friend_name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Location (optional) */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Место (необязательно)</p>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
              <Input
                placeholder="Где встречаемся?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 h-11 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-5 border-t border-border/50">
          {selectedFriends.length > 0 && selectedType && (
            <div className="mb-3 p-3 rounded-xl bg-muted/50 text-sm text-center">
              <span className="text-muted-foreground">
                {meetingTypes.find(t => t.id === selectedType)?.emoji}{' '}
                {meetingTypes.find(t => t.id === selectedType)?.label} с{' '}
              </span>
              <span className="font-medium text-foreground">
                {getSelectedFriendsNames()}
              </span>
            </div>
          )}
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg"
          >
            {isSubmitting ? 'Создание...' : 'Создать встречу'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
