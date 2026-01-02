import { useState } from 'react';
import { UserProfile, FriendCategory, Friend } from '../types';
import { CATEGORY_INFO } from '../constants';
import { Button } from './ui/button';
import { Sparkles, ArrowRight, Share2, LogOut, Mail, Settings } from 'lucide-react';
import { FriendshipScoreGauge } from './FriendshipScoreGauge';
import { FriendshipScoreHistory } from './FriendshipScoreHistory';
import { ShareModal } from './ShareModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

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
  const { t } = useLanguage();
  const [showShareModal, setShowShareModal] = useState(false);

  // Get localized category label
  const getCategoryLabel = (category: FriendCategory) => {
    return t(`category.${category}`) || categoryInfo.label;
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: t('profile.goodbye'),
        description: t('profile.logout_success'),
      });
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('profile.logout_error'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-[100dvh] bg-background overflow-y-auto overscroll-y-contain">
      {/* Scrollable content */}
      <div className="px-4 py-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)] animate-fade-in">
        {/* Header with user info */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        {user?.email && (
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full bg-secondary text-xs sm:text-sm min-w-0">
            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground truncate max-w-[100px] sm:max-w-[150px]">{user.email}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
          <LanguageSelector />
          <button
            onClick={() => {}}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
          >
            <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{t('profile.logout')}</span>
          </button>
        </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">{t('profile.analysis_complete')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('profile.ready')}</h1>
        </div>

        {/* Friendship Score Gauge - At Top */}
        {friends.length > 0 && (
          <div className="mb-6">
            <FriendshipScoreGauge friends={friends} />
          </div>
        )}

        {/* Result Card */}
        <div className="space-y-3 sm:space-y-4">
          <div className="glass rounded-2xl sm:rounded-3xl overflow-hidden shadow-card animate-scale-in">
            {/* Gradient Header */}
            <div className={`bg-gradient-to-br ${gradientClass} p-6 sm:p-8 text-center`}>
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4 animate-float">{categoryInfo.emoji}</div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{getCategoryLabel(profile.category)}</h2>
              <p className="text-white/80 text-xs sm:text-sm">{t('profile.your_type')}</p>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <div className="bg-secondary/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-4 sm:mb-6">
                <h3 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">{t('profile.about_type')}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {profile.description}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">💫</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{t('profile.depth')}</div>
                </div>
                <div className="bg-teal-50 dark:bg-teal-950/30 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">🤝</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{t('profile.loyalty')}</div>
                </div>
                <div className="bg-pink-50 dark:bg-pink-950/30 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
                  <div className="text-xl sm:text-2xl mb-0.5 sm:mb-1">❤️</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{t('profile.openness')}</div>
                </div>
              </div>

              {/* Share hint */}
              <button 
                onClick={() => setShowShareModal(true)}
                className="w-full flex items-center gap-2.5 sm:gap-3 h-14 sm:h-16 px-3 sm:px-4 bg-card rounded-full border border-border hover:bg-muted transition-colors"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{t('profile.share')}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t('profile.share_desc')}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Friendship Score History */}
          {friends.length > 0 && (
            <FriendshipScoreHistory friends={friends} />
          )}

          {/* Continue Button - Scrolls with content */}
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-base font-semibold transition-colors shadow-lg mt-4"
          >
            {t('profile.continue')}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        userId={user?.id}
      />
    </div>
  );
};
