import { 
  PersonalityProfile, 
  SocialStyle, 
  DecisionStyle, 
  EnergyStyle, 
  LeadershipStyle 
} from '@/types';

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

const PERSONALITY_TYPE_NAMES: Record<string, string> = {
  // Extrovert combinations
  'extrovert-analytical-active-leader': 'ЭНЕРГИЧНЫЙ СТРАТЕГ',
  'extrovert-analytical-active-collaborator': 'АКТИВНЫЙ АНАЛИТИК',
  'extrovert-analytical-active-supporter': 'НАДЁЖНЫЙ ПОМОЩНИК',
  'extrovert-analytical-moderate-leader': 'РАССУДИТЕЛЬНЫЙ ЛИДЕР',
  'extrovert-analytical-moderate-collaborator': 'КОМАНДНЫЙ ИГРОК',
  'extrovert-analytical-moderate-supporter': 'ПРЕДАННЫЙ ДРУГ',
  'extrovert-analytical-calm-leader': 'МУДРЫЙ НАСТАВНИК',
  'extrovert-analytical-calm-collaborator': 'ВДУМЧИВЫЙ ПАРТНЁР',
  'extrovert-analytical-calm-supporter': 'СПОКОЙНЫЙ СОВЕТНИК',
  
  'extrovert-balanced-active-leader': 'ХАРИЗМАТИЧНЫЙ ЛИДЕР',
  'extrovert-balanced-active-collaborator': 'ДУША КОМПАНИИ',
  'extrovert-balanced-active-supporter': 'ЭНТУЗИАСТ',
  'extrovert-balanced-moderate-leader': 'ДИПЛОМАТ',
  'extrovert-balanced-moderate-collaborator': 'УНИВЕРСАЛ',
  'extrovert-balanced-moderate-supporter': 'ОТЗЫВЧИВЫЙ ДРУГ',
  'extrovert-balanced-calm-leader': 'УРАВНОВЕШЕННЫЙ ЛИДЕР',
  'extrovert-balanced-calm-collaborator': 'ГАРМОНИЧНЫЙ ПАРТНЁР',
  'extrovert-balanced-calm-supporter': 'НАДЁЖНАЯ ОПОРА',
  
  'extrovert-creative-active-leader': 'ВДОХНОВИТЕЛЬ',
  'extrovert-creative-active-collaborator': 'ТВОРЧЕСКИЙ ЭНТУЗИАСТ',
  'extrovert-creative-active-supporter': 'КРЕАТИВНЫЙ ПОМОЩНИК',
  'extrovert-creative-moderate-leader': 'АРТИСТИЧНЫЙ ЛИДЕР',
  'extrovert-creative-moderate-collaborator': 'ТВОРЧЕСКАЯ ДУША',
  'extrovert-creative-moderate-supporter': 'ЭМПАТИЧНЫЙ ДРУГ',
  'extrovert-creative-calm-leader': 'МЕЧТАТЕЛЬ-ОРГАНИЗАТОР',
  'extrovert-creative-calm-collaborator': 'ВДУМЧИВЫЙ ТВОРЕЦ',
  'extrovert-creative-calm-supporter': 'ДОБРЫЙ МЕЧТАТЕЛЬ',

  // Ambivert combinations
  'ambivert-analytical-active-leader': 'ПРАКТИЧНЫЙ ЛИДЕР',
  'ambivert-analytical-active-collaborator': 'ЭФФЕКТИВНЫЙ ПАРТНЁР',
  'ambivert-analytical-active-supporter': 'ОТВЕТСТВЕННЫЙ ИСПОЛНИТЕЛЬ',
  'ambivert-analytical-moderate-leader': 'ВЗВЕШЕННЫЙ РУКОВОДИТЕЛЬ',
  'ambivert-analytical-moderate-collaborator': 'НАДЁЖНЫЙ КОЛЛЕГА',
  'ambivert-analytical-moderate-supporter': 'ВЕРНЫЙ СОРАТНИК',
  'ambivert-analytical-calm-leader': 'СТРАТЕГ',
  'ambivert-analytical-calm-collaborator': 'АНАЛИТИК',
  'ambivert-analytical-calm-supporter': 'МЫСЛИТЕЛЬ',
  
  'ambivert-balanced-active-leader': 'АДАПТИВНЫЙ ЛИДЕР',
  'ambivert-balanced-active-collaborator': 'АКТИВНЫЙ ПАРТНЁР',
  'ambivert-balanced-active-supporter': 'ЭНЕРГИЧНЫЙ ДРУГ',
  'ambivert-balanced-moderate-leader': 'ГИБКИЙ ЛИДЕР',
  'ambivert-balanced-moderate-collaborator': 'СБАЛАНСИРОВАННЫЙ',
  'ambivert-balanced-moderate-supporter': 'ПОНИМАЮЩИЙ ДРУГ',
  'ambivert-balanced-calm-leader': 'СПОКОЙНЫЙ ЛИДЕР',
  'ambivert-balanced-calm-collaborator': 'МИРОТВОРЕЦ',
  'ambivert-balanced-calm-supporter': 'ТИХАЯ ГАВАНЬ',
  
  'ambivert-creative-active-leader': 'ИННОВАТОР',
  'ambivert-creative-active-collaborator': 'ИЗОБРЕТАТЕЛЬ',
  'ambivert-creative-active-supporter': 'ФАНТАЗЁР',
  'ambivert-creative-moderate-leader': 'ТВОРЧЕСКИЙ ЛИДЕР',
  'ambivert-creative-moderate-collaborator': 'КРЕАТИВЩИК',
  'ambivert-creative-moderate-supporter': 'ХУДОЖНИК',
  'ambivert-creative-calm-leader': 'ФИЛОСОФ',
  'ambivert-creative-calm-collaborator': 'СОЗЕРЦАТЕЛЬ',
  'ambivert-creative-calm-supporter': 'МЕЧТАТЕЛЬ',

  // Introvert combinations
  'introvert-analytical-active-leader': 'ТИХИЙ ЛИДЕР',
  'introvert-analytical-active-collaborator': 'ЦЕЛЕУСТРЕМЛЁННЫЙ',
  'introvert-analytical-active-supporter': 'УСЕРДНЫЙ ПОМОЩНИК',
  'introvert-analytical-moderate-leader': 'ИНТЕЛЛЕКТУАЛ',
  'introvert-analytical-moderate-collaborator': 'ИССЛЕДОВАТЕЛЬ',
  'introvert-analytical-moderate-supporter': 'ЭКСПЕРТ',
  'introvert-analytical-calm-leader': 'МУДРЕЦ',
  'introvert-analytical-calm-collaborator': 'УЧЁНЫЙ',
  'introvert-analytical-calm-supporter': 'НАБЛЮДАТЕЛЬ',
  
  'introvert-balanced-active-leader': 'СФОКУСИРОВАННЫЙ ЛИДЕР',
  'introvert-balanced-active-collaborator': 'ИНДИВИДУАЛИСТ',
  'introvert-balanced-active-supporter': 'СКРЫТАЯ СИЛА',
  'introvert-balanced-moderate-leader': 'РЕФЛЕКСИВНЫЙ ЛИДЕР',
  'introvert-balanced-moderate-collaborator': 'ВДУМЧИВЫЙ ДРУГ',
  'introvert-balanced-moderate-supporter': 'ЧУТКИЙ СЛУШАТЕЛЬ',
  'introvert-balanced-calm-leader': 'СОЗИДАТЕЛЬ',
  'introvert-balanced-calm-collaborator': 'СПОКОЙНЫЙ ДРУГ',
  'introvert-balanced-calm-supporter': 'НАДЁЖНАЯ ТЕНЬ',
  
  'introvert-creative-active-leader': 'ВИЗИОНЕР',
  'introvert-creative-active-collaborator': 'ТВОРЕЦ',
  'introvert-creative-active-supporter': 'ВДОХНОВЛЁННЫЙ',
  'introvert-creative-moderate-leader': 'АРТИСТ',
  'introvert-creative-moderate-collaborator': 'ПОЭТ',
  'introvert-creative-moderate-supporter': 'РОМАНТИК',
  'introvert-creative-calm-leader': 'ГЛУБОКИЙ МЫСЛИТЕЛЬ',
  'introvert-creative-calm-collaborator': 'МИСТИК',
  'introvert-creative-calm-supporter': 'СОЗЕРЦАТЕЛЬНАЯ ДУША',
};

