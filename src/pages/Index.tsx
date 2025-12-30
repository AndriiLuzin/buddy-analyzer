import { useState, useEffect } from 'react';
import { Screen, Friend, UserProfile } from '../types';
import { MOCK_FRIENDS } from '../data/mockFriends';
import { QuizScreen } from '../components/QuizScreen';
import { LoadingScreen } from '../components/LoadingScreen';
import { ProfileResultScreen } from '../components/ProfileResultScreen';
import { FriendListScreen } from '../components/FriendListScreen';
import { useFriendClassifier } from '../hooks/useFriendClassifier';

const STORAGE_KEYS = {
  USER_PROFILE: 'friendify_user_profile',
  FRIENDS: 'friendify_friends'
};

const Index = () => {
  const [screen, setScreen] = useState<Screen>('loading');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const { classifyUser, isLoading } = useFriendClassifier();

  // Initialize app
  useEffect(() => {
    const initApp = () => {
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
  }, []);

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

  const handleContinueToList = () => {
    setScreen('list');
  };

  const handleViewProfile = () => {
    if (userProfile) {
      setScreen('userProfileResult');
    }
  };

  // Render loading screen
  if (screen === 'loading' || isLoading) {
    return <LoadingScreen />;
  }

  // Render quiz screen
  if (screen === 'userQuiz') {
    return <QuizScreen onComplete={handleQuizComplete} />;
  }

  // Render profile result screen
  if (screen === 'userProfileResult' && userProfile) {
    return (
      <ProfileResultScreen
        profile={userProfile}
        onContinue={handleContinueToList}
      />
    );
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
