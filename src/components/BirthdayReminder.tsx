import { Friend } from '../types';
import { Cake, Gift } from 'lucide-react';

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

export const BirthdayReminder = ({ friends }: BirthdayReminderProps) => {
  const upcomingBirthdays = getUpcomingBirthdays(friends);

  if (upcomingBirthdays.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-4 mb-4 animate-slide-up">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <Cake className="w-4 h-4 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">Дни рождения</h3>
      </div>

      <div className="space-y-2">
        {upcomingBirthdays.slice(0, 3).map(friend => (
          <div 
            key={friend.id} 
            className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl"
          >
            <Gift className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{friend.name}</p>
              <p className="text-xs text-muted-foreground">
                {friend.daysUntil === 0 
                  ? 'Сегодня! 🎉' 
                  : friend.daysUntil === 1 
                    ? 'Завтра'
                    : `Через ${friend.daysUntil} дней`
                }
              </p>
            </div>
            <span className="text-2xl">🎂</span>
          </div>
        ))}
      </div>
    </div>
  );
};