const getPersonalityTypeName = (
  social: SocialStyle, 
  decision: DecisionStyle, 
  energy: EnergyStyle, 
  leadership: LeadershipStyle
): string => {
  const key = `${social}-${decision}-${energy}-${leadership}`;
  return PERSONALITY_TYPE_NAMES[key] || 'УНИКАЛЬНАЯ ЛИЧНОСТЬ';
};

const getTraits = (
  social: SocialStyle,
  decision: DecisionStyle,
  energy: EnergyStyle,
  leadership: LeadershipStyle
): string[] => {
  const traits: string[] = [];
  
  // Social traits
  switch (social) {
    case 'extrovert':
      traits.push('Общительный', 'Открытый');
      break;
    case 'ambivert':
      traits.push('Адаптивный', 'Гибкий');
      break;
    case 'introvert':
      traits.push('Вдумчивый', 'Глубокий');
      break;
  }
  
  // Decision traits
  switch (decision) {
    case 'analytical':
      traits.push('Логичный', 'Рациональный');
      break;
    case 'balanced':
      traits.push('Сбалансированный', 'Прагматичный');
      break;
    case 'creative':
      traits.push('Творческий', 'Интуитивный');
      break;
  }
  
  // Energy traits
  switch (energy) {
    case 'active':
      traits.push('Энергичный');
      break;
    case 'moderate':
      traits.push('Уравновешенный');
      break;
    case 'calm':
      traits.push('Спокойный');
      break;
  }
  
  // Leadership traits
  switch (leadership) {
    case 'leader':
      traits.push('Лидер');
      break;
    case 'collaborator':
      traits.push('Командный');
      break;
    case 'supporter':
      traits.push('Поддерживающий');
      break;
  }
  
  return traits;
};

