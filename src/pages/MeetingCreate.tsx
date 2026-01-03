import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, addDays } from 'date-fns';
import { enUS, ru as ruLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Check,
  MapPin,
  Link as LinkIcon,
  Copy,
  Share2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { TimeWheelPicker } from '@/components/TimeWheelPicker';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';
import { meetingTypeIcons } from '@/components/icons/MeetingTypeIcons';

interface Friend {
  id: string;
  friend_name: string;
  friend_last_name: string;
}

type Step = 'type' | 'datetime' | 'friends' | 'location' | 'share';

// Generate a short random invite code
const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const meetingTypeIds = [
  'coffee', 'lunch', 'movie', 'sport', 'shopping', 'party',
  'work', 'walk', 'bar', 'restaurant', 'concert', 'game', 'travel', 'study', 'other'
];

const meetingTypeEmojis: Record<string, string> = {
  coffee: '☕',
  lunch: '🍽️',
  movie: '🎬',
  sport: '🏃',
  shopping: '🛍️',
  party: '🎉',
  work: '💼',
  walk: '🚶',
  bar: '🍺',
  restaurant: '🍴',
  concert: '🎵',
  game: '🎮',
  travel: '✈️',
  study: '📚',
  other: '📌',
};

export default function MeetingCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  
  const dateLocale = language === 'ru' || language === 'uk' ? ruLocale : enUS;
  
  const preselectedFriendId = location.state?.friendId || null;
  const preselectedFriendName = location.state?.friendName || null;
  const preselectedDate = location.state?.date ? new Date(location.state.date) : null;

  const [step, setStep] = useState<Step>('type');
  const [currentMonth, setCurrentMonth] = useState(preselectedDate || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(preselectedDate || undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>(preselectedFriendId ? [preselectedFriendId] : []);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const handleTimeChange = useCallback((val: { hours: number; minutes: number }) => {
    setSelectedTime(`${val.hours.toString().padStart(2, '0')}:${val.minutes.toString().padStart(2, '0')}`);
  }, []);

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  
  const weekDays = language === 'ru' || language === 'uk' 
    ? ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const today = new Date();
  const tomorrow = addDays(today, 1);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }

    const { data, error } = await supabase
      .from('friends')
      .select('id, friend_name, friend_last_name')
      .eq('owner_id', user.id);

    if (!error && data) {
      setFriends(data);
    }
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const getMeetingTypeLabel = (typeId: string) => {
    return t(`meeting_type.${typeId}`);
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedType) return;

    setIsSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsSubmitting(false);
      return;
    }

    // Get user's profile for the invitation message
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const userName = userProfile 
      ? `${userProfile.first_name} ${userProfile.last_name}`.trim() 
      : 'Friend';

    const emoji = meetingTypeEmojis[selectedType] || '📅';
    const label = getMeetingTypeLabel(selectedType);
    const title = `${emoji} ${label}`;

    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        owner_id: user.id,
        title,
        meeting_date: format(selectedDate, 'yyyy-MM-dd'),
        meeting_time: selectedTime || null,
        location: meetingLocation.trim() || null,
      })
      .select()
      .single();

    if (error) {
      toast.error(t('meeting_create.error'));
      setIsSubmitting(false);
      return;
    }

    // Generate invite link for external guests
    const inviteCode = generateInviteCode();
    const { error: inviteError } = await supabase
      .from('meeting_external_invites')
      .insert({
        meeting_id: meeting.id,
        invite_code: inviteCode,
      });

    if (!inviteError) {
      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/meeting-invite/${inviteCode}`);
    }

    if (selectedFriends.length > 0 && meeting) {
      // Add participants
      await supabase.from('meeting_participants').insert(
        selectedFriends.map(friendId => ({
          meeting_id: meeting.id,
          friend_id: friendId,
        }))
      );

      // Get friend details to find those with user accounts
      const { data: friendsWithAccounts } = await supabase
        .from('friends')
        .select('id, friend_user_id, friend_name')
        .in('id', selectedFriends);

      // Send notifications to friends who have accounts
      if (friendsWithAccounts && friendsWithAccounts.length > 0) {
        const dateFormatted = format(selectedDate, 'd MMMM', { locale: dateLocale });
        const timeStr = selectedTime ? ` ${language === 'ru' ? 'в' : 'at'} ${selectedTime}` : '';
        const locationStr = meetingLocation.trim() ? ` • ${meetingLocation.trim()}` : '';
        
        const notifications = friendsWithAccounts
          .filter(f => f.friend_user_id && f.friend_user_id !== user.id)
          .map(friend => ({
            user_id: friend.friend_user_id,
            type: 'meeting_invite',
            title: '📅 Meeting Invitation',
            message: `${userName} invites you: ${title} — ${dateFormatted}${timeStr}${locationStr}`,
            data: {
              meeting_id: meeting.id,
              inviter_id: user.id,
              inviter_name: userName,
              meeting_title: title,
              meeting_date: format(selectedDate, 'yyyy-MM-dd'),
              meeting_time: selectedTime || null,
              location: meetingLocation.trim() || null,
            },
          }));

        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications);
        }
      }
    }

    toast.success(t('meeting_create.success'));
    setIsSubmitting(false);
    setStep('share');
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success(language === 'ru' ? 'Ссылка скопирована!' : 'Link copied!');
    } catch {
      toast.error(language === 'ru' ? 'Не удалось скопировать' : 'Failed to copy');
    }
  };

  const shareInviteLink = async () => {
    const meetingTitle = `${meetingTypeEmojis[selectedType]} ${getMeetingTypeLabel(selectedType)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: meetingTitle,
          text: language === 'ru' ? `Приглашаю вас на ${meetingTitle}!` : `Join me for ${meetingTitle}!`,
          url: inviteLink,
        });
      } catch {
        // User cancelled
      }
    } else {
      copyInviteLink();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'type': return t('meeting_create.what');
      case 'datetime': return t('meeting_create.when');
      case 'friends': return t('meeting_create.who');
      case 'location': return t('meeting_create.where');
      case 'share': return language === 'ru' ? 'Ссылка для гостей' : 'Invite link';
    }
  };

  const canProceed = () => {
    switch (step) {
      case 'type': return !!selectedType;
      case 'datetime': return !!selectedDate;
      case 'friends': return true; // Friends are optional now
      case 'location': return true;
      case 'share': return true;
    }
  };

  const goNext = () => {
    switch (step) {
      case 'type': setStep('datetime'); break;
      case 'datetime': setStep('friends'); break;
      case 'friends': setStep('location'); break;
      case 'location': handleSubmit(); break;
      case 'share': navigate('/meetings'); break;
    }
  };

  const goBack = () => {
    switch (step) {
      case 'datetime': setStep('type'); break;
      case 'friends': setStep('datetime'); break;
      case 'location': setStep('friends'); break;
      case 'share': navigate('/meetings'); break;
      default: navigate('/meetings'); break;
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const getSelectedFriendsNames = () => {
    return friends
      .filter(f => selectedFriends.includes(f.id))
      .map(f => f.friend_name)
      .join(', ');
  };

  const getDateLabel = (date: Date) => {
    if (isSameDay(date, today)) return t('meeting_create.today');
    if (isSameDay(date, tomorrow)) return t('meeting_create.tomorrow');
    return format(date, 'd MMM', { locale: dateLocale });
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-5 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground">
              {step === 'share' ? (language === 'ru' ? 'Встреча создана!' : 'Meeting created!') : t('meeting_create.title')}
            </h2>
            <p className="text-sm text-muted-foreground">{getStepTitle()}</p>
          </div>
          {step !== 'share' && (
            <div className="flex gap-1.5">
              {['type', 'datetime', 'friends', 'location'].map((s, i) => (
                <div 
                  key={s}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    step === s ? "bg-primary scale-110" : 
                    ['type', 'datetime', 'friends', 'location'].indexOf(step as Step) > i ? "bg-primary/50" : "bg-muted"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
        
        {/* Step 1: Meeting Type */}
        {step === 'type' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-3 gap-3">
              {meetingTypeIds.map(typeId => {
                const IconComponent = meetingTypeIcons[typeId];
                return (
                  <button
                    key={typeId}
                    onClick={() => setSelectedType(typeId)}
                    className={cn(
                      "aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200",
                      selectedType === typeId 
                        ? "bg-primary text-primary-foreground scale-105" 
                        : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                    )}
                  >
                    {IconComponent ? (
                      <IconComponent size={44} />
                    ) : (
                      <span className="text-3xl">{meetingTypeEmojis[typeId]}</span>
                    )}
                    <span className="text-sm font-medium">{getMeetingTypeLabel(typeId)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick date buttons */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedDate(today);
                    setShowCalendar(false);
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-medium transition-all duration-200",
                    selectedDate && isSameDay(selectedDate, today)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                  )}
                >
                  {t('meeting_create.today')}
                </button>
                <button
                  onClick={() => {
                    setSelectedDate(tomorrow);
                    setShowCalendar(false);
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-medium transition-all duration-200",
                    selectedDate && isSameDay(selectedDate, tomorrow)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                  )}
                >
                  {t('meeting_create.tomorrow')}
                </button>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2",
                    showCalendar || (selectedDate && !isSameDay(selectedDate, today) && !isSameDay(selectedDate, tomorrow))
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                  )}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>{t('meeting_create.calendar')}</span>
                </button>
              </div>
              
              {/* Show selected date if from calendar */}
              {selectedDate && !isSameDay(selectedDate, today) && !isSameDay(selectedDate, tomorrow) && !showCalendar && (
                <div className="p-3 rounded-xl bg-primary/10 text-center">
                  <span className="font-medium">{format(selectedDate, 'd MMMM yyyy', { locale: dateLocale })}</span>
                </div>
              )}
            </div>

            {/* Calendar */}
            {showCalendar && (
              <div className="glass rounded-2xl p-4 animate-fade-in">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-base font-semibold capitalize">
                    {format(currentMonth, 'LLLL yyyy', { locale: dateLocale })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center hover:bg-secondary transition-colors rotate-180"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Week days */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: paddingDays }).map((_, i) => (
                    <div key={`pad-${i}`} className="aspect-square" />
                  ))}
                  {daysInMonth.map(day => {
                    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          if (!isPast) {
                            setSelectedDate(day);
                            setShowCalendar(false);
                          }
                        }}
                        disabled={isPast}
                        className={cn(
                          "aspect-square rounded-2xl flex items-center justify-center text-sm font-medium transition-all duration-200",
                          isToday(day) && !isSelected && "bg-accent text-accent-foreground",
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : isPast
                              ? "text-muted-foreground/30"
                              : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Time Selection */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('meeting_create.time')}
              </p>
              <TimeWheelPicker
                value={selectedTime ? { 
                  hours: parseInt(selectedTime.split(':')[0]), 
                  minutes: parseInt(selectedTime.split(':')[1]) 
                } : undefined}
                onChange={handleTimeChange}
              />
            </div>
          </div>
        )}

        {/* Step 3: Friends */}
        {step === 'friends' && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary */}
            <div className="p-4 rounded-2xl glass flex items-center gap-3 flex-wrap">
              <span className="text-xl">{meetingTypeEmojis[selectedType]}</span>
              <span className="font-medium">{getMeetingTypeLabel(selectedType)}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm">
                {selectedDate && getDateLabel(selectedDate)}
              </span>
              {selectedTime && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm">{selectedTime}</span>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('meeting_create.who')}
            </p>
            
            {preselectedFriendName && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{preselectedFriendName}</span>
              </div>
            )}
            
            {friends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 opacity-50" />
                </div>
                <p className="font-medium">{t('friends.not_found')}</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {friends.map(friend => {
                  const isPreselected = preselectedFriendId === friend.id;
                  const isSelected = selectedFriends.includes(friend.id);
                  
                  if (isPreselected) return null;
                  
                  return (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={cn(
                        "px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/50 hover:bg-secondary hover:scale-[1.02]"
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                      {friend.friend_name} {friend.friend_last_name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Location (optional) */}
        {step === 'location' && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary */}
            <div className="p-4 rounded-2xl glass space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xl">{meetingTypeEmojis[selectedType]}</span>
                <span className="font-medium">{getMeetingTypeLabel(selectedType)}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm">
                  {selectedDate && getDateLabel(selectedDate)}
                </span>
                {selectedTime && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm">{selectedTime}</span>
                  </>
                )}
              </div>
              {selectedFriends.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{getSelectedFriendsNames()}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('meeting_create.where')}
              </p>
              <Input
                placeholder={t('meeting_create.location_placeholder')}
                value={meetingLocation}
                onChange={(e) => setMeetingLocation(e.target.value)}
                className="h-14 rounded-2xl text-base"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 5: Share Link */}
        {step === 'share' && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {meetingTypeEmojis[selectedType]} {getMeetingTypeLabel(selectedType)}
              </h3>
              <p className="text-muted-foreground">
                {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: dateLocale })}
                {selectedTime && ` ${language === 'ru' ? 'в' : 'at'} ${selectedTime}`}
              </p>
            </div>

            <div className="bg-secondary/50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {language === 'ru' ? 'Ссылка для гостей' : 'Invite link'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ru' ? 'Отправьте людям без аккаунта' : 'Send to people without an account'}
                  </p>
                </div>
              </div>

              <div className="bg-background rounded-xl p-3 flex items-center gap-2">
                <input
                  type="text"
                  value={inviteLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-foreground truncate outline-none"
                />
                <button
                  onClick={copyInviteLink}
                  className="shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Copy className="w-4 h-4 text-foreground" />
                </button>
              </div>

              <Button
                onClick={shareInviteLink}
                variant="outline"
                className="w-full h-12 rounded-xl gap-2"
              >
                <Share2 className="w-4 h-4" />
                {language === 'ru' ? 'Поделиться ссылкой' : 'Share link'}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {language === 'ru' 
                ? 'Когда гости откроют ссылку и ответят, вы получите уведомление'
                : 'When guests open the link and respond, you will be notified'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-5 pt-0">
        <Button 
          onClick={goNext}
          disabled={!canProceed() || isSubmitting}
          className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
              <span>{t('auth.loading')}</span>
            </div>
          ) : step === 'location' ? (
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              <span>{t('meeting_create.create')}</span>
            </div>
          ) : step === 'share' ? (
            language === 'ru' ? 'Готово' : 'Done'
          ) : (
            t('meeting_create.next')
          )}
        </Button>
      </div>
    </div>
  );
}
