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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AuthScreenProps {
  onAuthSuccess: (birthday?: Date) => void;
}

type AuthStep = 'main' | 'verify_code' | 'name' | 'birthday' | 'forgot' | 'reset_code' | 'new_password';

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
  const [step, setStep] = useState<AuthStep>('main');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const getLocalizedText = (ruText: string, enText: string) => {
    return language === 'ru' || language === 'uk' ? ruText : enText;
  };

  // Login with phone + password (no SMS)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return;
    
    setIsLoading(true);

    try {
      const fakeEmail = getFakeEmail();

      const { error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: password,
      });

      if (error) {
        toast({
          title: t('auth.error_login'),
          description: getLocalizedText('Неверный номер или пароль', 'Wrong phone or password'),
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

  // Register step 1: Send SMS code
  const handleRegisterSendCode = async (e: React.FormEvent) => {
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
        description: getLocalizedText('Пароли не совпадают', 'Passwords do not match'),
        variant: "destructive",
      });
      return;
    }

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
      setStep('verify_code');
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

  // Register step 2: Verify SMS code
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

      // Proceed to name step
      setStep('name');
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

  // Register step 3: Enter name
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep('birthday');
  };

  // Register step 4: Complete registration
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
        if (signUpError.message?.includes('already registered')) {
          toast({
            title: t('common.error'),
            description: getLocalizedText('Этот номер уже зарегистрирован', 'This phone is already registered'),
            variant: "destructive",
          });
        } else {
          toast({
            title: t('auth.error_register'),
            description: signUpError.message,
            variant: "destructive",
          });
        }
        return;
      }

      // Auto sign in after registration
      if (signUpData?.user && !signUpData.session) {
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

      // Link existing friend records to this new account
      const userId = signUpData?.user?.id;
      if (userId) {
        const [firstName, ...lastParts] = name.trim().split(' ');
        const lastName = lastParts.join(' ') || '';
        
        try {
          await supabase.functions.invoke('link-friend-account', {
            body: {
              userId,
              firstName,
              lastName,
              birthday: birthday ? birthday.toISOString().split('T')[0] : null,
              phone: normalizedPhone
            }
          });
        } catch (linkError) {
          console.error('Error linking friend account:', linkError);
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
    if (!phone) {
      toast({
        title: t('common.error'),
        description: getLocalizedText('Введите номер телефона', 'Enter phone number'),
        variant: "destructive",
      });
      return;
    }

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
        description: getLocalizedText('Пароли не совпадают', 'Passwords do not match'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const fakeEmail = getFakeEmail();

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
        title: getLocalizedText('Пароль изменён!', 'Password changed!'),
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

  const resetToMain = () => {
    setStep('main');
    setCode('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center px-4 py-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] animate-fade-in overflow-y-auto">
      {/* Language selector */}
      <div className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4 z-10">
        <LanguageSelector />
      </div>

      {/* Logo and branding */}
      <div className="relative mb-6">
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
      <p className="text-muted-foreground text-center mb-6 max-w-xs text-sm sm:text-base px-2">
        {t('auth.subtitle')}
      </p>

      {/* Auth form */}
      <div className="w-full max-w-sm p-4 sm:p-6 animate-scale-in">
        
        {/* Main: Login/Register tabs */}
        {step === 'main' && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">{t('auth.submit_login')}</TabsTrigger>
              <TabsTrigger value="register">{getLocalizedText('Регистрация', 'Register')}</TabsTrigger>
            </TabsList>

            {/* Login tab */}
            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-phone" className="text-foreground font-medium">
                    {t('auth.phone')}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="login-phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                      className="pl-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary text-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground font-medium">
                    {t('auth.password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="login-password"
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
                  disabled={isLoading || !phone || !password}
                  className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
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
                  onClick={() => setStep('forgot')}
                  className="w-full h-12 rounded-xl"
                >
                  {t('auth.forgot_password')}
                </Button>
              </form>
            </TabsContent>

            {/* Register tab */}
            <TabsContent value="register" className="mt-0">
              <form onSubmit={handleRegisterSendCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-phone" className="text-foreground font-medium">
                    {t('auth.phone')}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="register-phone"
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

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-foreground font-medium">
                    {t('auth.password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="register-password"
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
                  <Label htmlFor="register-confirm-password" className="text-foreground font-medium">
                    {getLocalizedText('Подтвердите пароль', 'Confirm password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="register-confirm-password"
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

                <Button
                  type="submit"
                  disabled={isLoading || phone.length < 10 || password.length < 6 || password !== confirmPassword}
                  className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      <span>{t('auth.loading')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{t('common.next')}</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        {/* Step: Verify SMS code (registration) */}
        {step === 'verify_code' && (
          <div className="animate-fade-in">
            <button
              onClick={resetToMain}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('quiz.back')}
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

        {/* Step: Enter name */}
        {step === 'name' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep('verify_code')}
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
                <h3 className="text-lg font-semibold text-foreground">{t('auth.enter_birthday') || getLocalizedText('Когда ваш день рождения?', 'When is your birthday?')}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t('auth.birthday_desc') || getLocalizedText('Мы будем поздравлять вас!', "We'll celebrate with you!")}</p>
              </div>

              <div className="py-4">
                <DateWheelPicker
                  value={dateValue}
                  onChange={handleDateChange}
                  showYear={true}
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
                  <span>{t('auth.register')}</span>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* Step: Forgot password */}
        {step === 'forgot' && (
          <div className="animate-fade-in">
            <button
              onClick={resetToMain}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('quiz.back')}
            </button>

            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{t('auth.forgot_password')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {getLocalizedText('Введите номер телефона для восстановления', 'Enter your phone number to reset')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="forgot-phone" className="text-foreground font-medium">
                  {t('auth.phone')}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="forgot-phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    className="pl-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary text-lg"
                    required
                  />
                </div>
              </div>

              <Button
                onClick={handleForgotPassword}
                disabled={isLoading || phone.length < 10}
                className="w-full h-14 rounded-2xl text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
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
            </div>
          </div>
        )}

        {/* Step: Verify reset code */}
        {step === 'reset_code' && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep('forgot')}
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

        {/* Step: Set new password */}
        {step === 'new_password' && (
          <div className="animate-fade-in">
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
                  <Label htmlFor="confirm-new-password" className="text-foreground font-medium">
                    {getLocalizedText('Подтвердите пароль', 'Confirm password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirm-new-password"
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
                  <span>{getLocalizedText('Сохранить', 'Save')}</span>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center px-4">
        {t('auth.terms')}
      </p>

      <WelcomeModal 
        open={showWelcome} 
        onClose={handleWelcomeClose}
      />
    </div>
  );
};
