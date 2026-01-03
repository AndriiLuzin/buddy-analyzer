import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Users, Heart, Sparkles, Phone, User, ArrowRight, UserPlus, ArrowLeft, CheckCircle, Calendar, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { WelcomeModal } from './WelcomeModal';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { DateWheelPicker } from './DateWheelPicker';

interface AuthScreenProps {
  onAuthSuccess: (birthday?: Date) => void;
}

type AuthStep = 'phone' | 'code' | 'login' | 'password' | 'name' | 'birthday' | 'forgot' | 'reset_code' | 'new_password';

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [dateValue, setDateValue] = useState<{ month: number; day: number; year?: number }>({
    month: new Date().getMonth(),
    day: new Date().getDate(),
    year: undefined
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleDateChange = useCallback((value: { month: number; day: number; year?: number }) => {
    setDateValue(value);
  }, []);

  const birthday = dateValue.year 
    ? new Date(dateValue.year, dateValue.month, dateValue.day)
    : undefined;

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, '');
    return cleaned;
  };

  const getNormalizedPhone = () => phone.startsWith('+') ? phone : `+${phone}`;
  const getFakeEmail = () => `${getNormalizedPhone().replace('+', '')}@phone.buddybe.app`;

  // Step 1: Send SMS code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalizedPhone = getNormalizedPhone();
      
      const response = await supabase.functions.invoke('send-sms-code', {
        body: { phone: normalizedPhone }
      });

      if (response.error) {
        toast({
          title: t('auth.error_sms'),
          description: response.error.message || t('auth.error_generic'),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t('auth.code_sent'),
        description: t('auth.code_sent_desc'),
      });
      setStep('code');
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

  // Step 2: Verify SMS code
  const handleVerifyCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (code.length !== 6) return;
    
    setIsLoading(true);

    try {
      const normalizedPhone = getNormalizedPhone();

      const response = await supabase.functions.invoke('verify-sms-code', {
        body: { phone: normalizedPhone, code, name }
      });

      if (response.error) {
        toast({
          title: t('auth.error_code'),
          description: response.error.message || t('auth.error_invalid_code'),
          variant: "destructive",
        });
        return;
      }

      const { isNewUser } = response.data;
      setIsExistingUser(!isNewUser);

      if (isNewUser) {
        // New user - create password
        setStep('password');
      } else {
        // Existing user - login with password
        setStep('login');
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

  // Login with password (existing user)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setIsLoading(true);

    try {
      const fakeEmail = getFakeEmail();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: password,
      });

      if (error) {
        toast({
          title: t('auth.error_login'),
          description: language === 'ru' || language === 'uk' ? 'Неверный пароль' : 'Wrong password',
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t('auth.welcome'),
        description: t('auth.welcome_login'),
      });
      onAuthSuccess();
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

  // Create password (new user)
  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        title: t('common.error'),
        description: t('auth.password_min'),
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: language === 'ru' || language === 'uk' ? 'Пароли не совпадают' : 'Passwords do not match',
        variant: "destructive",
      });
      return;
    }

    // Save password and proceed to name step
    setStep('name');
  };

  // Name step
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep('birthday');
  };

  // Complete registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthday) return;
    
    setIsLoading(true);

    try {
      const fakeEmail = getFakeEmail();
      const normalizedPhone = getNormalizedPhone();

      // Create user with password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: name,
            phone: normalizedPhone,
            birthday: birthday.toISOString().split('T')[0],
          },
        },
      });

      if (signUpError) {
        // If user exists, try to update password and sign in
        if (signUpError.message?.includes('already registered')) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: fakeEmail,
            password: password,
          });

          if (signInError) {
            toast({
              title: t('common.error'),
              description: signInError.message,
              variant: "destructive",
            });
            return;
          }
        } else {
          toast({
            title: t('auth.error_register'),
            description: signUpError.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Auto sign in after registration
      if (signUpData?.user && !signUpData.session) {
        // Need to sign in manually
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: fakeEmail,
          password: password,
        });

        if (signInError) {
          toast({
            title: t('common.error'),
            description: signInError.message,
            variant: "destructive",
          });
          return;
        }
      }

      setShowWelcome(true);
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

  // Forgot password - send SMS
  const handleForgotPassword = async () => {
    setIsLoading(true);

    try {
      const normalizedPhone = getNormalizedPhone();
      
      const response = await supabase.functions.invoke('send-sms-code', {
        body: { phone: normalizedPhone }
      });

      if (response.error) {
        toast({
          title: t('auth.error_sms'),
          description: response.error.message || t('auth.error_generic'),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t('auth.code_sent'),
        description: t('auth.code_sent_desc'),
      });
      setCode('');
      setStep('reset_code');
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

  // Verify reset code
  const handleVerifyResetCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (code.length !== 6) return;
    
    setIsLoading(true);

    try {
      const normalizedPhone = getNormalizedPhone();

      const response = await supabase.functions.invoke('verify-sms-code', {
        body: { phone: normalizedPhone, code, name: '' }
      });

      if (response.error) {
        toast({
          title: t('auth.error_code'),
          description: response.error.message || t('auth.error_invalid_code'),
          variant: "destructive",
        });
        return;
      }

      setPassword('');
      setConfirmPassword('');
      setStep('new_password');
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

  // Set new password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast({
        title: t('common.error'),
        description: t('auth.password_min'),
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: language === 'ru' || language === 'uk' ? 'Пароли не совпадают' : 'Passwords do not match',
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const fakeEmail = getFakeEmail();

      // Update password via edge function
      const response = await supabase.functions.invoke('reset-password', {
        body: { phone: getNormalizedPhone(), newPassword: password }
      });

      if (response.error) {
        toast({
          title: t('common.error'),
          description: response.error.message || t('auth.error_generic'),
          variant: "destructive",
        });
        return;
      }

      // Sign in with new password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: password,
      });

      if (signInError) {
        toast({
          title: t('common.error'),
          description: signInError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: language === 'ru' || language === 'uk' ? 'Пароль изменён!' : 'Password changed!',
        description: t('auth.welcome_login'),
      });
      onAuthSuccess();
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

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const normalizedPhone = getNormalizedPhone();
      
      const response = await supabase.functions.invoke('send-sms-code', {
        body: { phone: normalizedPhone }
      });

      if (response.error) {
        toast({
          title: t('common.error'),
          description: response.error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t('auth.code_resent'),
        description: t('auth.code_sent_desc'),
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
    onAuthSuccess(birthday);
  };

  const getLocalizedText = (ruText: string, enText: string) => {
    return language === 'ru' || language === 'uk' ? ruText : enText;
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
        
        {/* Step: Phone input */}
        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Phone className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{t('auth.enter_phone')}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t('auth.enter_phone_desc')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground font-medium">
                {t('auth.phone')}
              </Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                  className="pl-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary text-lg"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('auth.phone_format')}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isLoading || phone.length < 10}
              className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>{t('auth.loading')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{t('auth.send_code')}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>
        )}

        {/* Step: SMS code verification */}
        {step === 'code' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep('phone')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.change_phone')}
            </button>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{t('auth.enter_code')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('auth.code_sent_to')} {phone}
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  value={code}
                  onChange={setCode}
                  maxLength={6}
                  onComplete={handleVerifyCode}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>{t('auth.loading')}</span>
                  </div>
                ) : (
                  <span>{t('auth.verify_code')}</span>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={isLoading}
                className="w-full h-12 rounded-xl"
              >
                {t('auth.resend_code')}
              </Button>
            </form>
          </div>
        )}

        {/* Step: Login with password (existing user) */}
        {step === 'login' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep('phone')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('auth.change_phone')}
            </button>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {getLocalizedText('Введите пароль', 'Enter password')}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{phone}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  {t('auth.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password}
                className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>{t('auth.loading')}</span>
                  </div>
                ) : (
                  <span>{t('auth.submit_login')}</span>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="w-full h-12 rounded-xl"
              >
                {t('auth.forgot_password')}
              </Button>
            </form>
          </div>
        )}

        {/* Step: Create password (new user) */}
        {step === 'password' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep('code')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('quiz.back')}
            </button>

            <form onSubmit={handleCreatePassword} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {getLocalizedText('Создайте пароль', 'Create password')}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {getLocalizedText('Для входа в аккаунт', 'To access your account')}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-foreground font-medium">
                    {t('auth.password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('auth.password_min')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-foreground font-medium">
                    {getLocalizedText('Подтвердите пароль', 'Confirm password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || password.length < 6 || password !== confirmPassword}
                className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
              >
                <div className="flex items-center gap-2">
                  <span>{t('common.next')}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </form>
          </div>
        )}

        {/* Step: Enter name */}
        {step === 'name' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep('password')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('quiz.back')}
            </button>

            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{t('auth.welcome_new')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('auth.enter_name_desc')}</p>
              </div>

              <div className="space-y-2">
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
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={!name.trim()}
                className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
              >
                <div className="flex items-center gap-2">
                  <span>{t('common.next')}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </Button>
            </form>
          </div>
        )}

        {/* Step: Birthday */}
        {step === 'birthday' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep('name')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('quiz.back')}
            </button>

            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{t('auth.enter_birthday') || 'When is your birthday?'}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('auth.birthday_desc') || 'We will adapt questions to your age'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  {t('friend_reg.birthday') || 'Birthday'} <span className="text-destructive">*</span>
                </Label>
                <DateWheelPicker
                  value={dateValue}
                  onChange={handleDateChange}
                  showYear
                  yearPlaceholder={t('friend_reg.year_placeholder') || 'When were you born?'}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !birthday}
                className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>{t('auth.loading')}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{t('auth.submit_register')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Step: Reset code verification */}
        {step === 'reset_code' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep('login')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('quiz.back')}
            </button>

            <form onSubmit={handleVerifyResetCode} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{t('auth.enter_code')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('auth.code_sent_to')} {phone}
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  value={code}
                  onChange={setCode}
                  maxLength={6}
                  onComplete={handleVerifyResetCode}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>{t('auth.loading')}</span>
                  </div>
                ) : (
                  <span>{t('auth.verify_code')}</span>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={isLoading}
                className="w-full h-12 rounded-xl"
              >
                {t('auth.resend_code')}
              </Button>
            </form>
          </div>
        )}

        {/* Step: New password */}
        {step === 'new_password' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep('reset_code')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('quiz.back')}
            </button>

            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {getLocalizedText('Новый пароль', 'New password')}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {getLocalizedText('Придумайте новый пароль', 'Create a new password')}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pw" className="text-foreground font-medium">
                    {t('auth.password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="new-pw"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t('auth.password_min')}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-new-pw" className="text-foreground font-medium">
                    {getLocalizedText('Подтвердите пароль', 'Confirm password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirm-new-pw"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-12 pr-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || password.length < 6 || password !== confirmPassword}
                className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>{t('auth.loading')}</span>
                  </div>
                ) : (
                  <span>{getLocalizedText('Сохранить пароль', 'Save password')}</span>
                )}
              </Button>
            </form>
          </div>
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
