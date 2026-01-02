import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, MapPin, Clock, X, CalendarClock, Sparkles, Users, CalendarPlus, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isTomorrow, addMonths, subMonths, differenceInDays } from 'date-fns';
import { enUS, fr, es, ru, pt, uk, ko, zhCN } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/i18n/LanguageContext';

interface Friend {
  id: string;
  friend_name: string;
  friend_last_name: string;
}

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  meeting_date: string;
  meeting_time: string | null;
  location: string | null;
  participants: { friend_id: string; friend_name: string; friend_last_name: string }[];
}

export default function Meetings() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const getLocale = (): typeof enUS => {
    const locales = { en: enUS, fr, es, ru, pt, uk, ko, zh: zhCN };
    return locales[language as keyof typeof locales] || enUS;
  };
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMeetingDetail, setShowMeetingDetail] = useState<Meeting | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    fetchMeetings();
    fetchFriends();
  }, []);

  const fetchMeetings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: meetingsData, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('owner_id', user.id)
      .order('meeting_date', { ascending: true });

    if (error) {
      console.error('Error fetching meetings:', error);
      setLoading(false);
      return;
    }

    // Fetch participants for each meeting
    const meetingsWithParticipants = await Promise.all(
      (meetingsData || []).map(async (meeting) => {
        const { data: participants } = await supabase
          .from('meeting_participants')
          .select('friend_id')
          .eq('meeting_id', meeting.id);

        const friendIds = (participants || []).map(p => p.friend_id);
        
        let participantDetails: { friend_id: string; friend_name: string; friend_last_name: string }[] = [];
        if (friendIds.length > 0) {
          const { data: friendsData } = await supabase
            .from('friends')
            .select('id, friend_name, friend_last_name')
            .in('id', friendIds);
          
          participantDetails = (friendsData || []).map(f => ({
            friend_id: f.id,
            friend_name: f.friend_name,
            friend_last_name: f.friend_last_name
          }));
        }

        return { ...meeting, participants: participantDetails };
      })
    );

    setMeetings(meetingsWithParticipants);
    setLoading(false);
  };

  const fetchFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('friends')
      .select('id, friend_name, friend_last_name')
      .eq('owner_id', user.id);

    if (!error && data) {
      setFriends(data);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    const { error } = await supabase.from('meetings').delete().eq('id', meetingId);
    if (error) {
      toast({ title: t('meetings.error'), description: t('meetings.delete_error'), variant: 'destructive' });
      return;
    }
    toast({ title: t('meetings.deleted'), description: t('meetings.deleted_desc') });
    setShowMeetingDetail(null);
    fetchMeetings();
  };

  const openCreatePage = (date?: Date) => {
    navigate('/meetings/create', { state: date ? { date: date.toISOString() } : undefined });
  };

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const getMeetingsForDay = (date: Date) => {
    return meetings.filter(m => isSameDay(new Date(m.meeting_date), date));
  };

  const weekDays = [t('meetings.weekdays.mon'), t('meetings.weekdays.tue'), t('meetings.weekdays.wed'), t('meetings.weekdays.thu'), t('meetings.weekdays.fri'), t('meetings.weekdays.sat'), t('meetings.weekdays.sun')];

  // AI Insights component
  const AIInsightsContent = ({ meetings, friends }: { meetings: Meeting[], friends: Friend[] }) => {
    const insights = useMemo(() => {
      const today = new Date();
      const next7Days = meetings.filter(m => {
        const meetingDate = new Date(m.meeting_date);
        const diff = differenceInDays(meetingDate, today);
        return diff >= 0 && diff <= 7;
      });

      const next30Days = meetings.filter(m => {
        const meetingDate = new Date(m.meeting_date);
        const diff = differenceInDays(meetingDate, today);
        return diff >= 0 && diff <= 30;
      });

      // Find friends without upcoming meetings
      const friendsWithMeetings = new Set<string>();
      meetings.forEach(m => {
        m.participants.forEach(p => friendsWithMeetings.add(p.friend_id));
      });
      
      const friendsWithoutMeetings = friends.filter(f => !friendsWithMeetings.has(f.id));
      const suggestedFriend = friendsWithoutMeetings.length > 0 
        ? friendsWithoutMeetings[Math.floor(Math.random() * friendsWithoutMeetings.length)]
        : null;

      let workloadText = '';
      if (next7Days.length === 0) {
        workloadText = t('meetings.week_free');
      } else if (next7Days.length <= 2) {
        workloadText = t('meetings.week_light').replace('{count}', String(next7Days.length));
      } else if (next7Days.length <= 4) {
        workloadText = t('meetings.week_moderate').replace('{count}', String(next7Days.length));
      } else {
        workloadText = t('meetings.week_busy').replace('{count}', String(next7Days.length));
      }

      let suggestionText = '';
      if (suggestedFriend) {
        suggestionText = t('meetings.suggest_friend').replace('{name}', suggestedFriend.friend_name);
      } else if (friendsWithoutMeetings.length === 0 && friends.length > 0) {
        suggestionText = t('meetings.all_scheduled');
      }

      return { workloadText, suggestionText, suggestedFriend };
    }, [meetings, friends, t]);

    return (
      <div className="space-y-2 text-sm text-foreground/80">
        <p>{insights.workloadText}</p>
        {insights.suggestionText && (
          <p className="text-primary">{insights.suggestionText}</p>
        )}
      </div>
    );
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">{t('meetings.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalendar(true)}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => openCreatePage()}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Calendar Modal */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
         <DialogContent className="max-w-full w-full h-[100dvh] sm:h-[90vh] sm:max-w-full p-0 gap-0" hideClose>
          <div className="flex flex-col h-full min-h-[500px]">
            {/* Calendar Header */}
            <div className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-border/50">
              {/* Close button */}
              <button
                onClick={() => setShowCalendar(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold capitalize">
                {format(currentMonth, 'LLLL yyyy', { locale: getLocale() })}
              </h2>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-full hover:bg-muted transition-colors rotate-180"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm text-muted-foreground font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Padding for first week */}
                {Array.from({ length: paddingDays }).map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square" />
                ))}

                {/* Actual days */}
                {daysInMonth.map(day => {
                  const dayMeetings = getMeetingsForDay(day);
                  const hasMeetings = dayMeetings.length > 0;
                  const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => {
                        if (hasMeetings) {
                          setShowCalendar(false);
                          setShowMeetingDetail(dayMeetings[0]);
                        } else if (!isPast) {
                          setShowCalendar(false);
                          openCreatePage(day);
                        }
                      }}
                      disabled={isPast && !hasMeetings}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-200 font-medium ${
                        isToday(day) 
                          ? 'bg-primary text-primary-foreground font-bold' 
                          : hasMeetings 
                            ? 'bg-secondary/80 text-foreground' 
                            : isPast
                              ? 'text-muted-foreground/30'
                              : 'bg-secondary/50 hover:bg-secondary hover:scale-[1.02] text-foreground'
                      }`}
                    >
                      <span className="text-base">{format(day, 'd')}</span>
                      {hasMeetings && (
                        <div className="flex gap-0.5 mt-1">
                          {dayMeetings.slice(0, 3).map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${isToday(day) ? 'bg-primary-foreground' : 'bg-primary'}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Insights Section */}
            <div className="flex-1 px-4 pb-4 overflow-y-auto">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{t('meetings.ai_assistant')}</span>
                </div>
                <AIInsightsContent meetings={meetings} friends={friends} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upcoming meetings list grouped by date */}
      <div className="flex-1 overflow-y-auto px-4 mt-6 space-y-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">{t('meetings.no_meetings')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('meetings.tap_to_create')}</p>
          </div>
        ) : (
          (() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const getDateLabel = (dateStr: string) => {
              const date = new Date(dateStr);
              date.setHours(0, 0, 0, 0);
              
              if (isToday(date)) return t('meetings.today');
              if (isTomorrow(date)) return t('meetings.tomorrow');
              
              const daysDiff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              if (daysDiff === 2) return t('meetings.day_after');
              if (daysDiff > 2 && daysDiff <= 7) return format(date, 'EEEE', { locale: getLocale() });
              
              return format(date, 'd MMMM', { locale: getLocale() });
            };
            
            // Group meetings by date label
            const groupedMeetings = meetings.reduce((acc, meeting) => {
              const label = getDateLabel(meeting.meeting_date);
              if (!acc[label]) acc[label] = [];
              acc[label].push(meeting);
              return acc;
            }, {} as Record<string, Meeting[]>);
            
            return Object.entries(groupedMeetings).map(([label, groupMeetings]) => (
              <div key={label}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">{label}</h3>
                <div className="space-y-2">
                  {groupMeetings.map(meeting => (
                    <button
                      key={meeting.id}
                      onClick={() => setShowMeetingDetail(meeting)}
                      className="w-full p-4 rounded-xl glass text-left transition-all hover:shadow-card"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{meeting.title}</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            {meeting.meeting_time && (
                              <>
                                <Clock className="w-3.5 h-3.5" />
                                <span>{meeting.meeting_time.slice(0, 5)}</span>
                              </>
                            )}
                            {meeting.location && (
                              <>
                                <MapPin className="w-3.5 h-3.5 ml-2" />
                                <span className="truncate">{meeting.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {meeting.participants.length > 0 && (
                          <div className="flex -space-x-2">
                            {meeting.participants.slice(0, 3).map((p, i) => (
                              <div
                                key={p.friend_id}
                                className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary ring-2 ring-background"
                                style={{ zIndex: 3 - i }}
                              >
                                {p.friend_name[0]}{p.friend_last_name[0]}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ));
          })()
        )}
      </div>


      {/* Meeting Detail Modal */}
      <MeetingDetailModal
        meeting={showMeetingDetail}
        onClose={() => setShowMeetingDetail(null)}
        onReschedule={() => {
          setShowMeetingDetail(null);
          openCreatePage();
        }}
        onDelete={handleDeleteMeeting}
      />
    </div>
  );
}

// Meeting Detail Modal Component
interface MeetingDetailModalProps {
  meeting: Meeting | null;
  onClose: () => void;
  onReschedule: () => void;
  onDelete: (id: string) => void;
}

// Helper function to generate calendar links
function generateCalendarLinks(meeting: Meeting) {
  const title = encodeURIComponent(meeting.title);
  const description = encodeURIComponent(meeting.description || '');
  const location = encodeURIComponent(meeting.location || '');
  
  // Format date for calendar URLs
  const meetingDate = new Date(meeting.meeting_date);
  const [hours, minutes] = meeting.meeting_time ? meeting.meeting_time.split(':').map(Number) : [12, 0];
  meetingDate.setHours(hours, minutes, 0, 0);
  
  // End time (default 1 hour later)
  const endDate = new Date(meetingDate);
  endDate.setHours(endDate.getHours() + 1);
  
  // Format for Google Calendar (YYYYMMDDTHHmmssZ)
  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const googleStart = formatGoogleDate(meetingDate);
  const googleEnd = formatGoogleDate(endDate);
  
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${googleStart}/${googleEnd}&details=${description}&location=${location}`;
  
  // Generate ICS content
  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//BuddyBe//Meeting//EN
BEGIN:VEVENT
UID:${meeting.id}@buddybe.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(meetingDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${meeting.title}
DESCRIPTION:${meeting.description || ''}
LOCATION:${meeting.location || ''}
END:VEVENT
END:VCALENDAR`;

  return { googleCalendarUrl, icsContent };
}

function MeetingDetailModal({ meeting, onClose, onReschedule, onDelete }: MeetingDetailModalProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  
  const getLocale = (): typeof enUS => {
    const locales = { en: enUS, fr, es, ru, pt, uk, ko, zh: zhCN };
    return locales[language as keyof typeof locales] || enUS;
  };
  
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION = 3000; // 3 секунды для удобства
  const PROGRESS_INTERVAL = 50; // Обновление прогресса каждые 50мс

  const handleHoldStart = () => {
    if (!meeting) return;
    
    setIsHolding(true);
    setHoldProgress(0);

    let elapsed = 0;
    progressIntervalRef.current = setInterval(() => {
      elapsed += PROGRESS_INTERVAL;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, PROGRESS_INTERVAL);

    holdTimerRef.current = setTimeout(() => {
      onDelete(meeting.id);
      clearInterval(progressIntervalRef.current!);
      setIsHolding(false);
      setHoldProgress(0);
    }, HOLD_DURATION);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const handleAddToCalendar = (type: 'google' | 'ics') => {
    if (!meeting) return;
    
    const { googleCalendarUrl, icsContent } = generateCalendarLinks(meeting);
    
    if (type === 'google') {
      window.open(googleCalendarUrl, '_blank');
      toast({
        title: "Открыт Google Календарь",
        description: "Добавьте встречу в свой календарь",
      });
    } else {
      // Download ICS file
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${meeting.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Файл скачан",
        description: "Откройте .ics файл для добавления в календарь",
      });
    }
    
    setShowCalendarOptions(false);
  };

  if (!meeting) return null;

  return (
    <Dialog open={!!meeting} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 bg-background border-0 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/10 to-accent/5 px-4 py-3">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <h2 className="text-lg font-bold text-foreground pr-8">{meeting.title}</h2>
          
          {meeting.description && (
            <p className="text-xs text-muted-foreground mt-1">{meeting.description}</p>
          )}
        </div>

        {/* Info - Compact single line items */}
        <div className="p-3 space-y-2">
          {/* Date & Time */}
          <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {format(new Date(meeting.meeting_date), 'd MMMM yyyy', { locale: getLocale() })}
              {meeting.meeting_time && ` · ${meeting.meeting_time.slice(0, 5)}`}
            </p>
          </div>

          {/* Location */}
          {meeting.location && (
            <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-teal-500" />
              </div>
              <p className="text-sm font-medium text-foreground truncate">{meeting.location}</p>
            </div>
          )}

          {/* Participants */}
          {meeting.participants.length > 0 && (
            <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
                {meeting.participants.map(p => (
                  <div
                    key={p.friend_id}
                    className="px-2 py-1 rounded-full bg-secondary text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary">
                      {p.friend_name[0]}{p.friend_last_name[0]}
                    </div>
                    {p.friend_name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add to Calendar Button */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowCalendarOptions(!showCalendarOptions)}
              className="w-full h-10 rounded-xl text-sm border-primary/30 text-primary hover:bg-primary/10"
            >
              <CalendarPlus className="w-4 h-4 mr-1.5" />
              Добавить в календарь
            </Button>
            
            {/* Calendar Options Dropdown */}
            {showCalendarOptions && (
              <div className="absolute top-12 left-0 right-0 z-10 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-slide-up">
                <button
                  onClick={() => handleAddToCalendar('google')}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#4285F4]/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-[#4285F4]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Google Календарь</p>
                    <p className="text-xs text-muted-foreground">Открыть в браузере</p>
                  </div>
                </button>
                <button
                  onClick={() => handleAddToCalendar('ics')}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left border-t border-border"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Download className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Скачать .ics</p>
                    <p className="text-xs text-muted-foreground">Apple, Outlook, другие</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="px-3 pb-3 pt-1 flex gap-2">
          <Button
            variant="secondary"
            onClick={onReschedule}
            className="flex-1 h-10 rounded-xl text-sm"
          >
            <CalendarClock className="w-4 h-4 mr-1.5" />
            {t('meetings.reschedule')}
          </Button>

          <div className="relative flex-1">
            <Button
              variant="outline"
              className={`w-full h-10 rounded-xl text-sm border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all ${isHolding ? 'bg-destructive/10' : ''}`}
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onMouseLeave={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
            >
              <X className="w-4 h-4 mr-1.5" />
              {isHolding ? `${Math.ceil((100 - holdProgress) / 33)}s` : t('meetings.cancel')}
            </Button>
            
            {isHolding && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-destructive/20 rounded-b-xl overflow-hidden">
                <div 
                  className="h-full bg-destructive transition-all duration-100 ease-linear"
                  style={{ width: `${holdProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