export const classifyPersonality = (answers: number[]): PersonalityProfile => {
  const scores = calculateDimensionScores(answers);
  
  const socialStyle = getSocialStyle(scores.social);
  const decisionStyle = getDecisionStyle(scores.decision);
  const energyStyle = getEnergyStyle(scores.energy);
  const leadershipStyle = getLeadershipStyle(scores.leadership);
  
  const personalityType = getPersonalityTypeName(
    socialStyle, 
    decisionStyle, 
    energyStyle, 
    leadershipStyle
  );
  
  const traits = getTraits(socialStyle, decisionStyle, energyStyle, leadershipStyle);
  
  return {
    socialStyle,
    decisionStyle,
    energyStyle,
    leadershipStyle,
    personalityType,
    traits
  };
};

export const getPersonalityDescription = (personality: PersonalityProfile): string => {
  const { socialStyle, decisionStyle, energyStyle, leadershipStyle } = personality;
  
  let description = '';
  
  // Social style description
  switch (socialStyle) {
    case 'extrovert':
      description += 'Вы черпаете энергию из общения с людьми и любите быть в центре событий. ';
      break;
    case 'ambivert':
      description += 'Вы комфортно чувствуете себя как в компании, так и наедине с собой. ';
      break;
    case 'introvert':
      description += 'Вы цените глубокие связи и время для размышлений наедине. ';
      break;
  }
  
  // Decision style description
  switch (decisionStyle) {
    case 'analytical':
      description += 'При принятии решений вы опираетесь на логику и факты. ';
      break;
    case 'balanced':
      description += 'Вы умеете сочетать разум и интуицию при принятии решений. ';
      break;
    case 'creative':
      description += 'Ваши решения часто продиктованы интуицией и творческим видением. ';
      break;
  }
  
  // Energy style description
  switch (energyStyle) {
    case 'active':
      description += 'Вам нравится быть в движении и браться за новые вызовы. ';
      break;
    case 'moderate':
      description += 'Вы умеете балансировать между активностью и отдыхом. ';
      break;
    case 'calm':
      description += 'Вы предпочитаете размеренный темп жизни и вдумчивый подход. ';
      break;
  }
  
  // Leadership style description
  switch (leadershipStyle) {
    case 'leader':
      description += 'В группе вы естественно берёте на себя роль организатора.';
      break;
    case 'collaborator':
      description += 'Вы отлично работаете в команде, внося ценный вклад.';
      break;
    case 'supporter':
      description += 'Вы — надёжная поддержка для своих близких и друзей.';
      break;
  }
  
  return description;
};

// Localized labels for UI display
export const PERSONALITY_LABELS = {
  socialStyle: {
    extrovert: { ru: 'Экстраверт', en: 'Extrovert', emoji: '🌟' },
    ambivert: { ru: 'Амбиверт', en: 'Ambivert', emoji: '⚖️' },
    introvert: { ru: 'Интроверт', en: 'Introvert', emoji: '🌙' }
  },
  decisionStyle: {
    analytical: { ru: 'Аналитик', en: 'Analytical', emoji: '🧠' },
    balanced: { ru: 'Сбалансированный', en: 'Balanced', emoji: '🎯' },
    creative: { ru: 'Творец', en: 'Creative', emoji: '🎨' }
  },
  energyStyle: {
    active: { ru: 'Активный', en: 'Active', emoji: '⚡' },
    moderate: { ru: 'Умеренный', en: 'Moderate', emoji: '🌊' },
    calm: { ru: 'Спокойный', en: 'Calm', emoji: '🍃' }
  },
  leadershipStyle: {
    leader: { ru: 'Лидер', en: 'Leader', emoji: '👑' },
    collaborator: { ru: 'Партнёр', en: 'Collaborator', emoji: '🤝' },
    supporter: { ru: 'Помощник', en: 'Supporter', emoji: '💪' }
  }
};
