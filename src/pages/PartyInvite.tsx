import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, Clock, MapPin, User, Check, X, Loader2, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { partyTypeIcons } from '@/components/icons/PartyTypeIcons';

interface PartyInviteData {
  id: string;
  invite_code: string;
  status: string;
  first_name: string | null;
  last_name: string | null;
  party: {
    id: string;
    title: string;
    party_type: string;
    party_date: string;
    party_time: string | null;
    location: string | null;
    description: string | null;
    owner_id: string;
  };
  host: {
    first_name: string;
    last_name: string;
  } | null;
}

export default function PartyInvite() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const [invite, setInvite] = useState<PartyInviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [responded, setResponded] = useState(false);
  const [responseStatus, setResponseStatus] = useState<'accepted' | 'declined' | null>(null);

  useEffect(() => {
    fetchInvite();
  }, [inviteCode]);

  const fetchInvite = async () => {
    if (!inviteCode) return;

    try {
      // Fetch invite with party details
      const { data: inviteData, error: inviteError } = await supabase
        .from('party_external_invites')
        .select(`
          *,
          party:parties(*)
        `)
        .eq('invite_code', inviteCode)
        .single();

      if (inviteError) throw inviteError;

      // Fetch host profile
      const { data: hostData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', inviteData.party.owner_id)
        .single();

      setInvite({
        ...inviteData,
        host: hostData,
      });

      if (inviteData.status !== 'pending') {
        setResponded(true);
        setResponseStatus(inviteData.status as 'accepted' | 'declined');
      }
    } catch (error) {
      console.error('Error fetching invite:', error);
      toast.error('Приглашение не найдено');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (status: 'accepted' | 'declined') => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('party-rsvp', {
        body: {
          inviteCode,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          status,
        },
      });

      if (error) throw error;

      setResponded(true);
      setResponseStatus(status);
      toast.success(status === 'accepted' ? 'Вы подтвердили участие!' : 'Ответ отправлен');
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      toast.error('Ошибка при отправке ответа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <PartyPopper className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Приглашение не найдено</h1>
          <p className="text-muted-foreground">Возможно, ссылка устарела или недействительна</p>
        </div>
      </div>
    );
  }

  const partyDate = new Date(invite.party.party_date);
  const IconComponent = partyTypeIcons[invite.party.party_type as keyof typeof partyTypeIcons];

  if (responded) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
            responseStatus === 'accepted' ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            {responseStatus === 'accepted' ? (
              <Check className="w-10 h-10 text-green-500" />
            ) : (
              <X className="w-10 h-10 text-red-500" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {responseStatus === 'accepted' ? 'Вы придёте!' : 'Вы отказались'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {responseStatus === 'accepted'
              ? `Ждём вас на "${invite.party.title}"`
              : 'Ваш ответ отправлен организатору'}
          </p>
          <div className="bg-secondary/50 rounded-2xl p-4 text-left">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span>{format(partyDate, 'd MMMM yyyy', { locale: ru })}</span>
            </div>
            {invite.party.party_time && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{invite.party.party_time.slice(0, 5)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/20 to-background pt-[calc(env(safe-area-inset-top)+2rem)] pb-8 px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
            {IconComponent ? (
              <IconComponent className="w-10 h-10 text-primary" />
            ) : (
              <PartyPopper className="w-10 h-10 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Вас приглашают!</h1>
          {invite.host && (
            <p className="text-muted-foreground">
              {invite.host.first_name} {invite.host.last_name} приглашает вас на
            </p>
          )}
        </div>
      </div>

      {/* Party Details */}
      <div className="px-6 -mt-4">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">{invite.party.title}</h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Дата</p>
                  <p className="font-medium text-foreground">
                    {format(partyDate, 'd MMMM yyyy', { locale: ru })}
                  </p>
                </div>
              </div>

              {invite.party.party_time && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Время</p>
                    <p className="font-medium text-foreground">
                      {invite.party.party_time.slice(0, 5)}
                    </p>
                  </div>
                </div>
              )}

              {invite.party.location && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Место</p>
                    <p className="font-medium text-foreground">{invite.party.location}</p>
                  </div>
                </div>
              )}
            </div>

            {invite.party.description && (
              <p className="mt-4 text-muted-foreground text-sm border-t border-border pt-4">
                {invite.party.description}
              </p>
            )}
          </div>

          {/* RSVP Form */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Ваши данные
            </h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Введите ваше имя"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Введите вашу фамилию"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Номер телефона</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => handleSubmit('declined')}
                disabled={isSubmitting}
                className="h-12"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Не приду
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSubmit('accepted')}
                disabled={isSubmitting}
                className="h-12"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Приду!
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
