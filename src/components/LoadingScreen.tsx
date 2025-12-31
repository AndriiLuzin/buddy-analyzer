import { Sparkles, Brain, Heart } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message }: LoadingScreenProps) => {
  const { t } = useLanguage();
  const displayMessage = message || t('loading.analyzing');

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-6 animate-fade-in overflow-hidden">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
        
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow animate-pulse-glow">
          <Brain className="w-12 h-12 text-primary-foreground animate-float" />
        </div>

        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center animate-float" style={{ animationDelay: '0.3s' }}>
          <Sparkles className="w-4 h-4 text-amber-900" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-pink-400 flex items-center justify-center animate-float" style={{ animationDelay: '0.6s' }}>
          <Heart className="w-4 h-4 text-pink-900" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-2 text-center">
        {displayMessage}
      </h2>
      <p className="text-muted-foreground text-center max-w-xs">
        {t('loading.ai')}
      </p>

      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};
