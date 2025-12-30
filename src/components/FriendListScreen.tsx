import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Friend, FriendCategory, UserProfile } from '../types';
import { FriendCard } from './FriendCard';
import { BirthdayReminder } from './BirthdayReminder';

import { CategoryFilter } from './CategoryFilter';
import { FriendDetailModal } from './FriendDetailModal';
import { BottomNavBar } from './BottomNavBar';
import { ShareModal } from './ShareModal';
import { ThemeToggle } from './ThemeToggle';
import { CATEGORY_INFO } from '../constants';
import { Search, UserPlus, X, Bell } from 'lucide-react';

interface FriendListScreenProps {
  friends: Friend[];
  userProfile: UserProfile | null;
  onViewProfile: () => void;
}

export const FriendListScreen = ({ friends, userProfile, onViewProfile }: FriendListScreenProps) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<FriendCategory | 'all'>('all');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredFriends = friends.filter(friend => {
    const matchesCategory = selectedCategory === 'all' || friend.category === selectedCategory;
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFriendClick = (friend: Friend) => {
    setSelectedFriend(friend);
    setIsDetailOpen(true);
  };

  const isMatch = (friend: Friend) => {
    return userProfile && friend.category === userProfile.category;
  };

  const userCategoryInfo = userProfile ? CATEGORY_INFO[userProfile.category] : null;

  return (
    <div className="min-h-screen pb-28 animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-strong px-4 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Друзья</h1>
            <p className="text-sm text-muted-foreground">
              {friends.length} {friends.length === 1 ? 'друг' : friends.length < 5 ? 'друга' : 'друзей'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              {isSearchOpen ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Search className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <button 
              onClick={() => navigate('/notifications')}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors relative"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-destructive rounded-full" />
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
      <main className="px-4 pt-4">
        {/* Birthday Reminder */}
        <BirthdayReminder friends={friends} />

        {/* Friends List */}
        <div className="space-y-3">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend, index) => (
              <div key={friend.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <FriendCard
                  friend={friend}
                  onClick={() => handleFriendClick(friend)}
                  isMatch={isMatch(friend)}
                />
              </div>
            ))
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

      {/* Bottom Navigation */}
      <BottomNavBar
        onFriendsClick={() => {}}
        onAnalyzeClick={() => setIsShareOpen(true)}
        onProfileClick={onViewProfile}
      />

      {/* Friend Detail Modal */}
      <FriendDetailModal
        friend={selectedFriend}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        isMatch={selectedFriend ? isMatch(selectedFriend) : false}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
};
