import { Language } from '@/i18n/translations';
import { SocialStyle, DecisionStyle, EnergyStyle, LeadershipStyle } from '@/types';

// Personality type names in all supported languages
export const PERSONALITY_TYPE_NAMES: Record<string, Record<Language, string>> = {
  // Extrovert combinations
  'extrovert-analytical-active-leader': {
    en: 'ENERGETIC STRATEGIST', ru: 'ЭНЕРГИЧНЫЙ СТРАТЕГ', fr: 'STRATÈGE ÉNERGIQUE', es: 'ESTRATEGA ENERGÉTICO',
    pt: 'ESTRATEGISTA ENERGÉTICO', uk: 'ЕНЕРГІЙНИЙ СТРАТЕГ', ko: '에너지 넘치는 전략가', zh: '充满活力的战略家'
  },
  'extrovert-analytical-active-collaborator': {
    en: 'ACTIVE ANALYST', ru: 'АКТИВНЫЙ АНАЛИТИК', fr: 'ANALYSTE ACTIF', es: 'ANALISTA ACTIVO',
    pt: 'ANALISTA ATIVO', uk: 'АКТИВНИЙ АНАЛІТИК', ko: '적극적인 분석가', zh: '活跃的分析师'
  },
  'extrovert-analytical-active-supporter': {
    en: 'RELIABLE HELPER', ru: 'НАДЁЖНЫЙ ПОМОЩНИК', fr: 'ASSISTANT FIABLE', es: 'AYUDANTE CONFIABLE',
    pt: 'AJUDANTE CONFIÁVEL', uk: 'НАДІЙНИЙ ПОМІЧНИК', ko: '믿음직한 조력자', zh: '可靠的助手'
  },
  'extrovert-analytical-moderate-leader': {
    en: 'THOUGHTFUL LEADER', ru: 'РАССУДИТЕЛЬНЫЙ ЛИДЕР', fr: 'LEADER RÉFLÉCHI', es: 'LÍDER REFLEXIVO',
    pt: 'LÍDER PONDERADO', uk: 'РОЗВАЖЛИВИЙ ЛІДЕР', ko: '사려 깊은 리더', zh: '深思熟虑的领导者'
  },
  'extrovert-analytical-moderate-collaborator': {
    en: 'TEAM PLAYER', ru: 'КОМАНДНЫЙ ИГРОК', fr: 'JOUEUR D\'ÉQUIPE', es: 'JUGADOR DE EQUIPO',
    pt: 'JOGADOR DE EQUIPE', uk: 'КОМАНДНИЙ ГРАВЕЦЬ', ko: '팀 플레이어', zh: '团队合作者'
  },
  'extrovert-analytical-moderate-supporter': {
    en: 'DEVOTED FRIEND', ru: 'ПРЕДАННЫЙ ДРУГ', fr: 'AMI DÉVOUÉ', es: 'AMIGO DEVOTO',
    pt: 'AMIGO DEDICADO', uk: 'ВІДДАНИЙ ДРУГ', ko: '헌신적인 친구', zh: '忠诚的朋友'
  },
  'extrovert-analytical-calm-leader': {
    en: 'WISE MENTOR', ru: 'МУДРЫЙ НАСТАВНИК', fr: 'MENTOR SAGE', es: 'MENTOR SABIO',
    pt: 'MENTOR SÁBIO', uk: 'МУДРИЙ НАСТАВНИК', ko: '현명한 멘토', zh: '睿智的导师'
  },
  'extrovert-analytical-calm-collaborator': {
    en: 'THOUGHTFUL PARTNER', ru: 'ВДУМЧИВЫЙ ПАРТНЁР', fr: 'PARTENAIRE RÉFLÉCHI', es: 'COMPAÑERO REFLEXIVO',
    pt: 'PARCEIRO PENSATIVO', uk: 'ВДУМЛИВИЙ ПАРТНЕР', ko: '사려 깊은 파트너', zh: '深思的伙伴'
  },
  'extrovert-analytical-calm-supporter': {
    en: 'CALM ADVISOR', ru: 'СПОКОЙНЫЙ СОВЕТНИК', fr: 'CONSEILLER CALME', es: 'CONSEJERO TRANQUILO',
    pt: 'CONSELHEIRO CALMO', uk: 'СПОКІЙНИЙ РАДНИК', ko: '차분한 조언자', zh: '冷静的顾问'
  },
  
  'extrovert-balanced-active-leader': {
    en: 'CHARISMATIC LEADER', ru: 'ХАРИЗМАТИЧНЫЙ ЛИДЕР', fr: 'LEADER CHARISMATIQUE', es: 'LÍDER CARISMÁTICO',
    pt: 'LÍDER CARISMÁTICO', uk: 'ХАРИЗМАТИЧНИЙ ЛІДЕР', ko: '카리스마 있는 리더', zh: '魅力领袖'
  },
  'extrovert-balanced-active-collaborator': {
    en: 'LIFE OF THE PARTY', ru: 'ДУША КОМПАНИИ', fr: 'BOUTE-EN-TRAIN', es: 'ALMA DE LA FIESTA',
    pt: 'ALMA DA FESTA', uk: 'ДУША КОМПАНІЇ', ko: '파티의 중심', zh: '聚会灵魂'
  },
  'extrovert-balanced-active-supporter': {
    en: 'ENTHUSIAST', ru: 'ЭНТУЗИАСТ', fr: 'ENTHOUSIASTE', es: 'ENTUSIASTA',
    pt: 'ENTUSIASTA', uk: 'ЕНТУЗІАСТ', ko: '열정적인 사람', zh: '热心人'
  },
  'extrovert-balanced-moderate-leader': {
    en: 'DIPLOMAT', ru: 'ДИПЛОМАТ', fr: 'DIPLOMATE', es: 'DIPLOMÁTICO',
    pt: 'DIPLOMATA', uk: 'ДИПЛОМАТ', ko: '외교관', zh: '外交官'
  },
  'extrovert-balanced-moderate-collaborator': {
    en: 'VERSATILE', ru: 'УНИВЕРСАЛ', fr: 'POLYVALENT', es: 'VERSÁTIL',
    pt: 'VERSÁTIL', uk: 'УНІВЕРСАЛ', ko: '다재다능', zh: '多面手'
  },
  'extrovert-balanced-moderate-supporter': {
    en: 'RESPONSIVE FRIEND', ru: 'ОТЗЫВЧИВЫЙ ДРУГ', fr: 'AMI ATTENTIF', es: 'AMIGO RECEPTIVO',
    pt: 'AMIGO RESPONSIVO', uk: 'ЧУЙНИЙ ДРУГ', ko: '반응이 좋은 친구', zh: '热心的朋友'
  },
  'extrovert-balanced-calm-leader': {
    en: 'BALANCED LEADER', ru: 'УРАВНОВЕШЕННЫЙ ЛИДЕР', fr: 'LEADER ÉQUILIBRÉ', es: 'LÍDER EQUILIBRADO',
    pt: 'LÍDER EQUILIBRADO', uk: 'ВРІВНОВАЖЕНИЙ ЛІДЕР', ko: '균형 잡힌 리더', zh: '平衡的领导者'
  },
  'extrovert-balanced-calm-collaborator': {
    en: 'HARMONIOUS PARTNER', ru: 'ГАРМОНИЧНЫЙ ПАРТНЁР', fr: 'PARTENAIRE HARMONIEUX', es: 'COMPAÑERO ARMONIOSO',
    pt: 'PARCEIRO HARMONIOSO', uk: 'ГАРМОНІЙНИЙ ПАРТНЕР', ko: '조화로운 파트너', zh: '和谐的伙伴'
  },
  'extrovert-balanced-calm-supporter': {
    en: 'RELIABLE SUPPORT', ru: 'НАДЁЖНАЯ ОПОРА', fr: 'SOUTIEN FIABLE', es: 'APOYO CONFIABLE',
    pt: 'APOIO CONFIÁVEL', uk: 'НАДІЙНА ОПОРА', ko: '든든한 지원자', zh: '可靠的后盾'
  },
  
  'extrovert-creative-active-leader': {
    en: 'INSPIRER', ru: 'ВДОХНОВИТЕЛЬ', fr: 'INSPIRATEUR', es: 'INSPIRADOR',
    pt: 'INSPIRADOR', uk: 'НАТХНЕННИК', ko: '영감을 주는 사람', zh: '激励者'
  },
  'extrovert-creative-active-collaborator': {
    en: 'CREATIVE ENTHUSIAST', ru: 'ТВОРЧЕСКИЙ ЭНТУЗИАСТ', fr: 'ENTHOUSIASTE CRÉATIF', es: 'ENTUSIASTA CREATIVO',
    pt: 'ENTUSIASTA CRIATIVO', uk: 'ТВОРЧИЙ ЕНТУЗІАСТ', ko: '창의적 열정가', zh: '创意热心者'
  },
  'extrovert-creative-active-supporter': {
    en: 'CREATIVE HELPER', ru: 'КРЕАТИВНЫЙ ПОМОЩНИК', fr: 'ASSISTANT CRÉATIF', es: 'AYUDANTE CREATIVO',
    pt: 'AJUDANTE CRIATIVO', uk: 'КРЕАТИВНИЙ ПОМІЧНИК', ko: '창의적 조력자', zh: '创意助手'
  },
  'extrovert-creative-moderate-leader': {
    en: 'ARTISTIC LEADER', ru: 'АРТИСТИЧНЫЙ ЛИДЕР', fr: 'LEADER ARTISTIQUE', es: 'LÍDER ARTÍSTICO',
    pt: 'LÍDER ARTÍSTICO', uk: 'АРТИСТИЧНИЙ ЛІДЕР', ko: '예술적 리더', zh: '艺术领袖'
  },
  'extrovert-creative-moderate-collaborator': {
    en: 'CREATIVE SOUL', ru: 'ТВОРЧЕСКАЯ ДУША', fr: 'ÂME CRÉATIVE', es: 'ALMA CREATIVA',
    pt: 'ALMA CRIATIVA', uk: 'ТВОРЧА ДУША', ko: '창의적 영혼', zh: '创意灵魂'
  },
  'extrovert-creative-moderate-supporter': {
    en: 'EMPATHIC FRIEND', ru: 'ЭМПАТИЧНЫЙ ДРУГ', fr: 'AMI EMPATHIQUE', es: 'AMIGO EMPÁTICO',
    pt: 'AMIGO EMPÁTICO', uk: 'ЕМПАТИЧНИЙ ДРУГ', ko: '공감하는 친구', zh: '富有同情心的朋友'
  },
  'extrovert-creative-calm-leader': {
    en: 'DREAMER-ORGANIZER', ru: 'МЕЧТАТЕЛЬ-ОРГАНИЗАТОР', fr: 'RÊVEUR-ORGANISATEUR', es: 'SOÑADOR-ORGANIZADOR',
    pt: 'SONHADOR-ORGANIZADOR', uk: 'МРІЙНИК-ОРГАНІЗАТОР', ko: '꿈꾸는 조직가', zh: '梦想家组织者'
  },
  'extrovert-creative-calm-collaborator': {
    en: 'THOUGHTFUL CREATOR', ru: 'ВДУМЧИВЫЙ ТВОРЕЦ', fr: 'CRÉATEUR RÉFLÉCHI', es: 'CREADOR REFLEXIVO',
    pt: 'CRIADOR PENSATIVO', uk: 'ВДУМЛИВИЙ ТВОРЕЦЬ', ko: '사려 깊은 창작자', zh: '深思的创造者'
  },
  'extrovert-creative-calm-supporter': {
    en: 'KIND DREAMER', ru: 'ДОБРЫЙ МЕЧТАТЕЛЬ', fr: 'RÊVEUR BIENVEILLANT', es: 'SOÑADOR AMABLE',
    pt: 'SONHADOR BONDOSO', uk: 'ДОБРИЙ МРІЙНИК', ko: '친절한 몽상가', zh: '善良的梦想家'
  },

  // Ambivert combinations
  'ambivert-analytical-active-leader': {
    en: 'PRACTICAL LEADER', ru: 'ПРАКТИЧНЫЙ ЛИДЕР', fr: 'LEADER PRATIQUE', es: 'LÍDER PRÁCTICO',
    pt: 'LÍDER PRÁTICO', uk: 'ПРАКТИЧНИЙ ЛІДЕР', ko: '실용적 리더', zh: '务实的领导者'
  },
  'ambivert-analytical-active-collaborator': {
    en: 'EFFECTIVE PARTNER', ru: 'ЭФФЕКТИВНЫЙ ПАРТНЁР', fr: 'PARTENAIRE EFFICACE', es: 'COMPAÑERO EFECTIVO',
    pt: 'PARCEIRO EFICAZ', uk: 'ЕФЕКТИВНИЙ ПАРТНЕР', ko: '효율적 파트너', zh: '高效的伙伴'
  },
  'ambivert-analytical-active-supporter': {
    en: 'RESPONSIBLE EXECUTOR', ru: 'ОТВЕТСТВЕННЫЙ ИСПОЛНИТЕЛЬ', fr: 'EXÉCUTANT RESPONSABLE', es: 'EJECUTOR RESPONSABLE',
    pt: 'EXECUTOR RESPONSÁVEL', uk: 'ВІДПОВІДАЛЬНИЙ ВИКОНАВЕЦЬ', ko: '책임감 있는 실행자', zh: '负责的执行者'
  },
  'ambivert-analytical-moderate-leader': {
    en: 'BALANCED MANAGER', ru: 'ВЗВЕШЕННЫЙ РУКОВОДИТЕЛЬ', fr: 'GESTIONNAIRE ÉQUILIBRÉ', es: 'GERENTE EQUILIBRADO',
    pt: 'GERENTE EQUILIBRADO', uk: 'ЗВАЖЕНИЙ КЕРІВНИК', ko: '균형 잡힌 관리자', zh: '平衡的管理者'
  },
  'ambivert-analytical-moderate-collaborator': {
    en: 'RELIABLE COLLEAGUE', ru: 'НАДЁЖНЫЙ КОЛЛЕГА', fr: 'COLLÈGUE FIABLE', es: 'COLEGA CONFIABLE',
    pt: 'COLEGA CONFIÁVEL', uk: 'НАДІЙНИЙ КОЛЕГА', ko: '믿을 수 있는 동료', zh: '可靠的同事'
  },
  'ambivert-analytical-moderate-supporter': {
    en: 'LOYAL ALLY', ru: 'ВЕРНЫЙ СОРАТНИК', fr: 'ALLIÉ FIDÈLE', es: 'ALIADO LEAL',
    pt: 'ALIADO FIEL', uk: 'ВІРНИЙ СОРАТНИК', ko: '충실한 동맹', zh: '忠诚的盟友'
  },
  'ambivert-analytical-calm-leader': {
    en: 'STRATEGIST', ru: 'СТРАТЕГ', fr: 'STRATÈGE', es: 'ESTRATEGA',
    pt: 'ESTRATEGISTA', uk: 'СТРАТЕГ', ko: '전략가', zh: '战略家'
  },
  'ambivert-analytical-calm-collaborator': {
    en: 'ANALYST', ru: 'АНАЛИТИК', fr: 'ANALYSTE', es: 'ANALISTA',
    pt: 'ANALISTA', uk: 'АНАЛІТИК', ko: '분석가', zh: '分析师'
  },
  'ambivert-analytical-calm-supporter': {
    en: 'THINKER', ru: 'МЫСЛИТЕЛЬ', fr: 'PENSEUR', es: 'PENSADOR',
    pt: 'PENSADOR', uk: 'МИСЛИТЕЛЬ', ko: '사상가', zh: '思想家'
  },
  
  'ambivert-balanced-active-leader': {
    en: 'ADAPTIVE LEADER', ru: 'АДАПТИВНЫЙ ЛИДЕР', fr: 'LEADER ADAPTATIF', es: 'LÍDER ADAPTABLE',
    pt: 'LÍDER ADAPTÁVEL', uk: 'АДАПТИВНИЙ ЛІДЕР', ko: '적응력 있는 리더', zh: '适应性强的领导者'
  },
  'ambivert-balanced-active-collaborator': {
    en: 'ACTIVE PARTNER', ru: 'АКТИВНЫЙ ПАРТНЁР', fr: 'PARTENAIRE ACTIF', es: 'COMPAÑERO ACTIVO',
    pt: 'PARCEIRO ATIVO', uk: 'АКТИВНИЙ ПАРТНЕР', ko: '적극적인 파트너', zh: '活跃的伙伴'
  },
  'ambivert-balanced-active-supporter': {
    en: 'ENERGETIC FRIEND', ru: 'ЭНЕРГИЧНЫЙ ДРУГ', fr: 'AMI ÉNERGIQUE', es: 'AMIGO ENÉRGICO',
    pt: 'AMIGO ENERGÉTICO', uk: 'ЕНЕРГІЙНИЙ ДРУГ', ko: '활기찬 친구', zh: '充满活力的朋友'
  },
  'ambivert-balanced-moderate-leader': {
    en: 'FLEXIBLE LEADER', ru: 'ГИБКИЙ ЛИДЕР', fr: 'LEADER FLEXIBLE', es: 'LÍDER FLEXIBLE',
    pt: 'LÍDER FLEXÍVEL', uk: 'ГНУЧКИЙ ЛІДЕР', ko: '유연한 리더', zh: '灵活的领导者'
  },
  'ambivert-balanced-moderate-collaborator': {
    en: 'BALANCED', ru: 'СБАЛАНСИРОВАННЫЙ', fr: 'ÉQUILIBRÉ', es: 'EQUILIBRADO',
    pt: 'EQUILIBRADO', uk: 'ЗБАЛАНСОВАНИЙ', ko: '균형 잡힌', zh: '平衡'
  },
  'ambivert-balanced-moderate-supporter': {
    en: 'UNDERSTANDING FRIEND', ru: 'ПОНИМАЮЩИЙ ДРУГ', fr: 'AMI COMPRÉHENSIF', es: 'AMIGO COMPRENSIVO',
    pt: 'AMIGO COMPREENSIVO', uk: 'РОЗУМІЮЧИЙ ДРУГ', ko: '이해심 깊은 친구', zh: '善解人意的朋友'
  },
  'ambivert-balanced-calm-leader': {
    en: 'CALM LEADER', ru: 'СПОКОЙНЫЙ ЛИДЕР', fr: 'LEADER CALME', es: 'LÍDER TRANQUILO',
    pt: 'LÍDER CALMO', uk: 'СПОКІЙНИЙ ЛІДЕР', ko: '차분한 리더', zh: '沉稳的领导者'
  },
  'ambivert-balanced-calm-collaborator': {
    en: 'PEACEMAKER', ru: 'МИРОТВОРЕЦ', fr: 'PACIFICATEUR', es: 'PACIFICADOR',
    pt: 'PACIFICADOR', uk: 'МИРОТВОРЕЦЬ', ko: '평화주의자', zh: '和平使者'
  },
  'ambivert-balanced-calm-supporter': {
    en: 'SAFE HAVEN', ru: 'ТИХАЯ ГАВАНЬ', fr: 'HAVRE DE PAIX', es: 'REFUGIO SEGURO',
    pt: 'PORTO SEGURO', uk: 'ТИХА ГАВАНЬ', ko: '안식처', zh: '避风港'
  },
  
  'ambivert-creative-active-leader': {
    en: 'INNOVATOR', ru: 'ИННОВАТОР', fr: 'INNOVATEUR', es: 'INNOVADOR',
    pt: 'INOVADOR', uk: 'ІННОВАТОР', ko: '혁신가', zh: '创新者'
  },
  'ambivert-creative-active-collaborator': {
    en: 'INVENTOR', ru: 'ИЗОБРЕТАТЕЛЬ', fr: 'INVENTEUR', es: 'INVENTOR',
    pt: 'INVENTOR', uk: 'ВИНАХІДНИК', ko: '발명가', zh: '发明家'
  },
  'ambivert-creative-active-supporter': {
    en: 'DAYDREAMER', ru: 'ФАНТАЗЁР', fr: 'RÊVEUR', es: 'SOÑADOR',
    pt: 'SONHADOR', uk: 'ФАНТАЗЕР', ko: '공상가', zh: '幻想家'
  },
  'ambivert-creative-moderate-leader': {
    en: 'CREATIVE LEADER', ru: 'ТВОРЧЕСКИЙ ЛИДЕР', fr: 'LEADER CRÉATIF', es: 'LÍDER CREATIVO',
    pt: 'LÍDER CRIATIVO', uk: 'ТВОРЧИЙ ЛІДЕР', ko: '창의적 리더', zh: '创意领袖'
  },
  'ambivert-creative-moderate-collaborator': {
    en: 'CREATIVE', ru: 'КРЕАТИВЩИК', fr: 'CRÉATIF', es: 'CREATIVO',
    pt: 'CRIATIVO', uk: 'КРЕАТИВНИК', ko: '크리에이터', zh: '创意人'
  },
  'ambivert-creative-moderate-supporter': {
    en: 'ARTIST', ru: 'ХУДОЖНИК', fr: 'ARTISTE', es: 'ARTISTA',
    pt: 'ARTISTA', uk: 'ХУДОЖНИК', ko: '예술가', zh: '艺术家'
  },
  'ambivert-creative-calm-leader': {
    en: 'PHILOSOPHER', ru: 'ФИЛОСОФ', fr: 'PHILOSOPHE', es: 'FILÓSOFO',
    pt: 'FILÓSOFO', uk: 'ФІЛОСОФ', ko: '철학자', zh: '哲学家'
  },
  'ambivert-creative-calm-collaborator': {
    en: 'CONTEMPLATOR', ru: 'СОЗЕРЦАТЕЛЬ', fr: 'CONTEMPLATEUR', es: 'CONTEMPLADOR',
    pt: 'CONTEMPLADOR', uk: 'СПОГЛЯДАЛЬНИК', ko: '명상가', zh: '沉思者'
  },
  'ambivert-creative-calm-supporter': {
    en: 'DREAMER', ru: 'МЕЧТАТЕЛЬ', fr: 'RÊVEUR', es: 'SOÑADOR',
    pt: 'SONHADOR', uk: 'МРІЙНИК', ko: '몽상가', zh: '梦想家'
  },

  // Introvert combinations
  'introvert-analytical-active-leader': {
    en: 'QUIET LEADER', ru: 'ТИХИЙ ЛИДЕР', fr: 'LEADER DISCRET', es: 'LÍDER SILENCIOSO',
    pt: 'LÍDER DISCRETO', uk: 'ТИХИЙ ЛІДЕР', ko: '조용한 리더', zh: '沉默的领导者'
  },
  'introvert-analytical-active-collaborator': {
    en: 'DETERMINED', ru: 'ЦЕЛЕУСТРЕМЛЁННЫЙ', fr: 'DÉTERMINÉ', es: 'DECIDIDO',
    pt: 'DETERMINADO', uk: 'ЦІЛЕСПРЯМОВАНИЙ', ko: '결단력 있는', zh: '坚定的'
  },
  'introvert-analytical-active-supporter': {
    en: 'DILIGENT HELPER', ru: 'УСЕРДНЫЙ ПОМОЩНИК', fr: 'ASSISTANT DILIGENT', es: 'AYUDANTE DILIGENTE',
    pt: 'AJUDANTE DILIGENTE', uk: 'СТАРАННИЙ ПОМІЧНИК', ko: '성실한 조력자', zh: '勤奋的助手'
  },
  'introvert-analytical-moderate-leader': {
    en: 'INTELLECTUAL', ru: 'ИНТЕЛЛЕКТУАЛ', fr: 'INTELLECTUEL', es: 'INTELECTUAL',
    pt: 'INTELECTUAL', uk: 'ІНТЕЛЕКТУАЛ', ko: '지식인', zh: '知识分子'
  },
  'introvert-analytical-moderate-collaborator': {
    en: 'RESEARCHER', ru: 'ИССЛЕДОВАТЕЛЬ', fr: 'CHERCHEUR', es: 'INVESTIGADOR',
    pt: 'PESQUISADOR', uk: 'ДОСЛІДНИК', ko: '연구자', zh: '研究者'
  },
  'introvert-analytical-moderate-supporter': {
    en: 'EXPERT', ru: 'ЭКСПЕРТ', fr: 'EXPERT', es: 'EXPERTO',
    pt: 'ESPECIALISTA', uk: 'ЕКСПЕРТ', ko: '전문가', zh: '专家'
  },
  'introvert-analytical-calm-leader': {
    en: 'SAGE', ru: 'МУДРЕЦ', fr: 'SAGE', es: 'SABIO',
    pt: 'SÁBIO', uk: 'МУДРЕЦЬ', ko: '현자', zh: '智者'
  },
  'introvert-analytical-calm-collaborator': {
    en: 'SCHOLAR', ru: 'УЧЁНЫЙ', fr: 'ÉRUDIT', es: 'ERUDITO',
    pt: 'ERUDITO', uk: 'ВЧЕНИЙ', ko: '학자', zh: '学者'
  },
  'introvert-analytical-calm-supporter': {
    en: 'OBSERVER', ru: 'НАБЛЮДАТЕЛЬ', fr: 'OBSERVATEUR', es: 'OBSERVADOR',
    pt: 'OBSERVADOR', uk: 'СПОСТЕРІГАЧ', ko: '관찰자', zh: '观察者'
  },
  
  'introvert-balanced-active-leader': {
    en: 'FOCUSED LEADER', ru: 'СФОКУСИРОВАННЫЙ ЛИДЕР', fr: 'LEADER CONCENTRÉ', es: 'LÍDER ENFOCADO',
    pt: 'LÍDER FOCADO', uk: 'СФОКУСОВАНИЙ ЛІДЕР', ko: '집중력 있는 리더', zh: '专注的领导者'
  },
  'introvert-balanced-active-collaborator': {
    en: 'INDIVIDUALIST', ru: 'ИНДИВИДУАЛИСТ', fr: 'INDIVIDUALISTE', es: 'INDIVIDUALISTA',
    pt: 'INDIVIDUALISTA', uk: 'ІНДИВІДУАЛІСТ', ko: '개인주의자', zh: '个人主义者'
  },
  'introvert-balanced-active-supporter': {
    en: 'HIDDEN STRENGTH', ru: 'СКРЫТАЯ СИЛА', fr: 'FORCE CACHÉE', es: 'FUERZA OCULTA',
    pt: 'FORÇA OCULTA', uk: 'ПРИХОВАНА СИЛА', ko: '숨겨진 힘', zh: '隐藏的力量'
  },
  'introvert-balanced-moderate-leader': {
    en: 'REFLECTIVE LEADER', ru: 'РЕФЛЕКСИВНЫЙ ЛИДЕР', fr: 'LEADER RÉFLEXIF', es: 'LÍDER REFLEXIVO',
    pt: 'LÍDER REFLEXIVO', uk: 'РЕФЛЕКСИВНИЙ ЛІДЕР', ko: '성찰하는 리더', zh: '反思型领导者'
  },
  'introvert-balanced-moderate-collaborator': {
    en: 'THOUGHTFUL FRIEND', ru: 'ВДУМЧИВЫЙ ДРУГ', fr: 'AMI RÉFLÉCHI', es: 'AMIGO REFLEXIVO',
    pt: 'AMIGO PENSATIVO', uk: 'ВДУМЛИВИЙ ДРУГ', ko: '사려 깊은 친구', zh: '深思的朋友'
  },
  'introvert-balanced-moderate-supporter': {
    en: 'SENSITIVE LISTENER', ru: 'ЧУТКИЙ СЛУШАТЕЛЬ', fr: 'ÉCOUTEUR SENSIBLE', es: 'OYENTE SENSIBLE',
    pt: 'OUVINTE SENSÍVEL', uk: 'ЧУЙНИЙ СЛУХАЧ', ko: '민감한 경청자', zh: '敏感的倾听者'
  },
  'introvert-balanced-calm-leader': {
    en: 'CREATOR', ru: 'СОЗИДАТЕЛЬ', fr: 'CRÉATEUR', es: 'CREADOR',
    pt: 'CRIADOR', uk: 'ТВОРЕЦЬ', ko: '창조자', zh: '创造者'
  },
  'introvert-balanced-calm-collaborator': {
    en: 'CALM FRIEND', ru: 'СПОКОЙНЫЙ ДРУГ', fr: 'AMI CALME', es: 'AMIGO TRANQUILO',
    pt: 'AMIGO CALMO', uk: 'СПОКІЙНИЙ ДРУГ', ko: '차분한 친구', zh: '平静的朋友'
  },
  'introvert-balanced-calm-supporter': {
    en: 'RELIABLE SHADOW', ru: 'НАДЁЖНАЯ ТЕНЬ', fr: 'OMBRE FIABLE', es: 'SOMBRA CONFIABLE',
    pt: 'SOMBRA CONFIÁVEL', uk: 'НАДІЙНА ТІНЬ', ko: '든든한 그림자', zh: '可靠的影子'
  },
  
  'introvert-creative-active-leader': {
    en: 'VISIONARY', ru: 'ВИЗИОНЕР', fr: 'VISIONNAIRE', es: 'VISIONARIO',
    pt: 'VISIONÁRIO', uk: 'ВІЗІОНЕР', ko: '비전가', zh: '远见者'
  },
  'introvert-creative-active-collaborator': {
    en: 'CREATOR', ru: 'ТВОРЕЦ', fr: 'CRÉATEUR', es: 'CREADOR',
    pt: 'CRIADOR', uk: 'ТВОРЕЦЬ', ko: '창작자', zh: '创作者'
  },
  'introvert-creative-active-supporter': {
    en: 'INSPIRED', ru: 'ВДОХНОВЛЁННЫЙ', fr: 'INSPIRÉ', es: 'INSPIRADO',
    pt: 'INSPIRADO', uk: 'НАТХНЕННИЙ', ko: '영감을 받은', zh: '受启发的'
  },
  'introvert-creative-moderate-leader': {
    en: 'ARTIST', ru: 'АРТИСТ', fr: 'ARTISTE', es: 'ARTISTA',
    pt: 'ARTISTA', uk: 'АРТИСТ', ko: '아티스트', zh: '艺人'
  },
  'introvert-creative-moderate-collaborator': {
    en: 'POET', ru: 'ПОЭТ', fr: 'POÈTE', es: 'POETA',
    pt: 'POETA', uk: 'ПОЕТ', ko: '시인', zh: '诗人'
  },
  'introvert-creative-moderate-supporter': {
    en: 'ROMANTIC', ru: 'РОМАНТИК', fr: 'ROMANTIQUE', es: 'ROMÁNTICO',
    pt: 'ROMÂNTICO', uk: 'РОМАНТИК', ko: '로맨티스트', zh: '浪漫主义者'
  },
  'introvert-creative-calm-leader': {
    en: 'DEEP THINKER', ru: 'ГЛУБОКИЙ МЫСЛИТЕЛЬ', fr: 'PENSEUR PROFOND', es: 'PENSADOR PROFUNDO',
    pt: 'PENSADOR PROFUNDO', uk: 'ГЛИБОКИЙ МИСЛИТЕЛЬ', ko: '깊은 사색가', zh: '深度思考者'
  },
  'introvert-creative-calm-collaborator': {
    en: 'MYSTIC', ru: 'МИСТИК', fr: 'MYSTIQUE', es: 'MÍSTICO',
    pt: 'MÍSTICO', uk: 'МІСТИК', ko: '신비주의자', zh: '神秘主义者'
  },
  'introvert-creative-calm-supporter': {
    en: 'CONTEMPLATIVE SOUL', ru: 'СОЗЕРЦАТЕЛЬНАЯ ДУША', fr: 'ÂME CONTEMPLATIVE', es: 'ALMA CONTEMPLATIVA',
    pt: 'ALMA CONTEMPLATIVA', uk: 'СПОГЛЯДАЛЬНА ДУША', ko: '명상적 영혼', zh: '沉思的灵魂'
  },
};

