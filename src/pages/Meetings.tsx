import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, MapPin, Clock, Users, Check, X, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BottomNavBar } from '@/components/BottomNavBar';
import { CreateMeetingModal } from '@/components/CreateMeetingModal';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateMeetingModal, setShowCreateMeetingModal] = useState(false);
  const [showMeetingDetail, setShowMeetingDetail] = useState<Meeting | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

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

  const handleCreateMeeting = async () => {
    if (!newTitle.trim() || !selectedDate) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        owner_id: user.id,
        title: newTitle.trim(),
        meeting_date: format(selectedDate, 'yyyy-MM-dd'),
        meeting_time: newTime || null,
        location: newLocation.trim() || null,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать встречу', variant: 'destructive' });
      return;
    }

    // Add participants
    if (selectedFriends.length > 0 && meeting) {
      await supabase.from('meeting_participants').insert(
        selectedFriends.map(friendId => ({
          meeting_id: meeting.id,
          friend_id: friendId,
        }))
      );
    }

    toast({ title: 'Готово', description: 'Встреча создана' });
    resetForm();
    setShowCreateModal(false);
    fetchMeetings();
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

  const resetForm = () => {
    setNewTitle('');
    setNewTime('');
    setNewLocation('');
    setSelectedFriends([]);
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const openCreateModal = (date: Date) => {
    setSelectedDate(date);
    resetForm();
    setShowCreateModal(true);
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
        <DialogContent className="max-w-full h-full sm:max-w-full sm:h-auto sm:max-h-[90vh] p-0 gap-0">
          <div className="flex flex-col h-full min-h-[500px]">
            {/* Calendar Header */}
            <div className="px-4 py-4 flex items-center justify-between border-b border-border/50">
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
            <div className="flex-1 p-4">
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
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => {
                        if (hasMeetings) {
                          setShowCalendar(false);
                          setShowMeetingDetail(dayMeetings[0]);
                        } else {
                          setShowCalendar(false);
                          openCreateModal(day);
                        }
                      }}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all ${
                        isToday(day) 
                          ? 'bg-primary text-primary-foreground font-bold' 
                          : hasMeetings 
                            ? 'bg-accent/30 text-foreground' 
                            : 'hover:bg-muted text-foreground'
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Upcoming meetings list */}
      <div className="px-4 mt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Ближайшие встречи</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Нет запланированных встреч</p>
            <p className="text-xs text-muted-foreground mt-1">Нажмите на дату, чтобы создать</p>
          </div>
        ) : (
          <div className="space-y-2">
            {meetings.slice(0, 5).map(meeting => (
              <button
                key={meeting.id}
                onClick={() => setShowMeetingDetail(meeting)}
                className="w-full p-4 rounded-xl glass text-left transition-all hover:shadow-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{meeting.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{format(new Date(meeting.meeting_date), 'd MMMM', { locale: ru })}</span>
                      {meeting.meeting_time && (
                        <>
                          <Clock className="w-3.5 h-3.5 ml-2" />
                          <span>{meeting.meeting_time.slice(0, 5)}</span>
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
        )}
      </div>

      {/* Create Meeting Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая встреча</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedDate && (
              <div className="p-3 rounded-xl bg-muted text-center">
                <span className="text-sm font-medium">
                  {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                </span>
              </div>
            )}

            <Input
              placeholder="Название встречи"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <Input
              type="time"
              placeholder="Время"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />

            <Input
              placeholder="Место (необязательно)"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />

            {/* Friends selector */}
            {friends.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Пригласить друзей
                </p>
                <div className="flex flex-wrap gap-2">
                  {friends.map(friend => (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={`px-3 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
                        selectedFriends.includes(friend.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground hover:bg-muted/80'
                      }`}
                    >
                      {selectedFriends.includes(friend.id) && <Check className="w-3 h-3" />}
                      {friend.friend_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleCreateMeeting} className="w-full" disabled={!newTitle.trim()}>
              Создать встречу
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Meeting Detail Modal */}
      <Dialog open={!!showMeetingDetail} onOpenChange={() => setShowMeetingDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showMeetingDetail?.title}</DialogTitle>
          </DialogHeader>
          {showMeetingDetail && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(showMeetingDetail.meeting_date), 'd MMMM yyyy', { locale: ru })}</span>
              </div>

              {showMeetingDetail.meeting_time && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{showMeetingDetail.meeting_time.slice(0, 5)}</span>
                </div>
              )}

              {showMeetingDetail.location && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{showMeetingDetail.location}</span>
                </div>
              )}

              {showMeetingDetail.participants.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Участники:</p>
                  <div className="flex flex-wrap gap-2">
                    {showMeetingDetail.participants.map(p => (
                      <div
                        key={p.friend_id}
                        className="px-3 py-2 rounded-full bg-muted text-sm flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                          {p.friend_name[0]}{p.friend_last_name[0]}
                        </div>
                        {p.friend_name} {p.friend_last_name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="destructive"
                onClick={() => handleDeleteMeeting(showMeetingDetail.id)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Удалить встречу
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Meeting Modal (new step-by-step flow) */}
      <CreateMeetingModal
        isOpen={showCreateMeetingModal}
        onClose={() => setShowCreateMeetingModal(false)}
        onSuccess={() => {
          setShowCreateMeetingModal(false);
          fetchMeetings();
        }}
      />

      <BottomNavBar />
    </div>
  );
}
