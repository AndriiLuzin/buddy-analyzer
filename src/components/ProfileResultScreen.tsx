import { UserProfile, FriendCategory } from '../types';
import { CATEGORY_INFO } from '../constants';
import { Button } from './ui/button';
import { Sparkles, ArrowRight, Share2 } from 'lucide-react';

interface ProfileResultScreenProps {
  profile: UserProfile;
  onContinue: () => void;
}

const categoryStyles: Record<FriendCategory, string> = {
  soul_mate: 'from-amber-400 to-orange-500',
  close_friend: 'from-orange-400 to-rose-500',
  good_buddy: 'from-teal-400 to-cyan-500',
  situational: 'from-blue-400 to-indigo-500',
  distant: 'from-slate-400 to-gray-500'
};

export const ProfileResultScreen = ({ profile, onContinue }: ProfileResultScreenProps) => {
  const categoryInfo = CATEGORY_INFO[profile.category];
  const gradientClass = categoryStyles[profile.category];

  return (
    <div className="min-h-screen flex flex-col p-4 pb-24 animate-fade-in">
      {/* Header */}
      <div className="text-center pt-8 mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Анализ завершён</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Ваш профиль готов!</h1>
      </div>

      {/* Result Card */}
      <div className="flex-1">
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
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Поделитесь с друзьями</p>
                <p className="text-xs text-muted-foreground">Узнайте их тип и совместимость</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <Button
        onClick={onContinue}
        className="h-14 rounded-xl text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
      >
        Перейти к друзьям
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
};
