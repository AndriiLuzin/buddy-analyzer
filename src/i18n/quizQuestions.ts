import { Language } from './translations';

export interface LocalizedQuizQuestion {
  id: number;
  text: string;
  options: string[];
}

export type AgeGroup = 'kids' | 'teens' | 'young_adults' | 'adults';

export const getAgeGroup = (age: number): AgeGroup => {
  if (age <= 10) return 'kids';
  if (age <= 16) return 'teens';
  if (age <= 25) return 'young_adults';
  return 'adults';
};

export const getAgeFromBirthday = (birthday: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
};

// Questions for kids (up to 10 years) - Character & Personality focused
const KIDS_QUESTIONS: Record<Language, LocalizedQuizQuestion[]> = {
  en: [
    { id: 1, text: "When you meet new people, how do you feel?", options: ["Excited to make new friends!", "A bit shy at first", "I prefer to watch first", "I stay close to people I know"] },
    { id: 2, text: "What do you like to do when you're alone?", options: ["Play active games", "Read or draw", "Build things", "Daydream and imagine"] },
    { id: 3, text: "If something doesn't go your way, what do you do?", options: ["Try again right away", "Get upset but try later", "Ask someone for help", "Try something different"] },
    { id: 4, text: "How do you feel about trying new foods?", options: ["I love trying new things!", "Only if they look good", "I prefer what I know", "I need time to decide"] },
    { id: 5, text: "When playing with others, are you usually...", options: ["The leader of the game", "Someone who suggests ideas", "Happy to follow along", "The peacemaker"] },
    { id: 6, text: "If a friend is sad, what would you do?", options: ["Try to cheer them up", "Sit quietly with them", "Get help from an adult", "Give them space"] },
    { id: 7, text: "How do you feel about being the center of attention?", options: ["I love it!", "It's okay sometimes", "I prefer being in a group", "I don't like it much"] },
    { id: 8, text: "When you have a problem, you usually...", options: ["Figure it out myself", "Ask for help right away", "Think about it for a while", "Talk to someone about it"] },
    { id: 9, text: "What makes you the happiest?", options: ["Playing with friends", "Quiet time alone", "Learning new things", "Helping others"] },
    { id: 10, text: "How do you feel about surprises?", options: ["I love them!", "Good surprises are fun", "I prefer knowing what's coming", "They can be scary"] }
  ],
  ru: [
    { id: 1, text: "Когда ты встречаешь новых людей, как ты себя чувствуешь?", options: ["Рад знакомству!", "Сначала немного стесняюсь", "Предпочитаю сначала понаблюдать", "Держусь рядом с теми, кого знаю"] },
    { id: 2, text: "Что тебе нравится делать, когда ты один?", options: ["Активные игры", "Читать или рисовать", "Конструировать", "Мечтать и фантазировать"] },
    { id: 3, text: "Если что-то не получается, что ты делаешь?", options: ["Пробую снова сразу", "Расстраиваюсь, но пробую позже", "Прошу кого-то помочь", "Пробую что-то другое"] },
    { id: 4, text: "Как ты относишься к новой еде?", options: ["Люблю пробовать новое!", "Только если выглядит вкусно", "Предпочитаю привычное", "Мне нужно время подумать"] },
    { id: 5, text: "Когда играешь с другими, ты обычно...", options: ["Лидер игры", "Предлагаю идеи", "С радостью следую за другими", "Примиряю всех"] },
    { id: 6, text: "Если друг грустит, что ты сделаешь?", options: ["Попробую развеселить", "Тихо посижу рядом", "Позову взрослого на помощь", "Дам ему побыть одному"] },
    { id: 7, text: "Как ты себя чувствуешь в центре внимания?", options: ["Мне нравится!", "Иногда нормально", "Предпочитаю быть в группе", "Не очень люблю"] },
    { id: 8, text: "Когда у тебя проблема, ты обычно...", options: ["Разбираюсь сам", "Сразу прошу помочь", "Думаю об этом", "Разговариваю с кем-то"] },
    { id: 9, text: "Что делает тебя самым счастливым?", options: ["Играть с друзьями", "Тихое время наедине", "Узнавать новое", "Помогать другим"] },
    { id: 10, text: "Как ты относишься к сюрпризам?", options: ["Обожаю!", "Хорошие сюрпризы — весело", "Предпочитаю знать заранее", "Они могут пугать"] }
  ],
  fr: [
    { id: 1, text: "Quand tu rencontres de nouvelles personnes, que ressens-tu?", options: ["Content de me faire des amis!", "Un peu timide au début", "Je préfère d'abord observer", "Je reste près de ceux que je connais"] },
    { id: 2, text: "Qu'aimes-tu faire quand tu es seul?", options: ["Des jeux actifs", "Lire ou dessiner", "Construire des choses", "Rêver et imaginer"] },
    { id: 3, text: "Si quelque chose ne va pas comme tu veux, que fais-tu?", options: ["J'essaie tout de suite", "Je suis déçu mais j'essaie après", "Je demande de l'aide", "J'essaie autre chose"] },
    { id: 4, text: "Que penses-tu d'essayer de nouveaux plats?", options: ["J'adore essayer du nouveau!", "Seulement si ça a l'air bon", "Je préfère ce que je connais", "J'ai besoin de temps pour décider"] },
    { id: 5, text: "Quand tu joues avec d'autres, tu es généralement...", options: ["Le chef du jeu", "Quelqu'un qui propose des idées", "Content de suivre", "Le médiateur"] },
    { id: 6, text: "Si un ami est triste, que ferais-tu?", options: ["Essayer de lui remonter le moral", "Rester tranquillement avec lui", "Demander l'aide d'un adulte", "Lui laisser de l'espace"] },
    { id: 7, text: "Comment te sens-tu au centre de l'attention?", options: ["J'adore!", "C'est ok parfois", "Je préfère être en groupe", "Je n'aime pas trop"] },
    { id: 8, text: "Quand tu as un problème, tu...", options: ["Le résous seul", "Demandes de l'aide tout de suite", "Y réfléchis longtemps", "En parles à quelqu'un"] },
    { id: 9, text: "Qu'est-ce qui te rend le plus heureux?", options: ["Jouer avec des amis", "Du temps calme seul", "Apprendre de nouvelles choses", "Aider les autres"] },
    { id: 10, text: "Que penses-tu des surprises?", options: ["J'adore!", "Les bonnes surprises sont fun", "Je préfère savoir ce qui arrive", "Ça peut faire peur"] }
  ],
  es: [
    { id: 1, text: "Cuando conoces gente nueva, ¿cómo te sientes?", options: ["¡Emocionado por hacer amigos!", "Un poco tímido al principio", "Prefiero observar primero", "Me quedo cerca de quienes conozco"] },
    { id: 2, text: "¿Qué te gusta hacer cuando estás solo?", options: ["Juegos activos", "Leer o dibujar", "Construir cosas", "Soñar e imaginar"] },
    { id: 3, text: "Si algo no sale como quieres, ¿qué haces?", options: ["Intento de nuevo enseguida", "Me molesto pero intento después", "Pido ayuda a alguien", "Intento algo diferente"] },
    { id: 4, text: "¿Qué piensas de probar comidas nuevas?", options: ["¡Me encanta probar cosas nuevas!", "Solo si se ven bien", "Prefiero lo que conozco", "Necesito tiempo para decidir"] },
    { id: 5, text: "Cuando juegas con otros, generalmente eres...", options: ["El líder del juego", "Quien sugiere ideas", "Feliz de seguir a otros", "El pacificador"] },
    { id: 6, text: "Si un amigo está triste, ¿qué harías?", options: ["Tratar de animarlo", "Sentarme tranquilo con él", "Buscar ayuda de un adulto", "Darle espacio"] },
    { id: 7, text: "¿Cómo te sientes siendo el centro de atención?", options: ["¡Me encanta!", "A veces está bien", "Prefiero estar en grupo", "No me gusta mucho"] },
    { id: 8, text: "Cuando tienes un problema, generalmente...", options: ["Lo resuelvo solo", "Pido ayuda enseguida", "Pienso en ello un rato", "Hablo con alguien"] },
    { id: 9, text: "¿Qué te hace más feliz?", options: ["Jugar con amigos", "Tiempo tranquilo solo", "Aprender cosas nuevas", "Ayudar a otros"] },
    { id: 10, text: "¿Qué piensas de las sorpresas?", options: ["¡Las amo!", "Las buenas sorpresas son divertidas", "Prefiero saber qué viene", "Pueden dar miedo"] }
  ],
  pt: [
    { id: 1, text: "Quando você conhece pessoas novas, como se sente?", options: ["Animado para fazer amigos!", "Um pouco tímido no início", "Prefiro observar primeiro", "Fico perto de quem conheço"] },
    { id: 2, text: "O que você gosta de fazer quando está sozinho?", options: ["Jogos ativos", "Ler ou desenhar", "Construir coisas", "Sonhar acordado e imaginar"] },
    { id: 3, text: "Se algo não sai do seu jeito, o que você faz?", options: ["Tento de novo na hora", "Fico chateado mas tento depois", "Peço ajuda a alguém", "Tento algo diferente"] },
    { id: 4, text: "O que você acha de experimentar comidas novas?", options: ["Adoro experimentar coisas novas!", "Só se parecer bom", "Prefiro o que conheço", "Preciso de tempo para decidir"] },
    { id: 5, text: "Quando brinca com outros, você geralmente é...", options: ["O líder da brincadeira", "Quem sugere ideias", "Feliz em seguir os outros", "O pacificador"] },
    { id: 6, text: "Se um amigo está triste, o que você faria?", options: ["Tentar animá-lo", "Ficar quieto com ele", "Pedir ajuda a um adulto", "Dar espaço a ele"] },
    { id: 7, text: "Como você se sente sendo o centro das atenções?", options: ["Adoro!", "Às vezes tudo bem", "Prefiro estar em grupo", "Não gosto muito"] },
    { id: 8, text: "Quando você tem um problema, geralmente...", options: ["Resolvo sozinho", "Peço ajuda na hora", "Penso nisso por um tempo", "Converso com alguém"] },
    { id: 9, text: "O que te faz mais feliz?", options: ["Brincar com amigos", "Tempo tranquilo sozinho", "Aprender coisas novas", "Ajudar os outros"] },
    { id: 10, text: "O que você acha de surpresas?", options: ["Adoro!", "Boas surpresas são legais", "Prefiro saber o que vem", "Podem assustar"] }
  ],
  uk: [
    { id: 1, text: "Коли ти зустрічаєш нових людей, як ти себе почуваєш?", options: ["Радий знайомству!", "Спочатку трохи соромлюся", "Волію спочатку спостерігати", "Тримаюся поряд з тими, кого знаю"] },
    { id: 2, text: "Що тобі подобається робити, коли ти один?", options: ["Активні ігри", "Читати або малювати", "Будувати щось", "Мріяти та уявляти"] },
    { id: 3, text: "Якщо щось не виходить, що ти робиш?", options: ["Пробую одразу знову", "Засмучуюся, але пробую пізніше", "Прошу когось допомогти", "Пробую щось інше"] },
    { id: 4, text: "Як ти ставишся до нової їжі?", options: ["Люблю пробувати нове!", "Тільки якщо виглядає смачно", "Волію звичне", "Мені потрібен час подумати"] },
    { id: 5, text: "Коли граєш з іншими, ти зазвичай...", options: ["Лідер гри", "Пропоную ідеї", "Із задоволенням слідую за іншими", "Примирювач"] },
    { id: 6, text: "Якщо друг сумує, що ти зробиш?", options: ["Спробую розвеселити", "Тихо посиджу поруч", "Покличу дорослого на допомогу", "Дам йому побути одному"] },
    { id: 7, text: "Як ти себе почуваєш у центрі уваги?", options: ["Мені подобається!", "Іноді нормально", "Волію бути в групі", "Не дуже люблю"] },
    { id: 8, text: "Коли у тебе проблема, ти зазвичай...", options: ["Розбираюся сам", "Одразу прошу допомоги", "Думаю про це", "Розмовляю з кимось"] },
    { id: 9, text: "Що робить тебе найщасливішим?", options: ["Гратися з друзями", "Тихий час наодинці", "Дізнаватися нове", "Допомагати іншим"] },
    { id: 10, text: "Як ти ставишся до сюрпризів?", options: ["Обожнюю!", "Хороші сюрпризи — весело", "Волію знати наперед", "Вони можуть лякати"] }
  ],
  ko: [
    { id: 1, text: "새로운 사람을 만나면 어떤 기분이에요?", options: ["새 친구 사귀어서 신나요!", "처음엔 좀 부끄러워요", "먼저 관찰하고 싶어요", "아는 사람 가까이 있어요"] },
    { id: 2, text: "혼자 있을 때 뭘 하고 싶어요?", options: ["활동적인 놀이", "책 읽기나 그림 그리기", "뭔가 만들기", "상상하고 꿈꾸기"] },
    { id: 3, text: "일이 뜻대로 안 되면 어떻게 해요?", options: ["바로 다시 해봐요", "속상하지만 나중에 해봐요", "누군가에게 도움을 구해요", "다른 걸 시도해요"] },
    { id: 4, text: "새로운 음식 먹어보는 거 어때요?", options: ["새로운 거 먹어보는 게 좋아요!", "맛있어 보이면요", "아는 음식이 좋아요", "결정하는 데 시간이 필요해요"] },
    { id: 5, text: "다른 아이들과 놀 때 보통...", options: ["놀이의 리더예요", "아이디어를 제안해요", "따라가는 게 좋아요", "평화롭게 해요"] },
    { id: 6, text: "친구가 슬퍼하면 어떻게 해요?", options: ["기분 좋게 해줘요", "조용히 옆에 있어요", "어른에게 도움을 구해요", "혼자 있게 해줘요"] },
    { id: 7, text: "관심의 중심이 되면 어떤 기분이에요?", options: ["좋아요!", "가끔은 괜찮아요", "그룹에 있는 게 좋아요", "별로 안 좋아해요"] },
    { id: 8, text: "문제가 있으면 보통...", options: ["혼자 해결해요", "바로 도움을 구해요", "한참 생각해요", "누군가와 이야기해요"] },
    { id: 9, text: "뭐가 가장 행복해요?", options: ["친구와 노는 것", "혼자 조용한 시간", "새로운 것 배우기", "다른 사람 돕기"] },
    { id: 10, text: "깜짝 선물은 어때요?", options: ["너무 좋아요!", "좋은 깜짝 선물은 재밌어요", "뭐가 올지 알고 싶어요", "무서울 수 있어요"] }
  ],
  zh: [
    { id: 1, text: "当你遇到新朋友时，你感觉怎样？", options: ["兴奋地想交朋友！", "一开始有点害羞", "我喜欢先观察", "我待在认识的人旁边"] },
    { id: 2, text: "独处时你喜欢做什么？", options: ["活跃的游戏", "阅读或画画", "搭建东西", "做白日梦和想象"] },
    { id: 3, text: "如果事情不顺利，你会怎么做？", options: ["马上再试", "难过但以后再试", "请人帮忙", "尝试别的"] },
    { id: 4, text: "你觉得尝试新食物怎么样？", options: ["我喜欢尝试新东西！", "只要看起来好吃", "我喜欢熟悉的", "我需要时间决定"] },
    { id: 5, text: "和别人一起玩时，你通常是...", options: ["游戏的领导者", "提出想法的人", "乐意跟随别人", "和事佬"] },
    { id: 6, text: "如果朋友难过了，你会怎么做？", options: ["尽量让他开心", "安静地陪着他", "找大人帮忙", "给他空间"] },
    { id: 7, text: "成为关注焦点时你感觉怎样？", options: ["我很喜欢！", "有时候可以", "我喜欢在群体中", "不太喜欢"] },
    { id: 8, text: "当你有问题时，你通常...", options: ["自己解决", "马上寻求帮助", "想很久", "和别人聊聊"] },
    { id: 9, text: "什么让你最开心？", options: ["和朋友玩", "独处的安静时光", "学习新东西", "帮助别人"] },
    { id: 10, text: "你觉得惊喜怎么样？", options: ["我很喜欢！", "好的惊喜很有趣", "我喜欢知道会发生什么", "可能会害怕"] }
  ]
};

