import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Trash2, UserPlus } from 'lucide-react';
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
      setLoading(false);
      return;
    }

    // Get members for each group
    const groupsWithMembers = await Promise.all(
      (groupsData || []).map(async (group) => {
        const { data: membersData } = await supabase
          .from('group_members')
          .select('friend_id')
          .eq('group_id', group.id);

        const memberIds = (membersData || []).map(m => m.friend_id);
        
        // Get friend details for members
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

  const handleDeleteGroup = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить группу', variant: 'destructive' });
      return;
    }
    toast({ title: 'Готово', description: 'Группа удалена' });
    fetchGroups();
  };

  const handleOpenMembers = async (e: React.MouseEvent, group: Group) => {
    e.stopPropagation();
    setSelectedGroup(group);
    await fetchGroupMembers(group.id);
    setShowMembersModal(true);
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
              onClick={(e) => handleOpenMembers(e, group)}
              className="w-full glass rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-card hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
            >
              {/* Avatar stack or icon */}
              <div className="relative shrink-0">
                {group.members.length > 0 ? (
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 4).map((member, idx) => (
                      <div
                        key={member.friend_id}
                        className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm border-2 border-background"
                        style={{ zIndex: 4 - idx }}
                      >
                        {member.friend_name[0]}{member.friend_last_name[0]}
                      </div>
                    ))}
                    {group.members.length > 4 && (
                      <div
                        className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-xs border-2 border-background"
                        style={{ zIndex: 0 }}
                      >
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-semibold text-foreground truncate">{group.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {group.members.length} {getPlural(group.members.length)}
                </p>
                {group.description && (
                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                    {group.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="shrink-0 flex items-center gap-1">
                <div
                  onClick={(e) => handleOpenMembers(e, group)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-muted-foreground" />
                </div>
                <div
                  onClick={(e) => handleDeleteGroup(e, group.id)}
                  className="p-2 rounded-full hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </div>
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
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                    {friend.friend_name[0]}{friend.friend_last_name[0]}
                  </div>
                  <span className="font-medium">{friend.friend_name} {friend.friend_last_name}</span>
                  {groupMembers.includes(friend.id) && (
                    <span className="ml-auto text-primary font-bold">✓</span>
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