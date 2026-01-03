import { useState } from 'react';
import { FriendCategory, UserProfile, PersonalityProfile } from '../types';
import { classifyPersonality, getPersonalityDescription } from '@/lib/personalityClassifier';
import { Language } from '@/i18n/translations';

interface ClassificationResult {
  category: FriendCategory;
  description: string;
  personality: PersonalityProfile;
}

// Classification based on answers with personality analysis
const classifyFromAnswers = (answers: number[], language: Language = 'en'): ClassificationResult => {
  // Calculate personality profile
  const personality = classifyPersonality(answers, language);
  
  // Calculate average score for friendship category (0-3 scale per question)
  const avgScore = answers.reduce((sum, a) => sum + a, 0) / answers.length;
  
  let category: FriendCategory;
  
  if (avgScore < 0.8) {
    category = 'soul_mate';
  } else if (avgScore < 1.4) {
    category = 'close_friend';
  } else if (avgScore < 2.0) {
    category = 'good_buddy';
  } else if (avgScore < 2.6) {
    category = 'situational';
  } else {
    category = 'distant';
  }
  
  // Generate description based on personality
  const description = getPersonalityDescription(personality, language);
  
  return { category, description, personality };
};

export const useFriendClassifier = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classifyUser = async (answers: number[], language: Language = 'en'): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = classifyFromAnswers(answers, language);
      
      return {
        category: result.category,
        description: result.description,
        completedAt: new Date().toISOString(),
        personality: result.personality
      };
    } catch (err) {
      setError('Failed to analyze answers');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    classifyUser,
    isLoading,
    error
  };
};
