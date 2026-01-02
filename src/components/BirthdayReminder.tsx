import { useState, useEffect } from 'react';
import { Friend } from '../types';
import { Cake, Gift, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BirthdayReminderProps {
  friends: Friend[];
}

const getUpcomingBirthdays = (friends: Friend[]) => {
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(today.getDate() + 30);

  return friends
    .filter(friend => friend.birthday)
    .map(friend => {
      const birthday = new Date(friend.birthday!);
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
      
      // If birthday already passed this year, check next year
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }

      const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...friend,
        daysUntil,
        birthdayDate: thisYearBirthday
      };
    })
    .filter(friend => friend.daysUntil <= 30 && friend.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil);
};

const STORAGE_KEY = 'birthday-reminder-expanded';

export const BirthdayReminder = ({ friends }: BirthdayReminderProps) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved !== null ? saved === 'true' : true;
  });
  const upcomingBirthdays = getUpcomingBirthdays(friends);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isExpanded));
  }, [isExpanded]);

  if (upcomingBirthdays.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-4 mb-4 animate-slide-up">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-full bg-pink-500/30 flex items-center justify-center">
          <Cake className="w-4 h-4 text-pink-400" />
        </div>
        <h3 className="font-semibold text-foreground flex-1 text-left">Дни рождения</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{upcomingBirthdays.length}</span>
          <ChevronDown className={cn(
            "w-5 h-5 text-muted-foreground transition-transform duration-200",
            isExpanded ? "rotate-180" : ""
          )} />
        </div>
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
      )}>
        <div className="space-y-2">
          {upcomingBirthdays.slice(0, 3).map(friend => {
            const formattedDate = friend.birthdayDate.toLocaleDateString('en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            
            return (
              <div 
                key={friend.id} 
                className="flex items-center gap-3 p-3 glass rounded-xl"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-2xl">🎂</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{friend.name}</p>
                  <p className="text-sm text-muted-foreground">{formattedDate}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-foreground">{friend.daysUntil}</p>
                  <p className="text-xs text-muted-foreground">
                    {friend.daysUntil === 0 ? 'today' : friend.daysUntil === 1 ? 'day left' : 'days left'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
