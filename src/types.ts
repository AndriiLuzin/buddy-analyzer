export type FriendCategory = 
  | 'soul_mate'      // Душа в душу
  | 'family'         // Семья
  | 'close_friend'   // Близкий друг
  | 'good_buddy'     // Хороший приятель
  | 'situational'    // Ситуативный знакомый
  | 'distant';       // Дальний знакомый

// Personality dimensions
export type SocialStyle = 'extrovert' | 'ambivert' | 'introvert';
export type DecisionStyle = 'analytical' | 'balanced' | 'creative';
export type EnergyStyle = 'active' | 'moderate' | 'calm';
export type LeadershipStyle = 'leader' | 'collaborator' | 'supporter';

export interface PersonalityProfile {
  socialStyle: SocialStyle;
  decisionStyle: DecisionStyle;
  energyStyle: EnergyStyle;
  leadershipStyle: LeadershipStyle;
  personalityType: string; // e.g., "АКТИВНЫЙ ЛИДЕР", "ТВОРЧЕСКИЙ ИНТРОВЕРТ"
  traits: string[]; // Key personality traits
}

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
  friendUserId?: string;
  personality?: PersonalityProfile;
}

export interface UserProfile {
  category: FriendCategory;
  description: string;
  completedAt: string;
  personality?: PersonalityProfile;
}

export type Screen = 'auth' | 'friendRegistration' | 'userQuiz' | 'userProfileResult' | 'list' | 'loading' | 'friendQuiz' | 'accountPrompt';

export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
}
