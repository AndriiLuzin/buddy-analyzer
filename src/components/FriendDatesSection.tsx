import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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

export const FriendDatesSection = ({ friendId, ownerId }: FriendDatesSectionProps) => {
  const navigate = useNavigate();
  const [dates, setDates] = useState<FriendDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  useEffect(() => {
    fetchDates();
  }, [friendId]);

  // Close selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-date-item]')) {
        setSelectedDateId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
      setSelectedDateId(null);
    }
  };

  const handleTouchStart = (dateId: string) => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      // Navigate to edit page on long press
      navigate(`/friend/${friendId}/date/${dateId}/edit`);
    }, 500);
  };

  const handleTouchEnd = (e: React.TouchEvent, dateId: string) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    // If it was a long press, prevent the click
    if (isLongPressRef.current) {
      e.preventDefault();
    }
  };

  const handleClick = (e: React.MouseEvent, dateId: string) => {
    e.stopPropagation();
    // If it was a long press, don't toggle selection
    if (isLongPressRef.current) {
      return;
    }
    // Toggle selection on tap
    setSelectedDateId(prev => prev === dateId ? null : dateId);
  };

  const handleDeleteClick = (e: React.MouseEvent, dateId: string) => {
    e.stopPropagation();
    setDateToDelete(dateId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (dateToDelete) {
      handleDeleteDate(dateToDelete);
      setDateToDelete(null);
    }
    setDeleteDialogOpen(false);
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

  if (dates.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        {dates.map(date => {
          const emoji = getDateEmoji(date.date_type);
          const daysUntil = getDaysUntil(date.date);
          const isSelected = selectedDateId === date.id;
          
          return (
            <div
              key={date.id}
              data-date-item
              onTouchStart={() => handleTouchStart(date.id)}
              onTouchEnd={(e) => handleTouchEnd(e, date.id)}
              onClick={(e) => handleClick(e, date.id)}
              className="bg-secondary/50 rounded-xl p-4 flex items-center gap-3 cursor-pointer active:bg-secondary/70 transition-colors"
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
                {isSelected && (
                  <button
                    onClick={(e) => handleDeleteClick(e, date.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors animate-fade-in"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить дату?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Дата будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
