import { useMemo } from 'react';
import { Friend, FriendCategory } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FriendshipScoreGaugeProps {
  friends: Friend[];
}

// Интервалы напоминаний в днях для каждой категории
const REMINDER_INTERVALS: Record<FriendCategory, number> = {
  soul_mate: 3,
  family: 5,
  close_friend: 7,
  good_buddy: 14,
  situational: 30,
  distant: 60
};

const getDaysSinceLastContact = (lastInteraction?: string): number => {
  if (!lastInteraction) return 999;
  const lastDate = new Date(lastInteraction);
  const today = new Date();
  return Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
};

interface ScoreLevel {
  label: string;
  color: string;
  arcColor: string;
}

const getScoreLevel = (score: number): ScoreLevel => {
  if (score >= 90) return { label: 'Отлично', color: 'text-emerald-500', arcColor: '#10b981' };
  if (score >= 70) return { label: 'Хорошо', color: 'text-green-500', arcColor: '#22c55e' };
  if (score >= 50) return { label: 'Неплохо', color: 'text-yellow-500', arcColor: '#eab308' };
  if (score >= 30) return { label: 'Слабо', color: 'text-orange-500', arcColor: '#f97316' };
  return { label: 'Критично', color: 'text-red-500', arcColor: '#ef4444' };
};

export const FriendshipScoreGauge = ({ friends }: FriendshipScoreGaugeProps) => {
  const { score, level, pointsChange } = useMemo(() => {
    const categorizedFriends = friends.filter(f => f.category);
    
    if (categorizedFriends.length === 0) {
      return { score: 100, level: getScoreLevel(100), pointsChange: 0 };
    }

    let totalScore = 0;

    categorizedFriends.forEach(friend => {
      const daysSince = getDaysSinceLastContact(friend.lastInteraction);
      const interval = REMINDER_INTERVALS[friend.category!];
      const ratio = daysSince / interval;
      
      if (ratio <= 1) {
        totalScore += 100;
      } else if (ratio <= 1.5) {
        totalScore += 70;
      } else if (ratio <= 2) {
        totalScore += 40;
      } else {
        totalScore += Math.max(0, 20 - (ratio - 2) * 10);
      }
    });

    const averageScore = Math.round(totalScore / categorizedFriends.length);
    
    // Симулируем изменение за неделю (положительное если score > 50)
    const pointsChange = averageScore > 50 ? Math.floor(Math.random() * 10) + 1 : -Math.floor(Math.random() * 5);

    return {
      score: averageScore,
      level: getScoreLevel(averageScore),
      pointsChange
    };
  }, [friends]);

  // Расчёт для SVG дуги
  const radius = 80;
  const strokeWidth = 8;
  const circumference = Math.PI * radius; // Полуокружность
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h3 className="font-semibold text-foreground text-center mb-2">Оценка дружбы</h3>
      
      {/* Gauge */}
      <div className="relative flex flex-col items-center">
        <svg 
          width="200" 
          height="120" 
          viewBox="0 0 200 120"
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={level.arcColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.3s ease'
            }}
          />
        </svg>

        {/* Score display - positioned over the arc */}
        <div className="absolute top-8 flex flex-col items-center">
          {/* Points change */}
          <div className={`flex items-center gap-1 text-xs font-medium ${pointsChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {pointsChange >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{pointsChange >= 0 ? '+' : ''}{pointsChange} pts</span>
          </div>
          
          {/* Main score */}
          <span className="text-5xl font-bold text-foreground">{score}</span>
          
          {/* Label */}
          <span className={`text-base font-medium ${level.color}`}>{level.label}</span>
        </div>
      </div>

      {/* Brand */}
      <p className="text-xs text-muted-foreground text-center mt-2 tracking-widest uppercase">
        Bundo Score
      </p>
    </div>
  );
};
