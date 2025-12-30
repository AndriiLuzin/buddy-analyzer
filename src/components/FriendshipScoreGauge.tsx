import { useMemo } from 'react';
import { Friend, FriendCategory } from '../types';

interface FriendshipScoreGaugeProps {
  friends: Friend[];
}

// Интервалы напоминаний в днях для каждой категории
const REMINDER_INTERVALS: Record<FriendCategory, number> = {
  soul_mate: 3,
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
  emoji: string;
  description: string;
}

const SCORE_LEVELS: ScoreLevel[] = [
  { label: 'Отличный друг', color: 'text-emerald-500', emoji: '🌟', description: 'Вы прекрасно поддерживаете связь!' },
  { label: 'Хороший друг', color: 'text-green-500', emoji: '😊', description: 'У вас хороший баланс общения' },
  { label: 'Неплохо', color: 'text-yellow-500', emoji: '👍', description: 'Есть над чем поработать' },
  { label: 'Нужно улучшить', color: 'text-orange-500', emoji: '😕', description: 'Свяжитесь с друзьями' },
  { label: 'Критично', color: 'text-red-500', emoji: '😟', description: 'Срочно напишите друзьям!' },
];

export const FriendshipScoreGauge = ({ friends }: FriendshipScoreGaugeProps) => {
  const { score, level, overdueCount, onTimeCount, totalTracked } = useMemo(() => {
    const categorizedFriends = friends.filter(f => f.category);
    
    if (categorizedFriends.length === 0) {
      return { score: 100, level: SCORE_LEVELS[0], overdueCount: 0, onTimeCount: 0, totalTracked: 0 };
    }

    let totalScore = 0;
    let overdueCount = 0;
    let onTimeCount = 0;

    categorizedFriends.forEach(friend => {
      const daysSince = getDaysSinceLastContact(friend.lastInteraction);
      const interval = REMINDER_INTERVALS[friend.category!];
      
      // Расчёт score для каждого друга
      // 100 баллов если общение вовремя, уменьшается по мере просрочки
      const ratio = daysSince / interval;
      
      if (ratio <= 1) {
        // В пределах нормы
        totalScore += 100;
        onTimeCount++;
      } else if (ratio <= 1.5) {
        // Небольшая просрочка
        totalScore += 70;
      } else if (ratio <= 2) {
        // Средняя просрочка
        totalScore += 40;
        overdueCount++;
      } else {
        // Критическая просрочка
        totalScore += Math.max(0, 20 - (ratio - 2) * 10);
        overdueCount++;
      }
    });

    const averageScore = Math.round(totalScore / categorizedFriends.length);
    
    // Определяем уровень
    let levelIndex = 4;
    if (averageScore >= 90) levelIndex = 0;
    else if (averageScore >= 70) levelIndex = 1;
    else if (averageScore >= 50) levelIndex = 2;
    else if (averageScore >= 30) levelIndex = 3;

    return {
      score: averageScore,
      level: SCORE_LEVELS[levelIndex],
      overdueCount,
      onTimeCount,
      totalTracked: categorizedFriends.length
    };
  }, [friends]);

  // Угол стрелки: от -90 (0 баллов) до 90 (100 баллов)
  const needleAngle = -90 + (score / 100) * 180;

  // Цвет дуги в зависимости от score
  const getGaugeGradient = () => {
    return `conic-gradient(
      from 180deg,
      #ef4444 0deg,
      #f97316 36deg,
      #eab308 72deg,
      #22c55e 108deg,
      #10b981 144deg,
      #10b981 180deg,
      transparent 180deg
    )`;
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h3 className="font-semibold text-foreground text-center mb-4">Оценка дружбы</h3>
      
      {/* Gauge */}
      <div className="relative flex justify-center mb-4">
        <div className="relative w-48 h-24 overflow-hidden">
          {/* Background arc */}
          <div 
            className="absolute w-48 h-48 rounded-full"
            style={{
              background: getGaugeGradient(),
              clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
              transform: 'rotate(180deg)'
            }}
          />
          
          {/* Inner white circle */}
          <div 
            className="absolute bg-card rounded-full"
            style={{
              width: '120px',
              height: '120px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />
          
          {/* Needle */}
          <div 
            className="absolute"
            style={{
              width: '4px',
              height: '60px',
              background: 'linear-gradient(to top, hsl(var(--foreground)), hsl(var(--foreground) / 0.7))',
              left: 'calc(50% - 2px)',
              bottom: '0',
              transformOrigin: 'bottom center',
              transform: `rotate(${needleAngle}deg)`,
              borderRadius: '2px',
              transition: 'transform 0.5s ease-out'
            }}
          />
          
          {/* Center dot */}
          <div 
            className="absolute w-4 h-4 bg-foreground rounded-full"
            style={{
              left: 'calc(50% - 8px)',
              bottom: '-8px'
            }}
          />
        </div>
      </div>

      {/* Score */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">{level.emoji}</span>
          <span className={`text-2xl font-bold ${level.color}`}>{score}</span>
          <span className="text-muted-foreground text-sm">/100</span>
        </div>
        <p className={`font-medium ${level.color}`}>{level.label}</p>
        <p className="text-sm text-muted-foreground mt-1">{level.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-muted/50 rounded-xl p-2">
          <p className="text-lg font-bold text-emerald-500">{onTimeCount}</p>
          <p className="text-xs text-muted-foreground">Вовремя</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-2">
          <p className="text-lg font-bold text-orange-500">{overdueCount}</p>
          <p className="text-xs text-muted-foreground">Просрочено</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-2">
          <p className="text-lg font-bold text-foreground">{totalTracked}</p>
          <p className="text-xs text-muted-foreground">Всего</p>
        </div>
      </div>
    </div>
  );
};
