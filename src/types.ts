export type FriendCategory = 
  | 'soul_mate'      // Душа в душу
  | 'close_friend'   // Близкий друг
  | 'good_buddy'     // Хороший приятель
  | 'situational'    // Ситуативный знакомый
  | 'distant';       // Дальний знакомый

export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  birthday?: string;
  category?: FriendCategory;
  description?: string;
  analysis?: string;
  lastInteraction?: string;
  quizAnswers?: number[];
  matchScore?: number;
}

export interface UserProfile {
  category: FriendCategory;
  description: string;
  completedAt: string;
}

export type Screen = 'auth' | 'friendRegistration' | 'userQuiz' | 'userProfileResult' | 'list' | 'loading' | 'friendQuiz' | 'accountPrompt';

export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
}
