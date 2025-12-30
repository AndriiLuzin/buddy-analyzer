import { useState } from 'react';
import { FriendCategory, UserProfile } from '../types';

interface ClassificationResult {
  category: FriendCategory;
  description: string;
  analysis?: string;
}

// Simple local classification based on answers
// In production, this would call an AI API
const classifyFromAnswers = (answers: number[]): ClassificationResult => {
  // Calculate average score (0-3 scale per question)
  const avgScore = answers.reduce((sum, a) => sum + a, 0) / answers.length;
  
  // Lower scores indicate deeper, more committed friendship style
  // Higher scores indicate more casual approach
  
  let category: FriendCategory;
  let description: string;
  
  if (avgScore < 0.8) {
    category = 'soul_mate';
    description = 'Вы — настоящий друг "до конца". Ваша преданность и эмоциональная глубина создают связи, которые длятся всю жизнь. Вы готовы на всё ради близких людей и цените искренность превыше всего.';
  } else if (avgScore < 1.4) {
    category = 'close_friend';
    description = 'Вы формируете крепкие, доверительные отношения. Ваши друзья знают, что могут на вас положиться в важные моменты. Вы балансируете между глубиной связи и уважением к личным границам.';
  } else if (avgScore < 2.0) {
    category = 'good_buddy';
    description = 'Вы — отличный компаньон для совместных занятий и веселья. Ваш позитивный настрой и лёгкость в общении делают вас желанным гостем в любой компании. Вы цените качественно проведённое время.';
  } else if (avgScore < 2.6) {
    category = 'situational';
    description = 'Вы предпочитаете контекстуальные связи — дружба для вас строится вокруг общих интересов или обстоятельств. Это практичный подход, который помогает поддерживать много полезных контактов.';
  } else {
    category = 'distant';
    description = 'Вы цените независимость и предпочитаете поддерживать дистанцию. Это не значит, что вы не способны на глубокие связи — просто вы тщательно выбираете, кому открываться.';
  }
  
  return { category, description };
};

export const useFriendClassifier = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classifyUser = async (answers: number[]): Promise<UserProfile> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = classifyFromAnswers(answers);
      
      return {
        category: result.category,
        description: result.description,
        completedAt: new Date().toISOString()
      };
    } catch (err) {
      setError('Не удалось проанализировать ответы');
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
