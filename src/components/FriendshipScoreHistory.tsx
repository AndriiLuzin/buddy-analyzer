import { useMemo } from 'react';
import { Friend, FriendCategory } from '../types';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface FriendshipScoreHistoryProps {
  friends: Friend[];
}

const REMINDER_INTERVALS: Record<FriendCategory, number> = {
  soul_mate: 3,
  close_friend: 7,
  good_buddy: 14,
  situational: 30,
  distant: 60
};

const getDaysSinceLastContact = (lastInteraction: string | undefined, daysAgo: number): number => {
  if (!lastInteraction) return 999;
  const lastDate = new Date(lastInteraction);
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - daysAgo);
  return Math.floor((targetDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateScoreForDay = (friends: Friend[], daysAgo: number): number => {
  const categorizedFriends = friends.filter(f => f.category);
  
  if (categorizedFriends.length === 0) return 100;

  let totalScore = 0;

  categorizedFriends.forEach(friend => {
    const daysSince = getDaysSinceLastContact(friend.lastInteraction, daysAgo);
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

  return Math.round(totalScore / categorizedFriends.length);
};

export const FriendshipScoreHistory = ({ friends }: FriendshipScoreHistoryProps) => {
  const chartData = useMemo(() => {
    const data = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Симуляция исторических данных с небольшими вариациями
      const baseScore = calculateScoreForDay(friends, i);
      const variation = Math.sin(i * 0.5) * 10 + Math.random() * 5;
      const score = Math.max(0, Math.min(100, Math.round(baseScore + variation)));
      
      data.push({
        date: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        score,
        fullDate: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
      });
    }
    
    return data;
  }, [friends]);

  const minScore = Math.min(...chartData.map(d => d.score));
  const maxScore = Math.max(...chartData.map(d => d.score));
  const avgScore = Math.round(chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length);

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">История за 30 дней</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Средняя:</span>
          <span className="font-medium text-foreground">{avgScore}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval={6}
            />
            <YAxis 
              domain={[Math.max(0, minScore - 10), Math.min(100, maxScore + 10)]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              width={30}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                      <p className="text-xs text-muted-foreground">{data.fullDate}</p>
                      <p className="text-sm font-semibold text-foreground">Оценка: {data.score}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-between mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="text-red-500">↓</span>
          <span>Мин: {minScore}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-emerald-500">↑</span>
          <span>Макс: {maxScore}</span>
        </div>
      </div>
    </div>
  );
};