// Questions for teens (11-16 years) - Personality & Character focused
const TEENS_QUESTIONS: Record<Language, LocalizedQuizQuestion[]> = {
  en: [
    { id: 1, text: "In a group project, you usually...", options: ["Take the lead naturally", "Contribute ideas actively", "Do your part quietly", "Prefer working alone"] },
    { id: 2, text: "When facing a stressful situation, you tend to...", options: ["Stay calm and think it through", "Get energized and take action", "Feel anxious but push through", "Need time to process alone"] },
    { id: 3, text: "Your ideal weekend looks like...", options: ["Hanging out with lots of friends", "Spending time with one close friend", "A mix of social and alone time", "Mostly peaceful time alone"] },
    { id: 4, text: "When someone disagrees with you, you...", options: ["Enjoy debating the topic", "Try to find common ground", "Usually let it go", "Get frustrated but stay quiet"] },
    { id: 5, text: "How organized are you with your things?", options: ["Very organized and tidy", "Organized enough to find things", "Creative chaos works for me", "I struggle with organization"] },
    { id: 6, text: "When trying something new, you feel...", options: ["Excited and eager to try", "Curious but a bit cautious", "Nervous but willing to try", "Prefer sticking to what I know"] },
    { id: 7, text: "How do you make decisions?", options: ["Trust my gut feeling", "Think through all options carefully", "Ask others for their opinion", "Avoid making decisions if possible"] },
    { id: 8, text: "When you're upset, you usually...", options: ["Talk about it immediately", "Need time before discussing", "Express it through creative outlets", "Keep it to myself"] },
    { id: 9, text: "How competitive are you?", options: ["Very - I always want to win", "Somewhat - winning is nice but not everything", "Not really - I prefer cooperation", "I avoid competition"] },
    { id: 10, text: "What energizes you most?", options: ["Being around lots of people", "Deep conversations with a few", "Pursuing my hobbies", "Quiet time to recharge"] }
  ],
  ru: [
    { id: 1, text: "В групповом проекте ты обычно...", options: ["Естественно берёшь на себя лидерство", "Активно предлагаешь идеи", "Тихо делаешь свою часть", "Предпочитаешь работать одному"] },
    { id: 2, text: "В стрессовой ситуации ты...", options: ["Остаёшься спокойным и обдумываешь", "Заряжаешься энергией и действуешь", "Нервничаешь, но справляешься", "Нужно время побыть одному"] },
    { id: 3, text: "Твои идеальные выходные выглядят как...", options: ["Тусовка с кучей друзей", "Время с одним близким другом", "Смесь общения и одиночества", "В основном спокойное время наедине"] },
    { id: 4, text: "Когда с тобой не согласны, ты...", options: ["Любишь подискутировать", "Пытаешься найти общее", "Обычно отпускаешь", "Расстраиваешься, но молчишь"] },
    { id: 5, text: "Насколько ты организован?", options: ["Очень организован и аккуратен", "Достаточно, чтобы найти вещи", "Творческий хаос работает для меня", "Мне сложно с организацией"] },
    { id: 6, text: "Когда пробуешь что-то новое, ты чувствуешь...", options: ["Восторг и желание попробовать", "Любопытство, но с осторожностью", "Нервничаю, но готов попробовать", "Предпочитаю привычное"] },
    { id: 7, text: "Как ты принимаешь решения?", options: ["Доверяю интуиции", "Тщательно обдумываю все варианты", "Спрашиваю мнение других", "Избегаю принятия решений если можно"] },
    { id: 8, text: "Когда ты расстроен, ты обычно...", options: ["Сразу говорю об этом", "Нужно время перед разговором", "Выражаю через творчество", "Держу в себе"] },
    { id: 9, text: "Насколько ты конкурентный?", options: ["Очень - всегда хочу победить", "Немного - победа приятна, но не главное", "Не особо - предпочитаю сотрудничество", "Избегаю конкуренции"] },
    { id: 10, text: "Что заряжает тебя энергией больше всего?", options: ["Быть среди множества людей", "Глубокие разговоры с немногими", "Заниматься своими хобби", "Тихое время для восстановления"] }
  ],
  fr: [
    { id: 1, text: "Dans un projet de groupe, tu...", options: ["Prends naturellement les commandes", "Contribues activement avec des idées", "Fais ta part discrètement", "Préfères travailler seul"] },
    { id: 2, text: "Face à une situation stressante, tu as tendance à...", options: ["Rester calme et réfléchir", "Te dynamiser et agir", "Te sentir anxieux mais continuer", "Avoir besoin de temps seul"] },
    { id: 3, text: "Ton week-end idéal ressemble à...", options: ["Traîner avec plein d'amis", "Passer du temps avec un ami proche", "Un mélange de social et de solitude", "Surtout du temps calme seul"] },
    { id: 4, text: "Quand quelqu'un n'est pas d'accord avec toi, tu...", options: ["Aimes débattre du sujet", "Cherches un terrain d'entente", "Laisses généralement tomber", "Es frustré mais restes silencieux"] },
    { id: 5, text: "À quel point es-tu organisé?", options: ["Très organisé et ordonné", "Assez pour trouver mes affaires", "Le chaos créatif me convient", "J'ai du mal avec l'organisation"] },
    { id: 6, text: "Quand tu essaies quelque chose de nouveau, tu te sens...", options: ["Excité et impatient d'essayer", "Curieux mais un peu prudent", "Nerveux mais prêt à essayer", "Préfères rester dans le connu"] },
    { id: 7, text: "Comment prends-tu des décisions?", options: ["Je fais confiance à mon instinct", "Je réfléchis à toutes les options", "Je demande l'avis des autres", "J'évite de décider si possible"] },
    { id: 8, text: "Quand tu es contrarié, tu...", options: ["En parles immédiatement", "As besoin de temps avant d'en discuter", "L'exprimes par des activités créatives", "Gardes ça pour toi"] },
    { id: 9, text: "À quel point es-tu compétitif?", options: ["Très - je veux toujours gagner", "Un peu - gagner c'est bien mais pas tout", "Pas vraiment - je préfère coopérer", "J'évite la compétition"] },
    { id: 10, text: "Qu'est-ce qui t'énergise le plus?", options: ["Être entouré de beaucoup de monde", "Des conversations profondes avec quelques-uns", "Poursuivre mes hobbies", "Du temps calme pour me ressourcer"] }
  ],
  es: [
    { id: 1, text: "En un proyecto grupal, tú generalmente...", options: ["Tomas el liderazgo naturalmente", "Contribuyes ideas activamente", "Haces tu parte tranquilamente", "Prefieres trabajar solo"] },
    { id: 2, text: "Ante una situación estresante, tiendes a...", options: ["Mantener la calma y pensar", "Energizarte y actuar", "Sentir ansiedad pero seguir adelante", "Necesitar tiempo a solas para procesar"] },
    { id: 3, text: "Tu fin de semana ideal es...", options: ["Salir con muchos amigos", "Pasar tiempo con un amigo cercano", "Una mezcla de social y soledad", "Mayormente tiempo tranquilo solo"] },
    { id: 4, text: "Cuando alguien no está de acuerdo contigo...", options: ["Disfrutas debatir el tema", "Intentas encontrar puntos en común", "Generalmente lo dejas pasar", "Te frustras pero te quedas callado"] },
    { id: 5, text: "¿Qué tan organizado eres?", options: ["Muy organizado y ordenado", "Lo suficiente para encontrar cosas", "El caos creativo me funciona", "Me cuesta organizarme"] },
    { id: 6, text: "Cuando pruebas algo nuevo, te sientes...", options: ["Emocionado y ansioso por probar", "Curioso pero un poco cauteloso", "Nervioso pero dispuesto a probar", "Prefieres quedarte con lo conocido"] },
    { id: 7, text: "¿Cómo tomas decisiones?", options: ["Confío en mi instinto", "Pienso en todas las opciones cuidadosamente", "Pido opiniones a otros", "Evito decidir si es posible"] },
    { id: 8, text: "Cuando estás molesto, generalmente...", options: ["Hablas de eso inmediatamente", "Necesitas tiempo antes de discutirlo", "Lo expresas a través de actividades creativas", "Lo guardas para ti"] },
    { id: 9, text: "¿Qué tan competitivo eres?", options: ["Mucho - siempre quiero ganar", "Algo - ganar es bueno pero no todo", "No mucho - prefiero cooperar", "Evito la competencia"] },
    { id: 10, text: "¿Qué te da más energía?", options: ["Estar rodeado de mucha gente", "Conversaciones profundas con pocos", "Perseguir mis pasatiempos", "Tiempo tranquilo para recargarme"] }
  ],
  pt: [
    { id: 1, text: "Em um projeto em grupo, você geralmente...", options: ["Assume a liderança naturalmente", "Contribui com ideias ativamente", "Faz sua parte quietamente", "Prefere trabalhar sozinho"] },
    { id: 2, text: "Diante de uma situação estressante, você tende a...", options: ["Manter a calma e pensar", "Se energizar e agir", "Sentir ansiedade mas seguir em frente", "Precisar de tempo sozinho para processar"] },
    { id: 3, text: "Seu fim de semana ideal é...", options: ["Sair com muitos amigos", "Passar tempo com um amigo próximo", "Uma mistura de social e solidão", "Principalmente tempo tranquilo sozinho"] },
    { id: 4, text: "Quando alguém discorda de você...", options: ["Gosta de debater o assunto", "Tenta encontrar pontos em comum", "Geralmente deixa passar", "Fica frustrado mas fica quieto"] },
    { id: 5, text: "O quão organizado você é?", options: ["Muito organizado e arrumado", "O suficiente para achar as coisas", "Caos criativo funciona para mim", "Tenho dificuldade com organização"] },
    { id: 6, text: "Quando tenta algo novo, você se sente...", options: ["Animado e ansioso para tentar", "Curioso mas um pouco cauteloso", "Nervoso mas disposto a tentar", "Prefere ficar no que conhece"] },
    { id: 7, text: "Como você toma decisões?", options: ["Confio na minha intuição", "Penso em todas as opções cuidadosamente", "Peço opinião dos outros", "Evito decidir se possível"] },
    { id: 8, text: "Quando você está chateado, geralmente...", options: ["Fala sobre isso imediatamente", "Precisa de tempo antes de discutir", "Expressa através de atividades criativas", "Guarda para si"] },
    { id: 9, text: "O quão competitivo você é?", options: ["Muito - sempre quero ganhar", "Um pouco - ganhar é bom mas não é tudo", "Não muito - prefiro cooperar", "Evito competição"] },
    { id: 10, text: "O que te dá mais energia?", options: ["Estar rodeado de muitas pessoas", "Conversas profundas com poucos", "Praticar meus hobbies", "Tempo tranquilo para recarregar"] }
  ],
  uk: [
    { id: 1, text: "У груповому проекті ти зазвичай...", options: ["Природно береш на себе лідерство", "Активно пропонуєш ідеї", "Тихо робиш свою частину", "Волієш працювати наодинці"] },
    { id: 2, text: "У стресовій ситуації ти...", options: ["Залишаєшся спокійним і обмірковуєш", "Заряджаєшся енергією і дієш", "Нервуєш, але справляєшся", "Потрібен час побути на самоті"] },
    { id: 3, text: "Твої ідеальні вихідні виглядають як...", options: ["Тусовка з купою друзів", "Час з одним близьким другом", "Суміш спілкування і самотності", "Переважно спокійний час наодинці"] },
    { id: 4, text: "Коли з тобою не погоджуються, ти...", options: ["Любиш подискутувати", "Намагаєшся знайти спільне", "Зазвичай відпускаєш", "Засмучуєшся, але мовчиш"] },
    { id: 5, text: "Наскільки ти організований?", options: ["Дуже організований і акуратний", "Достатньо, щоб знайти речі", "Творчий хаос працює для мене", "Мені важко з організацією"] },
    { id: 6, text: "Коли пробуєш щось нове, ти відчуваєш...", options: ["Захоплення і бажання спробувати", "Цікавість, але з обережністю", "Нервую, але готовий спробувати", "Волію звичне"] },
    { id: 7, text: "Як ти приймаєш рішення?", options: ["Довіряю інтуїції", "Ретельно обмірковую всі варіанти", "Питаю думку інших", "Уникаю прийняття рішень якщо можливо"] },
    { id: 8, text: "Коли ти засмучений, ти зазвичай...", options: ["Одразу говорю про це", "Потрібен час перед розмовою", "Виражаю через творчість", "Тримаю в собі"] },
    { id: 9, text: "Наскільки ти конкурентний?", options: ["Дуже - завжди хочу перемогти", "Трохи - перемога приємна, але не головне", "Не особливо - волію співпрацю", "Уникаю конкуренції"] },
    { id: 10, text: "Що заряджає тебе енергією найбільше?", options: ["Бути серед багатьох людей", "Глибокі розмови з небагатьма", "Займатися своїми хобі", "Тихий час для відновлення"] }
  ],
  ko: [
    { id: 1, text: "그룹 프로젝트에서 보통...", options: ["자연스럽게 리더 역할을 해요", "적극적으로 아이디어를 내요", "조용히 제 몫을 해요", "혼자 일하는 게 좋아요"] },
    { id: 2, text: "스트레스 상황에서 당신은...", options: ["침착하게 생각해요", "에너지를 받고 행동해요", "불안하지만 해나가요", "혼자 처리할 시간이 필요해요"] },
    { id: 3, text: "이상적인 주말은...", options: ["많은 친구들과 어울리기", "친한 친구 한 명과 시간 보내기", "사교와 혼자 시간의 조합", "대부분 조용히 혼자 있기"] },
    { id: 4, text: "누군가 의견이 다르면...", options: ["토론하는 게 좋아요", "공통점을 찾으려 해요", "보통 넘어가요", "답답하지만 조용히 있어요"] },
    { id: 5, text: "얼마나 정리정돈을 잘 해요?", options: ["매우 정리정돈을 잘해요", "물건 찾을 정도는 해요", "창의적 혼란이 저한테 맞아요", "정리가 어려워요"] },
    { id: 6, text: "새로운 것을 시도할 때...", options: ["신나고 하고 싶어요", "호기심은 있지만 조심스러워요", "긴장되지만 해볼 의향 있어요", "아는 것을 유지하는 게 좋아요"] },
    { id: 7, text: "어떻게 결정을 내려요?", options: ["직감을 믿어요", "모든 옵션을 신중히 생각해요", "다른 사람 의견을 구해요", "가능하면 결정을 피해요"] },
    { id: 8, text: "화가 나면 보통...", options: ["바로 이야기해요", "논의하기 전에 시간이 필요해요", "창의적 활동으로 표현해요", "혼자 간직해요"] },
    { id: 9, text: "얼마나 경쟁심이 있어요?", options: ["매우 - 항상 이기고 싶어요", "어느 정도 - 이기면 좋지만 전부는 아니에요", "별로 - 협력이 좋아요", "경쟁을 피해요"] },
    { id: 10, text: "무엇이 가장 에너지를 줘요?", options: ["많은 사람들과 함께 있기", "소수와 깊은 대화", "취미 활동하기", "충전할 조용한 시간"] }
  ],
  zh: [
    { id: 1, text: "在小组项目中，你通常...", options: ["自然地担任领导", "积极贡献想法", "安静地完成自己的部分", "更喜欢独自工作"] },
    { id: 2, text: "面对压力情况，你倾向于...", options: ["保持冷静并思考", "充满能量并采取行动", "感到焦虑但坚持", "需要独处时间来处理"] },
    { id: 3, text: "你理想的周末是...", options: ["和很多朋友一起玩", "和一个亲密朋友共度时光", "社交和独处时间的混合", "主要是安静地独处"] },
    { id: 4, text: "当有人不同意你时，你...", options: ["喜欢辩论这个话题", "尝试找到共同点", "通常算了", "感到沮丧但保持沉默"] },
    { id: 5, text: "你有多有条理？", options: ["非常有条理和整洁", "足够找到东西", "创造性的混乱适合我", "我很难组织"] },
    { id: 6, text: "尝试新事物时，你感觉...", options: ["兴奋且急于尝试", "好奇但有点谨慎", "紧张但愿意尝试", "更喜欢坚持我知道的"] },
    { id: 7, text: "你如何做决定？", options: ["相信我的直觉", "仔细考虑所有选项", "询问别人的意见", "尽可能避免做决定"] },
    { id: 8, text: "当你不高兴时，你通常...", options: ["立即谈论它", "需要时间再讨论", "通过创意活动表达", "自己藏在心里"] },
    { id: 9, text: "你有多强的竞争心？", options: ["很强 - 我总是想赢", "有点 - 赢是好的但不是一切", "不太 - 我更喜欢合作", "我避免竞争"] },
    { id: 10, text: "什么最能给你能量？", options: ["和很多人在一起", "和少数人深入交谈", "追求我的爱好", "安静的时间来充电"] }
  ]
};

