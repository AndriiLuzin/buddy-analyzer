import { Button } from './ui/button';
import { UserPlus, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface CreateAccountPromptProps {
  onCreateAccount: () => void;
  onSkip: () => void;
  referrerName?: string;
}

export const CreateAccountPrompt = ({ onCreateAccount, onSkip, referrerName }: CreateAccountPromptProps) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {t('account_prompt.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('account_prompt.subtitle')}
          </p>
        </div>

        {/* Benefits */}
        <div className="glass rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="font-semibold text-foreground mb-4">{t('account_prompt.benefits_title')}</h3>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg">🔗</span>
            </div>
            <div>
              <p className="font-medium text-foreground">{t('account_prompt.benefit_1')}</p>
              <p className="text-sm text-muted-foreground">{t('account_prompt.benefit_1_desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <p className="font-medium text-foreground">{t('account_prompt.benefit_2')}</p>
              <p className="text-sm text-muted-foreground">{t('account_prompt.benefit_2_desc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg">🎉</span>
            </div>
            <div>
              <p className="font-medium text-foreground">{t('account_prompt.benefit_3')}</p>
              <p className="text-sm text-muted-foreground">{t('account_prompt.benefit_3_desc')}</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onCreateAccount}
            className="w-full h-14 rounded-xl text-base font-medium bg-primary hover:bg-primary/90"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            {t('account_prompt.create_account')}
          </Button>

          <button
            onClick={onSkip}
            className="w-full flex items-center justify-center gap-2 h-12 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            {t('account_prompt.skip')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
