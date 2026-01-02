import { useState, useEffect, useCallback } from 'react';
import { Plus, Gift, Calendar, Star, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DateWheelPicker } from './DateWheelPicker';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FriendDate {
  id: string;
  title: string;
  date: string;
  date_type: string;
  notes?: string;
}

interface FriendDatesSectionProps {
  friendId: string;
  ownerId: string;
}

const DATE_TYPES = [
  { value: 'birthday', label: 'День рождения', icon: Gift, color: 'text-pink-500' },
  { value: 'anniversary', label: 'Годовщина свадьбы', icon: Star, color: 'text-amber-500' },
  { value: 'nameday', label: 'Именины', icon: Calendar, color: 'text-purple-500' },
  { value: 'graduation', label: 'Выпускной', icon: Star, color: 'text-blue-500' },
  { value: 'new_year', label: 'Новый год', icon: Gift, color: 'text-green-500' },
  { value: 'valentine', label: 'День влюблённых', icon: Gift, color: 'text-red-500' },
  { value: 'mothers_day', label: 'День матери', icon: Gift, color: 'text-rose-500' },
  { value: 'fathers_day', label: 'День отца', icon: Gift, color: 'text-sky-500' },
  { value: 'professional', label: 'Профессиональный праздник', icon: Star, color: 'text-orange-500' },
  { value: 'memorial', label: 'Памятная дата', icon: Calendar, color: 'text-slate-500' },
  { value: 'other', label: 'Другое', icon: Calendar, color: 'text-muted-foreground' },
];

export const FriendDatesSection = ({ friendId, ownerId }: FriendDatesSectionProps) => {
  const [dates, setDates] = useState<FriendDate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [customTitle, setCustomTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<{ month: number; day: number }>({
    month: new Date().getMonth(),
    day: new Date().getDate()
  });
  const [dateType, setDateType] = useState('birthday');

  useEffect(() => {
    fetchDates();
  }, [friendId]);

  const fetchDates = async () => {
    const { data, error } = await supabase
      .from('friend_dates')
      .select('*')
      .eq('friend_id', friendId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching friend dates:', error);
    } else {
      setDates(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setCustomTitle('');
    setSelectedDate({
      month: new Date().getMonth(),
      day: new Date().getDate()
    });
    setDateType('birthday');
  };

  const getTitle = () => {
    if (dateType === 'other') {
      return customTitle.trim();
    }
    return DATE_TYPES.find(t => t.value === dateType)?.label || '';
  };

  const handleDateChange = useCallback((value: { month: number; day: number }) => {
    setSelectedDate(value);
  }, []);

  const handleAddDate = async () => {
    const finalTitle = getTitle();
    if (!finalTitle) {
      toast({
        title: 'Заполните название',
        description: 'Выберите тип праздника или введите свой вариант',
        variant: 'destructive',
      });
      return;
    }

    const year = new Date().getFullYear();
    const dateStr = `${year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;

    const { error } = await supabase.from('friend_dates').insert({
      friend_id: friendId,
      owner_id: ownerId,
      title: finalTitle,
      date: dateStr,
      date_type: dateType,
    });

    if (error) {
      console.error('Error adding date:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить дату',
        variant: 'destructive',
      });
    } else {
      const displayDate = new Date(year, selectedDate.month, selectedDate.day);
      toast({
        title: 'Дата добавлена',
        description: `${finalTitle} - ${format(displayDate, 'd MMMM', { locale: ru })}`,
      });
      resetForm();
      setIsModalOpen(false);
      fetchDates();
    }
  };

  const handleDeleteDate = async (dateId: string) => {
    const { error } = await supabase
      .from('friend_dates')
      .delete()
      .eq('id', dateId);

    if (error) {
      console.error('Error deleting date:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить дату',
        variant: 'destructive',
      });
    } else {
      fetchDates();
    }
  };

  const getDateTypeInfo = (type: string) => {
    return DATE_TYPES.find(t => t.value === type) || DATE_TYPES[DATE_TYPES.length - 1];
  };

  const getDateEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      birthday: '🎂',
      anniversary: '💍',
      nameday: '📅',
      graduation: '🎓',
      new_year: '🎄',
      valentine: '❤️',
      mothers_day: '💐',
      fathers_day: '👔',
      professional: '💼',
      memorial: '🕯️',
      other: '📆',
    };
    return emojiMap[type] || '📆';
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    const thisYearDate = new Date(today.getFullYear(), date.getMonth(), date.getDate());
    
    if (thisYearDate < today) {
      thisYearDate.setFullYear(today.getFullYear() + 1);
    }
    
    return Math.ceil((thisYearDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDisplayDate = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    const thisYearDate = new Date(today.getFullYear(), date.getMonth(), date.getDate());
    
    if (thisYearDate < today) {
      thisYearDate.setFullYear(today.getFullYear() + 1);
    }
    
    return thisYearDate.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return null;
  }

  return (
    <>
      {/* Header with add button */}
      <div className="flex items-center justify-between bg-secondary/30 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-pink-500" />
          <span className="text-sm text-muted-foreground">Важные даты</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-8 px-3 text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Добавить
        </Button>
      </div>

      {/* Dates list - each date as separate card */}
      {dates.length > 0 && (
        <div className="space-y-3 mt-3">
          {dates.map(date => {
            const typeInfo = getDateTypeInfo(date.date_type);
            const emoji = getDateEmoji(date.date_type);
            const daysUntil = getDaysUntil(date.date);
            
            return (
              <div
                key={date.id}
                className="bg-secondary/50 rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center shrink-0">
                  <span className="text-2xl">{emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{date.title}</p>
                  <p className="text-sm text-muted-foreground">{formatDisplayDate(date.date)}</p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-3">
                  <div>
                    <p className="text-xl font-bold text-foreground">{daysUntil}</p>
                    <p className="text-xs text-muted-foreground">
                      {daysUntil === 0 ? 'today' : daysUntil === 1 ? 'day left' : 'days left'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDate(date.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Date Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm p-0 overflow-hidden bg-card border-0 rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-pink-400 to-rose-500 p-4 sm:p-5">
            <DialogHeader>
              <DialogTitle className="text-white text-base sm:text-lg font-semibold flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Новая важная дата
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-5 space-y-4">
            {/* Date type selector - first */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Тип праздника</p>
              <Select value={dateType} onValueChange={setDateType}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-60">
                  {DATE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className={cn("w-4 h-4", type.color)} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom title input - only for "other" type */}
            {dateType === 'other' && (
              <Input
                placeholder="Введите название"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="h-11"
              />
            )}
            
            {/* Date wheel picker */}
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Выберите дату</p>
              <DateWheelPicker
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>
            
            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="flex-1 h-11"
              >
                Отмена
              </Button>
              <Button 
                onClick={handleAddDate} 
                className="flex-1 h-11"
                disabled={dateType === 'other' ? !customTitle.trim() : false}
              >
                Добавить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
