import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { Friend } from '@/types';
import { format } from 'date-fns';
import { MessageCircle } from 'lucide-react';

interface ChatPreview {
  friendId: string;
  friendUserId: string;
  friend: Friend;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  hasMessages: boolean;
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
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    const fetchChatPreviews = async () => {
      // Get friend user IDs from friends table
      const { data: friendsData } = await supabase
        .from('friends')
        .select('id, friend_user_id, friend_name, friend_last_name')
        .eq('owner_id', currentUserId);

      if (!friendsData || friendsData.length === 0) {
        setLoading(false);
        setChatPreviews([]);
        return;
      }

      const friendUserIds = friendsData.map(f => f.friend_user_id);

      // Get all messages with these friends
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.in.(${friendUserIds.join(',')}),receiver_id.eq.${currentUserId}),and(sender_id.eq.${currentUserId},receiver_id.in.(${friendUserIds.join(',')}))`)
        .order('created_at', { ascending: false });

      // Build chat previews for ALL friends
      const previews: ChatPreview[] = [];

      for (const friendData of friendsData) {
        const friendUserId = friendData.friend_user_id;
        const friend = friends.find(f => f.id === friendData.id);
        
        if (!friend) {
          // Create friend object from friendsData if not in friends prop
          const friendFromData: Friend = {
            id: friendData.id,
            name: `${friendData.friend_name} ${friendData.friend_last_name || ''}`.trim(),
            friendUserId: friendData.friend_user_id
          };

          // Find messages for this friend
          const friendMessages = messages?.filter(
            m => (m.sender_id === friendUserId && m.receiver_id === currentUserId) ||
                 (m.sender_id === currentUserId && m.receiver_id === friendUserId)
          ) || [];

          const lastMessage = friendMessages[0];
          const unreadCount = friendMessages.filter(
            m => m.receiver_id === currentUserId && !m.is_read
          ).length;

          previews.push({
            friendId: friendData.id,
            friendUserId,
            friend: friendFromData,
            lastMessage: lastMessage?.content,
            lastMessageTime: lastMessage?.created_at,
            unreadCount,
            hasMessages: friendMessages.length > 0
          });
          continue;
        }

        // Find messages for this friend
        const friendMessages = messages?.filter(
          m => (m.sender_id === friendUserId && m.receiver_id === currentUserId) ||
               (m.sender_id === currentUserId && m.receiver_id === friendUserId)
        ) || [];

        const lastMessage = friendMessages[0];
        const unreadCount = friendMessages.filter(
          m => m.receiver_id === currentUserId && !m.is_read
        ).length;

        previews.push({
          friendId: friendData.id,
          friendUserId,
          friend: { ...friend, friendUserId },
          lastMessage: lastMessage?.content,
          lastMessageTime: lastMessage?.created_at,
          unreadCount,
          hasMessages: friendMessages.length > 0
        });
      }

      // Sort: chats with messages first (by time), then friends without messages
      previews.sort((a, b) => {
        if (a.hasMessages && !b.hasMessages) return -1;
        if (!a.hasMessages && b.hasMessages) return 1;
        if (a.lastMessageTime && b.lastMessageTime) {
          return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        }
        return 0;
      });

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
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">{t('chat.no_chats')}</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          {t('chat.invite_friends') || 'Пригласите друзей, чтобы начать переписку'}
        </p>
      </div>
    );
  }

  // Demo data for preview
  const showDemo = chatPreviews.length === 0;
  const displayPreviews = showDemo ? [
    {
      friendId: 'demo-1',
      friendUserId: 'demo-user-1',
      friend: { id: 'demo-1', name: 'Анна Петрова', friendUserId: 'demo-user-1' },
      lastMessage: 'Привет! Как дела? Давно не виделись 😊',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 2,
      hasMessages: true
    },
    {
      friendId: 'demo-2',
      friendUserId: 'demo-user-2',
      friend: { id: 'demo-2', name: 'Максим Иванов', friendUserId: 'demo-user-2' },
      lastMessage: 'Отличная идея! Давай в субботу',
      lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
      unreadCount: 0,
      hasMessages: true
    },
    {
      friendId: 'demo-3',
      friendUserId: 'demo-user-3',
      friend: { id: 'demo-3', name: 'Елена Козлова', friendUserId: 'demo-user-3' },
      lastMessage: undefined,
      lastMessageTime: undefined,
      unreadCount: 0,
      hasMessages: false
    }
  ] as ChatPreview[] : chatPreviews;

  return (
    <ScrollArea className="h-full">
      {showDemo && (
        <div className="mb-4 p-3 bg-primary/10 rounded-xl border border-primary/20">
          <p className="text-sm text-primary font-medium text-center">
            ✨ Демо-режим — пригласите друзей, чтобы начать переписку
          </p>
        </div>
      )}
      <div className="space-y-1">
        {displayPreviews.map((preview) => (
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
                {preview.lastMessageTime && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTime(preview.lastMessageTime)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground truncate">
                  {preview.lastMessage || (t('chat.start_chat') || 'Начать переписку')}
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
