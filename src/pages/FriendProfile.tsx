import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Friend, FriendCategory } from '../types';
import { CATEGORY_INFO } from '../constants';
import { ArrowLeft, Heart, MessageCircle, Send, Plus, Settings, Pencil, Trash2, Camera, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FriendDatesSection } from '@/components/FriendDatesSection';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const categoryGradients: Record<FriendCategory, string> = {
  soul_mate: 'from-amber-400 to-orange-500',
  family: 'from-rose-400 to-pink-500',
  close_friend: 'from-orange-400 to-rose-500',
  good_buddy: 'from-teal-400 to-cyan-500',
  situational: 'from-blue-400 to-indigo-500',
  distant: 'from-slate-400 to-gray-500'
};

export default function FriendProfile() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userCategory, setUserCategory] = useState<FriendCategory | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEditingBirthday, setIsEditingBirthday] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFriend = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      setCurrentUserId(session.user.id);

      // Fetch user profile for match check
      const { data: profileData } = await supabase
        .from('profiles')
        .select('category')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileData?.category) {
        setUserCategory(profileData.category as FriendCategory);
      }

      // Fetch friend data
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('id', friendId)
        .eq('owner_id', session.user.id)
        .maybeSingle();

      if (error || !data) {
        navigate('/');
        return;
      }

      setFriend({
        id: data.id,
        name: `${data.friend_name} ${data.friend_last_name}`,
        category: data.friend_category as FriendCategory,
        description: data.friend_description || undefined,
        birthday: data.friend_birthday || undefined,
        lastInteraction: data.last_interaction || undefined,
        matchScore: data.match_score || undefined,
        friendUserId: data.friend_user_id,
        avatar: (data as any).avatar_url || undefined,
      });
      setIsLoading(false);
    };

    fetchFriend();
  }, [friendId, navigate]);

  if (isLoading || !friend) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background overflow-hidden">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  const categoryInfo = friend.category ? CATEGORY_INFO[friend.category] : null;
  const gradient = friend.category ? categoryGradients[friend.category] : 'from-gray-400 to-gray-500';
  const initials = friend.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const isMatch = userCategory && friend.category === userCategory;

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const getBirthdayInfo = (birthdayString?: string) => {
    if (!birthdayString) return null;
    const today = new Date();
    const birthday = new Date(birthdayString);
    const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
    
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const formattedDate = thisYearBirthday.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    return { daysUntil, formattedDate };
  };

  const handleActionsClick = () => {
    navigate(`/friend/${friendId}/actions`);
  };

  const handleChatClick = () => {
    if (friend.friendUserId) {
      navigate('/chat', { state: { friend, friendUserId: friend.friendUserId } });
    }
  };

  const handleBirthdayChange = async (date: Date | undefined) => {
    if (!date || !friend) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const { error } = await supabase
      .from('friends')
      .update({ friend_birthday: dateStr })
      .eq('id', friend.id);
    
    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить дату рождения',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Сохранено',
        description: 'Дата рождения обновлена'
      });
      setFriend({ ...friend, birthday: dateStr });
    }
    setIsEditingBirthday(false);
  };

  const handleCategoryChange = async (newCategory: FriendCategory) => {
    if (!friend) return;
    
    const { error } = await supabase
      .from('friends')
      .update({ friend_category: newCategory })
      .eq('id', friend.id);
    
    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось изменить категорию',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Сохранено',
        description: 'Категория изменена'
      });
      setFriend({ ...friend, category: newCategory });
    }
  };

  const handleDeleteFriend = async () => {
    if (!friend) return;
    
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friend.id);
    
    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить друга',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Удалено',
        description: 'Друг удален из списка'
      });
      navigate('/');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !friend || !currentUserId) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, выберите изображение',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Ошибка',
        description: 'Размер файла не должен превышать 5MB',
        variant: 'destructive'
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserId}/${friend.id}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('friend-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('friend-avatars')
        .getPublicUrl(fileName);

      // Update friend record
      const { error: updateError } = await supabase
        .from('friends')
        .update({ avatar_url: publicUrl })
        .eq('id', friend.id);

      if (updateError) throw updateError;

      setFriend({ ...friend, avatar: publicUrl });
      toast({
        title: 'Сохранено',
        description: 'Фото обновлено'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить фото',
        variant: 'destructive'
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const categoryOrder: FriendCategory[] = ['soul_mate', 'family', 'close_friend', 'good_buddy', 'situational', 'distant'];

  return (
    <div className="h-[100dvh] bg-background overflow-y-auto overscroll-y-contain">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-br ${gradient} p-4 sm:p-6 pb-16 sm:pb-20 relative`}>
        <div className="flex items-center justify-between pt-[env(safe-area-inset-top)]">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white text-lg font-semibold">{friend.name}</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${isEditMode ? 'bg-white/40' : 'bg-white/20 hover:bg-white/30'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate(`/friend/${friendId}/date/create`)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Avatar overlay */}
      <div className="flex justify-center -mt-12 sm:-mt-14 relative z-10">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarUpload}
        />
        <div className="relative">
          {friend.avatar ? (
            <img 
              src={friend.avatar} 
              alt={friend.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-background object-cover shadow-lg"
            />
          ) : (
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-background flex items-center justify-center text-white font-bold text-2xl sm:text-3xl bg-gradient-to-br ${gradient} shadow-lg`}>
              {initials}
            </div>
          )}
          {isEditMode && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 pt-4 pb-8">
        {/* Category badges - editable in edit mode */}
        <div className="text-center mb-6">
          {isEditMode ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">Выберите категорию:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {categoryOrder.map((cat) => {
                  const info = CATEGORY_INFO[cat];
                  const isSelected = friend.category === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                        isSelected 
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2" 
                          : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                      )}
                    >
                      <span className="text-lg">{info.emoji}</span>
                      <span className="font-medium text-sm">{info.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {categoryInfo && (
                <>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
                    <span className="text-lg">{categoryInfo.emoji}</span>
                    <span className="font-medium text-secondary-foreground">{categoryInfo.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground/70 text-center max-w-xs">{categoryInfo.hint}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Description */}
        {friend.description && (
          <div className="bg-secondary/50 rounded-2xl p-4 mb-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {friend.description}
            </p>
          </div>
        )}

        {/* Analysis */}
        {friend.analysis && (
          <div className="bg-primary/5 rounded-2xl p-4 mb-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm text-foreground">Анализ совместимости</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {friend.analysis}
            </p>
          </div>
        )}

        {/* All dates - vertical layout */}
        <div className="space-y-3 mb-6">
          {friend.lastInteraction && (
            <div className="bg-secondary/50 rounded-xl p-4">
              <span className="text-sm text-muted-foreground">Последнее общение</span>
              <p className="font-medium text-foreground text-base">{formatDate(friend.lastInteraction)}</p>
            </div>
          )}
          {/* Birthday - editable only in edit mode */}
          {isEditMode ? (
            <Popover open={isEditingBirthday} onOpenChange={setIsEditingBirthday}>
              <PopoverTrigger asChild>
                <button className="w-full bg-pink-50 dark:bg-pink-950/30 rounded-xl p-4 flex items-center gap-3 hover:bg-pink-100 dark:hover:bg-pink-950/50 transition-colors text-left border-2 border-dashed border-pink-300 dark:border-pink-700">
                  <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center shrink-0">
                    <span className="text-2xl">🎂</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{friend.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {friend.birthday 
                        ? getBirthdayInfo(friend.birthday)?.formattedDate 
                        : 'Нажмите чтобы добавить дату'}
                    </p>
                  </div>
                  <Pencil className="w-5 h-5 text-pink-500 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={friend.birthday ? new Date(friend.birthday) : undefined}
                  onSelect={handleBirthdayChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  captionLayout="dropdown-buttons"
                  fromYear={1920}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          ) : (
            friend.birthday && getBirthdayInfo(friend.birthday) && (
              <div className="bg-secondary/50 rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center shrink-0">
                  <span className="text-2xl">🎂</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{friend.name}</p>
                  <p className="text-sm text-muted-foreground">{getBirthdayInfo(friend.birthday)?.formattedDate}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-foreground">{getBirthdayInfo(friend.birthday)?.daysUntil}</p>
                  <p className="text-xs text-muted-foreground">
                    {getBirthdayInfo(friend.birthday)?.daysUntil === 0 ? 'сегодня' : getBirthdayInfo(friend.birthday)?.daysUntil === 1 ? 'день' : 'дней'}
                  </p>
                </div>
              </div>
            )
          )}
          
          {/* Important dates section */}
          {currentUserId && (
            <FriendDatesSection 
              friendId={friend.id} 
              ownerId={currentUserId}
            />
          )}

          {/* Delete button in edit mode */}
          {isEditMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full bg-destructive/10 text-destructive rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors">
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Удалить друга</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить друга?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы уверены, что хотите удалить {friend.name} из списка друзей? Это действие нельзя отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteFriend} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Actions - Scrollable with content */}
        <div className="flex gap-3 max-w-lg mx-auto pb-[env(safe-area-inset-bottom)]">
          <button 
            onClick={handleActionsClick}
            className="flex-1 h-14 rounded-2xl border-2 border-primary bg-transparent text-primary font-semibold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Действия
          </button>
          {friend.friendUserId && (
            <button 
              onClick={handleChatClick}
              className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Send className="w-5 h-5" />
              Написать
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
