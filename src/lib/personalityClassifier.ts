import { 
  PersonalityProfile, 
  SocialStyle, 
  DecisionStyle, 
  EnergyStyle, 
  LeadershipStyle 
} from '@/types';
import { Language } from '@/i18n/translations';
import { 
  getTranslatedPersonalityType, 
  getTranslatedTraits, 
  getTranslatedDescription 
} from './personalityTranslations';

interface DimensionScore {
  social: number; // 0 = extrovert, 3 = introvert
  decision: number; // 0 = analytical, 3 = creative
  energy: number; // 0 = active, 3 = calm
  leadership: number; // 0 = leader, 3 = supporter
}

// Map quiz question indices to personality dimensions
// Questions are designed to measure different aspects
const QUESTION_DIMENSION_MAP: Record<number, keyof DimensionScore> = {
  0: 'social',      // Meeting new people / group work
  1: 'energy',      // What you do alone / stress handling
  2: 'decision',    // Handling failures / planning
  3: 'decision',    // Trying new things / decision making
  4: 'leadership',  // Role in group / social situations
  5: 'social',      // Empathy / criticism handling
  6: 'social',      // Center of attention / communication
  7: 'decision',    // Problem solving
  8: 'energy',      // What makes happy / competitiveness
  9: 'leadership',  // Surprises / motivation
};

const calculateDimensionScores = (answers: number[]): DimensionScore => {
  const scores: DimensionScore = {
    social: 0,
    decision: 0,
    energy: 0,
    leadership: 0
  };
  
  const counts: DimensionScore = {
    social: 0,
    decision: 0,
    energy: 0,
    leadership: 0
  };

  answers.forEach((answer, index) => {
    const dimension = QUESTION_DIMENSION_MAP[index];
    if (dimension) {
      scores[dimension] += answer;
      counts[dimension]++;
    }
  });

  // Normalize scores by dividing by count
  return {
    social: counts.social > 0 ? scores.social / counts.social : 1.5,
    decision: counts.decision > 0 ? scores.decision / counts.decision : 1.5,
    energy: counts.energy > 0 ? scores.energy / counts.energy : 1.5,
    leadership: counts.leadership > 0 ? scores.leadership / counts.leadership : 1.5
  };
};

const getSocialStyle = (score: number): SocialStyle => {
  if (score < 1.0) return 'extrovert';
  if (score < 2.0) return 'ambivert';
  return 'introvert';
};

const getDecisionStyle = (score: number): DecisionStyle => {
  if (score < 1.0) return 'analytical';
  if (score < 2.0) return 'balanced';
  return 'creative';
};

const getEnergyStyle = (score: number): EnergyStyle => {
  if (score < 1.0) return 'active';
  if (score < 2.0) return 'moderate';
  return 'calm';
};

const getLeadershipStyle = (score: number): LeadershipStyle => {
  if (score < 1.0) return 'leader';
  if (score < 2.0) return 'collaborator';
  return 'supporter';
};

const getPersonalityTypeKey = (
  social: SocialStyle, 
  decision: DecisionStyle, 
  energy: EnergyStyle, 
  leadership: LeadershipStyle
): string => {
  return `${social}-${decision}-${energy}-${leadership}`;
};

export const classifyPersonality = (answers: number[], language: Language = 'en'): PersonalityProfile => {
  const scores = calculateDimensionScores(answers);
  
  const socialStyle = getSocialStyle(scores.social);
  const decisionStyle = getDecisionStyle(scores.decision);
  const energyStyle = getEnergyStyle(scores.energy);
  const leadershipStyle = getLeadershipStyle(scores.leadership);
  
  const typeKey = getPersonalityTypeKey(socialStyle, decisionStyle, energyStyle, leadershipStyle);
  const personalityType = getTranslatedPersonalityType(typeKey, language);
  const traits = getTranslatedTraits(socialStyle, decisionStyle, energyStyle, leadershipStyle, language);
  
  return {
    socialStyle,
    decisionStyle,
    energyStyle,
    leadershipStyle,
    personalityType,
    traits
  };
};

export const getPersonalityDescription = (personality: PersonalityProfile, language: Language = 'en'): string => {
  const { socialStyle, decisionStyle, energyStyle, leadershipStyle } = personality;
  return getTranslatedDescription(socialStyle, decisionStyle, energyStyle, leadershipStyle, language);
};

// Localized labels for UI display
export const PERSONALITY_LABELS: Record<string, Record<string, Record<string, string>>> = {
  socialStyle: {
    extrovert: { ru: 'Экстраверт', en: 'Extrovert', fr: 'Extraverti', es: 'Extrovertido', pt: 'Extrovertido', uk: 'Екстраверт', ko: '외향적', zh: '外向', emoji: '🌟' },
    ambivert: { ru: 'Амбиверт', en: 'Ambivert', fr: 'Ambivert', es: 'Ambivertido', pt: 'Ambivertido', uk: 'Амбіверт', ko: '양향적', zh: '中性', emoji: '⚖️' },
    introvert: { ru: 'Интроверт', en: 'Introvert', fr: 'Introverti', es: 'Introvertido', pt: 'Introvertido', uk: 'Інтроверт', ko: '내향적', zh: '内向', emoji: '🌙' }
  },
  decisionStyle: {
    analytical: { ru: 'Аналитик', en: 'Analytical', fr: 'Analytique', es: 'Analítico', pt: 'Analítico', uk: 'Аналітик', ko: '분석적', zh: '分析型', emoji: '🧠' },
    balanced: { ru: 'Сбалансированный', en: 'Balanced', fr: 'Équilibré', es: 'Equilibrado', pt: 'Equilibrado', uk: 'Збалансований', ko: '균형 잡힌', zh: '平衡型', emoji: '🎯' },
    creative: { ru: 'Творец', en: 'Creative', fr: 'Créatif', es: 'Creativo', pt: 'Criativo', uk: 'Творець', ko: '창의적', zh: '创意型', emoji: '🎨' }
  },
  energyStyle: {
    active: { ru: 'Активный', en: 'Active', fr: 'Actif', es: 'Activo', pt: 'Ativo', uk: 'Активний', ko: '활동적', zh: '活跃', emoji: '⚡' },
    moderate: { ru: 'Умеренный', en: 'Moderate', fr: 'Modéré', es: 'Moderado', pt: 'Moderado', uk: 'Помірний', ko: '적당한', zh: '适度', emoji: '🌊' },
    calm: { ru: 'Спокойный', en: 'Calm', fr: 'Calme', es: 'Tranquilo', pt: 'Calmo', uk: 'Спокійний', ko: '차분한', zh: '冷静', emoji: '🍃' }
  },
  leadershipStyle: {
    leader: { ru: 'Лидер', en: 'Leader', fr: 'Leader', es: 'Líder', pt: 'Líder', uk: 'Лідер', ko: '리더', zh: '领导者', emoji: '👑' },
    collaborator: { ru: 'Партнёр', en: 'Collaborator', fr: 'Collaborateur', es: 'Colaborador', pt: 'Colaborador', uk: 'Партнер', ko: '협력자', zh: '合作者', emoji: '🤝' },
    supporter: { ru: 'Помощник', en: 'Supporter', fr: 'Supporteur', es: 'Apoyo', pt: 'Apoiador', uk: 'Помічник', ko: '지지자', zh: '支持者', emoji: '💪' }
  }
};
