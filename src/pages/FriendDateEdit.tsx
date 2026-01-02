import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Calendar, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateWheelPicker } from '@/components/DateWheelPicker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export default function FriendDateEdit() {
  const { friendId, dateId } = useParams<{ friendId: string; dateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [customTitle, setCustomTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState<{ month: number; day: number }>({
    month: new Date().getMonth(),
    day: new Date().getDate()
  });
  const [dateType, setDateType] = useState('birthday');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchDate = async () => {
      if (!dateId) return;

      const { data, error } = await supabase
        .from('friend_dates')
        .select('*')
        .eq('id', dateId)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить данные',
          variant: 'destructive',
        });
        navigate(-1);
        return;
      }

      const date = new Date(data.date);
      setSelectedDate({ month: date.getMonth(), day: date.getDate() });
      setDateType(data.date_type);
      
      // Check if title matches a predefined type
      const predefinedType = DATE_TYPES.find(t => t.label === data.title);
      if (predefinedType) {
        setDateType(predefinedType.value);
      } else if (data.date_type === 'other') {
        setCustomTitle(data.title);
      } else {
        setCustomTitle(data.title);
        setDateType(data.date_type);
      }
      
      setIsLoading(false);
    };

    fetchDate();
  }, [dateId, navigate, toast]);

  const handleDateChange = useCallback((value: { month: number; day: number }) => {
    setSelectedDate(value);
  }, []);

  const getTitle = () => {
    if (dateType === 'other') {
      return customTitle.trim();
    }
    return DATE_TYPES.find(t => t.value === dateType)?.label || '';
  };

  const handleSubmit = async () => {
    const finalTitle = getTitle();
    if (!finalTitle) {
      toast({
        title: 'Заполните название',
        description: 'Выберите тип праздника или введите свой вариант',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const year = new Date().getFullYear();
    const dateStr = `${year}-${String(selectedDate.month + 1).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;

    const { error } = await supabase
      .from('friend_dates')
      .update({
        title: finalTitle,
        date: dateStr,
        date_type: dateType,
      })
      .eq('id', dateId);

    if (error) {
      console.error('Error updating date:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить дату',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    } else {
      const displayDate = new Date(year, selectedDate.month, selectedDate.day);
      toast({
        title: 'Дата обновлена',
        description: `${finalTitle} - ${format(displayDate, 'd MMMM', { locale: ru })}`,
      });
      navigate(`/friend/${friendId}`);
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('friend_dates')
      .delete()
      .eq('id', dateId);

    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить дату',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Удалено',
        description: 'Дата успешно удалена',
      });
      navigate(`/friend/${friendId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-gradient-to-br from-pink-400 to-rose-500 p-4 sm:p-5">
        <div className="flex items-center justify-between pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-white" />
              <h1 className="text-lg font-semibold text-white">Редактировать дату</h1>
            </div>
          </div>
          <button 
            onClick={() => setShowDeleteDialog(true)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* Date type selector */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Тип праздника</p>
          <Select value={dateType} onValueChange={setDateType}>
            <SelectTrigger className="h-14 rounded-2xl text-base">
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
            className="h-14 rounded-2xl text-base"
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
      </div>

      {/* Footer */}
      <div className="shrink-0 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <Button 
          onClick={handleSubmit}
          disabled={dateType === 'other' ? !customTitle.trim() : false || isSubmitting}
          className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg"
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить дату?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Дата будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
