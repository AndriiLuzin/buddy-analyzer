import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function GroupEdit() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const { toast } = useToast();
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTimerRef = { current: null as NodeJS.Timeout | null };
  const deleteIntervalRef = { current: null as NodeJS.Timeout | null };

  useEffect(() => {
    if (groupId) {
      fetchGroup();
    }
  }, [groupId]);

  const fetchGroup = async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (error || !data) {
      toast({ title: 'Ошибка', description: 'Группа не найдена', variant: 'destructive' });
      navigate('/groups');
      return;
    }

    setGroupName(data.name);
    setGroupDescription(data.description || '');
    setLoading(false);
  };

  const handleUpdateGroup = async () => {
    if (!groupName.trim()) return;
    setSaving(true);

    const { error } = await supabase
      .from('groups')
      .update({
        name: groupName.trim(),
        description: groupDescription.trim() || null,
      })
      .eq('id', groupId);

    if (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить группу', variant: 'destructive' });
      setSaving(false);
      return;
    }

    toast({ title: 'Готово', description: 'Группа обновлена' });
    navigate('/groups');
  };

  const handleDeleteGroup = async () => {
    const { error } = await supabase.from('groups').delete().eq('id', groupId);
    if (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить группу', variant: 'destructive' });
      return;
    }
    toast({ title: 'Готово', description: 'Группа удалена' });
    navigate('/groups');
  };

  const startDeleteHold = () => {
    setIsDeleting(true);
    setDeleteProgress(0);
    
    const startTime = Date.now();
    const duration = 5000;
    
    deleteIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setDeleteProgress(progress);
    }, 50);
    
    deleteTimerRef.current = setTimeout(() => {
      handleDeleteGroup();
      cancelDeleteHold();
    }, duration);
  };

  const cancelDeleteHold = () => {
    setIsDeleting(false);
    setDeleteProgress(0);
    if (deleteTimerRef.current) {
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = null;
    }
    if (deleteIntervalRef.current) {
      clearInterval(deleteIntervalRef.current);
      deleteIntervalRef.current = null;
    }
  };

  if (loading) {
    return (
      <div className="h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-xl font-semibold">Редактировать группу</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        <Input
          placeholder="Название группы"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <Input
          placeholder="Описание (необязательно)"
          value={groupDescription}
          onChange={(e) => setGroupDescription(e.target.value)}
        />

        <Button 
          onClick={handleUpdateGroup} 
          className="w-full"
          disabled={!groupName.trim() || saving}
        >
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>

        <div className="pt-4 border-t border-border">
          <div className="relative">
            <Button 
              variant="destructive" 
              onMouseDown={startDeleteHold}
              onMouseUp={cancelDeleteHold}
              onMouseLeave={cancelDeleteHold}
              onTouchStart={startDeleteHold}
              onTouchEnd={cancelDeleteHold}
              className="w-full overflow-hidden"
            >
              {isDeleting && (
                <div 
                  className="absolute inset-0 bg-destructive-foreground/20 transition-all"
                  style={{ width: `${deleteProgress}%` }}
                />
              )}
              <span className="relative z-10 flex items-center">
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? `Удержите ещё ${Math.ceil((100 - deleteProgress) / 20)}с...` : 'Удержите 5 сек для удаления'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
