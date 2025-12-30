import { useState, useEffect } from 'react';
import { Screen, Friend, UserProfile } from '../types';
import { MOCK_FRIENDS } from '../data/mockFriends';
import { QuizScreen } from '../components/QuizScreen';
import { LoadingScreen } from '../components/LoadingScreen';
import { ProfileResultScreen } from '../components/ProfileResultScreen';
import { FriendListScreen } from '../components/FriendListScreen';
import { NotificationsPage } from './Notifications';
import { AuthScreen } from '../components/AuthScreen';
import { useFriendClassifier } from '../hooks/useFriendClassifier';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const STORAGE_KEYS = {
  USER_PROFILE: 'buddybe_user_profile',
  FRIENDS: 'buddybe_friends'
};

interface IndexProps {
  initialRoute?: 'notifications';
}

const Index = ({ initialRoute }: IndexProps) => {
  const [screen, setScreen] = useState<Screen>('loading');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { classifyUser, isLoading } = useFriendClassifier();

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize app based on auth state
  useEffect(() => {
    const initApp = () => {
      // If no user is logged in, show auth screen
      if (user === null && session === null) {
        // Check if we've completed initial auth check
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            setScreen('auth');
          }
        });
        return;
      }

      // Load user profile
      const savedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }

      // Load friends or use mock data
      const savedFriends = localStorage.getItem(STORAGE_KEYS.FRIENDS);
      if (savedFriends) {
        setFriends(JSON.parse(savedFriends));
      } else {
        setFriends(MOCK_FRIENDS);
        localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(MOCK_FRIENDS));
      }

      // Determine initial screen
      if (savedProfile) {
        setScreen('list');
      } else {
        setScreen('userQuiz');
      }
    };

    // Small delay for smooth initial load
    setTimeout(initApp, 500);
  }, [user, session]);

  const handleQuizComplete = async (answers: number[]) => {
    setScreen('loading');
    
    try {
      const profile = await classifyUser(answers);
      setUserProfile(profile);
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      setScreen('userProfileResult');
    } catch (error) {
      console.error('Classification error:', error);
      setScreen('userQuiz');
    }
  };

  const handleAuthSuccess = () => {
    setScreen('userQuiz');
  };

  const handleContinueToList = () => {
    setScreen('list');
  };

  const handleViewProfile = () => {
    if (userProfile) {
      setScreen('userProfileResult');
    }
  };

  const handleUpdateFriend = (friendId: string, updates: Partial<Friend>) => {
    const updatedFriends = friends.map(f => 
      f.id === friendId ? { ...f, ...updates } : f
    );
    setFriends(updatedFriends);
    localStorage.setItem(STORAGE_KEYS.FRIENDS, JSON.stringify(updatedFriends));
  };

  // Render auth screen
  if (screen === 'auth') {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Render loading screen
  if (screen === 'loading' || isLoading) {
    return <LoadingScreen />;
  }

  // Render quiz screen
  if (screen === 'userQuiz') {
    return <QuizScreen onComplete={handleQuizComplete} />;
  }

  const handleLogout = () => {
    setUser(null);
    setSession(null);
    setUserProfile(null);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.FRIENDS);
    setScreen('auth');
  };

  // Render profile result screen
  if (screen === 'userProfileResult' && userProfile) {
    return (
      <ProfileResultScreen
        profile={userProfile}
        onContinue={handleContinueToList}
        friends={friends}
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // Render notifications page
  if (initialRoute === 'notifications') {
    return <NotificationsPage friends={friends} onUpdateFriend={handleUpdateFriend} />;
  }

  // Render friend list screen
  if (screen === 'list') {
    return (
      <FriendListScreen
        friends={friends}
        userProfile={userProfile}
        onViewProfile={handleViewProfile}
      />
    );
  }

  return null;
};

export default Index;
