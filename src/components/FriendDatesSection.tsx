import { useState, useEffect } from 'react';
import { Plus, Gift, Calendar, Star, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  { value: 'holiday', label: 'Праздник', icon: Gift, color: 'text-pink-500' },
  { value: 'anniversary', label: 'Годовщина', icon: Star, color: 'text-amber-500' },
  { value: 'other', label: 'Другое', icon: Calendar, color: 'text-blue-500' },
];

export const FriendDatesSection = ({ friendId, ownerId }: FriendDatesSectionProps) => {
  const [dates, setDates] = useState<FriendDate[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [dateType, setDateType] = useState('holiday');
  const [calendarOpen, setCalendarOpen] = useState(false);

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

  const handleAddDate = async () => {
    if (!title.trim() || !selectedDate) {
      toast({
        title: 'Заполните поля',
        description: 'Введите название и выберите дату',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('friend_dates').insert({
      friend_id: friendId,
      owner_id: ownerId,
      title: title.trim(),
      date: format(selectedDate, 'yyyy-MM-dd'),
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
      toast({
        title: 'Дата добавлена',
        description: `${title} - ${format(selectedDate, 'd MMMM', { locale: ru })}`,
      });
      setTitle('');
      setSelectedDate(undefined);
      setDateType('holiday');
      setIsAdding(false);
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
    return DATE_TYPES.find(t => t.value === type) || DATE_TYPES[2];
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'd MMMM', { locale: ru });
  };

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
          <span className="text-xs sm:text-sm text-muted-foreground">Важные даты</span>
        </div>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-7 px-2 text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        )}
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="bg-secondary/50 rounded-xl p-3 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Новая дата</span>
            <button onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <Input
            placeholder="Название (напр. День свадьбы)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 text-sm"
          />
          
          <div className="flex gap-2">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex-1 justify-start text-left font-normal h-9 text-sm",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'd MMMM', { locale: ru }) : 'Выберите дату'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            <Select value={dateType} onValueChange={setDateType}>
              <SelectTrigger className="w-32 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50">
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
          
          <Button onClick={handleAddDate} size="sm" className="w-full h-9">
            Добавить дату
          </Button>
        </div>
      )}

      {/* Dates list */}
      {dates.length > 0 ? (
        <div className="space-y-2">
          {dates.map(date => {
            const typeInfo = getDateTypeInfo(date.date_type);
            const IconComponent = typeInfo.icon;
            
            return (
              <div
                key={date.id}
                className="flex items-center justify-between bg-secondary/30 rounded-lg p-2.5 sm:p-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-background/50")}>
                    <IconComponent className={cn("w-4 h-4", typeInfo.color)} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{date.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDisplayDate(date.date)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDate(date.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : !isAdding && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Нет важных дат
        </p>
      )}
    </div>
  );
};