// Traits translations
export const TRAITS: Record<string, Record<Language, string>> = {
  // Social traits
  'sociable': { en: 'Sociable', ru: 'Общительный', fr: 'Sociable', es: 'Sociable', pt: 'Sociável', uk: 'Товариський', ko: '사교적인', zh: '善于交际' },
  'open': { en: 'Open', ru: 'Открытый', fr: 'Ouvert', es: 'Abierto', pt: 'Aberto', uk: 'Відкритий', ko: '개방적인', zh: '开放的' },
  'adaptive': { en: 'Adaptive', ru: 'Адаптивный', fr: 'Adaptatif', es: 'Adaptable', pt: 'Adaptável', uk: 'Адаптивний', ko: '적응력 있는', zh: '适应性强' },
  'flexible': { en: 'Flexible', ru: 'Гибкий', fr: 'Flexible', es: 'Flexible', pt: 'Flexível', uk: 'Гнучкий', ko: '유연한', zh: '灵活的' },
  'thoughtful': { en: 'Thoughtful', ru: 'Вдумчивый', fr: 'Réfléchi', es: 'Reflexivo', pt: 'Pensativo', uk: 'Вдумливий', ko: '사려 깊은', zh: '深思熟虑' },
  'deep': { en: 'Deep', ru: 'Глубокий', fr: 'Profond', es: 'Profundo', pt: 'Profundo', uk: 'Глибокий', ko: '깊은', zh: '深刻的' },
  // Decision traits
  'logical': { en: 'Logical', ru: 'Логичный', fr: 'Logique', es: 'Lógico', pt: 'Lógico', uk: 'Логічний', ko: '논리적인', zh: '逻辑的' },
  'rational': { en: 'Rational', ru: 'Рациональный', fr: 'Rationnel', es: 'Racional', pt: 'Racional', uk: 'Раціональний', ko: '합리적인', zh: '理性的' },
  'balanced': { en: 'Balanced', ru: 'Сбалансированный', fr: 'Équilibré', es: 'Equilibrado', pt: 'Equilibrado', uk: 'Збалансований', ko: '균형 잡힌', zh: '平衡的' },
  'pragmatic': { en: 'Pragmatic', ru: 'Прагматичный', fr: 'Pragmatique', es: 'Pragmático', pt: 'Pragmático', uk: 'Прагматичний', ko: '실용적인', zh: '务实的' },
  'creative': { en: 'Creative', ru: 'Творческий', fr: 'Créatif', es: 'Creativo', pt: 'Criativo', uk: 'Творчий', ko: '창의적인', zh: '有创意的' },
  'intuitive': { en: 'Intuitive', ru: 'Интуитивный', fr: 'Intuitif', es: 'Intuitivo', pt: 'Intuitivo', uk: 'Інтуїтивний', ko: '직관적인', zh: '直觉的' },
  // Energy traits
  'energetic': { en: 'Energetic', ru: 'Энергичный', fr: 'Énergique', es: 'Enérgico', pt: 'Energético', uk: 'Енергійний', ko: '활기찬', zh: '精力充沛' },
  'moderate_trait': { en: 'Balanced', ru: 'Уравновешенный', fr: 'Équilibré', es: 'Equilibrado', pt: 'Equilibrado', uk: 'Врівноважений', ko: '차분한', zh: '平衡的' },
  'calm': { en: 'Calm', ru: 'Спокойный', fr: 'Calme', es: 'Tranquilo', pt: 'Calmo', uk: 'Спокійний', ko: '차분한', zh: '冷静的' },
  // Leadership traits
  'leader': { en: 'Leader', ru: 'Лидер', fr: 'Leader', es: 'Líder', pt: 'Líder', uk: 'Лідер', ko: '리더', zh: '领导者' },
  'team_player': { en: 'Team player', ru: 'Командный', fr: 'Joueur d\'équipe', es: 'Trabajo en equipo', pt: 'Jogador de equipe', uk: 'Командний', ko: '팀 플레이어', zh: '团队合作者' },
  'supportive': { en: 'Supportive', ru: 'Поддерживающий', fr: 'Soutenant', es: 'Solidario', pt: 'Apoiador', uk: 'Підтримуючий', ko: '지지하는', zh: '支持性的' },
};

