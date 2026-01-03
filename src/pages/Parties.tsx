import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, PartyPopper, Calendar, MapPin, Users, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { FloatingActionMenu } from '@/components/FloatingActionMenu';

interface Party {
  id: string;
  title: string;
  party_type: string;
  party_date: string;
  party_time: string | null;
  location: string | null;
  description: string | null;
  created_at: string;
  participants: {
    id: string;
    friend_id: string;
    status: string;
    friend_name: string;
    friend_last_name: string;
  }[];
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

export default function Parties() {
  const navigate = useNavigate();
  const [parties, setParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }

    const { data: partiesData, error } = await supabase
      .from('parties')
      .select('*')
      .eq('owner_id', user.id)
      .order('party_date', { ascending: true });

    if (error) {
      console.error('Error fetching parties:', error);
      setIsLoading(false);
      return;
    }

    // Fetch participants for each party
    const partiesWithParticipants = await Promise.all(
      (partiesData || []).map(async (party) => {
        const { data: participants } = await supabase
          .from('party_participants')
          .select(`
            id,
            friend_id,
            status,
            friends!inner(friend_name, friend_last_name)
          `)
          .eq('party_id', party.id);

        return {
          ...party,
          participants: (participants || []).map((p: any) => ({
            id: p.id,
            friend_id: p.friend_id,
            status: p.status,
            friend_name: p.friends.friend_name,
            friend_last_name: p.friends.friend_last_name,
          })),
        };
      })
    );

    setParties(partiesWithParticipants);
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-500';
      case 'declined': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <Check className="w-3 h-3" />;
      case 'declined': return <X className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Parties</h1>
              <p className="text-sm text-muted-foreground">Ваши мероприятия</p>
            </div>
            <Button
              onClick={() => navigate('/parties/create')}
              size="icon"
              className="rounded-full w-12 h-12"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : parties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <PartyPopper className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Нет мероприятий</h3>
            <p className="text-muted-foreground mb-6">Создайте своё первое мероприятие!</p>
            <Button onClick={() => navigate('/parties/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Создать мероприятие
            </Button>
          </div>
        ) : (
          parties.map((party) => {
            const acceptedCount = party.participants.filter(p => p.status === 'accepted').length;
            const pendingCount = party.participants.filter(p => p.status === 'pending').length;
            const declinedCount = party.participants.filter(p => p.status === 'declined').length;

            return (
              <div
                key={party.id}
                className="bg-card rounded-2xl border border-border/50 p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                    {partyTypeEmojis[party.party_type] || '🎊'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{party.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{format(new Date(party.party_date), 'd MMMM yyyy', { locale: ru })}</span>
                      {party.party_time && (
                        <>
                          <span>•</span>
                          <span>{party.party_time.slice(0, 5)}</span>
                        </>
                      )}
                    </div>
                    {party.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{party.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Participants status */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{party.participants.length}</span>
                  </div>
                  {acceptedCount > 0 && (
                    <div className="flex items-center gap-1 text-green-500">
                      <Check className="w-3.5 h-3.5" />
                      <span>{acceptedCount}</span>
                    </div>
                  )}
                  {pendingCount > 0 && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pendingCount}</span>
                    </div>
                  )}
                  {declinedCount > 0 && (
                    <div className="flex items-center gap-1 text-red-500">
                      <X className="w-3.5 h-3.5" />
                      <span>{declinedCount}</span>
                    </div>
                  )}
                </div>

                {/* Participant avatars */}
                {party.participants.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {party.participants.map((p) => (
                      <div
                        key={p.id}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          p.status === 'accepted' ? 'bg-green-500/10 text-green-600' :
                          p.status === 'declined' ? 'bg-red-500/10 text-red-600' :
                          'bg-yellow-500/10 text-yellow-600'
                        }`}
                      >
                        {getStatusIcon(p.status)}
                        <span>{p.friend_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <FloatingActionMenu />
    </div>
  );
}
