import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Trash2, Settings, Send, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BottomNavBar } from '@/components/BottomNavBar';

interface GroupMember {
  friend_id: string;
  friend_name: string;
  friend_last_name: string;
}

interface GroupMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  color: string;
  members: GroupMember[];
}

interface Friend {
  id: string;
  friend_name: string;
  friend_last_name: string;
}

export default function Groups() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGroups();
    fetchFriends();
    getCurrentUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!selectedGroup) return;

    const channel = supabase
      .channel(`group-messages-${selectedGroup.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${selectedGroup.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as GroupMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedGroup?.id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchGroups = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: groupsData, error } = await supabase
      .from('groups')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching groups:', error);
      setLoading(false);
      return;
    }

    const groupsWithMembers = await Promise.all(
      (groupsData || []).map(async (group) => {
        const { data: membersData } = await supabase
          .from('group_members')
          .select('friend_id')
          .eq('group_id', group.id);

        const memberIds = (membersData || []).map(m => m.friend_id);
        
        let members: GroupMember[] = [];
        if (memberIds.length > 0) {
          const { data: friendsData } = await supabase
            .from('friends')
            .select('id, friend_name, friend_last_name')
            .in('id', memberIds);
          
          members = (friendsData || []).map(f => ({
            friend_id: f.id,
            friend_name: f.friend_name,
            friend_last_name: f.friend_last_name
          }));
        }

        return { ...group, members };
      })
    );

    setGroups(groupsWithMembers);
    setLoading(false);
  };

  const fetchFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('friends')
      .select('id, friend_name, friend_last_name')
      .eq('owner_id', user.id);

    if (!error && data) {
      setFriends(data);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_members')
      .select('friend_id')
      .eq('group_id', groupId);

    if (!error && data) {
      setGroupMembers(data.map(m => m.friend_id));
    }
  };

  const fetchMessages = async (groupId: string) => {
    const { data, error } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('groups').insert({
      owner_id: user.id,
      name: newGroupName.trim(),
      description: newGroupDescription.trim() || null,
    });

    if (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать группу', variant: 'destructive' });
      return;
    }

    toast({ title: 'Готово', description: 'Группа создана' });
    setShowCreateModal(false);
    setNewGroupName('');
    setNewGroupDescription('');
    fetchGroups();
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    const { error } = await supabase.from('groups').delete().eq('id', selectedGroup.id);
    if (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить группу', variant: 'destructive' });
      return;
    }
    toast({ title: 'Готово', description: 'Группа удалена' });
    setShowSettings(false);
    setShowGroupDetail(false);
    setSelectedGroup(null);
    fetchGroups();
  };

  const handleOpenGroup = async (group: Group) => {
    setSelectedGroup(group);
    await fetchGroupMembers(group.id);
    await fetchMessages(group.id);
    setShowGroupDetail(true);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedGroup || !currentUserId) return;

    const { error } = await supabase.from('group_messages').insert({
      group_id: selectedGroup.id,
      sender_id: currentUserId,
      content: newMessage.trim(),
    });

    if (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить сообщение', variant: 'destructive' });
      return;
    }

    setNewMessage('');
  };

  const toggleMember = async (friendId: string) => {
    if (!selectedGroup) return;

    if (groupMembers.includes(friendId)) {
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', selectedGroup.id)
        .eq('friend_id', friendId);
      setGroupMembers(prev => prev.filter(id => id !== friendId));
    } else {
      await supabase.from('group_members').insert({
        group_id: selectedGroup.id,
        friend_id: friendId,
      });
      setGroupMembers(prev => [...prev, friendId]);
    }
    fetchGroups();
  };

  const getPlural = (count: number) => {
    if (count === 1) return 'участник';
    if (count >= 2 && count <= 4) return 'участника';
    return 'участников';
  };

  const handleCloseGroupDetail = () => {
    setShowGroupDetail(false);
    setSelectedGroup(null);
    setShowSettings(false);
    setMessages([]);
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Группы</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="ml-auto p-2 rounded-full bg-primary text-primary-foreground"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Нет групп</p>
            <p className="text-sm text-muted-foreground mt-1">
              Создайте группу для организации друзей
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleOpenGroup(group)}
              className="w-full glass rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-card hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
            >
              {/* Avatar stack */}
              <div className="flex items-center shrink-0">
                {group.members.length > 0 ? (
                  <div className="flex -space-x-3">
                    {group.members.slice(0, 4).map((member, idx) => (
                      <div
                        key={member.friend_id}
                        className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-primary font-semibold text-sm border-[3px] border-background shadow-sm"
                        style={{ zIndex: 10 - idx }}
                      >
                        {member.friend_name[0]}{member.friend_last_name[0]}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center border-[3px] border-background">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-semibold text-foreground truncate">{group.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {group.members.length > 4 && <span className="text-primary font-medium">{group.members.length}+ </span>}
                  {group.members.length <= 4 && <span>{group.members.length} </span>}
                  {getPlural(group.members.length)}
                </p>
                {group.description && (
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                    {group.description}
                  </p>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Create Group Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новая группа</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Название группы"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <Input
              placeholder="Описание (необязательно)"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
            />
            <Button onClick={handleCreateGroup} className="w-full">
              Создать
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Group Chat Modal */}
      <Dialog open={showGroupDetail} onOpenChange={handleCloseGroupDetail}>
        <DialogContent 
          className="w-full max-w-full h-[100dvh] sm:max-w-md sm:h-auto sm:max-h-[90vh] p-0 gap-0 bg-background border-0 sm:border rounded-none sm:rounded-2xl flex flex-col"
          hideClose
        >
          {/* Header */}
          <div className="shrink-0 bg-background border-b border-border px-4 py-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleCloseGroupDetail}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              
              {/* Clickable header to show members */}
              <button 
                onClick={() => setShowMembers(true)}
                className="flex-1 text-left"
              >
                <h2 className="text-lg font-bold text-foreground">{selectedGroup?.name}</h2>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {selectedGroup?.members.slice(0, 3).map((member, idx) => (
                      <div
                        key={member.friend_id}
                        className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-[8px] text-primary font-bold ring-1 ring-background"
                        style={{ zIndex: 5 - idx }}
                      >
                        {member.friend_name[0]}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedGroup?.members.length} {getPlural(selectedGroup?.members.length || 0)}
                  </p>
                </div>
              </button>

              <button 
                onClick={() => setShowSettings(true)}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <Settings className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-muted/30">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Users className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Нет сообщений</p>
                <p className="text-sm text-muted-foreground/70">Напишите первое сообщение!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.sender_id === currentUserId
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border border-border rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.sender_id === currentUserId ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="shrink-0 bg-background border-t border-border p-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 rounded-full bg-muted border-0"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Members Modal */}
      <Dialog open={showMembers} onOpenChange={setShowMembers}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Участники</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {/* Stacked avatars header */}
            {selectedGroup && selectedGroup.members.length > 0 && (
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="flex -space-x-3">
                  {selectedGroup.members.slice(0, 5).map((member, idx) => (
                    <div
                      key={member.friend_id}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center text-primary font-semibold text-sm ring-2 ring-background"
                      style={{ zIndex: 10 - idx }}
                    >
                      {member.friend_name[0]}{member.friend_last_name[0]}
                    </div>
                  ))}
                </div>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{selectedGroup.members.length}</span> {getPlural(selectedGroup.members.length)}
                </p>
              </div>
            )}

            {/* Member list */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedGroup?.members.map((member) => (
                <div
                  key={member.friend_id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-primary font-semibold text-sm">
                    {member.friend_name[0]}{member.friend_last_name[0]}
                  </div>
                  <span className="font-medium">{member.friend_name} {member.friend_last_name}</span>
                </div>
              ))}
            </div>

            {/* Add friends */}
            {friends.filter(f => !groupMembers.includes(f.id)).length > 0 && (
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Добавить в группу
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {friends.filter(f => !groupMembers.includes(f.id)).map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => toggleMember(friend.id)}
                      className="w-full p-3 rounded-xl border border-border hover:bg-muted transition-all text-left flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-sm">
                        {friend.friend_name[0]}{friend.friend_last_name[0]}
                      </div>
                      <span className="font-medium">{friend.friend_name} {friend.friend_last_name}</span>
                      <Plus className="w-4 h-4 ml-auto text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройки группы</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-xl bg-card border border-border">
              <h4 className="font-medium mb-1">{selectedGroup?.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedGroup?.description || 'Нет описания'}
              </p>
            </div>

            <Button 
              variant="destructive" 
              onClick={handleDeleteGroup}
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить группу
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavBar />
    </div>
  );
}