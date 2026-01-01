import { useState, useEffect } from 'react';
import { Plus, Gift, Calendar, Star, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [dateType, setDateType] = useState('holiday');

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
    setTitle('');
    setSelectedDate(undefined);
    setDateType('holiday');
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
    <>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
            <span className="text-xs sm:text-sm text-muted-foreground">Важные даты</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-7 px-2 text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>

        {/* Dates list */}
        {dates.length > 0 ? (
          <div className="space-y-2">
            {dates.map(date => {
              const typeInfo = getDateTypeInfo(date.date_type);
              const IconComponent = typeInfo.icon;
              
              return (
                <div
                  key={date.id}
                  className="flex items-center justify-between bg-background/50 rounded-lg p-2.5 sm:p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-secondary")}>
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
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            Нет важных дат
          </p>
        )}
      </div>

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
            <Input
              placeholder="Название (напр. День свадьбы)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11"
            />
            
            {/* Calendar */}
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className={cn("rounded-xl border pointer-events-auto")}
                locale={ru}
              />
            </div>

            {/* Date type selector */}
            <Select value={dateType} onValueChange={setDateType}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[100]">
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
                disabled={!title.trim() || !selectedDate}
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
