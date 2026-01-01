import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Friend, FriendCategory } from '../types';
import { CATEGORY_INFO } from '../constants';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, MessageCircle, Calendar, Sparkles, Send, Gift } from 'lucide-react';
import { ChatModal } from '@/components/ChatModal';
import { FriendDatesSection } from '@/components/FriendDatesSection';
import { supabase } from '@/integrations/supabase/client';

const categoryGradients: Record<FriendCategory, string> = {
  soul_mate: 'from-amber-400 to-orange-500',
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userCategory, setUserCategory] = useState<FriendCategory | null>(null);

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
        .single();

      if (profileData?.category) {
        setUserCategory(profileData.category as FriendCategory);
      }

      // Fetch friend data
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .eq('id', friendId)
        .eq('owner_id', session.user.id)
        .single();

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
      });
      setIsLoading(false);
    };

    fetchFriend();
  }, [friendId, navigate]);

  if (isLoading || !friend) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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

  const handleActionsClick = () => {
    navigate(`/friend/${friendId}/actions`);
  };

  const handleChatClick = () => {
    if (friend.friendUserId) {
      setIsChatOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
          <div className="w-10" />
        </div>
      </div>

      {/* Avatar overlay */}
      <div className="flex justify-center -mt-12 sm:-mt-14 relative z-10">
        <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-background flex items-center justify-center text-white font-bold text-2xl sm:text-3xl bg-gradient-to-br ${gradient} shadow-lg ${isMatch ? 'animate-pulse-glow' : ''}`}>
          {initials}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 pt-4 pb-24">
        {/* Category badges */}
        <div className="text-center mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {categoryInfo && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
                <span className="text-lg">{categoryInfo.emoji}</span>
                <span className="font-medium text-secondary-foreground">{categoryInfo.label}</span>
              </div>
            )}
            {isMatch && (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Идеальное совпадение!</span>
              </div>
            )}
          </div>
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
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-muted-foreground">Последнее общение</span>
              </div>
              <p className="font-medium text-foreground text-base">{formatDate(friend.lastInteraction)}</p>
            </div>
          )}
          {friend.birthday && (
            <div className="bg-pink-50 dark:bg-pink-950/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-5 h-5 text-pink-500" />
                <span className="text-sm text-muted-foreground">День рождения</span>
              </div>
              <p className="font-medium text-foreground text-base">{formatDate(friend.birthday)}</p>
            </div>
          )}
          
          {/* Important dates section */}
          {currentUserId && (
            <FriendDatesSection friendId={friend.id} ownerId={currentUserId} />
          )}
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border safe-area-bottom">
          <div className="flex gap-3 max-w-lg mx-auto">
            <Button 
              onClick={handleActionsClick}
              variant="outline"
              className="flex-1 h-12 rounded-xl font-medium"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Действия
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
      </div>

      {/* Chat Modal */}
      <ChatModal
        friend={friend}
        friendUserId={friend.friendUserId || null}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUserId={currentUserId}
      />
    </div>
  );
}
