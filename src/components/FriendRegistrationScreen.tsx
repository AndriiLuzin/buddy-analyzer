import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Users, Heart, Sparkles, User, Calendar, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FriendInfo {
  firstName: string;
  lastName: string;
  birthday: Date | undefined;
}

interface FriendRegistrationScreenProps {
  onComplete: (info: FriendInfo) => void;
  referrerName?: string;
}

export const FriendRegistrationScreen = ({ onComplete, referrerName }: FriendRegistrationScreenProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState<Date | undefined>();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName && lastName) {
      onComplete({ firstName, lastName, birthday });
    }
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
      
      {referrerName && (
        <p className="text-primary text-center mb-2 font-medium text-sm sm:text-base">
          {referrerName} {t('friend_reg.invited_you') || 'invited you'}
        </p>
      )}
      
      <p className="text-muted-foreground text-center mb-4 sm:mb-6 max-w-xs text-sm sm:text-base px-2">
        {t('friend_reg.subtitle') || 'Tell us about yourself to discover your friendship style'}
      </p>

      {/* Form card */}
      <div className="w-full max-w-sm glass rounded-2xl p-4 sm:p-6 shadow-card animate-scale-in">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-foreground font-medium">
              {t('friend_reg.first_name') || 'First Name'}
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                placeholder={t('friend_reg.first_name_placeholder') || 'Your first name'}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-foreground font-medium">
              {t('friend_reg.last_name') || 'Last Name'}
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="lastName"
                type="text"
                placeholder={t('friend_reg.last_name_placeholder') || 'Your last name'}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="pl-12 h-12 rounded-xl bg-card/50 border-border focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              {t('friend_reg.birthday') || 'Birthday'}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 rounded-xl bg-card/50 border-border justify-start text-left font-normal pl-12 relative",
                    !birthday && "text-muted-foreground"
                  )}
                >
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  {birthday ? format(birthday, "PPP") : (t('friend_reg.birthday_placeholder') || 'Select your birthday')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={birthday}
                  onSelect={setBirthday}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            type="submit"
            disabled={!firstName || !lastName}
            className="w-full h-14 rounded-xl text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground mt-6"
          >
            <span>{t('friend_reg.continue') || 'Continue to Quiz'}</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>
      </div>
    </div>
  );
};
