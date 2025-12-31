import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Trash2, Edit2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BottomNavBar } from '@/components/BottomNavBar';

interface Group {
  id: string;
  name: string;
  description: string | null;
  color: string;
  member_count?: number;
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
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  useEffect(() => {
    fetchGroups();
    fetchFriends();
  }, []);

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
      return;
    }

    // Get member counts
    const groupsWithCounts = await Promise.all(
      (groupsData || []).map(async (group) => {
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);
        return { ...group, member_count: count || 0 };
      })
    );

    setGroups(groupsWithCounts);
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

  const handleDeleteGroup = async (groupId: string) => {
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить группу', variant: 'destructive' });
      return;
    }
    toast({ title: 'Готово', description: 'Группа удалена' });
    fetchGroups();
  };

  const handleOpenMembers = async (group: Group) => {
    setSelectedGroup(group);
    await fetchGroupMembers(group.id);
    setShowMembersModal(true);
  };

  const toggleMember = async (friendId: string) => {
    if (!selectedGroup) return;

    if (groupMembers.includes(friendId)) {
      // Remove member
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', selectedGroup.id)
        .eq('friend_id', friendId);
      setGroupMembers(prev => prev.filter(id => id !== friendId));
    } else {
      // Add member
      await supabase.from('group_members').insert({
        group_id: selectedGroup.id,
        friend_id: friendId,
      });
      setGroupMembers(prev => [...prev, friendId]);
    }
    fetchGroups();
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
            <div
              key={group.id}
              className="p-4 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${group.color}20` }}
                >
                  <Users className="w-5 h-5" style={{ color: group.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{group.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {group.member_count} {group.member_count === 1 ? 'участник' : 'участников'}
                  </p>
                </div>
                <button
                  onClick={() => handleOpenMembers(group)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="p-2 rounded-full hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-2">{group.description}</p>
              )}
            </div>
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

      {/* Members Modal */}
      <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Участники: {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4 max-h-80 overflow-y-auto">
            {friends.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Нет друзей</p>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => toggleMember(friend.id)}
                  className={`w-full p-3 rounded-xl border transition-all text-left flex items-center gap-3 ${
                    groupMembers.includes(friend.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {friend.friend_name[0]}
                  </div>
                  <span>{friend.friend_name} {friend.friend_last_name}</span>
                  {groupMembers.includes(friend.id) && (
                    <span className="ml-auto text-primary text-sm">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavBar />
    </div>
  );
}