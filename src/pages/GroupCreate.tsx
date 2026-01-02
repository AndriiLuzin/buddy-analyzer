import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, Check, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Friend {
  id: string;
  friend_name: string;
  friend_last_name: string;
}

export default function GroupCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [inviteLink, setInviteLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

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

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: groupData, error } = await supabase.from('groups').insert({
      owner_id: user.id,
      name: newGroupName.trim(),
      description: newGroupDescription.trim() || null,
    }).select().single();

    if (error || !groupData) {
      toast({ title: 'Ошибка', description: 'Не удалось создать группу', variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (selectedFriends.length > 0) {
      const membersToInsert = selectedFriends.map(friendId => ({
        group_id: groupData.id,
        friend_id: friendId,
      }));
      await supabase.from('group_members').insert(membersToInsert);
    }

    toast({ title: 'Готово', description: 'Группа создана' });
    navigate('/groups');
  };

  const generateInviteLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const groupName = encodeURIComponent(newGroupName.trim() || 'group');
    const link = `${baseUrl}/groups?invite=${groupName}`;
    setInviteLink(link);
  };

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      toast({ title: 'Скопировано', description: 'Ссылка скопирована в буфер обмена' });
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось скопировать', variant: 'destructive' });
    }
  };

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/groups')}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold">Новая группа</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
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
        
        {/* Friend Selection */}
        {friends.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Добавить друзей</p>
            <div className="space-y-1 border border-border rounded-lg p-2">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => toggleFriend(friend.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    selectedFriends.includes(friend.id)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-secondary'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    selectedFriends.includes(friend.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground'
                  }`}>
                    {friend.friend_name[0]}{friend.friend_last_name[0]}
                  </div>
                  <span className="text-sm flex-1 text-left">
                    {friend.friend_name} {friend.friend_last_name}
                  </span>
                  {selectedFriends.includes(friend.id) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>
            {selectedFriends.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Выбрано: {selectedFriends.length}
              </p>
            )}
          </div>
        )}

        {/* Invite Link Section */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Ссылка-приглашение</p>
          {!inviteLink ? (
            <Button 
              variant="outline" 
              onClick={generateInviteLink}
              disabled={!newGroupName.trim()}
              className="w-full"
            >
              <Link className="w-4 h-4 mr-2" />
              Сгенерировать ссылку
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input 
                value={inviteLink} 
                readOnly 
                className="text-xs"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleCopyInviteLink}
              >
                {linkCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>

        <Button 
          onClick={handleCreateGroup} 
          className="w-full h-14 rounded-2xl text-base font-semibold" 
          disabled={!newGroupName.trim() || loading}
        >
          {loading ? 'Создание...' : 'Создать группу'}
        </Button>
      </div>
    </div>
  );
}
