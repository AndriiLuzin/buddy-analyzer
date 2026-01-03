import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowLeft, Calendar, MapPin, Users, Check, X, Clock, Trash2, MessageCircle, Link as LinkIcon, Copy, Share2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { partyTypeIcons } from '@/components/icons/PartyTypeIcons';

interface Participant {
  id: string;
  friend_id: string;
  status: string;
  friend_name: string;
  friend_last_name: string;
}

interface ExternalGuest {
  id: string;
  invite_code: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  status: string;
  responded_at: string | null;
}

interface Party {
  id: string;
  title: string;
  party_type: string;
  party_date: string;
  party_time: string | null;
  location: string | null;
  description: string | null;
  participants: Participant[];
  externalGuests: ExternalGuest[];
}

const partyTypeEmojis: Record<string, string> = {
  birthday: '🎂',
  party: '🎉',
  bbq: '🍖',
  wedding: '💒',
  newyear: '🎄',
  corporate: '🏢',
  other: '🎊',
};

export default function PartyDetail() {
  const navigate = useNavigate();
  const { partyId } = useParams<{ partyId: string }>();
  const { toast: showToast } = useToast();
  const [party, setParty] = useState<Party | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    if (partyId) {
      fetchParty();
    }
  }, [partyId]);

  const fetchParty = async () => {
    const { data: partyData, error } = await supabase
      .from('parties')
      .select('*')
      .eq('id', partyId)
      .single();

    if (error || !partyData) {
      showToast({ title: 'Ошибка', description: 'Мероприятие не найдено', variant: 'destructive' });
      navigate('/parties');
      return;
    }

    // Fetch participants
    const { data: participants } = await supabase
      .from('party_participants')
      .select(`
        id,
        friend_id,
        status,
        friends!inner(friend_name, friend_last_name)
      `)
      .eq('party_id', partyId);

    // Fetch external guests
    const { data: externalGuests } = await supabase
      .from('party_external_invites')
      .select('*')
      .eq('party_id', partyId);

    // Get the invite link if exists
    if (externalGuests && externalGuests.length > 0) {
      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/invite/${externalGuests[0].invite_code}`);
    }

    setParty({
      ...partyData,
      participants: (participants || []).map((p: any) => ({
        id: p.id,
        friend_id: p.friend_id,
        status: p.status,
        friend_name: p.friends.friend_name,
        friend_last_name: p.friends.friend_last_name,
      })),
      externalGuests: externalGuests || [],
    });
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!party) return;
    
    const { error } = await supabase
      .from('parties')
      .delete()
      .eq('id', party.id);

    if (error) {
      showToast({ title: 'Ошибка', description: 'Не удалось удалить мероприятие', variant: 'destructive' });
      return;
    }

    showToast({ title: 'Готово', description: 'Мероприятие удалено' });
    navigate('/parties');
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Ссылка скопирована!');
    } catch {
      toast.error('Не удалось скопировать ссылку');
    }
  };

  const shareInviteLink = async () => {
    if (navigator.share && party) {
      try {
        await navigator.share({
          title: party.title,
          text: `Приглашаю вас на ${party.title}!`,
          url: inviteLink,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      copyInviteLink();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'declined': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Check className="w-4 h-4" />;
      case 'declined': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Придёт';
      case 'declined': return 'Не придёт';
      default: return 'Ожидает ответа';
    }
  };

  if (isLoading) {
    return (
      <div className="h-[100dvh] bg-background flex items-center justify-center overflow-hidden">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!party) return null;

  const IconComponent = partyTypeIcons[party.party_type];
  
  // Count from both participants and external guests
  const participantAccepted = party.participants.filter(p => p.status === 'accepted').length;
  const participantPending = party.participants.filter(p => p.status === 'pending').length;
  const participantDeclined = party.participants.filter(p => p.status === 'declined').length;
  
  const externalAccepted = party.externalGuests.filter(g => g.status === 'accepted').length;
  const externalPending = party.externalGuests.filter(g => g.status === 'pending').length;
  const externalDeclined = party.externalGuests.filter(g => g.status === 'declined').length;

  const acceptedCount = participantAccepted + externalAccepted;
  const pendingCount = participantPending + externalPending;
  const declinedCount = participantDeclined + externalDeclined;

  // Filter external guests who have responded
  const respondedExternalGuests = party.externalGuests.filter(g => g.status !== 'pending');

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/parties')}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{party.title}</h1>
              <p className="text-sm text-muted-foreground">Детали мероприятия</p>
            </div>
            <button
              onClick={handleDelete}
              className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-destructive" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-24">
        {/* Party Info Card */}
        <div className="bg-card rounded-2xl border border-border/50 p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              {IconComponent ? <IconComponent size={52} /> : <span className="text-3xl">{partyTypeEmojis[party.party_type] || '🎊'}</span>}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{party.title}</h2>
              <p className="text-muted-foreground capitalize">{party.party_type === 'other' ? 'Мероприятие' : party.party_type}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-foreground">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{format(new Date(party.party_date), 'd MMMM yyyy', { locale: ru })}</p>
                {party.party_time && <p className="text-sm text-muted-foreground">{party.party_time.slice(0, 5)}</p>}
              </div>
            </div>

            {party.location && (
              <div className="flex items-center gap-3 text-foreground">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="font-medium">{party.location}</p>
              </div>
            )}

            {party.description && (
              <div className="flex items-start gap-3 text-foreground">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground pt-2">{party.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Invite Link Card */}
        {inviteLink && (
          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <LinkIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Ссылка для гостей</p>
                <p className="text-sm text-muted-foreground">Отправьте людям без аккаунта</p>
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
              className="w-full h-11 rounded-xl gap-2"
            >
              <Share2 className="w-4 h-4" />
              Поделиться ссылкой
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-500/10 rounded-2xl p-4 text-center border border-green-500/20">
            <div className="flex items-center justify-center gap-1.5 text-green-500 mb-1">
              <Check className="w-5 h-5" />
              <span className="text-2xl font-bold">{acceptedCount}</span>
            </div>
            <p className="text-xs text-green-600">Придут</p>
          </div>
          <div className="bg-yellow-500/10 rounded-2xl p-4 text-center border border-yellow-500/20">
            <div className="flex items-center justify-center gap-1.5 text-yellow-500 mb-1">
              <Clock className="w-5 h-5" />
              <span className="text-2xl font-bold">{pendingCount}</span>
            </div>
            <p className="text-xs text-yellow-600">Ожидают</p>
          </div>
          <div className="bg-red-500/10 rounded-2xl p-4 text-center border border-red-500/20">
            <div className="flex items-center justify-center gap-1.5 text-red-500 mb-1">
              <X className="w-5 h-5" />
              <span className="text-2xl font-bold">{declinedCount}</span>
            </div>
            <p className="text-xs text-red-600">Не придут</p>
          </div>
        </div>

        {/* Participants List */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">
              Приглашённые ({party.participants.length + respondedExternalGuests.length})
            </h3>
          </div>

          <div className="space-y-2">
            {party.participants.length === 0 && respondedExternalGuests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Нет приглашённых</p>
            ) : (
              <>
                {/* Regular participants */}
                {party.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                      {participant.friend_name[0]}{participant.friend_last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {participant.friend_name} {participant.friend_last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{getStatusLabel(participant.status)}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${getStatusColor(participant.status)}`}>
                      {getStatusIcon(participant.status)}
                    </div>
                  </div>
                ))}

                {/* External guests who responded */}
                {respondedExternalGuests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border/50"
                  >
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-semibold">
                      {guest.first_name?.[0] || '?'}{guest.last_name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {guest.first_name} {guest.last_name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{guest.phone}</span>
                        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">по ссылке</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${getStatusColor(guest.status)}`}>
                      {getStatusIcon(guest.status)}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
