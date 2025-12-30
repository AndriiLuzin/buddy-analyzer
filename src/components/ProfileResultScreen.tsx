import { UserProfile, FriendCategory, Friend } from '../types';
import { CATEGORY_INFO } from '../constants';
import { Button } from './ui/button';
import { Sparkles, ArrowRight, Share2, LogOut, Mail } from 'lucide-react';
import { FriendshipScoreGauge } from './FriendshipScoreGauge';
import { FriendshipScoreHistory } from './FriendshipScoreHistory';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';

interface ProfileResultScreenProps {
  profile: UserProfile;
  onContinue: () => void;
  friends?: Friend[];
  user?: User | null;
  onLogout?: () => void;
}

const categoryStyles: Record<FriendCategory, string> = {
  soul_mate: 'from-amber-400 to-orange-500',
  close_friend: 'from-orange-400 to-rose-500',
  good_buddy: 'from-teal-400 to-cyan-500',
  situational: 'from-blue-400 to-indigo-500',
  distant: 'from-slate-400 to-gray-500'
};

export const ProfileResultScreen = ({ profile, onContinue, friends = [], user, onLogout }: ProfileResultScreenProps) => {
  const categoryInfo = CATEGORY_INFO[profile.category];
  const gradientClass = categoryStyles[profile.category];
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "До свидания!",
        description: "Вы вышли из аккаунта",
      });
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из аккаунта",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-4 pb-24 animate-fade-in">
      {/* Header with user info */}
      <div className="flex items-center justify-between pt-4 mb-4">
        {user?.email && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-secondary text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground truncate max-w-[150px]">{user.email}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Выйти</span>
        </button>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Анализ завершён</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Ваш профиль готов!</h1>
      </div>

      {/* Result Card */}
      <div className="flex-1 space-y-4">
        <div className="glass rounded-3xl overflow-hidden shadow-card animate-scale-in">
          {/* Gradient Header */}
          <div className={`bg-gradient-to-br ${gradientClass} p-8 text-center`}>
            <div className="text-6xl mb-4 animate-float">{categoryInfo.emoji}</div>
            <h2 className="text-2xl font-bold text-white mb-2">{categoryInfo.label}</h2>
            <p className="text-white/80 text-sm">Ваш тип дружбы</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="bg-secondary/50 rounded-2xl p-5 mb-6">
              <h3 className="font-semibold text-foreground mb-3">О вашем типе:</h3>
              <p className="text-muted-foreground leading-relaxed">
                {profile.description}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">💫</div>
                <div className="text-xs text-muted-foreground">Глубина</div>
              </div>
              <div className="bg-teal-50 dark:bg-teal-950/30 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">🤝</div>
                <div className="text-xs text-muted-foreground">Преданность</div>
              </div>
              <div className="bg-pink-50 dark:bg-pink-950/30 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">❤️</div>
                <div className="text-xs text-muted-foreground">Открытость</div>
              </div>
            </div>

            {/* Share hint */}
            <button className="w-full flex items-center gap-3 h-16 px-4 bg-card rounded-full border border-border hover:bg-muted transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">Поделитесь с друзьями</p>
                <p className="text-xs text-muted-foreground">Узнайте их тип и совместимость</p>
              </div>
            </button>
          </div>
        </div>

        {/* Friendship Score Gauge */}
        {friends.length > 0 && (
          <>
            <FriendshipScoreGauge friends={friends} />
            <FriendshipScoreHistory friends={friends} />
          </>
        )}
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="w-full flex items-center justify-center gap-2 h-16 mt-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-base font-medium transition-colors"
      >
        Перейти к друзьям
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