// Questions for young adults (17-25 years) - Personality & Life Approach focused
const YOUNG_ADULTS_QUESTIONS: Record<Language, LocalizedQuizQuestion[]> = {
  en: [
    { id: 1, text: "How do you recharge after a long week?", options: ["Going out and socializing", "Relaxing at home alone", "Quality time with close friends", "Doing something creative or active"] },
    { id: 2, text: "When facing a big life decision, you tend to...", options: ["Go with your gut feeling", "Make detailed pro/con lists", "Seek advice from multiple people", "Delay until you absolutely must decide"] },
    { id: 3, text: "Your approach to planning is...", options: ["I plan everything meticulously", "I have a general plan but stay flexible", "I prefer spontaneity", "Planning stresses me out"] },
    { id: 4, text: "In social situations, you typically...", options: ["Thrive and feel energized", "Enjoy them but need recovery time", "Prefer smaller gatherings", "Find them draining"] },
    { id: 5, text: "How do you handle criticism?", options: ["Welcome it as growth opportunity", "Accept it but need time to process", "Take it personally initially", "Struggle with it significantly"] },
    { id: 6, text: "Your communication style is...", options: ["Direct and straightforward", "Diplomatic and careful", "Expressive and emotional", "Reserved and thoughtful"] },
    { id: 7, text: "When someone shares a problem, you usually...", options: ["Offer solutions immediately", "Listen and empathize first", "Share similar experiences", "Ask what they need from you"] },
    { id: 8, text: "How do you view change?", options: ["Exciting opportunity for growth", "Challenging but manageable", "Uncomfortable but necessary", "Prefer stability and routine"] },
    { id: 9, text: "Your emotional expression tends to be...", options: ["Open and visible to everyone", "Shared only with close people", "Processed internally first", "Kept mostly private"] },
    { id: 10, text: "What motivates you most?", options: ["Achievement and success", "Making a positive impact", "Personal growth and learning", "Security and stability"] }
  ],
  ru: [
    { id: 1, text: "Как вы восстанавливаетесь после долгой недели?", options: ["Выхожу и общаюсь с людьми", "Отдыхаю дома в одиночестве", "Провожу время с близкими друзьями", "Занимаюсь чем-то творческим или активным"] },
    { id: 2, text: "Принимая важное жизненное решение, вы...", options: ["Доверяете интуиции", "Составляете подробные списки за/против", "Спрашиваете совета у многих", "Откладываете до последнего"] },
    { id: 3, text: "Ваш подход к планированию...", options: ["Планирую всё детально", "Есть общий план, но гибко", "Предпочитаю спонтанность", "Планирование меня стрессирует"] },
    { id: 4, text: "В социальных ситуациях вы...", options: ["Расцветаете и заряжаетесь", "Получаете удовольствие, но нужно восстановление", "Предпочитаете небольшие компании", "Чувствуете себя истощённым"] },
    { id: 5, text: "Как вы воспринимаете критику?", options: ["Приветствую как возможность роста", "Принимаю, но нужно время осмыслить", "Сначала воспринимаю на свой счёт", "Тяжело переношу"] },
    { id: 6, text: "Ваш стиль общения...", options: ["Прямой и откровенный", "Дипломатичный и осторожный", "Выразительный и эмоциональный", "Сдержанный и вдумчивый"] },
    { id: 7, text: "Когда кто-то делится проблемой, вы обычно...", options: ["Сразу предлагаете решения", "Сначала слушаете и сочувствуете", "Делитесь похожим опытом", "Спрашиваете, что им нужно от вас"] },
    { id: 8, text: "Как вы относитесь к переменам?", options: ["Захватывающая возможность для роста", "Сложно, но справляюсь", "Некомфортно, но необходимо", "Предпочитаю стабильность и рутину"] },
    { id: 9, text: "Ваше эмоциональное выражение обычно...", options: ["Открытое и видимое всем", "Делюсь только с близкими", "Сначала обрабатываю внутренне", "В основном держу при себе"] },
    { id: 10, text: "Что мотивирует вас больше всего?", options: ["Достижения и успех", "Позитивное влияние на других", "Личностный рост и обучение", "Безопасность и стабильность"] }
  ],
  fr: [
    { id: 1, text: "Comment vous rechargez-vous après une longue semaine?", options: ["En sortant et en socialisant", "En me relaxant seul à la maison", "En passant du temps de qualité avec des amis proches", "En faisant quelque chose de créatif ou actif"] },
    { id: 2, text: "Face à une grande décision de vie, vous avez tendance à...", options: ["Suivre votre instinct", "Faire des listes détaillées pour/contre", "Demander conseil à plusieurs personnes", "Reporter jusqu'au dernier moment"] },
    { id: 3, text: "Votre approche de la planification est...", options: ["Je planifie tout méticuleusement", "J'ai un plan général mais reste flexible", "Je préfère la spontanéité", "La planification me stresse"] },
    { id: 4, text: "Dans les situations sociales, vous...", options: ["Vous épanouissez et vous sentez énergisé", "En profitez mais avez besoin de récupérer", "Préférez les petits groupes", "Les trouvez épuisantes"] },
    { id: 5, text: "Comment gérez-vous la critique?", options: ["Je l'accueille comme une opportunité de croissance", "Je l'accepte mais j'ai besoin de temps pour traiter", "Je le prends personnellement au début", "J'ai beaucoup de mal avec"] },
    { id: 6, text: "Votre style de communication est...", options: ["Direct et franc", "Diplomatique et prudent", "Expressif et émotionnel", "Réservé et réfléchi"] },
    { id: 7, text: "Quand quelqu'un partage un problème, vous...", options: ["Offrez des solutions immédiatement", "Écoutez et compatissez d'abord", "Partagez des expériences similaires", "Demandez ce qu'ils attendent de vous"] },
    { id: 8, text: "Comment voyez-vous le changement?", options: ["Une opportunité passionnante de croissance", "Difficile mais gérable", "Inconfortable mais nécessaire", "Je préfère la stabilité et la routine"] },
    { id: 9, text: "Votre expression émotionnelle tend à être...", options: ["Ouverte et visible pour tous", "Partagée seulement avec les proches", "D'abord traitée intérieurement", "Gardée principalement privée"] },
    { id: 10, text: "Qu'est-ce qui vous motive le plus?", options: ["L'accomplissement et le succès", "Avoir un impact positif", "La croissance personnelle et l'apprentissage", "La sécurité et la stabilité"] }
  ],
  es: [
    { id: 1, text: "¿Cómo te recargas después de una semana larga?", options: ["Saliendo y socializando", "Relajándome solo en casa", "Tiempo de calidad con amigos cercanos", "Haciendo algo creativo o activo"] },
    { id: 2, text: "Al enfrentar una decisión importante, tiendes a...", options: ["Seguir tu instinto", "Hacer listas detalladas de pros/contras", "Buscar consejo de varias personas", "Postergar hasta que debas decidir"] },
    { id: 3, text: "Tu enfoque de planificación es...", options: ["Planifico todo meticulosamente", "Tengo un plan general pero soy flexible", "Prefiero la espontaneidad", "Planificar me estresa"] },
    { id: 4, text: "En situaciones sociales, tú...", options: ["Florezco y me siento energizado", "Las disfruto pero necesito recuperarme", "Prefiero reuniones pequeñas", "Las encuentro agotadoras"] },
    { id: 5, text: "¿Cómo manejas la crítica?", options: ["La recibo como oportunidad de crecimiento", "La acepto pero necesito tiempo para procesar", "Al principio lo tomo personal", "Me cuesta bastante"] },
    { id: 6, text: "Tu estilo de comunicación es...", options: ["Directo y franco", "Diplomático y cuidadoso", "Expresivo y emocional", "Reservado y reflexivo"] },
    { id: 7, text: "Cuando alguien comparte un problema, usualmente...", options: ["Ofrezco soluciones inmediatamente", "Primero escucho y empatizo", "Comparto experiencias similares", "Pregunto qué necesitan de mí"] },
    { id: 8, text: "¿Cómo ves el cambio?", options: ["Oportunidad emocionante de crecimiento", "Desafiante pero manejable", "Incómodo pero necesario", "Prefiero estabilidad y rutina"] },
    { id: 9, text: "Tu expresión emocional tiende a ser...", options: ["Abierta y visible para todos", "Compartida solo con personas cercanas", "Procesada internamente primero", "Principalmente privada"] },
    { id: 10, text: "¿Qué te motiva más?", options: ["Logro y éxito", "Tener un impacto positivo", "Crecimiento personal y aprendizaje", "Seguridad y estabilidad"] }
  ],
  pt: [
    { id: 1, text: "Como você recarrega após uma semana longa?", options: ["Saindo e socializando", "Relaxando sozinho em casa", "Tempo de qualidade com amigos próximos", "Fazendo algo criativo ou ativo"] },
    { id: 2, text: "Ao enfrentar uma grande decisão, você tende a...", options: ["Seguir sua intuição", "Fazer listas detalhadas de prós/contras", "Buscar conselho de várias pessoas", "Adiar até precisar decidir"] },
    { id: 3, text: "Sua abordagem de planejamento é...", options: ["Planejo tudo meticulosamente", "Tenho um plano geral mas sou flexível", "Prefiro espontaneidade", "Planejar me estressa"] },
    { id: 4, text: "Em situações sociais, você...", options: ["Prospera e se sente energizado", "Aproveita mas precisa de recuperação", "Prefere encontros menores", "Acha esgotante"] },
    { id: 5, text: "Como você lida com críticas?", options: ["Recebo como oportunidade de crescimento", "Aceito mas preciso de tempo para processar", "Levo para o pessoal no início", "Tenho muita dificuldade"] },
    { id: 6, text: "Seu estilo de comunicação é...", options: ["Direto e franco", "Diplomático e cuidadoso", "Expressivo e emocional", "Reservado e pensativo"] },
    { id: 7, text: "Quando alguém compartilha um problema, você geralmente...", options: ["Oferece soluções imediatamente", "Primeiro ouve e se solidariza", "Compartilha experiências similares", "Pergunta o que precisam de você"] },
    { id: 8, text: "Como você vê mudanças?", options: ["Oportunidade empolgante de crescimento", "Desafiador mas gerenciável", "Desconfortável mas necessário", "Prefiro estabilidade e rotina"] },
    { id: 9, text: "Sua expressão emocional tende a ser...", options: ["Aberta e visível para todos", "Compartilhada apenas com pessoas próximas", "Processada internamente primeiro", "Mantida principalmente privada"] },
    { id: 10, text: "O que te motiva mais?", options: ["Conquistas e sucesso", "Ter um impacto positivo", "Crescimento pessoal e aprendizado", "Segurança e estabilidade"] }
  ],
  uk: [
    { id: 1, text: "Як ви відновлюєтеся після довгого тижня?", options: ["Виходжу та спілкуюся", "Відпочиваю вдома на самоті", "Проводжу час з близькими друзями", "Займаюся чимось творчим або активним"] },
    { id: 2, text: "Приймаючи важливе життєве рішення, ви...", options: ["Довіряєте інтуїції", "Складаєте детальні списки за/проти", "Питаєте поради у багатьох", "Відкладаєте до останнього"] },
    { id: 3, text: "Ваш підхід до планування...", options: ["Планую все детально", "Є загальний план, але гнучко", "Віддаю перевагу спонтанності", "Планування мене стресує"] },
    { id: 4, text: "У соціальних ситуаціях ви...", options: ["Розквітаєте і заряджаєтеся", "Отримуєте задоволення, але потрібно відновитися", "Віддаєте перевагу невеликим компаніям", "Відчуваєте себе виснаженим"] },
    { id: 5, text: "Як ви сприймаєте критику?", options: ["Вітаю як можливість зростання", "Приймаю, але потрібен час осмислити", "Спочатку сприймаю на свій рахунок", "Важко переношу"] },
    { id: 6, text: "Ваш стиль спілкування...", options: ["Прямий і відвертий", "Дипломатичний і обережний", "Виразний та емоційний", "Стриманий і вдумливий"] },
    { id: 7, text: "Коли хтось ділиться проблемою, ви зазвичай...", options: ["Одразу пропонуєте рішення", "Спочатку слухаєте і співчуваєте", "Ділитеся схожим досвідом", "Питаєте, що їм потрібно від вас"] },
    { id: 8, text: "Як ви ставитеся до змін?", options: ["Захоплююча можливість для зростання", "Складно, але справляюся", "Некомфортно, але необхідно", "Віддаю перевагу стабільності та рутині"] },
    { id: 9, text: "Ваше емоційне вираження зазвичай...", options: ["Відкрите і видиме всім", "Ділюся лише з близькими", "Спочатку обробляю внутрішньо", "Переважно тримаю при собі"] },
    { id: 10, text: "Що мотивує вас найбільше?", options: ["Досягнення та успіх", "Позитивний вплив на інших", "Особистісний ріст та навчання", "Безпека та стабільність"] }
  ],
  ko: [
    { id: 1, text: "긴 한 주 후에 어떻게 충전해요?", options: ["나가서 사교활동하기", "집에서 혼자 휴식하기", "친한 친구와 알찬 시간 보내기", "창의적이거나 활동적인 것 하기"] },
    { id: 2, text: "큰 인생 결정을 내릴 때...", options: ["직감을 따라요", "상세한 장단점 목록을 만들어요", "여러 사람에게 조언을 구해요", "꼭 결정해야 할 때까지 미뤄요"] },
    { id: 3, text: "계획에 대한 접근 방식은...", options: ["모든 것을 꼼꼼히 계획해요", "대략적인 계획은 있지만 유연해요", "즉흥적인 것을 선호해요", "계획 세우기가 스트레스예요"] },
    { id: 4, text: "사회적 상황에서 당신은...", options: ["번창하고 에너지를 받아요", "즐기지만 회복 시간이 필요해요", "소규모 모임을 선호해요", "지친다고 느껴요"] },
    { id: 5, text: "비판을 어떻게 받아들여요?", options: ["성장 기회로 환영해요", "받아들이지만 처리할 시간이 필요해요", "처음에는 개인적으로 받아들여요", "상당히 힘들어해요"] },
    { id: 6, text: "당신의 소통 스타일은...", options: ["직접적이고 솔직해요", "외교적이고 조심스러워요", "표현적이고 감정적이에요", "내성적이고 사려 깊어요"] },
    { id: 7, text: "누군가 문제를 공유하면 보통...", options: ["즉시 해결책을 제안해요", "먼저 듣고 공감해요", "비슷한 경험을 공유해요", "그들이 뭘 원하는지 물어봐요"] },
    { id: 8, text: "변화를 어떻게 봐요?", options: ["성장을 위한 흥미로운 기회", "도전적이지만 관리 가능해요", "불편하지만 필요해요", "안정과 루틴을 선호해요"] },
    { id: 9, text: "감정 표현은 보통...", options: ["모두에게 열려있고 보여요", "가까운 사람에게만 공유해요", "먼저 내부적으로 처리해요", "대부분 비밀로 유지해요"] },
    { id: 10, text: "무엇이 가장 동기를 부여해요?", options: ["성취와 성공", "긍정적인 영향 주기", "개인 성장과 학습", "안전과 안정"] }
  ],
  zh: [
    { id: 1, text: "漫长的一周后你怎么充电？", options: ["外出社交", "独自在家放松", "和亲密朋友度过优质时光", "做一些创造性或活跃的事"] },
    { id: 2, text: "面对重大人生决定时，你倾向于...", options: ["跟着直觉走", "做详细的利弊清单", "向多人寻求建议", "拖延到必须决定为止"] },
    { id: 3, text: "你的计划方式是...", options: ["我精心计划一切", "有大致计划但保持灵活", "我更喜欢随性", "计划让我有压力"] },
    { id: 4, text: "在社交场合，你通常...", options: ["茁壮成长并感到充满活力", "享受但需要恢复时间", "更喜欢小型聚会", "觉得累人"] },
    { id: 5, text: "你如何处理批评？", options: ["欢迎它作为成长机会", "接受但需要时间消化", "一开始会往心里去", "很难处理"] },
    { id: 6, text: "你的沟通风格是...", options: ["直接了当", "外交而谨慎", "富有表现力和情感", "内敛而深思熟虑"] },
    { id: 7, text: "当有人分享问题时，你通常...", options: ["立即提供解决方案", "先倾听和同情", "分享类似的经历", "问他们需要你做什么"] },
    { id: 8, text: "你如何看待变化？", options: ["令人兴奋的成长机会", "有挑战但可以应对", "不舒服但必要", "更喜欢稳定和常规"] },
    { id: 9, text: "你的情感表达倾向于...", options: ["对所有人开放可见", "只与亲近的人分享", "先在内部处理", "主要保持私密"] },
    { id: 10, text: "什么最能激励你？", options: ["成就和成功", "产生积极影响", "个人成长和学习", "安全和稳定"] }
  ]
};

