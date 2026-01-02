import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  const [dates, setDates] = useState<FriendDate[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-3">
      {dates.map(date => {
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
  );
};
