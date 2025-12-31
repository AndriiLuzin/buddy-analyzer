import { Heart, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export const WelcomeModal = ({ open, onClose }: WelcomeModalProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-background border-0 rounded-3xl">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary via-primary/80 to-accent p-8 text-center">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-float">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '0.5s' }}>
            <Heart className="w-3 h-3 text-white" />
          </div>
          
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {t('welcome.title')}
          </h2>
          <p className="text-white/80 text-sm font-medium">
            {t('welcome.subtitle')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">1</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('welcome.text1')}
              </p>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">2</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('welcome.text2')}
              </p>
            </div>
            
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary text-xs font-bold">3</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('welcome.text3')}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
            <p className="text-sm text-foreground font-medium text-center">
              {t('welcome.text4')}
            </p>
          </div>

          <Button 
            onClick={onClose}
            className="w-full h-14 rounded-xl text-base font-medium"
          >
            {t('welcome.continue')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
