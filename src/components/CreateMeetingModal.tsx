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
  MapPin
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

type Step = 'date' | 'time' | 'friends' | 'details';

export const CreateMeetingModal = ({ 
  isOpen, 
  onClose, 
  preselectedFriendId,
  preselectedFriendName,
  onSuccess
}: CreateMeetingModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('date');
      setSelectedDate(undefined);
      setSelectedTime('');
      setTitle('');
      setLocation('');
      
      // If preselected friend, add to selected friends
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
    if (!selectedDate || !title.trim()) return;

    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        owner_id: user.id,
        title: title.trim(),
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

  const getStepTitle = () => {
    switch (step) {
      case 'date': return 'Выберите дату';
      case 'time': return 'Выберите время';
      case 'friends': return 'Пригласите друзей';
      case 'details': return 'Детали встречи';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'date': return !!selectedDate;
      case 'time': return true; // Time is optional
      case 'friends': return true; // Friends are optional
      case 'details': return !!title.trim();
    }
  };

  const goNext = () => {
    switch (step) {
      case 'date': setStep('time'); break;
      case 'time': setStep('friends'); break;
      case 'friends': setStep('details'); break;
      case 'details': handleSubmit(); break;
    }
  };

  const goBack = () => {
    switch (step) {
      case 'time': setStep('date'); break;
      case 'friends': setStep('time'); break;
      case 'details': setStep('friends'); break;
      default: onClose(); break;
    }
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md max-h-[90vh] p-0 gap-0 bg-background border-0 sm:border sm:rounded-2xl flex flex-col overflow-hidden"
        hideClose
      >
        {/* Header */}
        <div className="shrink-0 bg-background border-b border-border px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={goBack}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">Новая встреча</h2>
              <p className="text-sm text-muted-foreground">{getStepTitle()}</p>
            </div>
            <div className="flex gap-1">
              {['date', 'time', 'friends', 'details'].map((s, i) => (
                <div 
                  key={s}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    step === s ? "bg-primary" : 
                    ['date', 'time', 'friends', 'details'].indexOf(step) > i ? "bg-primary/50" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'date' && (
            <div className="flex flex-col items-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={ru}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className={cn("p-3 pointer-events-auto rounded-xl border")}
              />
              {selectedDate && (
                <div className="mt-4 p-3 rounded-xl bg-primary/10 text-center">
                  <p className="text-sm text-muted-foreground">Выбранная дата</p>
                  <p className="font-semibold text-foreground">
                    {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'time' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Выберите время или пропустите
              </p>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(selectedTime === time ? '' : time)}
                    className={cn(
                      "p-3 rounded-xl text-center transition-all border",
                      selectedTime === time 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-card border-border hover:bg-muted"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  placeholder="Другое время"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {step === 'friends' && (
            <div className="space-y-4">
              {preselectedFriendName && (
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Встреча с</p>
                  <p className="font-semibold text-foreground">{preselectedFriendName}</p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                {preselectedFriendId 
                  ? 'Добавьте ещё друзей (необязательно)' 
                  : 'Выберите друзей для приглашения'}
              </p>
              
              {friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Нет добавленных друзей</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {friends.map(friend => {
                    const isPreselected = preselectedFriendId === friend.id;
                    const isSelected = selectedFriends.includes(friend.id);
                    
                    return (
                      <button
                        key={friend.id}
                        onClick={() => !isPreselected && toggleFriend(friend.id)}
                        disabled={isPreselected}
                        className={cn(
                          "px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-2 border",
                          isSelected || isPreselected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:bg-muted"
                        )}
                      >
                        {(isSelected || isPreselected) && <Check className="w-4 h-4" />}
                        {friend.friend_name} {friend.friend_last_name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="w-4 h-4 text-primary" />
                  <span>
                    {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: ru }) : 'Не выбрана'}
                  </span>
                  {selectedTime && (
                    <>
                      <Clock className="w-4 h-4 text-primary ml-2" />
                      <span>{selectedTime}</span>
                    </>
                  )}
                </div>
                {selectedFriends.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span>
                      {selectedFriends.length} {selectedFriends.length === 1 ? 'участник' : 'участников'}
                    </span>
                  </div>
                )}
              </div>

              <Input
                placeholder="Название встречи *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12"
              />

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Место (необязательно)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border p-4">
          <Button 
            onClick={goNext}
            disabled={!canProceed() || isSubmitting}
            className="w-full h-12 rounded-xl"
          >
            {step === 'details' ? (
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
