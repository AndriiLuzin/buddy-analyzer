import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { Friend } from '@/types';
import { format } from 'date-fns';

interface ChatPreview {
  friendId: string;
  friendUserId: string;
  friend: Friend;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface ChatListProps {
  friends: Friend[];
  currentUserId: string | null;
  onSelectChat: (friend: Friend, friendUserId: string) => void;
}

export const ChatList = ({ friends, currentUserId, onSelectChat }: ChatListProps) => {
  const { t } = useLanguage();
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId || friends.length === 0) {
      setLoading(false);
      return;
    }

    const fetchChatPreviews = async () => {
      // Get friend user IDs from friends table
      const { data: friendsData } = await supabase
        .from('friends')
        .select('id, friend_user_id, friend_name')
        .eq('owner_id', currentUserId);

      if (!friendsData || friendsData.length === 0) {
        setLoading(false);
        return;
      }

      const friendUserIds = friendsData.map(f => f.friend_user_id);

      // Get all messages with these friends
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.in.(${friendUserIds.join(',')}),receiver_id.in.(${friendUserIds.join(',')})`)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      // Build chat previews
      const previews: ChatPreview[] = [];

      for (const friendData of friendsData) {
        const friendUserId = friendData.friend_user_id;
        const friend = friends.find(f => f.id === friendData.id);
        
        if (!friend) continue;

        // Find messages for this friend
        const friendMessages = messages?.filter(
          m => (m.sender_id === friendUserId && m.receiver_id === currentUserId) ||
               (m.sender_id === currentUserId && m.receiver_id === friendUserId)
        ) || [];

        if (friendMessages.length === 0) continue;

        const lastMessage = friendMessages[0];
        const unreadCount = friendMessages.filter(
          m => m.receiver_id === currentUserId && !m.is_read
        ).length;

        previews.push({
          friendId: friendData.id,
          friendUserId,
          friend,
          lastMessage: lastMessage.content,
          lastMessageTime: lastMessage.created_at,
          unreadCount
        });
      }

      // Sort by last message time
      previews.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      setChatPreviews(previews);
      setLoading(false);
    };

    fetchChatPreviews();

    // Subscribe to new messages
    const channel = supabase
      .channel('chat-list-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          fetchChatPreviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, friends]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return format(date, 'HH:mm');
    }
    return format(date, 'dd.MM');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-muted-foreground">
          {t('auth.loading')}
        </div>
      </div>
    );
  }

  if (chatPreviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('chat.no_chats')}
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1">
        {chatPreviews.map((preview) => (
          <button
            key={preview.friendId}
            onClick={() => onSelectChat(preview.friend, preview.friendUserId)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
          >
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={preview.friend.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(preview.friend.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground truncate">
                  {preview.friend.name}
                </span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatTime(preview.lastMessageTime)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground truncate">
                  {preview.lastMessage}
                </p>
                {preview.unreadCount > 0 && (
                  <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center text-xs">
                    {preview.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
