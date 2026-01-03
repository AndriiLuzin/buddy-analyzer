import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Plus, Calendar, Users, Check, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { PartyIcon } from '@/components/icons/PartyIcon';
import { partyTypeIcons } from '@/components/icons/PartyTypeIcons';

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

// Kept for notifications - emoji fallback
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


  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="px-5 py-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Мероприятия</h1>
              <p className="text-sm text-muted-foreground">Ваши праздники и события</p>
            </div>
            <Button
              onClick={() => navigate('/parties/create')}
              size="icon"
              className="rounded-full w-10 h-10"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : parties.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <PartyIcon size={80} />
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

            return (
              <button
                key={party.id}
                onClick={() => navigate(`/parties/${party.id}`)}
                className="w-full bg-card rounded-2xl border border-border/50 p-4 text-left transition-all hover:border-primary/30 hover:shadow-lg active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    {(() => {
                      const IconComponent = partyTypeIcons[party.party_type];
                      return IconComponent ? <IconComponent size={44} /> : <span className="text-2xl">{partyTypeEmojis[party.party_type] || '🎊'}</span>;
                    })()}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-lg truncate">{party.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>{format(new Date(party.party_date), 'd MMMM yyyy', { locale: ru })}</span>
                      {party.party_time && (
                        <>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{party.party_time.slice(0, 5)}</span>
                        </>
                      )}
                    </div>
                    
                    {/* Stats row */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{party.participants.length}</span>
                      </div>
                      {acceptedCount > 0 && (
                        <div className="flex items-center gap-1 text-green-500">
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-sm">{acceptedCount}</span>
                        </div>
                      )}
                      {pendingCount > 0 && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-sm">{pendingCount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="text-muted-foreground/50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
