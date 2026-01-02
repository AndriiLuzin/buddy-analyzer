import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { ChatList } from '@/components/ChatList';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { Friend } from '@/types';

const Chats = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      setCurrentUserId(user.id);

      // Fetch friends
      const { data: friendsData } = await supabase
        .from('friends')
        .select('*')
        .eq('owner_id', user.id);

      if (friendsData) {
        const mappedFriends: Friend[] = friendsData.map(f => ({
          id: f.id,
          name: `${f.friend_name} ${f.friend_last_name}`.trim(),
          birthday: f.friend_birthday || undefined,
          category: f.friend_category as Friend['category'],
          description: f.friend_description || undefined,
          quizAnswers: f.friend_quiz_answers || undefined,
          matchScore: f.match_score || undefined,
          lastInteraction: f.last_interaction || undefined,
          friendUserId: f.friend_user_id
        }));
        setFriends(mappedFriends);

        // Auto-open chat if navigated from friend profile
        const state = location.state as { selectedFriendId?: string } | null;
        if (state?.selectedFriendId) {
          const friendToOpen = mappedFriends.find(f => f.friendUserId === state.selectedFriendId);
          if (friendToOpen) {
            navigate('/chat', { 
              state: { friend: friendToOpen, friendUserId: state.selectedFriendId },
              replace: true 
            });
          }
        }
      }
    };

    fetchData();
  }, [navigate, location.state]);

  const handleSelectChat = (friend: Friend, friendUserId: string) => {
    navigate('/chat', { state: { friend, friendUserId } });
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">{t('chat.title')}</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Chat List */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <ChatList
          friends={friends}
          currentUserId={currentUserId}
          onSelectChat={handleSelectChat}
        />
      </main>
    </div>
  );
};

export default Chats;