import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Friend, FriendCategory, UserProfile } from '../types';
import { FriendCard } from './FriendCard';
import { BirthdayReminder } from './BirthdayReminder';

import { CategoryFilter } from './CategoryFilter';
import { FloatingActionMenu } from './FloatingActionMenu';
import { ShareModal } from './ShareModal';
import { ThemeToggle } from './ThemeToggle';
import { CATEGORY_INFO } from '../constants';
import { Search, UserPlus, X, Bell, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState as useStateHook, useEffect as useEffectHook } from 'react';

interface FriendListScreenProps {
  friends: Friend[];
  userProfile: UserProfile | null;
  onViewProfile: () => void;
  userId?: string;
}

// Разрешённые email адреса для доступа в админку
const ADMIN_EMAILS = ['andrii@luzin.ca'];

export const FriendListScreen = ({ friends, userProfile, onViewProfile, userId }: FriendListScreenProps) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<FriendCategory | 'all'>('all');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Проверяем админ доступ
  useEffectHook(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && ADMIN_EMAILS.includes(session.user.email || '')) {
        setIsAdmin(true);
      }
    };
    checkAdmin();
  }, []);

  const filteredFriends = friends.filter(friend => {
    const matchesCategory = selectedCategory === 'all' || friend.category === selectedCategory;
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group friends by category for display
  const categoryOrder: FriendCategory[] = ['soul_mate', 'close_friend', 'good_buddy', 'situational', 'distant'];
  
  const groupedFriends = categoryOrder.reduce((acc, category) => {
    const friendsInCategory = filteredFriends.filter(f => f.category === category);
    if (friendsInCategory.length > 0) {
      acc.push({ category, friends: friendsInCategory });
    }
    return acc;
  }, [] as { category: FriendCategory; friends: Friend[] }[]);

  const handleFriendClick = (friend: Friend) => {
    navigate(`/friend/${friend.id}`);
  };

  const isMatch = (friend: Friend) => {
    return userProfile && friend.category === userProfile.category;
  };

  const userCategoryInfo = userProfile ? CATEGORY_INFO[userProfile.category] : null;

  return (
    <div className="h-[100dvh] animate-fade-in flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground">BuddyBe</h1>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:opacity-70 transition-opacity"
            >
              {isSearchOpen ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Search className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            {isAdmin && (
              <button 
                onClick={() => navigate('/admin')}
                className="p-2 hover:opacity-70 transition-opacity"
              >
                <Shield className="w-5 h-5 text-primary" />
              </button>
            )}
            <button 
              onClick={() => navigate('/notifications')}
              className="p-2 hover:opacity-70 transition-opacity relative"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Search - toggleable */}
        {isSearchOpen && (
          <div className="relative mb-4 animate-fade-in">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск друзей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        )}

        {/* Category Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto min-h-0 px-4 pt-4 pb-24">
        {/* Birthday Reminder - only show on 'all' tab */}
        {selectedCategory === 'all' && <BirthdayReminder friends={friends} />}

        {/* Friends List - Grouped by Category */}
        <div className="space-y-4">
          {groupedFriends.length > 0 ? (
            groupedFriends.map((group) => {
              const categoryInfo = CATEGORY_INFO[group.category];
              return (
                <div key={group.category} className="space-y-2">
                  {/* Category Header */}
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {categoryInfo.label}
                  </h3>
                  
                  {/* Friends in this category */}
                  <div className="space-y-2">
                    {group.friends.map((friend, index) => (
                      <div key={friend.id} style={{ animationDelay: `${index * 0.05}s` }}>
                        <FriendCard
                          friend={friend}
                          onClick={() => handleFriendClick(friend)}
                          isMatch={isMatch(friend)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-2">Друзья не найдены</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'Попробуйте изменить запрос' : 'Пригласите друзей пройти тест'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Menu */}
      <FloatingActionMenu
        onAnalyzeClick={() => setIsShareOpen(true)}
        onProfileClick={onViewProfile}
      />


      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        userId={userId}
      />
    </div>
  );
};
