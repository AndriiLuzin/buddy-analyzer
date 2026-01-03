import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Friend, FriendCategory } from '../types';
import { CATEGORY_INFO } from '../constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, Heart, MessageCircle, Calendar, Sparkles, Send, Pencil } from 'lucide-react';
import { FriendActionsModal } from './FriendActionsModal';
import { ChatModal } from './ChatModal';
import { FriendDatesSection } from './FriendDatesSection';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FriendDetailModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  isMatch?: boolean;
  currentUserId?: string | null;
  onUpdateFriend?: (friendId: string, updates: Partial<Friend>) => void;
}

const categoryGradients: Record<FriendCategory, string> = {
  soul_mate: 'from-amber-400 to-orange-500',
  family: 'from-rose-400 to-pink-500',
  close_friend: 'from-orange-400 to-rose-500',
  good_buddy: 'from-teal-400 to-cyan-500',
  situational: 'from-blue-400 to-indigo-500',
  distant: 'from-slate-400 to-gray-500'
};

export const FriendDetailModal = ({ friend, isOpen, onClose, isMatch, currentUserId, onUpdateFriend }: FriendDetailModalProps) => {
  const navigate = useNavigate();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditingBirthday, setIsEditingBirthday] = useState(false);
  const [selectedBirthday, setSelectedBirthday] = useState<Date | undefined>(
    friend?.birthday ? new Date(friend.birthday) : undefined
  );
  const { toast } = useToast();

  if (!friend) return null;

  const categoryInfo = friend.category ? CATEGORY_INFO[friend.category] : null;
  const gradient = friend.category ? categoryGradients[friend.category] : 'from-gray-400 to-gray-500';
  const initials = friend.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  const handleBirthdayChange = async (date: Date | undefined) => {
    if (!date || !currentUserId) return;
    
    setSelectedBirthday(date);
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
      onUpdateFriend?.(friend.id, { birthday: dateStr });
    }
    setIsEditingBirthday(false);
  };

  const handleWriteClick = () => {
    setIsActionsOpen(true);
  };

  const handleChatClick = () => {
    if (friend.friendUserId) {
      setIsChatOpen(true);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md p-0 overflow-hidden bg-card border-0 rounded-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto" hideClose>
          {/* Header with gradient */}
          <div className={`bg-gradient-to-br ${gradient} p-4 sm:p-6 pb-12 sm:pb-16 relative`}>
            <DialogHeader className="relative z-10">
              <button
                onClick={onClose}
                className="absolute right-0 top-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <DialogTitle className="text-white text-base sm:text-lg font-semibold">Профиль друга</DialogTitle>
            </DialogHeader>
          </div>

          {/* Avatar overlay */}
          <div className="flex justify-center -mt-10 sm:-mt-12 relative z-10">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-card flex items-center justify-center text-white font-bold text-xl sm:text-2xl bg-gradient-to-br ${gradient} shadow-card ${isMatch ? 'animate-pulse-glow' : ''}`}>
              {friend.avatar ? (
                <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 pt-3 sm:pt-4">
            {/* Name and category */}
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">{friend.name}</h2>
              {categoryInfo && (
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary">
                  <span className="text-base sm:text-lg">{categoryInfo.emoji}</span>
                  <span className="font-medium text-secondary-foreground text-sm sm:text-base">{categoryInfo.label}</span>
                </div>
              )}
              {isMatch && (
                <div className="mt-2 sm:mt-3 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Идеальное совпадение!</span>
                </div>
              )}
            </div>

            {/* Description */}
            {friend.description && (
              <div className="bg-secondary/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4">
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {friend.description}
                </p>
              </div>
            )}

            {/* Analysis */}
            {friend.analysis && (
              <div className="bg-primary/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 border border-primary/20">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="font-medium text-xs sm:text-sm text-foreground">Анализ совместимости</span>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {friend.analysis}
                </p>
              </div>
            )}

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {/* Birthday - always show with edit option */}
              <Popover open={isEditingBirthday} onOpenChange={setIsEditingBirthday}>
                <PopoverTrigger asChild>
                  <button className="bg-pink-50 dark:bg-pink-950/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-left hover:bg-pink-100 dark:hover:bg-pink-950/50 transition-colors group">
                    <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                        <span className="text-xs sm:text-sm text-muted-foreground">День рождения</span>
                      </div>
                      <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="font-medium text-foreground text-sm sm:text-base">
                      {selectedBirthday ? format(selectedBirthday, 'd MMMM yyyy', { locale: ru }) : 'Не указано'}
                    </p>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedBirthday}
                    onSelect={handleBirthdayChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    captionLayout="dropdown-buttons"
                    fromYear={1920}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              </Popover>
              
              {friend.lastInteraction && (
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Последнее общение</span>
                  </div>
                  <p className="font-medium text-foreground text-sm sm:text-base">{formatDate(friend.lastInteraction)}</p>
                </div>
              )}
            </div>

            {/* Important dates section */}
            {currentUserId && (
              <div className="bg-secondary/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                <FriendDatesSection friendId={friend.id} ownerId={currentUserId} />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 sm:gap-3">
              <Button 
                onClick={handleWriteClick}
                variant="outline"
                className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                Действия
              </Button>
              {friend.friendUserId && (
                <Button 
                  onClick={handleChatClick}
                  className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm sm:text-base"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                  Написать
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Actions Modal */}
      <FriendActionsModal
        friend={friend}
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
      />

      {/* Chat Modal */}
      <ChatModal
        friend={friend}
        friendUserId={friend.friendUserId || null}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUserId={currentUserId || null}
      />
    </>
  );
};
