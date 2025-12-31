import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Screen, Friend, UserProfile } from '../types';
import { MOCK_FRIENDS } from '../data/mockFriends';
import { QuizScreen } from '../components/QuizScreen';
import { LoadingScreen } from '../components/LoadingScreen';
import { ProfileResultScreen } from '../components/ProfileResultScreen';
import { FriendListScreen } from '../components/FriendListScreen';
import { NotificationsPage } from './Notifications';
import { AuthScreen } from '../components/AuthScreen';
import { FriendRegistrationScreen } from '../components/FriendRegistrationScreen';
import { CreateAccountPrompt } from '../components/CreateAccountPrompt';
import { useFriendClassifier } from '../hooks/useFriendClassifier';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';

const STORAGE_KEYS = {
  USER_PROFILE: 'buddybe_user_profile',
  FRIENDS: 'buddybe_friends'
};

interface FriendInfo {
  firstName: string;
  lastName: string;
  birthday: Date | undefined;
}

interface IndexProps {
  initialRoute?: 'notifications';
}

const Index = ({ initialRoute }: IndexProps) => {
  const [searchParams] = useSearchParams();
  const referrerId = searchParams.get('ref');
  
  const [screen, setScreen] = useState<Screen>('loading');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [friendInfo, setFriendInfo] = useState<FriendInfo | null>(null);
  const [referrerName, setReferrerName] = useState<string>('');
  const [pendingQuizAnswers, setPendingQuizAnswers] = useState<number[] | null>(null);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const { classifyUser, isLoading } = useFriendClassifier();
  const { toast } = useToast();
  const { t } = useLanguage();

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

  // Fetch referrer info if ref param exists
  useEffect(() => {
    const fetchReferrer = async () => {
      if (referrerId) {
        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', referrerId)
          .maybeSingle();
        
        if (data) {
          setReferrerName(`${data.first_name} ${data.last_name}`);
        }
      }
    };
    fetchReferrer();
  }, [referrerId]);

  // Initialize app based on auth state
  useEffect(() => {
    const initApp = () => {
      // If no user is logged in, show auth screen or friend registration
      if (user === null && session === null) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            // If coming from a referral link, show friend registration
            if (referrerId) {
              setScreen('friendRegistration');
            } else {
              setScreen('auth');
            }
          }
        });
        return;
      }

      // Load user profile from DB
      loadUserProfile();
    };

    setTimeout(initApp, 500);
  }, [user, session, referrerId]);

  const loadUserProfile = async () => {
    if (!user) return;

    // Try to get profile from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile && profile.category) {
      setUserProfile({
        category: profile.category as any,
        description: profile.description || '',
        completedAt: profile.created_at
      });
      
      // Load friends from database
      await loadFriendsFromDB();
      setScreen('list');
    } else {
      setScreen('userQuiz');
    }
  };

  const loadFriendsFromDB = async () => {
    if (!user) return;

    const { data: dbFriends } = await supabase
      .from('friends')
      .select('*')
      .eq('owner_id', user.id);

    if (dbFriends && dbFriends.length > 0) {
      const mappedFriends: Friend[] = dbFriends.map(f => ({
        id: f.id,
        name: `${f.friend_name} ${f.friend_last_name}`,
        birthday: f.friend_birthday || undefined,
        category: f.friend_category as any,
        description: f.friend_description || undefined,
        lastInteraction: f.last_interaction || undefined,
        quizAnswers: f.friend_quiz_answers || undefined,
        friendUserId: f.friend_user_id
      }));
      setFriends(mappedFriends);
    } else {
      // Use mock data if no friends yet
      setFriends(MOCK_FRIENDS);
    }
  };

  const handleFriendRegistration = (info: FriendInfo) => {
    setFriendInfo(info);
    setScreen('userQuiz'); // Go directly to quiz without auth
  };

  const handleAuthSuccess = async () => {
    // If we have pending quiz results from friend flow, save them now
    if (pendingQuizAnswers && pendingProfile && friendInfo && user) {
      // Save the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: friendInfo.firstName,
          last_name: friendInfo.lastName,
          birthday: friendInfo.birthday ? friendInfo.birthday.toISOString().split('T')[0] : null,
          category: pendingProfile.category,
          description: pendingProfile.description,
          quiz_answers: pendingQuizAnswers
        });

      if (profileError) {
        console.error('Error saving profile:', profileError);
      }

      // If this is a referred friend, add to referrer's friend list
      if (referrerId) {
        await addFriendToReferrer(pendingQuizAnswers, pendingProfile);
      }

      // Clear pending data
      setPendingQuizAnswers(null);
      setPendingProfile(null);
      setUserProfile(pendingProfile);
      setScreen('userProfileResult');
      return;
    }
    
    // Regular auth flow
    setScreen('userQuiz');
  };

  const addFriendToReferrer = async (answers: number[], profile: UserProfile, newUserId?: string) => {
    if (!friendInfo || !referrerId) return;

    // Get referrer's profile for matching and reverse friend creation
    const { data: referrerProfile } = await supabase
      .from('profiles')
      .select('quiz_answers, category, description, first_name, last_name, birthday')
      .eq('user_id', referrerId)
      .maybeSingle();

    // Calculate match score based on answer similarity
    let matchScore = 0;
    if (referrerProfile?.quiz_answers) {
      const referrerAnswers = referrerProfile.quiz_answers as number[];
      let matches = 0;
      for (let i = 0; i < Math.min(answers.length, referrerAnswers.length); i++) {
        if (answers[i] === referrerAnswers[i]) matches++;
      }
      matchScore = Math.round((matches / answers.length) * 100);
    }

    // Use provided userId or generate temporary one
    const friendUserId = newUserId || user?.id || crypto.randomUUID();

    // Add as friend to referrer (referrer sees the new user)
    await supabase
      .from('friends')
      .insert({
        owner_id: referrerId,
        friend_user_id: friendUserId,
        friend_name: friendInfo.firstName,
        friend_last_name: friendInfo.lastName,
        friend_birthday: friendInfo.birthday ? friendInfo.birthday.toISOString().split('T')[0] : null,
        friend_category: profile.category,
        friend_description: profile.description,
        friend_quiz_answers: answers,
        match_score: matchScore
      });

    // Create reverse friendship - add referrer as friend to the new user (new user sees referrer)
    // Only if the new user has an account
    if (newUserId && referrerProfile) {
      await supabase
        .from('friends')
        .insert({
          owner_id: newUserId,
          friend_user_id: referrerId,
          friend_name: referrerProfile.first_name,
          friend_last_name: referrerProfile.last_name || '',
          friend_birthday: referrerProfile.birthday || null,
          friend_category: referrerProfile.category || 'good_buddy',
          friend_description: referrerProfile.description || null,
          friend_quiz_answers: referrerProfile.quiz_answers || null,
          match_score: matchScore
        });
    }

    toast({
      title: t('friend_reg.added'),
      description: `${t('friend_reg.added_desc')} ${referrerName}`,
    });
  };

  const handleQuizComplete = async (answers: number[]) => {
    setScreen('loading');
    
    try {
      const profile = await classifyUser(answers);
      setUserProfile(profile);

      // If user is logged in, save immediately
      if (user) {
        await supabase
          .from('profiles')
          .update({
            category: profile.category,
            description: profile.description,
            quiz_answers: answers
          })
          .eq('user_id', user.id);

        // If this is a referred friend, add to referrer's friend list (with reverse friendship)
        if (referrerId && friendInfo) {
          await addFriendToReferrer(answers, profile, user.id);
        }

        setScreen('userProfileResult');
      } else {
        // User not logged in - this is the friend flow
        // Save pending data and add friend to referrer immediately (without account)
        if (referrerId && friendInfo) {
          await addFriendToReferrer(answers, profile);
        }
        
        // Store for later if they create account
        setPendingQuizAnswers(answers);
        setPendingProfile(profile);
        
        // Show account creation prompt
        setScreen('accountPrompt');
      }
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
    } else {
      // If no profile yet, redirect to quiz
      setScreen('userQuiz');
    }
  };

  const handleUpdateFriend = (friendId: string, updates: Partial<Friend>) => {
    const updatedFriends = friends.map(f => 
      f.id === friendId ? { ...f, ...updates } : f
    );
    setFriends(updatedFriends);
  };

  const handleLogout = () => {
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setFriendInfo(null);
    setScreen('auth');
  };

  const handleCreateAccount = () => {
    setScreen('auth');
  };

  const handleSkipAccount = () => {
    // Show profile result without saving to account
    if (pendingProfile) {
      setUserProfile(pendingProfile);
    }
    setScreen('userProfileResult');
  };

  const handleSkipQuiz = async () => {
    // Skip quiz and go directly to friend list
    // Create a default profile for the user
    if (user) {
      // Check if profile exists, if not create a minimal one
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            first_name: user.email?.split('@')[0] || 'User',
            last_name: '',
          });
      }
    }
    
    // Load friends and go to list
    await loadFriendsFromDB();
    setScreen('list');
  };

  // Render account prompt screen (after friend completes quiz)
  if (screen === 'accountPrompt') {
    return (
      <CreateAccountPrompt
        onCreateAccount={handleCreateAccount}
        onSkip={handleSkipAccount}
        referrerName={referrerName}
      />
    );
  }

  // Render friend registration screen (for referral links)
  if (screen === 'friendRegistration') {
    return (
      <FriendRegistrationScreen 
        onComplete={handleFriendRegistration}
        referrerName={referrerName}
      />
    );
  }

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
    // Show skip option only for regular users (not from referral)
    const showSkipOption = !referrerId && !!user;
    return (
      <QuizScreen 
        onComplete={handleQuizComplete} 
        onSkip={handleSkipQuiz}
        showSkip={showSkipOption}
      />
    );
  }

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
        userId={user?.id}
      />
    );
  }

  return null;
};

export default Index;
