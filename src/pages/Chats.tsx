import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FloatingActionMenu } from '@/components/FloatingActionMenu';
import { ChatList } from '@/components/ChatList';
import { ChatModal } from '@/components/ChatModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { Friend } from '@/types';

const Chats = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedFriendUserId, setSelectedFriendUserId] = useState<string | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);

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
      }
    };

    fetchData();
  }, [navigate]);

  const handleSelectChat = (friend: Friend, friendUserId: string) => {
    setSelectedFriend(friend);
    setSelectedFriendUserId(friendUserId);
    setChatModalOpen(true);
  };

  const handleCloseChat = () => {
    setChatModalOpen(false);
    setSelectedFriend(null);
    setSelectedFriendUserId(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
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
      <main className="flex-1 px-4 py-4 pb-24">
        <ChatList
          friends={friends}
          currentUserId={currentUserId}
          onSelectChat={handleSelectChat}
        />
      </main>

      {/* Floating Action Menu */}
      <FloatingActionMenu />

      {/* Chat Modal */}
      <ChatModal
        friend={selectedFriend}
        friendUserId={selectedFriendUserId}
        isOpen={chatModalOpen}
        onClose={handleCloseChat}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default Chats;