// Questions for adults (26+) - Personality & Character focused
const ADULTS_QUESTIONS: Record<Language, LocalizedQuizQuestion[]> = {
  en: [
    { id: 1, text: "In your free time, you prefer to...", options: ["Be social and around others", "Have a balance of both", "Spend time on personal hobbies", "Enjoy solitude and quiet"] },
    { id: 2, text: "When making important decisions, you rely on...", options: ["Logic and careful analysis", "Intuition and gut feelings", "Values and personal beliefs", "Input from trusted people"] },
    { id: 3, text: "How do you handle unexpected changes in plans?", options: ["Adapt easily and find it exciting", "Adjust but need a moment", "Feel uncomfortable but cope", "Prefer to stick to original plans"] },
    { id: 4, text: "Your approach to conflict is usually to...", options: ["Address it directly and honestly", "Find a diplomatic solution", "Avoid it if possible", "Take time to process before responding"] },
    { id: 5, text: "How would close friends describe you?", options: ["Energetic and outgoing", "Thoughtful and reliable", "Creative and independent", "Calm and supportive"] },
    { id: 6, text: "When stressed, you tend to...", options: ["Talk to others about it", "Analyze and find solutions", "Need alone time to recharge", "Keep busy to avoid thinking about it"] },
    { id: 7, text: "Your ideal work environment is...", options: ["Collaborative and social", "Structured with clear expectations", "Flexible and autonomous", "Quiet and focused"] },
    { id: 8, text: "How do you prefer to learn new things?", options: ["Through discussion and interaction", "By reading and researching", "Hands-on experience", "Observation and reflection"] },
    { id: 9, text: "When it comes to rules and traditions, you...", options: ["Value them as important structure", "Follow them when they make sense", "Prefer to question and improve them", "Often find them limiting"] },
    { id: 10, text: "What gives your life the most meaning?", options: ["Relationships and connections", "Achievements and accomplishments", "Personal growth and experiences", "Contribution and helping others"] }
  ],
  ru: [
    { id: 1, text: "В свободное время вы предпочитаете...", options: ["Быть в обществе людей", "Баланс между общением и одиночеством", "Заниматься личными хобби", "Наслаждаться одиночеством и тишиной"] },
    { id: 2, text: "Принимая важные решения, вы полагаетесь на...", options: ["Логику и тщательный анализ", "Интуицию и внутреннее чутьё", "Ценности и убеждения", "Мнение людей, которым доверяете"] },
    { id: 3, text: "Как вы справляетесь с неожиданными изменениями планов?", options: ["Легко адаптируюсь, это интересно", "Приспосабливаюсь, но нужен момент", "Некомфортно, но справляюсь", "Предпочитаю придерживаться изначальных планов"] },
    { id: 4, text: "Ваш подход к конфликтам обычно...", options: ["Решаю напрямую и честно", "Ищу дипломатическое решение", "Избегаю если возможно", "Беру время на осмысление"] },
    { id: 5, text: "Как близкие друзья описали бы вас?", options: ["Энергичный и общительный", "Вдумчивый и надёжный", "Творческий и независимый", "Спокойный и поддерживающий"] },
    { id: 6, text: "В стрессе вы обычно...", options: ["Разговариваете с другими об этом", "Анализируете и ищете решения", "Нуждаетесь во времени наедине", "Загружаете себя, чтобы не думать"] },
    { id: 7, text: "Ваша идеальная рабочая среда...", options: ["Коллективная и социальная", "Структурированная с чёткими ожиданиями", "Гибкая и автономная", "Тихая и сосредоточенная"] },
    { id: 8, text: "Как вы предпочитаете изучать новое?", options: ["Через обсуждение и взаимодействие", "Читая и исследуя", "На практике", "Наблюдая и размышляя"] },
    { id: 9, text: "Что касается правил и традиций, вы...", options: ["Цените их как важную структуру", "Следуете им, когда есть смысл", "Предпочитаете ставить под сомнение и улучшать", "Часто находите их ограничивающими"] },
    { id: 10, text: "Что придаёт вашей жизни наибольший смысл?", options: ["Отношения и связи", "Достижения и успехи", "Личностный рост и опыт", "Вклад и помощь другим"] }
  ],
  fr: [
    { id: 1, text: "Dans votre temps libre, vous préférez...", options: ["Être social et entouré d'autres", "Avoir un équilibre des deux", "Passer du temps sur vos hobbies", "Profiter de la solitude et du calme"] },
    { id: 2, text: "Pour prendre des décisions importantes, vous vous fiez à...", options: ["La logique et l'analyse soigneuse", "L'intuition et le ressenti", "Les valeurs et croyances personnelles", "L'avis de personnes de confiance"] },
    { id: 3, text: "Comment gérez-vous les changements imprévus?", options: ["Je m'adapte facilement, c'est excitant", "Je m'ajuste mais j'ai besoin d'un moment", "Inconfortable mais je gère", "Je préfère m'en tenir aux plans initiaux"] },
    { id: 4, text: "Votre approche des conflits est généralement de...", options: ["Les aborder directement et honnêtement", "Trouver une solution diplomatique", "Les éviter si possible", "Prendre du temps pour réfléchir avant de répondre"] },
    { id: 5, text: "Comment vos amis proches vous décriraient-ils?", options: ["Énergique et extraverti", "Réfléchi et fiable", "Créatif et indépendant", "Calme et soutenant"] },
    { id: 6, text: "Quand vous êtes stressé, vous avez tendance à...", options: ["En parler aux autres", "Analyser et trouver des solutions", "Avoir besoin de temps seul pour récupérer", "Rester occupé pour éviter d'y penser"] },
    { id: 7, text: "Votre environnement de travail idéal est...", options: ["Collaboratif et social", "Structuré avec des attentes claires", "Flexible et autonome", "Calme et concentré"] },
    { id: 8, text: "Comment préférez-vous apprendre de nouvelles choses?", options: ["Par la discussion et l'interaction", "En lisant et en recherchant", "Par l'expérience pratique", "Par l'observation et la réflexion"] },
    { id: 9, text: "Concernant les règles et traditions, vous...", options: ["Les valorisez comme structure importante", "Les suivez quand elles ont du sens", "Préférez les questionner et améliorer", "Les trouvez souvent limitantes"] },
    { id: 10, text: "Qu'est-ce qui donne le plus de sens à votre vie?", options: ["Les relations et connexions", "Les accomplissements et réussites", "La croissance personnelle et les expériences", "La contribution et l'aide aux autres"] }
  ],
  es: [
    { id: 1, text: "En tu tiempo libre, prefieres...", options: ["Ser social y estar con otros", "Tener un equilibrio de ambos", "Pasar tiempo en pasatiempos personales", "Disfrutar la soledad y el silencio"] },
    { id: 2, text: "Al tomar decisiones importantes, te basas en...", options: ["Lógica y análisis cuidadoso", "Intuición y corazonadas", "Valores y creencias personales", "Opinión de personas de confianza"] },
    { id: 3, text: "¿Cómo manejas los cambios inesperados de planes?", options: ["Me adapto fácil y lo encuentro emocionante", "Me ajusto pero necesito un momento", "Me siento incómodo pero lo manejo", "Prefiero mantener los planes originales"] },
    { id: 4, text: "Tu enfoque ante los conflictos generalmente es...", options: ["Abordarlos directa y honestamente", "Encontrar una solución diplomática", "Evitarlos si es posible", "Tomarme tiempo para procesar antes de responder"] },
    { id: 5, text: "¿Cómo te describirían tus amigos cercanos?", options: ["Energético y extrovertido", "Reflexivo y confiable", "Creativo e independiente", "Tranquilo y solidario"] },
    { id: 6, text: "Cuando estás estresado, tiendes a...", options: ["Hablar con otros al respecto", "Analizar y buscar soluciones", "Necesitar tiempo a solas para recargarme", "Mantenerme ocupado para evitar pensarlo"] },
    { id: 7, text: "Tu ambiente de trabajo ideal es...", options: ["Colaborativo y social", "Estructurado con expectativas claras", "Flexible y autónomo", "Tranquilo y enfocado"] },
    { id: 8, text: "¿Cómo prefieres aprender cosas nuevas?", options: ["A través de discusión e interacción", "Leyendo e investigando", "Experiencia práctica", "Observación y reflexión"] },
    { id: 9, text: "En cuanto a reglas y tradiciones, tú...", options: ["Las valoras como estructura importante", "Las sigues cuando tienen sentido", "Prefieres cuestionarlas y mejorarlas", "A menudo las encuentras limitantes"] },
    { id: 10, text: "¿Qué le da más significado a tu vida?", options: ["Relaciones y conexiones", "Logros y éxitos", "Crecimiento personal y experiencias", "Contribución y ayudar a otros"] }
  ],
  pt: [
    { id: 1, text: "No seu tempo livre, você prefere...", options: ["Ser social e estar com outros", "Ter um equilíbrio de ambos", "Passar tempo em hobbies pessoais", "Aproveitar a solidão e o silêncio"] },
    { id: 2, text: "Ao tomar decisões importantes, você confia em...", options: ["Lógica e análise cuidadosa", "Intuição e sensações", "Valores e crenças pessoais", "Opinião de pessoas de confiança"] },
    { id: 3, text: "Como você lida com mudanças inesperadas de planos?", options: ["Adapto facilmente e acho empolgante", "Me ajusto mas preciso de um momento", "Me sinto desconfortável mas lido", "Prefiro manter os planos originais"] },
    { id: 4, text: "Sua abordagem a conflitos geralmente é...", options: ["Abordar direta e honestamente", "Encontrar uma solução diplomática", "Evitar se possível", "Tomar tempo para processar antes de responder"] },
    { id: 5, text: "Como seus amigos próximos te descreveriam?", options: ["Energético e extrovertido", "Reflexivo e confiável", "Criativo e independente", "Calmo e solidário"] },
    { id: 6, text: "Quando estressado, você tende a...", options: ["Conversar com outros sobre isso", "Analisar e encontrar soluções", "Precisar de tempo sozinho para recarregar", "Se manter ocupado para evitar pensar nisso"] },
    { id: 7, text: "Seu ambiente de trabalho ideal é...", options: ["Colaborativo e social", "Estruturado com expectativas claras", "Flexível e autônomo", "Calmo e focado"] },
    { id: 8, text: "Como você prefere aprender coisas novas?", options: ["Através de discussão e interação", "Lendo e pesquisando", "Experiência prática", "Observação e reflexão"] },
    { id: 9, text: "Quanto a regras e tradições, você...", options: ["As valoriza como estrutura importante", "As segue quando fazem sentido", "Prefere questioná-las e melhorá-las", "Frequentemente as acha limitantes"] },
    { id: 10, text: "O que dá mais significado à sua vida?", options: ["Relacionamentos e conexões", "Conquistas e realizações", "Crescimento pessoal e experiências", "Contribuição e ajudar outros"] }
  ],
  uk: [
    { id: 1, text: "У вільний час ви віддаєте перевагу...", options: ["Бути в товаристві людей", "Балансу між спілкуванням і самотністю", "Займатися особистими хобі", "Насолоджуватися самотністю і тишею"] },
    { id: 2, text: "Приймаючи важливі рішення, ви покладаєтеся на...", options: ["Логіку та ретельний аналіз", "Інтуїцію та внутрішнє чуття", "Цінності та переконання", "Думку людей, яким довіряєте"] },
    { id: 3, text: "Як ви справляєтеся з несподіваними змінами планів?", options: ["Легко адаптуюся, це цікаво", "Пристосовуюся, але потрібен момент", "Некомфортно, але справляюся", "Віддаю перевагу початковим планам"] },
    { id: 4, text: "Ваш підхід до конфліктів зазвичай...", options: ["Вирішую напряму і чесно", "Шукаю дипломатичне рішення", "Уникаю якщо можливо", "Беру час на осмислення"] },
    { id: 5, text: "Як близькі друзі описали б вас?", options: ["Енергійний і товариський", "Вдумливий і надійний", "Творчий і незалежний", "Спокійний і підтримуючий"] },
    { id: 6, text: "У стресі ви зазвичай...", options: ["Розмовляєте з іншими про це", "Аналізуєте і шукаєте рішення", "Потребуєте часу наодинці", "Завантажуєте себе, щоб не думати"] },
    { id: 7, text: "Ваше ідеальне робоче середовище...", options: ["Колективне і соціальне", "Структуроване з чіткими очікуваннями", "Гнучке і автономне", "Тихе і зосереджене"] },
    { id: 8, text: "Як ви віддаєте перевагу вивчати нове?", options: ["Через обговорення і взаємодію", "Читаючи і досліджуючи", "На практиці", "Спостерігаючи і розмірковуючи"] },
    { id: 9, text: "Щодо правил і традицій, ви...", options: ["Цінуєте їх як важливу структуру", "Дотримуєтеся, коли є сенс", "Віддаєте перевагу ставити під сумнів і покращувати", "Часто вважаєте їх обмежуючими"] },
    { id: 10, text: "Що надає вашому життю найбільший сенс?", options: ["Стосунки і зв'язки", "Досягнення та успіхи", "Особистісний ріст та досвід", "Внесок і допомога іншим"] }
  ],
  ko: [
    { id: 1, text: "여가 시간에 당신은...", options: ["사교적이고 다른 사람들과 함께하기", "둘 다 균형 맞추기", "개인 취미에 시간 보내기", "고독과 조용함 즐기기"] },
    { id: 2, text: "중요한 결정을 내릴 때 당신은 의지하는 것은...", options: ["논리와 신중한 분석", "직관과 직감", "가치관과 개인 신념", "신뢰하는 사람들의 의견"] },
    { id: 3, text: "예상치 못한 계획 변경을 어떻게 처리해요?", options: ["쉽게 적응하고 흥미로워요", "적응하지만 시간이 필요해요", "불편하지만 대처해요", "원래 계획을 고수하는 게 좋아요"] },
    { id: 4, text: "갈등에 대한 접근 방식은 보통...", options: ["직접적이고 솔직하게 해결", "외교적 해결책 찾기", "가능하면 피하기", "반응하기 전에 처리할 시간 갖기"] },
    { id: 5, text: "친한 친구들이 당신을 어떻게 묘사할까요?", options: ["에너지 넘치고 외향적", "사려 깊고 믿을 수 있는", "창의적이고 독립적인", "차분하고 지지하는"] },
    { id: 6, text: "스트레스 받으면 보통...", options: ["다른 사람들과 이야기해요", "분석하고 해결책을 찾아요", "혼자 충전할 시간이 필요해요", "생각을 피하려고 바쁘게 지내요"] },
    { id: 7, text: "이상적인 업무 환경은...", options: ["협력적이고 사교적인", "명확한 기대가 있는 체계적인", "유연하고 자율적인", "조용하고 집중할 수 있는"] },
    { id: 8, text: "새로운 것을 배우는 방식은...", options: ["토론과 상호작용을 통해", "읽고 연구하며", "실습 경험으로", "관찰과 성찰로"] },
    { id: 9, text: "규칙과 전통에 관해 당신은...", options: ["중요한 구조로 가치 있게 여겨요", "이치에 맞을 때 따라요", "의문을 제기하고 개선하는 것을 선호해요", "종종 제한적이라고 느껴요"] },
    { id: 10, text: "무엇이 당신 삶에 가장 큰 의미를 주나요?", options: ["관계와 연결", "성취와 업적", "개인 성장과 경험", "기여와 다른 사람 돕기"] }
  ],
  zh: [
    { id: 1, text: "在空闲时间，你更喜欢...", options: ["社交和与他人在一起", "两者平衡", "花时间在个人爱好上", "享受独处和安静"] },
    { id: 2, text: "做重要决定时，你依赖...", options: ["逻辑和仔细分析", "直觉和第六感", "价值观和个人信念", "信任的人的意见"] },
    { id: 3, text: "你如何处理意外的计划变更？", options: ["轻松适应并觉得兴奋", "调整但需要一点时间", "不舒服但能应对", "更喜欢坚持原计划"] },
    { id: 4, text: "你处理冲突的方式通常是...", options: ["直接诚实地解决", "找到外交解决方案", "尽可能避免", "在回应前花时间处理"] },
    { id: 5, text: "亲密朋友会如何描述你？", options: ["精力充沛和外向", "深思熟虑和可靠", "有创意和独立", "冷静和支持"] },
    { id: 6, text: "压力大时，你倾向于...", options: ["和别人谈论它", "分析并寻找解决方案", "需要独处时间充电", "保持忙碌以避免想它"] },
    { id: 7, text: "你理想的工作环境是...", options: ["协作和社交的", "有明确期望的结构化的", "灵活和自主的", "安静和专注的"] },
    { id: 8, text: "你更喜欢怎样学习新东西？", options: ["通过讨论和互动", "通过阅读和研究", "实践经验", "观察和反思"] },
    { id: 9, text: "关于规则和传统，你...", options: ["视为重要的结构", "有道理时遵循", "更喜欢质疑和改进", "经常觉得有限制"] },
    { id: 10, text: "什么给你的生活最大的意义？", options: ["关系和联系", "成就和成功", "个人成长和经历", "贡献和帮助他人"] }
  ]
};

// Function to get questions by age group
export const getQuestionsByAgeGroup = (ageGroup: AgeGroup, language: Language): LocalizedQuizQuestion[] => {
  switch (ageGroup) {
    case 'kids':
      return KIDS_QUESTIONS[language] || KIDS_QUESTIONS.en;
    case 'teens':
      return TEENS_QUESTIONS[language] || TEENS_QUESTIONS.en;
    case 'young_adults':
      return YOUNG_ADULTS_QUESTIONS[language] || YOUNG_ADULTS_QUESTIONS.en;
    case 'adults':
    default:
      return ADULTS_QUESTIONS[language] || ADULTS_QUESTIONS.en;
  }
};

// Legacy export for backward compatibility
export const QUIZ_QUESTIONS_LOCALIZED = ADULTS_QUESTIONS;
