import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, MapPin, Clock, X, CalendarClock, Sparkles, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isTomorrow, addMonths, subMonths, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BottomNavBar } from '@/components/BottomNavBar';
import { CreateMeetingModal } from '@/components/CreateMeetingModal';
import { Progress } from '@/components/ui/progress';

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
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
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
      toast({ title: 'Ошибка', description: 'Не удалось удалить встречу', variant: 'destructive' });
      return;
    }
    toast({ title: 'Готово', description: 'Встреча удалена' });
    setShowMeetingDetail(null);
    fetchMeetings();
  };

  const openCreateModal = (date: Date) => {
    setSelectedDate(date);
    setShowCreateMeetingModal(true);
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

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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

      // Generate workload text
      let workloadText = '';
      if (next7Days.length === 0) {
        workloadText = 'На этой неделе у тебя свободно — отличное время для встреч!';
      } else if (next7Days.length <= 2) {
        workloadText = `На этой неделе ${next7Days.length === 1 ? '1 встреча' : `${next7Days.length} встречи`} — график спокойный.`;
      } else if (next7Days.length <= 4) {
        workloadText = `На этой неделе ${next7Days.length} встреч — умеренная загруженность.`;
      } else {
        workloadText = `На этой неделе ${next7Days.length} встреч — плотный график!`;
      }

      // Generate suggestion
      let suggestionText = '';
      if (suggestedFriend) {
        suggestionText = `Давно не виделись с ${suggestedFriend.friend_name} — может, назначить встречу?`;
      } else if (friendsWithoutMeetings.length === 0 && friends.length > 0) {
        suggestionText = 'Со всеми друзьями запланированы встречи — отлично!';
      }

      return { workloadText, suggestionText, suggestedFriend };
    }, [meetings, friends]);

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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Встречи</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalendar(true)}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowCreateMeetingModal(true)}
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
                {format(currentMonth, 'LLLL yyyy', { locale: ru })}
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
                          openCreateModal(day);
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
                  <span className="font-medium text-sm">AI-помощник</span>
                </div>
                <AIInsightsContent meetings={meetings} friends={friends} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upcoming meetings list grouped by date */}
      <div className="px-4 mt-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Нет запланированных встреч</p>
            <p className="text-xs text-muted-foreground mt-1">Нажмите +, чтобы создать</p>
          </div>
        ) : (
          (() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const getDateLabel = (dateStr: string) => {
              const date = new Date(dateStr);
              date.setHours(0, 0, 0, 0);
              
              if (isToday(date)) return 'Сегодня';
              if (isTomorrow(date)) return 'Завтра';
              
              const daysDiff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              if (daysDiff === 2) return 'Послезавтра';
              if (daysDiff > 2 && daysDiff <= 7) return format(date, 'EEEE', { locale: ru });
              
              return format(date, 'd MMMM', { locale: ru });
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
          setShowCreateMeetingModal(true);
        }}
        onDelete={handleDeleteMeeting}
      />

      {/* Create Meeting Modal (new step-by-step flow) */}
      <CreateMeetingModal
        isOpen={showCreateMeetingModal}
        onClose={() => {
          setShowCreateMeetingModal(false);
          setSelectedDate(null);
        }}
        preselectedDate={selectedDate}
        onSuccess={() => {
          setShowCreateMeetingModal(false);
          setSelectedDate(null);
          fetchMeetings();
        }}
      />

      <BottomNavBar />
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

function MeetingDetailModal({ meeting, onClose, onReschedule, onDelete }: MeetingDetailModalProps) {
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

  if (!meeting) return null;

  return (
    <Dialog open={!!meeting} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 gap-0 bg-background border-0 rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary/20 to-accent/10 p-6 pb-8">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <h2 className="text-xl font-bold text-foreground pr-10">{meeting.title}</h2>
          
          {meeting.description && (
            <p className="text-sm text-muted-foreground mt-2">{meeting.description}</p>
          )}
        </div>

        {/* Info Cards */}
        <div className="p-4 space-y-3">
          {/* Date & Time */}
          <div className="glass rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {format(new Date(meeting.meeting_date), 'd MMMM yyyy', { locale: ru })}
              </p>
              {meeting.meeting_time && (
                <p className="text-sm text-muted-foreground">
                  {meeting.meeting_time.slice(0, 5)}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          {meeting.location && (
            <div className="glass rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-teal-500" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{meeting.location}</p>
                <p className="text-sm text-muted-foreground">Место встречи</p>
              </div>
            </div>
          )}

          {/* Participants */}
          {meeting.participants.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Участники</p>
                  <p className="text-sm text-muted-foreground">{meeting.participants.length} человек</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {meeting.participants.map(p => (
                  <div
                    key={p.friend_id}
                    className="px-3 py-2 rounded-full bg-secondary text-sm flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                      {p.friend_name[0]}{p.friend_last_name[0]}
                    </div>
                    {p.friend_name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 pt-0 space-y-3">
          <Button
            variant="secondary"
            onClick={onReschedule}
            className="w-full h-12 rounded-xl"
          >
            <CalendarClock className="w-5 h-5 mr-2" />
            Перенести встречу
          </Button>

          {/* Hold to Cancel Button */}
          <div className="relative">
            <Button
              variant="outline"
              className={`w-full h-12 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all ${isHolding ? 'bg-destructive/10' : ''}`}
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onMouseLeave={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
            >
              <X className="w-5 h-5 mr-2" />
              {isHolding ? 'Удерживайте...' : 'Отменить (зажать)'}
            </Button>
            
            {isHolding && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-destructive/20 rounded-b-xl overflow-hidden">
                <div 
                  className="h-full bg-destructive transition-all duration-100 ease-linear"
                  style={{ width: `${holdProgress}%` }}
                />
              </div>
            )}
          </div>
          
          {isHolding && (
            <p className="text-xs text-center text-muted-foreground animate-pulse">
              Удерживайте для отмены встречи
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
