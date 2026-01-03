import { Friend } from '../types';
import { differenceInDays } from 'date-fns';
import { AlertCircle } from 'lucide-react';

interface FocusWidgetProps {
  friends: Friend[];
}

export const FocusWidget = ({ friends }: FocusWidgetProps) => {
  const today = new Date();
  
  // Count friends with no interaction in last 14 days (overdue)
  const overdueFriends = friends.filter(friend => {
    if (!friend.lastInteraction) return true;
    const lastInteraction = new Date(friend.lastInteraction);
    return differenceInDays(today, lastInteraction) > 14;
  });

  // Count friends to contact today (no interaction in 7-14 days)
  const todayContactFriends = friends.filter(friend => {
    if (!friend.lastInteraction) return false;
    const lastInteraction = new Date(friend.lastInteraction);
    const days = differenceInDays(today, lastInteraction);
    return days >= 7 && days <= 14;
  });

  const overdueCount = overdueFriends.length;
  const todayCount = todayContactFriends.length;

  // Don't show if nothing to display
  if (overdueCount === 0 && todayCount === 0) return null;

  const getMessage = () => {
    if (todayCount > 0 && overdueCount === 0) {
      return `Сегодня стоит написать ${todayCount} ${todayCount === 1 ? 'человеку' : 'людям'}`;
    }
    if (overdueCount > 0 && todayCount === 0) {
      return `${overdueCount} ${overdueCount === 1 ? 'человек давно' : 'человека давно'} без контакта`;
    }
    return `${todayCount} ${todayCount === 1 ? 'человеку' : 'людям'} стоит написать`;
  };

  return (
    <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <AlertCircle className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm text-foreground/80">{getMessage()}</p>
      </div>
    </div>
  );
};
