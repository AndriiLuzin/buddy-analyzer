import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { Friend } from '@/types';
import { format } from 'date-fns';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatModalProps {
  friend: Friend | null;
  friendUserId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string | null;
}

export const ChatModal = ({ friend, friendUserId, isOpen, onClose, currentUserId }: ChatModalProps) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch messages
  useEffect(() => {
    if (!isOpen || !currentUserId || !friendUserId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${friendUserId}),and(sender_id.eq.${friendUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
        // Mark unread messages as read
        const unreadIds = data
          .filter(m => m.receiver_id === currentUserId && !m.is_read)
          .map(m => m.id);
        
        if (unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadIds);
        }
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${currentUserId}-${friendUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id=eq.${currentUserId},receiver_id=eq.${friendUserId}),and(sender_id=eq.${friendUserId},receiver_id=eq.${currentUserId}))`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          
          // Mark as read if we're the receiver
          if (newMsg.receiver_id === currentUserId) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, currentUserId, friendUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUserId || !friendUserId) return;

    setLoading(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: friendUserId,
        content: messageContent
      });

    if (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent);
    }
    
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
    return format(date, 'dd.MM HH:mm');
  };

  if (!friend) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={friend.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(friend.name)}
              </AvatarFallback>
            </Avatar>
            <DialogTitle className="text-base font-medium">
              {friend.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {t('chat.no_messages')}
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender_id === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              className="flex-1"
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!newMessage.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
