import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Users, Heart, Sparkles, Mail, Lock, User, ArrowRight, UserPlus, LogIn, ArrowLeft, KeyRound, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { WelcomeModal } from './WelcomeModal';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        });

        if (error) {
          toast({
            title: t('common.error'),
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        setResetSent(true);
        toast({
          title: t('auth.reset_sent'),
          description: t('auth.reset_sent_desc'),
        });
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: t('auth.error_login'),
              description: t('auth.error_credentials'),
              variant: "destructive",
            });
          } else {
            toast({
              title: t('common.error'),
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: t('auth.welcome'),
          description: t('auth.welcome_login'),
        });
        onAuthSuccess();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: name,
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: t('auth.error_exists'),
              description: t('auth.error_exists_desc'),
              variant: "destructive",
            });
          } else {
            toast({
              title: t('auth.error_register'),
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }
        // Show email confirmation screen
        setEmailConfirmationSent(true);
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('auth.error_generic'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setIsForgotPassword(false);
    setResetSent(false);
    setEmailConfirmationSent(false);
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: t('common.error'),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t('auth.email_resent'),
        description: t('auth.email_resent_desc'),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('auth.error_generic'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    onAuthSuccess();
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center px-4 py-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] animate-fade-in overflow-y-auto">
      {/* Language selector */}
      <div className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4 z-10">
        <LanguageSelector />
      </div>

      {/* Logo and branding */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" style={{ animationDuration: '3s' }} />
        
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow animate-pulse-glow">
          <Users className="w-10 h-10 text-primary-foreground" />
        </div>

        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center animate-float" style={{ animationDelay: '0.3s' }}>
          <Sparkles className="w-3 h-3 text-amber-900" />
        </div>
        <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-pink-400 flex items-center justify-center animate-float" style={{ animationDelay: '0.6s' }}>
          <Heart className="w-3 h-3 text-pink-900" />
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 text-center">
        {t('auth.title')}
      </h1>
      <p className="text-muted-foreground text-center mb-6 sm:mb-8 max-w-xs text-sm sm:text-base px-2">
        {t('auth.subtitle')}
      </p>

      {/* Auth form */}
      <div className="w-full max-w-sm p-4 sm:p-6 animate-scale-in">
        {/* Email Confirmation View */}
        {emailConfirmationSent ? (
          <div className="animate-fade-in text-center py-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{t('auth.email_confirmation_title')}</h3>
            <p className="text-sm text-muted-foreground mb-2">{t('auth.email_confirmation_desc')}</p>
            <p className="text-xs text-muted-foreground/70 mb-6">{t('auth.email_confirmation_spam')}</p>
            
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 rounded-xl"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span>{t('auth.loading')}</span>
                  </div>
                ) : (
                  t('auth.resend_email')
                )}
              </Button>
              <Button
                onClick={handleBackToLogin}
                variant="ghost"
                className="w-full h-12 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('auth.back_to_login')}
              </Button>
            </div>
          </div>
        ) : isForgotPassword ? (
          <div className="animate-fade-in">
            <button
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.back_to_login')}
            </button>

            {resetSent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('auth.reset_sent')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('auth.reset_check_email')}</p>
                <Button
                  onClick={handleBackToLogin}
                  variant="outline"
                  className="w-full h-12 rounded-xl"
                >
                  {t('auth.back_to_login')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{t('auth.forgot_password')}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{t('auth.forgot_password_desc')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-foreground font-medium">
                    {t('auth.email')}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 rounded-xl text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>{t('auth.loading')}</span>
                    </div>
                  ) : (
                    <span>{t('auth.send_reset_link')}</span>
                  )}
                </Button>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Tab switcher */}
            <div className="flex gap-2 mb-6 p-1 bg-secondary rounded-xl">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLogin
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogIn className="w-4 h-4" />
                {t('auth.login')}
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !isLogin
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                {t('auth.register')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    {t('auth.name')}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder={t('auth.name_placeholder')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  {t('auth.email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    {t('auth.password')}
                  </Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-primary hover:underline"
                    >
                      {t('auth.forgot_password')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary"
                    required
                    minLength={6}
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-muted-foreground">
                    {t('auth.password_min')}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-xl text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>{t('auth.loading')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{isLogin ? t('auth.submit_login') : t('auth.submit_register')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
          </>
        )}
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground mt-8 text-center max-w-xs">
        {t('auth.terms')}
      </p>

      {/* Welcome Modal */}
      <WelcomeModal open={showWelcome} onClose={handleWelcomeClose} />
    </div>
  );
};