// Personality descriptions
export const PERSONALITY_DESCRIPTIONS: Record<string, Record<Language, string>> = {
  // Social style descriptions
  'social.extrovert': {
    en: 'You draw energy from interacting with people and love being in the center of events.',
    ru: 'Вы черпаете энергию из общения с людьми и любите быть в центре событий.',
    fr: 'Vous tirez votre énergie des interactions avec les gens et aimez être au centre des événements.',
    es: 'Obtienes energía de interactuar con personas y te encanta estar en el centro de los eventos.',
    pt: 'Você obtém energia ao interagir com pessoas e adora estar no centro dos eventos.',
    uk: 'Ви черпаєте енергію зі спілкування з людьми і любите бути в центрі подій.',
    ko: '사람들과의 교류에서 에너지를 얻고 행사의 중심에 있는 것을 좋아합니다.',
    zh: '你从与人交往中获取能量，喜欢成为事件的中心。'
  },
  'social.ambivert': {
    en: 'You feel comfortable both in company and alone with yourself.',
    ru: 'Вы комфортно чувствуете себя как в компании, так и наедине с собой.',
    fr: 'Vous vous sentez à l\'aise aussi bien en compagnie que seul.',
    es: 'Te sientes cómodo tanto en compañía como solo contigo mismo.',
    pt: 'Você se sente confortável tanto em companhia quanto sozinho.',
    uk: 'Ви комфортно почуваєте себе як у компанії, так і наодинці з собою.',
    ko: '함께 있을 때와 혼자 있을 때 모두 편안함을 느낍니다.',
    zh: '无论是与人相处还是独处，你都感到舒适。'
  },
  'social.introvert': {
    en: 'You value deep connections and time for reflection alone.',
    ru: 'Вы цените глубокие связи и время для размышлений наедине.',
    fr: 'Vous appréciez les liens profonds et le temps de réflexion seul.',
    es: 'Valoras las conexiones profundas y el tiempo para reflexionar a solas.',
    pt: 'Você valoriza conexões profundas e tempo para reflexão sozinho.',
    uk: 'Ви цінуєте глибокі зв\'язки та час для роздумів наодинці.',
    ko: '깊은 관계와 혼자 성찰하는 시간을 소중히 여깁니다.',
    zh: '你珍视深厚的关系和独自反思的时间。'
  },
  // Decision style descriptions
  'decision.analytical': {
    en: 'When making decisions, you rely on logic and facts.',
    ru: 'При принятии решений вы опираетесь на логику и факты.',
    fr: 'Lors de la prise de décisions, vous vous appuyez sur la logique et les faits.',
    es: 'Al tomar decisiones, te basas en la lógica y los hechos.',
    pt: 'Ao tomar decisões, você se baseia na lógica e nos fatos.',
    uk: 'При прийнятті рішень ви спираєтесь на логіку та факти.',
    ko: '결정을 내릴 때 논리와 사실에 의존합니다.',
    zh: '做决定时，你依赖逻辑和事实。'
  },
  'decision.balanced': {
    en: 'You know how to combine reason and intuition when making decisions.',
    ru: 'Вы умеете сочетать разум и интуицию при принятии решений.',
    fr: 'Vous savez combiner raison et intuition lors de la prise de décisions.',
    es: 'Sabes cómo combinar razón e intuición al tomar decisiones.',
    pt: 'Você sabe combinar razão e intuição ao tomar decisões.',
    uk: 'Ви вмієте поєднувати розум та інтуїцію при прийнятті рішень.',
    ko: '결정을 내릴 때 이성과 직관을 조화롭게 사용합니다.',
    zh: '做决定时，你能够结合理性和直觉。'
  },
  'decision.creative': {
    en: 'Your decisions are often driven by intuition and creative vision.',
    ru: 'Ваши решения часто продиктованы интуицией и творческим видением.',
    fr: 'Vos décisions sont souvent guidées par l\'intuition et la vision créative.',
    es: 'Tus decisiones suelen estar impulsadas por la intuición y la visión creativa.',
    pt: 'Suas decisões são frequentemente guiadas pela intuição e visão criativa.',
    uk: 'Ваші рішення часто продиктовані інтуїцією та творчим баченням.',
    ko: '당신의 결정은 종종 직관과 창의적 비전에 의해 이끌립니다.',
    zh: '你的决定往往受直觉和创意愿景驱动。'
  },
  // Energy style descriptions
  'energy.active': {
    en: 'You enjoy being on the move and taking on new challenges.',
    ru: 'Вам нравится быть в движении и браться за новые вызовы.',
    fr: 'Vous aimez être en mouvement et relever de nouveaux défis.',
    es: 'Disfrutas estar en movimiento y asumir nuevos desafíos.',
    pt: 'Você gosta de estar em movimento e assumir novos desafios.',
    uk: 'Вам подобається бути в русі та братися за нові виклики.',
    ko: '움직이고 새로운 도전을 받아들이는 것을 즐깁니다.',
    zh: '你喜欢保持活跃并接受新的挑战。'
  },
  'energy.moderate': {
    en: 'You know how to balance between activity and rest.',
    ru: 'Вы умеете балансировать между активностью и отдыхом.',
    fr: 'Vous savez équilibrer entre activité et repos.',
    es: 'Sabes equilibrar entre actividad y descanso.',
    pt: 'Você sabe equilibrar entre atividade e descanso.',
    uk: 'Ви вмієте балансувати між активністю та відпочинком.',
    ko: '활동과 휴식 사이의 균형을 유지할 줄 압니다.',
    zh: '你知道如何在活动和休息之间保持平衡。'
  },
  'energy.calm': {
    en: 'You prefer a measured pace of life and a thoughtful approach.',
    ru: 'Вы предпочитаете размеренный темп жизни и вдумчивый подход.',
    fr: 'Vous préférez un rythme de vie mesuré et une approche réfléchie.',
    es: 'Prefieres un ritmo de vida pausado y un enfoque reflexivo.',
    pt: 'Você prefere um ritmo de vida medido e uma abordagem pensativa.',
    uk: 'Ви віддаєте перевагу розміреному темпу життя та вдумливому підходу.',
    ko: '여유로운 삶의 속도와 신중한 접근을 선호합니다.',
    zh: '你喜欢有节奏的生活方式和深思熟虑的方法。'
  },
  // Leadership style descriptions
  'leadership.leader': {
    en: 'In a group, you naturally take on the role of organizer.',
    ru: 'В группе вы естественно берёте на себя роль организатора.',
    fr: 'Dans un groupe, vous prenez naturellement le rôle d\'organisateur.',
    es: 'En un grupo, naturalmente asumes el rol de organizador.',
    pt: 'Em um grupo, você naturalmente assume o papel de organizador.',
    uk: 'У групі ви природно берете на себе роль організатора.',
    ko: '그룹에서 자연스럽게 조직자 역할을 맡습니다.',
    zh: '在团队中，你自然而然地担任组织者的角色。'
  },
  'leadership.collaborator': {
    en: 'You work excellently in a team, making a valuable contribution.',
    ru: 'Вы отлично работаете в команде, внося ценный вклад.',
    fr: 'Vous travaillez excellemment en équipe, apportant une contribution précieuse.',
    es: 'Trabajas excelentemente en equipo, haciendo una contribución valiosa.',
    pt: 'Você trabalha excelentemente em equipe, fazendo uma contribuição valiosa.',
    uk: 'Ви чудово працюєте в команді, вносячи цінний внесок.',
    ko: '팀에서 훌륭하게 일하며 가치 있는 기여를 합니다.',
    zh: '你在团队中表现出色，做出宝贵贡献。'
  },
  'leadership.supporter': {
    en: 'You are a reliable support for your loved ones and friends.',
    ru: 'Вы — надёжная поддержка для своих близких и друзей.',
    fr: 'Vous êtes un soutien fiable pour vos proches et amis.',
    es: 'Eres un apoyo confiable para tus seres queridos y amigos.',
    pt: 'Você é um apoio confiável para seus entes queridos e amigos.',
    uk: 'Ви — надійна підтримка для своїх близьких та друзів.',
    ko: '당신은 사랑하는 사람들과 친구들에게 든든한 지원자입니다.',
    zh: '你是亲人和朋友可靠的支持者。'
  },
};

