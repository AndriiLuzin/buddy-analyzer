import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Friend, FriendCategory } from '../types';
import { CATEGORY_INFO } from '../constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, Heart, MessageCircle, Calendar, Sparkles, Send } from 'lucide-react';
import { FriendActionsModal } from './FriendActionsModal';
import { ChatModal } from './ChatModal';
import { supabase } from '@/integrations/supabase/client';

interface FriendDetailModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  isMatch?: boolean;
  currentUserId?: string | null;
}

const categoryGradients: Record<FriendCategory, string> = {
  soul_mate: 'from-amber-400 to-orange-500',
  close_friend: 'from-orange-400 to-rose-500',
  good_buddy: 'from-teal-400 to-cyan-500',
  situational: 'from-blue-400 to-indigo-500',
  distant: 'from-slate-400 to-gray-500'
};

export const FriendDetailModal = ({ friend, isOpen, onClose, isMatch, currentUserId }: FriendDetailModalProps) => {
  const navigate = useNavigate();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (!friend) return null;

  const categoryInfo = friend.category ? CATEGORY_INFO[friend.category] : null;
  const gradient = friend.category ? categoryGradients[friend.category] : 'from-gray-400 to-gray-500';
  const initials = friend.name.split(' ').map(n => n[0]).join('').toUpperCase();

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
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
        <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-0 rounded-3xl" hideClose>
          {/* Header with gradient */}
          <div className={`bg-gradient-to-br ${gradient} p-6 pb-16 relative`}>
            <DialogHeader className="relative z-10">
              <button
                onClick={onClose}
                className="absolute right-0 top-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <DialogTitle className="text-white text-lg font-semibold">Профиль друга</DialogTitle>
            </DialogHeader>
          </div>

          {/* Avatar overlay */}
          <div className="flex justify-center -mt-12 relative z-10">
            <div className={`w-24 h-24 rounded-full border-4 border-card flex items-center justify-center text-white font-bold text-2xl bg-gradient-to-br ${gradient} shadow-card ${isMatch ? 'animate-pulse-glow' : ''}`}>
              {friend.avatar ? (
                <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 pt-4">
            {/* Name and category */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">{friend.name}</h2>
              {categoryInfo && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
                  <span className="text-lg">{categoryInfo.emoji}</span>
                  <span className="font-medium text-secondary-foreground">{categoryInfo.label}</span>
                </div>
              )}
              {isMatch && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Идеальное совпадение!</span>
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

            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {friend.birthday && (
                <div className="bg-pink-50 dark:bg-pink-950/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-pink-500" />
                    <span className="text-xs text-muted-foreground">День рождения</span>
                  </div>
                  <p className="font-medium text-foreground text-sm">{formatDate(friend.birthday)}</p>
                </div>
              )}
              {friend.lastInteraction && (
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Последнее общение</span>
                  </div>
                  <p className="font-medium text-foreground text-sm">{formatDate(friend.lastInteraction)}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={handleWriteClick}
                variant="outline"
                className="flex-1 h-12 rounded-xl font-medium"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Шаблоны
              </Button>
              {friend.friendUserId && (
                <Button 
                  onClick={handleChatClick}
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  <Send className="w-5 h-5 mr-2" />
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
