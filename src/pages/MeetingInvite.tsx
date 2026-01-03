import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  X, 
  User,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

interface MeetingData {
  id: string;
  title: string;
  meeting_date: string;
  meeting_time: string | null;
  location: string | null;
  owner_id: string;
}

interface InviteData {
  id: string;
  invite_code: string;
  status: string;
  first_name: string | null;
  last_name: string | null;
  meetings: MeetingData;
}

export default function MeetingInvite() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [responded, setResponded] = useState(false);
  const [responseStatus, setResponseStatus] = useState<'accepted' | 'declined' | null>(null);

  const dateLocale = language === 'ru' || language === 'uk' ? ru : enUS;

  useEffect(() => {
    fetchInvite();
  }, [inviteCode]);

  const fetchInvite = async () => {
    if (!inviteCode) return;

    const { data, error } = await supabase
      .from('meeting_external_invites')
      .select(`
        id,
        invite_code,
        status,
        first_name,
        last_name,
        meetings (
          id,
          title,
          meeting_date,
          meeting_time,
          location,
          owner_id
        )
      `)
      .eq('invite_code', inviteCode)
      .maybeSingle();

    if (error || !data) {
      toast.error(language === 'ru' ? 'Приглашение не найдено' : 'Invitation not found');
      setLoading(false);
      return;
    }

    // Type assertion for the joined data
    const inviteData = data as unknown as InviteData;
    setInvite(inviteData);
    
    if (inviteData.first_name) setFirstName(inviteData.first_name);
    if (inviteData.last_name) setLastName(inviteData.last_name);
    if (inviteData.status !== 'pending') {
      setResponded(true);
      setResponseStatus(inviteData.status as 'accepted' | 'declined');
    }
    
    setLoading(false);
  };

  const handleRespond = async (status: 'accepted' | 'declined') => {
    if (!invite || !firstName.trim()) {
      toast.error(language === 'ru' ? 'Введите ваше имя' : 'Please enter your name');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('meeting_external_invites')
      .update({
        status,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        responded_at: new Date().toISOString(),
      })
      .eq('id', invite.id);

    if (error) {
      toast.error(language === 'ru' ? 'Ошибка при отправке ответа' : 'Error sending response');
      setSubmitting(false);
      return;
    }

    // Notify the meeting owner
    const { data: ownerProfile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('user_id', invite.meetings.owner_id)
      .maybeSingle();

    await supabase.from('notifications').insert({
      user_id: invite.meetings.owner_id,
      type: 'meeting_rsvp',
      title: status === 'accepted' 
        ? (language === 'ru' ? '✅ Гость принял приглашение' : '✅ Guest accepted')
        : (language === 'ru' ? '❌ Гость отклонил приглашение' : '❌ Guest declined'),
      message: `${firstName} ${lastName}`.trim() + (status === 'accepted' 
        ? (language === 'ru' ? ' придёт на ' : ' will attend ')
        : (language === 'ru' ? ' не придёт на ' : ' won\'t attend ')) + invite.meetings.title,
      data: {
        meeting_id: invite.meetings.id,
        guest_name: `${firstName} ${lastName}`.trim(),
        status,
      },
    });

    setResponded(true);
    setResponseStatus(status);
    setSubmitting(false);
    
    toast.success(status === 'accepted'
      ? (language === 'ru' ? 'Вы приняли приглашение!' : 'You accepted the invitation!')
      : (language === 'ru' ? 'Вы отклонили приглашение' : 'You declined the invitation')
    );
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
          <X className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {language === 'ru' ? 'Приглашение не найдено' : 'Invitation not found'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {language === 'ru' 
            ? 'Возможно, ссылка устарела или была удалена'
            : 'The link may have expired or been deleted'}
        </p>
        <Button onClick={() => navigate('/')}>
          {language === 'ru' ? 'На главную' : 'Go home'}
        </Button>
      </div>
    );
  }

  const meeting = invite.meetings;
  const meetingDate = new Date(meeting.meeting_date);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-transparent pt-[calc(env(safe-area-inset-top)+2rem)] pb-8 px-6 text-center">
        <div className="text-4xl mb-4">📅</div>
        <h1 className="text-2xl font-bold text-foreground mb-1">{meeting.title}</h1>
        <p className="text-muted-foreground">
          {language === 'ru' ? 'Вас приглашают на встречу' : 'You are invited to a meeting'}
        </p>
      </div>

      {/* Meeting Details */}
      <div className="flex-1 px-6 py-4">
        <div className="bg-secondary/30 rounded-2xl p-5 space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {language === 'ru' ? 'Дата' : 'Date'}
              </p>
              <p className="font-medium text-foreground">
                {format(meetingDate, 'd MMMM yyyy', { locale: dateLocale })}
              </p>
            </div>
          </div>

          {meeting.meeting_time && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Время' : 'Time'}
                </p>
                <p className="font-medium text-foreground">{meeting.meeting_time}</p>
              </div>
            </div>
          )}

          {meeting.location && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'ru' ? 'Место' : 'Location'}
                </p>
                <p className="font-medium text-foreground">{meeting.location}</p>
              </div>
            </div>
          )}
        </div>

        {responded ? (
          <div className="text-center py-8">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              responseStatus === 'accepted' ? 'bg-green-500/20' : 'bg-destructive/20'
            }`}>
              {responseStatus === 'accepted' 
                ? <Check className="w-10 h-10 text-green-500" />
                : <X className="w-10 h-10 text-destructive" />
              }
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {responseStatus === 'accepted'
                ? (language === 'ru' ? 'Вы приняли приглашение!' : 'You accepted!')
                : (language === 'ru' ? 'Вы отклонили приглашение' : 'You declined')
              }
            </h2>
            <p className="text-muted-foreground">
              {responseStatus === 'accepted'
                ? (language === 'ru' ? 'Организатор получит уведомление' : 'The organizer will be notified')
                : (language === 'ru' ? 'Организатор получит уведомление' : 'The organizer will be notified')
              }
            </p>
          </div>
        ) : (
          <>
            {/* Name Input */}
            <div className="space-y-4 mb-6">
              <p className="text-sm font-medium text-foreground">
                {language === 'ru' ? 'Представьтесь:' : 'Your name:'}
              </p>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={language === 'ru' ? 'Имя *' : 'First name *'}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder={language === 'ru' ? 'Фамилия' : 'Last name'}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Response Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleRespond('accepted')}
                disabled={submitting || !firstName.trim()}
                className="w-full h-14 rounded-2xl text-base font-semibold gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                {language === 'ru' ? 'Приду' : 'I will attend'}
              </Button>
              
              <Button
                onClick={() => handleRespond('declined')}
                disabled={submitting || !firstName.trim()}
                variant="outline"
                className="w-full h-14 rounded-2xl text-base font-semibold gap-2"
              >
                <X className="w-5 h-5" />
                {language === 'ru' ? 'Не смогу' : 'Cannot attend'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
