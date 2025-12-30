import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Users, Heart, Sparkles, Mail, Lock, User, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
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

        toast({
          title: t('auth.register_success'),
          description: t('auth.register_welcome'),
        });
        onAuthSuccess();
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* Language selector */}
      <div className="absolute top-4 right-4">
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

      <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
        {t('auth.title')}
      </h1>
      <p className="text-muted-foreground text-center mb-8 max-w-xs">
        {t('auth.subtitle')}
      </p>

      {/* Auth form card */}
      <div className="w-full max-w-sm glass rounded-2xl p-6 shadow-card animate-scale-in">
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
            <Label htmlFor="password" className="text-foreground font-medium">
              {t('auth.password')}
            </Label>
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
      </div>

      {/* Footer */}
      <p className="text-xs text-muted-foreground mt-8 text-center max-w-xs">
        {t('auth.terms')}
      </p>
    </div>
  );
};