// Get translated personality type name
export const getTranslatedPersonalityType = (key: string, language: Language): string => {
  const translation = PERSONALITY_TYPE_NAMES[key];
  if (translation) {
    return translation[language] || translation.en;
  }
  // Default fallback
  const defaultNames: Record<Language, string> = {
    en: 'UNIQUE PERSONALITY', ru: 'УНИКАЛЬНАЯ ЛИЧНОСТЬ', fr: 'PERSONNALITÉ UNIQUE',
    es: 'PERSONALIDAD ÚNICA', pt: 'PERSONALIDADE ÚNICA', uk: 'УНІКАЛЬНА ОСОБИСТІСТЬ',
    ko: '독특한 성격', zh: '独特的个性'
  };
  return defaultNames[language] || defaultNames.en;
};

// Get translated traits
export const getTranslatedTraits = (
  social: SocialStyle,
  decision: DecisionStyle,
  energy: EnergyStyle,
  leadership: LeadershipStyle,
  language: Language
): string[] => {
  const traits: string[] = [];
  
  // Social traits
  switch (social) {
    case 'extrovert':
      traits.push(TRAITS.sociable[language], TRAITS.open[language]);
      break;
    case 'ambivert':
      traits.push(TRAITS.adaptive[language], TRAITS.flexible[language]);
      break;
    case 'introvert':
      traits.push(TRAITS.thoughtful[language], TRAITS.deep[language]);
      break;
  }
  
  // Decision traits
  switch (decision) {
    case 'analytical':
      traits.push(TRAITS.logical[language], TRAITS.rational[language]);
      break;
    case 'balanced':
      traits.push(TRAITS.balanced[language], TRAITS.pragmatic[language]);
      break;
    case 'creative':
      traits.push(TRAITS.creative[language], TRAITS.intuitive[language]);
      break;
  }
  
  // Energy traits
  switch (energy) {
    case 'active':
      traits.push(TRAITS.energetic[language]);
      break;
    case 'moderate':
      traits.push(TRAITS.moderate_trait[language]);
      break;
    case 'calm':
      traits.push(TRAITS.calm[language]);
      break;
  }
  
  // Leadership traits
  switch (leadership) {
    case 'leader':
      traits.push(TRAITS.leader[language]);
      break;
    case 'collaborator':
      traits.push(TRAITS.team_player[language]);
      break;
    case 'supporter':
      traits.push(TRAITS.supportive[language]);
      break;
  }
  
  return traits;
};

// Get translated personality description
export const getTranslatedDescription = (
  social: SocialStyle,
  decision: DecisionStyle,
  energy: EnergyStyle,
  leadership: LeadershipStyle,
  language: Language
): string => {
  const parts = [
    PERSONALITY_DESCRIPTIONS[`social.${social}`][language],
    PERSONALITY_DESCRIPTIONS[`decision.${decision}`][language],
    PERSONALITY_DESCRIPTIONS[`energy.${energy}`][language],
    PERSONALITY_DESCRIPTIONS[`leadership.${leadership}`][language],
  ];
  
  return parts.join(' ');
};
