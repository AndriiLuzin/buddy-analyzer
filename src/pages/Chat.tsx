import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

export default function Chat() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { friend?: Friend; friendUserId?: string; initialMessage?: string } | null;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const friend = state?.friend || null;
  const friendUserId = state?.friendUserId || null;

  // Check if this is demo mode
  const isDemo = friendUserId?.startsWith('demo-');
  
  // Demo messages for preview
  const demoMessages: Message[] = [
    {
      id: 'demo-1',
      sender_id: 'demo-user-1',
      receiver_id: 'current-user',
      content: 'Привет! Как дела? 👋',
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'demo-2',
      sender_id: 'current-user',
      receiver_id: 'demo-user-1',
      content: 'Привет! Всё отлично, спасибо! А у тебя?',
      is_read: true,
      created_at: new Date(Date.now() - 3600000 * 1.5).toISOString()
    },
    {
      id: 'demo-3',
      sender_id: 'demo-user-1',
      receiver_id: 'current-user',
      content: 'Тоже хорошо! Давно хотела написать — может встретимся на выходных? ☕',
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'demo-4',
      sender_id: 'current-user',
      receiver_id: 'demo-user-1',
      content: 'Отличная идея! В субботу свободна?',
      is_read: true,
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'demo-5',
      sender_id: 'demo-user-1',
      receiver_id: 'current-user',
      content: 'Да, суббота идеально подходит! Давай в 15:00 в нашем любимом кафе? 😊',
      is_read: true,
      created_at: new Date(Date.now() - 600000).toISOString()
    }
  ];

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      setCurrentUserId(user.id);
    };
    fetchUser();
  }, [navigate]);

  // Set initial message if provided
  useEffect(() => {
    if (state?.initialMessage) {
      setNewMessage(state.initialMessage);
    }
  }, [state?.initialMessage]);

  // Fetch messages
  useEffect(() => {
    if (isDemo || !currentUserId || !friendUserId) return;

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
  }, [currentUserId, friendUserId, isDemo]);

  // Get display messages
  const displayMessages = isDemo ? demoMessages : messages;
  const effectiveCurrentUserId = isDemo ? 'current-user' : currentUserId;

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayMessages]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSend = async () => {
    if (isDemo) {
      setNewMessage('');
      return;
    }
    
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

  if (!friend) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Чат не найден</p>
          <Button onClick={() => navigate('/chats')}>Вернуться к чатам</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 z-10 bg-background border-b border-border px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={friend.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(friend.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-base font-semibold text-foreground">
              {friend.name}
            </h1>
            {isDemo && (
              <p className="text-xs text-muted-foreground">Демо-режим</p>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 chat-pattern-telegram" ref={scrollRef}>
        <div className="py-4 space-y-3">
          {isDemo && (
            <div className="text-center mb-4 p-2 bg-primary/10 rounded-lg">
              <p className="text-xs text-primary">
                ✨ Это демо — пригласите друзей для реальной переписки
              </p>
            </div>
          )}
          {displayMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {t('chat.no_messages')}
            </div>
          ) : (
            displayMessages.map((message) => {
              const isOwn = message.sender_id === effectiveCurrentUserId;
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

      {/* Input */}
      <div className="p-4 border-t border-border shrink-0 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isDemo ? 'Демо-режим...' : t('chat.placeholder')}
            className="flex-1"
            disabled={loading || isDemo}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || loading || isDemo}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}