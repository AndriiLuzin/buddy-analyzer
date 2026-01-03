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

// Questions for kids (up to 10 years)
const KIDS_QUESTIONS: Record<Language, LocalizedQuizQuestion[]> = {
  en: [
    { id: 1, text: "How often do you want to play with friends?", options: ["Every day!", "A few times a week", "Once a week", "Sometimes"] },
    { id: 2, text: "What do you like doing with friends the most?", options: ["Playing games", "Watching cartoons", "Going outside", "Drawing together"] },
    { id: 3, text: "Would you share your favorite toy with a friend?", options: ["Yes, always!", "Maybe sometimes", "Only my old toys", "Not really"] },
    { id: 4, text: "What would you do if your friend is sad?", options: ["Give them a hug", "Try to cheer them up", "Tell an adult", "Wait for them to feel better"] },
    { id: 5, text: "Do you like making new friends?", options: ["Yes, it's fun!", "Sometimes", "I'm a bit shy", "I prefer my old friends"] },
    { id: 6, text: "What's the best thing about having friends?", options: ["Playing together", "Having someone to talk to", "Sharing secrets", "Birthday parties!"] },
    { id: 7, text: "How do you feel when a friend can't play?", options: ["Really sad", "A bit disappointed", "It's okay", "I find something else to do"] },
    { id: 8, text: "Would you invite a new kid to play with you?", options: ["Yes, definitely!", "Probably", "Maybe", "I'm not sure"] },
    { id: 9, text: "What would you do if you argued with a friend?", options: ["Say sorry right away", "Wait and then make up", "Ask an adult for help", "Wait for them to say sorry"] },
    { id: 10, text: "How many best friends do you want?", options: ["Lots and lots!", "A few close ones", "Just one best friend", "I like everyone!"] }
  ],
  ru: [
    { id: 1, text: "Как часто ты хочешь играть с друзьями?", options: ["Каждый день!", "Несколько раз в неделю", "Раз в неделю", "Иногда"] },
    { id: 2, text: "Что тебе нравится делать с друзьями больше всего?", options: ["Играть в игры", "Смотреть мультики", "Гулять на улице", "Рисовать вместе"] },
    { id: 3, text: "Ты бы поделился любимой игрушкой с другом?", options: ["Да, всегда!", "Может быть, иногда", "Только старыми игрушками", "Наверное, нет"] },
    { id: 4, text: "Что бы ты сделал, если друг грустит?", options: ["Обнял бы", "Попробовал развеселить", "Позвал бы взрослого", "Подождал бы"] },
    { id: 5, text: "Тебе нравится заводить новых друзей?", options: ["Да, это весело!", "Иногда", "Я немного стесняюсь", "Мне больше нравятся старые друзья"] },
    { id: 6, text: "Что самое лучшее в дружбе?", options: ["Играть вместе", "Есть с кем поговорить", "Делиться секретами", "Дни рождения!"] },
    { id: 7, text: "Как ты себя чувствуешь, когда друг не может поиграть?", options: ["Очень грущу", "Немного расстраиваюсь", "Ничего страшного", "Нахожу другое занятие"] },
    { id: 8, text: "Ты бы позвал нового ребёнка играть с вами?", options: ["Да, конечно!", "Наверное", "Может быть", "Не уверен"] },
    { id: 9, text: "Что бы ты сделал, если поссорился с другом?", options: ["Сразу извинился бы", "Подождал и помирился", "Попросил взрослых помочь", "Подождал бы его извинений"] },
    { id: 10, text: "Сколько лучших друзей ты хочешь?", options: ["Много-много!", "Несколько близких", "Только одного лучшего", "Мне нравятся все!"] }
  ],
  fr: [
    { id: 1, text: "À quelle fréquence veux-tu jouer avec tes amis?", options: ["Tous les jours!", "Quelques fois par semaine", "Une fois par semaine", "Parfois"] },
    { id: 2, text: "Qu'est-ce que tu aimes faire le plus avec tes amis?", options: ["Jouer à des jeux", "Regarder des dessins animés", "Jouer dehors", "Dessiner ensemble"] },
    { id: 3, text: "Partagerais-tu ton jouet préféré avec un ami?", options: ["Oui, toujours!", "Peut-être parfois", "Seulement mes vieux jouets", "Pas vraiment"] },
    { id: 4, text: "Que ferais-tu si ton ami est triste?", options: ["Lui faire un câlin", "Essayer de le réconforter", "Le dire à un adulte", "Attendre qu'il aille mieux"] },
    { id: 5, text: "Aimes-tu te faire de nouveaux amis?", options: ["Oui, c'est amusant!", "Parfois", "Je suis un peu timide", "Je préfère mes anciens amis"] },
    { id: 6, text: "Quelle est la meilleure chose d'avoir des amis?", options: ["Jouer ensemble", "Avoir quelqu'un à qui parler", "Partager des secrets", "Les fêtes d'anniversaire!"] },
    { id: 7, text: "Comment te sens-tu quand un ami ne peut pas jouer?", options: ["Très triste", "Un peu déçu", "C'est pas grave", "Je trouve autre chose à faire"] },
    { id: 8, text: "Inviterais-tu un nouvel enfant à jouer avec toi?", options: ["Oui, absolument!", "Probablement", "Peut-être", "Je ne suis pas sûr"] },
    { id: 9, text: "Que ferais-tu si tu te disputais avec un ami?", options: ["M'excuser tout de suite", "Attendre et faire la paix", "Demander l'aide d'un adulte", "Attendre qu'il s'excuse"] },
    { id: 10, text: "Combien de meilleurs amis veux-tu?", options: ["Plein plein!", "Quelques proches", "Juste un meilleur ami", "J'aime tout le monde!"] }
  ],
  es: [
    { id: 1, text: "¿Con qué frecuencia quieres jugar con amigos?", options: ["¡Todos los días!", "Algunas veces a la semana", "Una vez a la semana", "A veces"] },
    { id: 2, text: "¿Qué te gusta hacer más con tus amigos?", options: ["Jugar juegos", "Ver dibujos animados", "Salir afuera", "Dibujar juntos"] },
    { id: 3, text: "¿Compartirías tu juguete favorito con un amigo?", options: ["¡Sí, siempre!", "Quizás a veces", "Solo mis juguetes viejos", "No realmente"] },
    { id: 4, text: "¿Qué harías si tu amigo está triste?", options: ["Darle un abrazo", "Tratar de animarlo", "Decirle a un adulto", "Esperar a que se sienta mejor"] },
    { id: 5, text: "¿Te gusta hacer nuevos amigos?", options: ["¡Sí, es divertido!", "A veces", "Soy un poco tímido", "Prefiero mis viejos amigos"] },
    { id: 6, text: "¿Qué es lo mejor de tener amigos?", options: ["Jugar juntos", "Tener con quien hablar", "Compartir secretos", "¡Fiestas de cumpleaños!"] },
    { id: 7, text: "¿Cómo te sientes cuando un amigo no puede jugar?", options: ["Muy triste", "Un poco decepcionado", "Está bien", "Encuentro otra cosa que hacer"] },
    { id: 8, text: "¿Invitarías a un niño nuevo a jugar contigo?", options: ["¡Sí, definitivamente!", "Probablemente", "Tal vez", "No estoy seguro"] },
    { id: 9, text: "¿Qué harías si discutieras con un amigo?", options: ["Disculparme enseguida", "Esperar y hacer las paces", "Pedir ayuda a un adulto", "Esperar a que se disculpe"] },
    { id: 10, text: "¿Cuántos mejores amigos quieres?", options: ["¡Muchos muchos!", "Algunos cercanos", "Solo un mejor amigo", "¡Me gustan todos!"] }
  ],
  pt: [
    { id: 1, text: "Com que frequência você quer brincar com amigos?", options: ["Todo dia!", "Algumas vezes por semana", "Uma vez por semana", "Às vezes"] },
    { id: 2, text: "O que você mais gosta de fazer com amigos?", options: ["Jogar jogos", "Assistir desenhos", "Brincar lá fora", "Desenhar juntos"] },
    { id: 3, text: "Você dividiria seu brinquedo favorito com um amigo?", options: ["Sim, sempre!", "Talvez às vezes", "Só meus brinquedos velhos", "Não muito"] },
    { id: 4, text: "O que você faria se seu amigo estivesse triste?", options: ["Dar um abraço", "Tentar animar", "Contar para um adulto", "Esperar melhorar"] },
    { id: 5, text: "Você gosta de fazer novos amigos?", options: ["Sim, é divertido!", "Às vezes", "Sou um pouco tímido", "Prefiro amigos antigos"] },
    { id: 6, text: "Qual a melhor coisa de ter amigos?", options: ["Brincar juntos", "Ter com quem conversar", "Compartilhar segredos", "Festas de aniversário!"] },
    { id: 7, text: "Como você se sente quando um amigo não pode brincar?", options: ["Muito triste", "Um pouco desapontado", "Tudo bem", "Encontro outra coisa"] },
    { id: 8, text: "Você convidaria uma criança nova para brincar?", options: ["Sim, com certeza!", "Provavelmente", "Talvez", "Não sei"] },
    { id: 9, text: "O que você faria se brigasse com um amigo?", options: ["Pedir desculpas logo", "Esperar e fazer as pazes", "Pedir ajuda a um adulto", "Esperar ele pedir desculpas"] },
    { id: 10, text: "Quantos melhores amigos você quer?", options: ["Muitos!", "Alguns próximos", "Só um melhor amigo", "Gosto de todos!"] }
  ],
  uk: [
    { id: 1, text: "Як часто ти хочеш гратися з друзями?", options: ["Щодня!", "Кілька разів на тиждень", "Раз на тиждень", "Іноді"] },
    { id: 2, text: "Що тобі найбільше подобається робити з друзями?", options: ["Грати в ігри", "Дивитися мультики", "Гуляти надворі", "Малювати разом"] },
    { id: 3, text: "Ти б поділився улюбленою іграшкою з другом?", options: ["Так, завжди!", "Може, іноді", "Тільки старими іграшками", "Мабуть, ні"] },
    { id: 4, text: "Що б ти зробив, якщо друг сумує?", options: ["Обійняв би", "Спробував розвеселити", "Покликав дорослого", "Почекав би"] },
    { id: 5, text: "Тобі подобається заводити нових друзів?", options: ["Так, це весело!", "Іноді", "Я трохи соромлюся", "Мені більше подобаються старі друзі"] },
    { id: 6, text: "Що найкраще у дружбі?", options: ["Гратися разом", "Є з ким поговорити", "Ділитися секретами", "Дні народження!"] },
    { id: 7, text: "Як ти себе почуваєш, коли друг не може погратися?", options: ["Дуже сумую", "Трохи засмучуюсь", "Нічого страшного", "Знаходжу інше заняття"] },
    { id: 8, text: "Ти б покликав нову дитину гратися з вами?", options: ["Так, звичайно!", "Мабуть", "Може бути", "Не впевнений"] },
    { id: 9, text: "Що б ти зробив, якщо посварився з другом?", options: ["Одразу вибачився б", "Почекав і помирився", "Попросив дорослих допомогти", "Почекав би його вибачень"] },
    { id: 10, text: "Скільки найкращих друзів ти хочеш?", options: ["Багато-багато!", "Кількох близьких", "Тільки одного найкращого", "Мені подобаються всі!"] }
  ],
  ko: [
    { id: 1, text: "친구와 얼마나 자주 놀고 싶어요?", options: ["매일!", "일주일에 몇 번", "일주일에 한 번", "가끔"] },
    { id: 2, text: "친구와 가장 좋아하는 활동은?", options: ["게임하기", "만화 보기", "밖에서 놀기", "같이 그림 그리기"] },
    { id: 3, text: "가장 좋아하는 장난감을 친구와 나눌 수 있어요?", options: ["네, 항상!", "가끔은요", "오래된 것만요", "글쎄요"] },
    { id: 4, text: "친구가 슬퍼하면 어떻게 해요?", options: ["안아줘요", "기분 좋게 해줘요", "어른에게 말해요", "기다려요"] },
    { id: 5, text: "새 친구 사귀는 게 좋아요?", options: ["네, 재미있어요!", "가끔요", "좀 부끄러워요", "옛 친구가 좋아요"] },
    { id: 6, text: "친구가 있어서 가장 좋은 점은?", options: ["같이 노는 것", "이야기할 사람이 있는 것", "비밀 나누기", "생일 파티!"] },
    { id: 7, text: "친구가 놀 수 없으면 어떤 기분이에요?", options: ["아주 슬퍼요", "좀 실망해요", "괜찮아요", "다른 걸 해요"] },
    { id: 8, text: "새로운 아이를 같이 놀자고 초대할 거예요?", options: ["네, 물론이죠!", "아마도요", "글쎄요", "잘 모르겠어요"] },
    { id: 9, text: "친구와 싸우면 어떻게 해요?", options: ["바로 사과해요", "기다렸다가 화해해요", "어른에게 도움을 구해요", "친구가 사과하길 기다려요"] },
    { id: 10, text: "제일 친한 친구 몇 명 갖고 싶어요?", options: ["엄청 많이!", "몇 명만", "딱 한 명", "다 좋아요!"] }
  ],
  zh: [
    { id: 1, text: "你想多久和朋友一起玩?", options: ["每天!", "一周几次", "一周一次", "有时候"] },
    { id: 2, text: "你最喜欢和朋友做什么?", options: ["玩游戏", "看动画片", "在外面玩", "一起画画"] },
    { id: 3, text: "你会把最喜欢的玩具分享给朋友吗?", options: ["是的，总是!", "也许有时候", "只分享旧玩具", "不太愿意"] },
    { id: 4, text: "如果朋友难过了你会怎么做?", options: ["给他们一个拥抱", "试着让他们开心", "告诉大人", "等他们好起来"] },
    { id: 5, text: "你喜欢交新朋友吗?", options: ["喜欢，很有趣!", "有时候", "我有点害羞", "我更喜欢老朋友"] },
    { id: 6, text: "有朋友最好的事情是什么?", options: ["一起玩", "有人说话", "分享秘密", "生日派对!"] },
    { id: 7, text: "朋友不能玩时你感觉怎样?", options: ["很难过", "有点失望", "没关系", "我找别的事做"] },
    { id: 8, text: "你会邀请新来的小朋友一起玩吗?", options: ["是的，当然!", "可能会", "也许吧", "不确定"] },
    { id: 9, text: "如果和朋友吵架了你会怎么做?", options: ["马上道歉", "等一等再和好", "请大人帮忙", "等他们道歉"] },
    { id: 10, text: "你想要多少个最好的朋友?", options: ["很多很多!", "几个亲密的", "只要一个最好的", "我喜欢大家!"] }
  ]
};

// Questions for teens (11-16 years)
const TEENS_QUESTIONS: Record<Language, LocalizedQuizQuestion[]> = {
  en: [
    { id: 1, text: "How often do you like to hang out with friends?", options: ["Every day", "A few times a week", "Once a week", "When I feel like it"] },
    { id: 2, text: "What's most important in a friendship for you?", options: ["Trust and loyalty", "Having fun together", "Common interests", "Support when needed"] },
    { id: 3, text: "Would you stand up for your friend if someone was mean to them?", options: ["Absolutely, always!", "Yes, most of the time", "Depends on the situation", "I'd prefer to stay out of it"] },
    { id: 4, text: "How do you prefer to communicate with friends?", options: ["Messaging apps", "Video calls", "In person", "Social media"] },
    { id: 5, text: "Would you keep a friend's secret even if it's hard?", options: ["Yes, always", "Usually, unless it's serious", "It depends", "I find it hard to keep secrets"] },
    { id: 6, text: "How do you feel about friends who have different opinions?", options: ["That's totally fine!", "It can be interesting", "Sometimes it's hard", "I prefer friends who agree with me"] },
    { id: 7, text: "What would you do if a friend copied your homework?", options: ["Help them understand instead", "Let them, but talk about it", "Say no", "I'm not sure"] },
    { id: 8, text: "How important is it that your friends like the same music/games/shows?", options: ["Not important at all", "Nice but not essential", "Pretty important", "Very important"] },
    { id: 9, text: "Would you tell a friend if they did something that upset you?", options: ["Yes, right away", "Yes, but carefully", "Maybe later", "Probably not"] },
    { id: 10, text: "How do you feel about making friends online?", options: ["Great, I have online friends!", "It's okay", "I prefer real-life friends", "I'm careful about it"] }
  ],
  ru: [
    { id: 1, text: "Как часто тебе нравится проводить время с друзьями?", options: ["Каждый день", "Несколько раз в неделю", "Раз в неделю", "Когда есть настроение"] },
    { id: 2, text: "Что для тебя самое важное в дружбе?", options: ["Доверие и верность", "Веселье вместе", "Общие интересы", "Поддержка когда нужно"] },
    { id: 3, text: "Ты бы заступился за друга, если бы кто-то его обижал?", options: ["Конечно, всегда!", "Да, в большинстве случаев", "Зависит от ситуации", "Предпочёл бы не вмешиваться"] },
    { id: 4, text: "Как ты предпочитаешь общаться с друзьями?", options: ["Мессенджеры", "Видеозвонки", "Вживую", "Соцсети"] },
    { id: 5, text: "Ты бы сохранил секрет друга, даже если это сложно?", options: ["Да, всегда", "Обычно, если не серьёзно", "Зависит от ситуации", "Мне сложно хранить секреты"] },
    { id: 6, text: "Как ты относишься к друзьям с другим мнением?", options: ["Это нормально!", "Может быть интересно", "Иногда сложно", "Предпочитаю тех, кто согласен"] },
    { id: 7, text: "Что бы ты сделал, если друг списал твою домашку?", options: ["Помог бы разобраться", "Позволил бы, но поговорил", "Отказал бы", "Не уверен"] },
    { id: 8, text: "Насколько важно, чтобы друзья любили ту же музыку/игры/сериалы?", options: ["Вообще не важно", "Приятно, но не обязательно", "Довольно важно", "Очень важно"] },
    { id: 9, text: "Ты бы сказал другу, если он тебя расстроил?", options: ["Да, сразу", "Да, но аккуратно", "Может быть, позже", "Наверное, нет"] },
    { id: 10, text: "Как ты относишься к онлайн-друзьям?", options: ["Отлично, у меня есть!", "Нормально", "Предпочитаю реальных", "Осторожно отношусь"] }
  ],
  fr: [
    { id: 1, text: "À quelle fréquence aimes-tu passer du temps avec tes amis?", options: ["Tous les jours", "Plusieurs fois par semaine", "Une fois par semaine", "Quand j'en ai envie"] },
    { id: 2, text: "Qu'est-ce qui est le plus important dans une amitié pour toi?", options: ["La confiance et la loyauté", "S'amuser ensemble", "Les intérêts communs", "Le soutien quand nécessaire"] },
    { id: 3, text: "Défendrais-tu ton ami si quelqu'un était méchant avec lui?", options: ["Absolument, toujours!", "Oui, la plupart du temps", "Ça dépend de la situation", "Je préférerais rester en dehors"] },
    { id: 4, text: "Comment préfères-tu communiquer avec tes amis?", options: ["Applications de messagerie", "Appels vidéo", "En personne", "Réseaux sociaux"] },
    { id: 5, text: "Garderais-tu un secret même si c'est difficile?", options: ["Oui, toujours", "Généralement, sauf si c'est grave", "Ça dépend", "J'ai du mal à garder les secrets"] },
    { id: 6, text: "Que penses-tu des amis qui ont des opinions différentes?", options: ["C'est très bien!", "Ça peut être intéressant", "Parfois c'est dur", "Je préfère ceux qui sont d'accord"] },
    { id: 7, text: "Que ferais-tu si un ami copiait tes devoirs?", options: ["L'aider à comprendre plutôt", "Le laisser faire, mais en parler", "Dire non", "Je ne suis pas sûr"] },
    { id: 8, text: "C'est important que tes amis aiment la même musique/jeux/séries?", options: ["Pas du tout important", "Sympa mais pas essentiel", "Assez important", "Très important"] },
    { id: 9, text: "Dirais-tu à un ami s'il t'a blessé?", options: ["Oui, tout de suite", "Oui, mais délicatement", "Peut-être plus tard", "Probablement pas"] },
    { id: 10, text: "Que penses-tu de se faire des amis en ligne?", options: ["Super, j'en ai!", "C'est ok", "Je préfère en vrai", "Je suis prudent"] }
  ],
  es: [
    { id: 1, text: "¿Con qué frecuencia te gusta pasar tiempo con amigos?", options: ["Todos los días", "Varias veces a la semana", "Una vez a la semana", "Cuando tengo ganas"] },
    { id: 2, text: "¿Qué es lo más importante en una amistad para ti?", options: ["Confianza y lealtad", "Divertirse juntos", "Intereses comunes", "Apoyo cuando se necesita"] },
    { id: 3, text: "¿Defenderías a tu amigo si alguien fuera malo con él?", options: ["¡Absolutamente, siempre!", "Sí, la mayoría de las veces", "Depende de la situación", "Preferiría no meterme"] },
    { id: 4, text: "¿Cómo prefieres comunicarte con amigos?", options: ["Apps de mensajes", "Videollamadas", "En persona", "Redes sociales"] },
    { id: 5, text: "¿Guardarías un secreto aunque sea difícil?", options: ["Sí, siempre", "Usualmente, a menos que sea serio", "Depende", "Me cuesta guardar secretos"] },
    { id: 6, text: "¿Qué piensas de amigos con opiniones diferentes?", options: ["¡Está genial!", "Puede ser interesante", "A veces es difícil", "Prefiero los que piensan igual"] },
    { id: 7, text: "¿Qué harías si un amigo copia tu tarea?", options: ["Ayudarle a entender mejor", "Dejarlo, pero hablarlo", "Decir que no", "No estoy seguro"] },
    { id: 8, text: "¿Es importante que tus amigos gusten de la misma música/juegos/series?", options: ["Nada importante", "Bien pero no esencial", "Bastante importante", "Muy importante"] },
    { id: 9, text: "¿Le dirías a un amigo si te molestó algo?", options: ["Sí, de inmediato", "Sí, pero con cuidado", "Quizás después", "Probablemente no"] },
    { id: 10, text: "¿Qué piensas de hacer amigos en línea?", options: ["¡Genial, tengo!", "Está bien", "Prefiero en persona", "Soy cuidadoso"] }
  ],
  pt: [
    { id: 1, text: "Com que frequência você gosta de sair com amigos?", options: ["Todo dia", "Algumas vezes por semana", "Uma vez por semana", "Quando estou a fim"] },
    { id: 2, text: "O que é mais importante numa amizade para você?", options: ["Confiança e lealdade", "Se divertir juntos", "Interesses comuns", "Apoio quando precisa"] },
    { id: 3, text: "Você defenderia seu amigo se alguém fosse mau com ele?", options: ["Com certeza, sempre!", "Sim, na maioria das vezes", "Depende da situação", "Prefiro não me meter"] },
    { id: 4, text: "Como você prefere se comunicar com amigos?", options: ["Apps de mensagem", "Chamadas de vídeo", "Pessoalmente", "Redes sociais"] },
    { id: 5, text: "Você guardaria um segredo mesmo sendo difícil?", options: ["Sim, sempre", "Geralmente, a menos que seja sério", "Depende", "Tenho dificuldade com segredos"] },
    { id: 6, text: "O que você acha de amigos com opiniões diferentes?", options: ["Tudo bem!", "Pode ser interessante", "Às vezes é difícil", "Prefiro quem concorda comigo"] },
    { id: 7, text: "O que faria se um amigo copiasse seu dever?", options: ["Ajudar a entender melhor", "Deixar, mas conversar", "Dizer não", "Não sei"] },
    { id: 8, text: "É importante que amigos gostem da mesma música/jogos/séries?", options: ["Nada importante", "Legal mas não essencial", "Bem importante", "Muito importante"] },
    { id: 9, text: "Você diria a um amigo se ele te chateou?", options: ["Sim, na hora", "Sim, mas com cuidado", "Talvez depois", "Provavelmente não"] },
    { id: 10, text: "O que você acha de fazer amigos online?", options: ["Ótimo, tenho!", "Tudo bem", "Prefiro pessoalmente", "Sou cuidadoso"] }
  ],
  uk: [
    { id: 1, text: "Як часто тобі подобається проводити час з друзями?", options: ["Щодня", "Кілька разів на тиждень", "Раз на тиждень", "Коли є настрій"] },
    { id: 2, text: "Що для тебе найважливіше у дружбі?", options: ["Довіра та вірність", "Веселощі разом", "Спільні інтереси", "Підтримка коли потрібно"] },
    { id: 3, text: "Ти б заступився за друга, якби хтось його ображав?", options: ["Звичайно, завжди!", "Так, здебільшого", "Залежить від ситуації", "Краще не втручатися"] },
    { id: 4, text: "Як ти віддаєш перевагу спілкуватися з друзями?", options: ["Месенджери", "Відеодзвінки", "Наживо", "Соцмережі"] },
    { id: 5, text: "Ти б зберіг секрет друга, навіть якщо це складно?", options: ["Так, завжди", "Зазвичай, якщо не серйозне", "Залежить", "Мені важко зберігати секрети"] },
    { id: 6, text: "Як ти ставишся до друзів з іншою думкою?", options: ["Це нормально!", "Може бути цікаво", "Іноді важко", "Віддаю перевагу тим, хто згоден"] },
    { id: 7, text: "Що б ти зробив, якби друг списав твою домашку?", options: ["Допоміг би розібратися", "Дозволив би, але поговорив", "Відмовив би", "Не впевнений"] },
    { id: 8, text: "Наскільки важливо, щоб друзі любили ту ж музику/ігри/серіали?", options: ["Взагалі не важливо", "Приємно, але не обов'язково", "Досить важливо", "Дуже важливо"] },
    { id: 9, text: "Ти б сказав другу, якщо він тебе засмутив?", options: ["Так, одразу", "Так, але обережно", "Може, пізніше", "Мабуть, ні"] },
    { id: 10, text: "Як ти ставишся до онлайн-друзів?", options: ["Чудово, маю!", "Нормально", "Віддаю перевагу реальним", "Обережно ставлюся"] }
  ],
  ko: [
    { id: 1, text: "친구와 얼마나 자주 시간을 보내고 싶어요?", options: ["매일", "일주일에 몇 번", "일주일에 한 번", "기분 따라"] },
    { id: 2, text: "우정에서 가장 중요한 것은?", options: ["신뢰와 충성", "함께 즐기기", "공통 관심사", "필요할 때 지원"] },
    { id: 3, text: "누군가 친구에게 나쁘게 굴면 편들어 줄 건가요?", options: ["물론, 항상!", "네, 대부분", "상황에 따라", "관여 안 하고 싶어요"] },
    { id: 4, text: "친구와 어떻게 연락하는 게 좋아요?", options: ["메신저", "영상통화", "직접 만나서", "SNS"] },
    { id: 5, text: "친구의 비밀을 어려워도 지킬 건가요?", options: ["네, 항상", "보통은, 심각하지 않으면", "상황에 따라", "비밀 지키기 어려워요"] },
    { id: 6, text: "의견이 다른 친구에 대해 어떻게 생각해요?", options: ["완전 괜찮아요!", "흥미로울 수 있어요", "가끔 어려워요", "같은 생각하는 친구가 좋아요"] },
    { id: 7, text: "친구가 숙제를 베꼈다면 어떻게 해요?", options: ["대신 이해하도록 도와요", "허락하되 이야기해요", "안 된다고 해요", "모르겠어요"] },
    { id: 8, text: "친구가 같은 음악/게임/드라마 좋아하는 게 중요해요?", options: ["전혀 중요하지 않아요", "좋지만 필수 아니에요", "꽤 중요해요", "매우 중요해요"] },
    { id: 9, text: "친구가 기분 상하게 했다면 말할 건가요?", options: ["네, 바로", "네, 조심스럽게", "나중에 아마도", "아마 안 할 거예요"] },
    { id: 10, text: "온라인에서 친구 사귀는 것에 대해 어떻게 생각해요?", options: ["좋아요, 있어요!", "괜찮아요", "실제 친구가 좋아요", "조심해요"] }
  ],
  zh: [
    { id: 1, text: "你喜欢多久和朋友一起玩?", options: ["每天", "一周几次", "一周一次", "看心情"] },
    { id: 2, text: "友谊中什么对你最重要?", options: ["信任和忠诚", "一起玩乐", "共同兴趣", "需要时的支持"] },
    { id: 3, text: "如果有人欺负你的朋友，你会站出来吗?", options: ["当然，总是!", "是的，大多数时候", "看情况", "我宁愿不参与"] },
    { id: 4, text: "你喜欢怎样和朋友联系?", options: ["聊天软件", "视频通话", "见面", "社交媒体"] },
    { id: 5, text: "即使很难，你也会保守朋友的秘密吗?", options: ["是的，总是", "通常会，除非很严重", "看情况", "我很难保守秘密"] },
    { id: 6, text: "你怎么看待意见不同的朋友?", options: ["完全没问题!", "可能很有趣", "有时候很难", "我更喜欢意见相同的"] },
    { id: 7, text: "如果朋友抄你的作业，你会怎么做?", options: ["帮他们理解", "让他们抄，但会谈谈", "拒绝", "不确定"] },
    { id: 8, text: "朋友喜欢同样的音乐/游戏/剧重要吗?", options: ["一点都不重要", "不错但不是必须", "相当重要", "非常重要"] },
    { id: 9, text: "如果朋友让你不开心，你会告诉他吗?", options: ["是的，立刻", "是的，但小心地", "也许以后", "可能不会"] },
    { id: 10, text: "你怎么看待网上交朋友?", options: ["很好，我有!", "还可以", "更喜欢现实中的", "我很谨慎"] }
  ]
};

// Questions for young adults (17-25 years)
const YOUNG_ADULTS_QUESTIONS: Record<Language, LocalizedQuizQuestion[]> = {
  en: [
    { id: 1, text: "How often do you prefer to meet with friends?", options: ["Every day", "Several times a week", "Once a week", "A few times a month"] },
    { id: 2, text: "What matters most to you in friendship?", options: ["Emotional support", "Shared interests", "Having fun together", "Reliability"] },
    { id: 3, text: "Would you drop everything to help a friend in crisis?", options: ["Without question", "Depends on the situation", "If I can manage it", "Probably not"] },
    { id: 4, text: "How do you handle disagreements with friends?", options: ["Talk it out immediately", "Give it time, then discuss", "Avoid confrontation", "Let it go"] },
    { id: 5, text: "Would you lend a significant amount of money to a close friend?", options: ["Yes, without hesitation", "Yes, with a clear agreement", "Only a small amount", "No, it complicates things"] },
    { id: 6, text: "How important is it that your friends share your values?", options: ["Very important", "Somewhat important", "Not very important", "Doesn't matter"] },
    { id: 7, text: "How do you feel about friends who have become distant?", options: ["Reach out to reconnect", "Wait for them to reach out", "Accept that people change", "Feel hurt but move on"] },
    { id: 8, text: "Would you tell a friend if their partner was bad for them?", options: ["Yes, they need to know", "Yes, but carefully", "Only if asked", "No, it's not my place"] },
    { id: 9, text: "How do you balance friendships with romantic relationships?", options: ["Friends always come first", "Try to balance both", "Partner often takes priority", "It depends on the situation"] },
    { id: 10, text: "What would you forgive a friend for?", options: ["Almost anything", "A lot, but not betrayal", "Minor things only", "Depends on the apology"] }
  ],
  ru: [
    { id: 1, text: "Как часто вы предпочитаете встречаться с друзьями?", options: ["Каждый день", "Несколько раз в неделю", "Раз в неделю", "Несколько раз в месяц"] },
    { id: 2, text: "Что для вас самое важное в дружбе?", options: ["Эмоциональная поддержка", "Общие интересы", "Веселье вместе", "Надёжность"] },
    { id: 3, text: "Вы бы бросили всё, чтобы помочь другу в беде?", options: ["Без вопросов", "Зависит от ситуации", "Если смогу справиться", "Наверное, нет"] },
    { id: 4, text: "Как вы решаете разногласия с друзьями?", options: ["Сразу обсуждаю", "Даю время, потом обсуждаю", "Избегаю конфронтации", "Отпускаю ситуацию"] },
    { id: 5, text: "Вы бы одолжили крупную сумму близкому другу?", options: ["Да, без колебаний", "Да, с чётким договором", "Только небольшую", "Нет, это осложняет"] },
    { id: 6, text: "Насколько важно, чтобы друзья разделяли ваши ценности?", options: ["Очень важно", "Довольно важно", "Не очень важно", "Не имеет значения"] },
    { id: 7, text: "Как вы относитесь к друзьям, которые отдалились?", options: ["Связываюсь, чтобы восстановить", "Жду, когда они свяжутся", "Принимаю, что люди меняются", "Обидно, но двигаюсь дальше"] },
    { id: 8, text: "Вы бы сказали другу, что его партнёр ему не подходит?", options: ["Да, им нужно знать", "Да, но осторожно", "Только если спросят", "Нет, это не моё дело"] },
    { id: 9, text: "Как вы балансируете дружбу с романтическими отношениями?", options: ["Друзья всегда на первом месте", "Стараюсь балансировать", "Партнёр часто в приоритете", "Зависит от ситуации"] },
    { id: 10, text: "Что вы готовы простить другу?", options: ["Почти всё", "Многое, но не предательство", "Только мелочи", "Зависит от извинений"] }
  ],
  fr: [
    { id: 1, text: "À quelle fréquence préférez-vous voir vos amis?", options: ["Tous les jours", "Plusieurs fois par semaine", "Une fois par semaine", "Quelques fois par mois"] },
    { id: 2, text: "Qu'est-ce qui compte le plus pour vous dans l'amitié?", options: ["Le soutien émotionnel", "Les intérêts partagés", "S'amuser ensemble", "La fiabilité"] },
    { id: 3, text: "Laisseriez-vous tout tomber pour aider un ami en crise?", options: ["Sans hésitation", "Ça dépend de la situation", "Si je peux gérer", "Probablement pas"] },
    { id: 4, text: "Comment gérez-vous les désaccords avec vos amis?", options: ["J'en parle immédiatement", "Je laisse du temps, puis discute", "J'évite la confrontation", "Je laisse passer"] },
    { id: 5, text: "Prêteriez-vous une somme importante à un ami proche?", options: ["Oui, sans hésiter", "Oui, avec un accord clair", "Seulement un petit montant", "Non, ça complique les choses"] },
    { id: 6, text: "Est-ce important que vos amis partagent vos valeurs?", options: ["Très important", "Assez important", "Pas très important", "Ça n'a pas d'importance"] },
    { id: 7, text: "Que pensez-vous des amis qui se sont éloignés?", options: ["Je les recontacte", "J'attends qu'ils me contactent", "J'accepte que les gens changent", "Ça blesse mais j'avance"] },
    { id: 8, text: "Diriez-vous à un ami si son partenaire ne lui convient pas?", options: ["Oui, il doit savoir", "Oui, mais prudemment", "Seulement si on me demande", "Non, ce n'est pas mon rôle"] },
    { id: 9, text: "Comment équilibrez-vous amitiés et relations amoureuses?", options: ["Les amis d'abord toujours", "J'essaie d'équilibrer", "Le partenaire a souvent priorité", "Ça dépend de la situation"] },
    { id: 10, text: "Que pardonneriez-vous à un ami?", options: ["Presque tout", "Beaucoup, sauf la trahison", "Que des petites choses", "Ça dépend des excuses"] }
  ],
  es: [
    { id: 1, text: "¿Con qué frecuencia prefieres ver a tus amigos?", options: ["Todos los días", "Varias veces a la semana", "Una vez a la semana", "Algunas veces al mes"] },
    { id: 2, text: "¿Qué es lo más importante en la amistad para ti?", options: ["Apoyo emocional", "Intereses compartidos", "Divertirse juntos", "Confiabilidad"] },
    { id: 3, text: "¿Dejarías todo para ayudar a un amigo en crisis?", options: ["Sin dudarlo", "Depende de la situación", "Si puedo manejarlo", "Probablemente no"] },
    { id: 4, text: "¿Cómo manejas los desacuerdos con amigos?", options: ["Lo hablo de inmediato", "Le doy tiempo, luego hablo", "Evito la confrontación", "Lo dejo pasar"] },
    { id: 5, text: "¿Prestarías una suma importante a un amigo cercano?", options: ["Sí, sin dudar", "Sí, con un acuerdo claro", "Solo una cantidad pequeña", "No, complica las cosas"] },
    { id: 6, text: "¿Es importante que tus amigos compartan tus valores?", options: ["Muy importante", "Algo importante", "No muy importante", "No importa"] },
    { id: 7, text: "¿Qué piensas de amigos que se han alejado?", options: ["Los busco para reconectar", "Espero que me busquen", "Acepto que la gente cambia", "Duele pero sigo adelante"] },
    { id: 8, text: "¿Le dirías a un amigo si su pareja no le conviene?", options: ["Sí, necesita saberlo", "Sí, pero con cuidado", "Solo si me preguntan", "No, no es mi lugar"] },
    { id: 9, text: "¿Cómo equilibras amistades con relaciones románticas?", options: ["Amigos siempre primero", "Trato de equilibrar", "La pareja suele tener prioridad", "Depende de la situación"] },
    { id: 10, text: "¿Qué le perdonarías a un amigo?", options: ["Casi todo", "Mucho, pero no traición", "Solo cosas menores", "Depende de la disculpa"] }
  ],
  pt: [
    { id: 1, text: "Com que frequência você prefere ver os amigos?", options: ["Todo dia", "Várias vezes por semana", "Uma vez por semana", "Algumas vezes por mês"] },
    { id: 2, text: "O que mais importa na amizade para você?", options: ["Apoio emocional", "Interesses compartilhados", "Se divertir juntos", "Confiabilidade"] },
    { id: 3, text: "Você largaria tudo para ajudar um amigo em crise?", options: ["Sem dúvida", "Depende da situação", "Se eu conseguir", "Provavelmente não"] },
    { id: 4, text: "Como você lida com desentendimentos com amigos?", options: ["Converso imediatamente", "Dou um tempo, depois converso", "Evito confronto", "Deixo pra lá"] },
    { id: 5, text: "Você emprestaria uma quantia grande a um amigo próximo?", options: ["Sim, sem hesitar", "Sim, com acordo claro", "Só uma quantia pequena", "Não, complica as coisas"] },
    { id: 6, text: "É importante que seus amigos compartilhem seus valores?", options: ["Muito importante", "Um pouco importante", "Não muito importante", "Não importa"] },
    { id: 7, text: "O que você pensa de amigos que se distanciaram?", options: ["Tento reconectar", "Espero eles me procurarem", "Aceito que pessoas mudam", "Machuca mas sigo em frente"] },
    { id: 8, text: "Você diria a um amigo se o parceiro não é bom pra ele?", options: ["Sim, precisa saber", "Sim, mas com cuidado", "Só se perguntarem", "Não, não é meu lugar"] },
    { id: 9, text: "Como você equilibra amizades com relacionamentos?", options: ["Amigos sempre primeiro", "Tento equilibrar", "Parceiro geralmente tem prioridade", "Depende da situação"] },
    { id: 10, text: "O que você perdoaria a um amigo?", options: ["Quase tudo", "Muito, mas não traição", "Só coisas pequenas", "Depende do pedido de desculpas"] }
  ],
  uk: [
    { id: 1, text: "Як часто ви віддаєте перевагу зустрічатися з друзями?", options: ["Щодня", "Кілька разів на тиждень", "Раз на тиждень", "Кілька разів на місяць"] },
    { id: 2, text: "Що для вас найважливіше у дружбі?", options: ["Емоційна підтримка", "Спільні інтереси", "Веселощі разом", "Надійність"] },
    { id: 3, text: "Ви б кинули все, щоб допомогти другу в біді?", options: ["Без питань", "Залежить від ситуації", "Якщо зможу впоратися", "Мабуть, ні"] },
    { id: 4, text: "Як ви вирішуєте розбіжності з друзями?", options: ["Одразу обговорюю", "Даю час, потім обговорюю", "Уникаю конфронтації", "Відпускаю ситуацію"] },
    { id: 5, text: "Ви б позичили велику суму близькому другу?", options: ["Так, без вагань", "Так, з чіткою домовленістю", "Тільки невелику", "Ні, це ускладнює"] },
    { id: 6, text: "Наскільки важливо, щоб друзі поділяли ваші цінності?", options: ["Дуже важливо", "Досить важливо", "Не дуже важливо", "Не має значення"] },
    { id: 7, text: "Як ви ставитеся до друзів, які віддалилися?", options: ["Зв'язуюсь, щоб відновити", "Чекаю, коли вони зв'яжуться", "Приймаю, що люди змінюються", "Образливо, але рухаюсь далі"] },
    { id: 8, text: "Ви б сказали другу, що його партнер йому не підходить?", options: ["Так, йому потрібно знати", "Так, але обережно", "Тільки якщо запитають", "Ні, це не моя справа"] },
    { id: 9, text: "Як ви балансуєте дружбу з романтичними стосунками?", options: ["Друзі завжди на першому місці", "Намагаюсь балансувати", "Партнер часто в пріоритеті", "Залежить від ситуації"] },
    { id: 10, text: "Що ви готові пробачити другу?", options: ["Майже все", "Багато, але не зраду", "Тільки дрібниці", "Залежить від вибачень"] }
  ],
  ko: [
    { id: 1, text: "친구와 얼마나 자주 만나고 싶어요?", options: ["매일", "일주일에 여러 번", "일주일에 한 번", "한 달에 몇 번"] },
    { id: 2, text: "우정에서 가장 중요한 것은?", options: ["정서적 지지", "공통 관심사", "함께 즐기기", "신뢰성"] },
    { id: 3, text: "위기에 처한 친구를 돕기 위해 모든 것을 버리시겠어요?", options: ["의심 없이", "상황에 따라", "가능하다면", "아마 안 할 거예요"] },
    { id: 4, text: "친구와의 불화는 어떻게 해결해요?", options: ["바로 이야기해요", "시간을 두고 논의해요", "대립을 피해요", "그냥 넘겨요"] },
    { id: 5, text: "가까운 친구에게 큰 금액을 빌려줄 건가요?", options: ["네, 주저 없이", "네, 명확한 합의하에", "소액만요", "아니요, 일이 복잡해져요"] },
    { id: 6, text: "친구가 당신의 가치관을 공유하는 게 중요해요?", options: ["매우 중요", "어느 정도 중요", "별로 안 중요", "상관없어요"] },
    { id: 7, text: "멀어진 친구에 대해 어떻게 생각해요?", options: ["연락해서 다시 연결해요", "그들이 연락할 때까지 기다려요", "사람은 변한다고 받아들여요", "상처받지만 넘어가요"] },
    { id: 8, text: "친구의 파트너가 안 좋다면 말해줄 건가요?", options: ["네, 알아야 해요", "네, 조심스럽게", "물어볼 때만", "아니요, 제 일이 아니에요"] },
    { id: 9, text: "우정과 연애 관계를 어떻게 균형 잡아요?", options: ["친구가 항상 우선", "둘 다 균형 잡으려 해요", "파트너가 자주 우선", "상황에 따라요"] },
    { id: 10, text: "친구를 위해 무엇을 용서할 건가요?", options: ["거의 모든 것", "많은 것, 배신만 빼고", "사소한 것만", "사과에 따라 달라요"] }
  ],
  zh: [
    { id: 1, text: "你多久见一次朋友?", options: ["每天", "一周几次", "一周一次", "一个月几次"] },
    { id: 2, text: "友谊中什么对你最重要?", options: ["情感支持", "共同兴趣", "一起玩乐", "可靠性"] },
    { id: 3, text: "你会放下一切去帮助有困难的朋友吗?", options: ["毫无疑问", "看情况", "如果我能处理", "可能不会"] },
    { id: 4, text: "你怎么处理和朋友的分歧?", options: ["立即讨论", "给点时间再讨论", "避免对抗", "算了"] },
    { id: 5, text: "你会借给亲密朋友一大笔钱吗?", options: ["是的，毫不犹豫", "是的，有明确协议", "只借小额", "不，会复杂化"] },
    { id: 6, text: "朋友分享你的价值观重要吗?", options: ["非常重要", "有点重要", "不太重要", "无所谓"] },
    { id: 7, text: "你怎么看待疏远的朋友?", options: ["主动联系重新连接", "等他们联系", "接受人会变", "受伤但继续前进"] },
    { id: 8, text: "如果朋友的伴侣不好，你会告诉他吗?", options: ["是的，他们需要知道", "是的，但小心地", "只有问我才说", "不，不是我的事"] },
    { id: 9, text: "你怎么平衡友谊和恋爱关系?", options: ["朋友总是第一", "尽量平衡", "伴侣经常优先", "看情况"] },
    { id: 10, text: "你会原谅朋友什么?", options: ["几乎一切", "很多，但不包括背叛", "只有小事", "取决于道歉"] }
  ]
};

// Questions for adults (26+)
const ADULTS_QUESTIONS: Record<Language, LocalizedQuizQuestion[]> = {
  en: [
    { id: 1, text: "How often do you prefer to communicate with friends?", options: ["Every day", "Several times a week", "Once a week", "Once a month"] },
    { id: 2, text: "What is more important to you in friendship?", options: ["Emotional support", "Shared interests", "Having fun together", "Practical help"] },
    { id: 3, text: "Would you go to a friend in the middle of the night if they're feeling bad?", options: ["Without question", "Depends on the situation", "Probably not", "Definitely not"] },
    { id: 4, text: "How often do you share personal feelings?", options: ["Constantly", "Often", "Rarely", "Almost never"] },
    { id: 5, text: "Would you lend a friend a large sum of money?", options: ["Yes, no problem", "Yes, but with conditions", "Probably not", "No"] },
    { id: 6, text: "Do you share secrets with friends?", options: ["Yes, I trust completely", "Yes, but not everything", "Rarely", "Never"] },
    { id: 7, text: "How do you handle conflicts in friendship?", options: ["Discuss openly", "Wait for it to pass", "Avoid it", "End communication"] },
    { id: 8, text: "How long do your friendships usually last?", options: ["Years and decades", "Several years", "A couple of years", "Less than a year"] },
    { id: 9, text: "Would you change your plans for a friend?", options: ["Always", "Usually", "Sometimes", "Rarely"] },
    { id: 10, text: "What would you forgive a friend for?", options: ["Almost anything", "A lot", "Not much", "Almost nothing"] }
  ],
  ru: [
    { id: 1, text: "Как часто вы предпочитаете общаться с друзьями?", options: ["Каждый день", "Несколько раз в неделю", "Раз в неделю", "Раз в месяц"] },
    { id: 2, text: "Что для вас важнее в дружбе?", options: ["Эмоциональная поддержка", "Общие интересы", "Веселье вместе", "Практическая помощь"] },
    { id: 3, text: "Готовы ли вы приехать к другу среди ночи, если ему плохо?", options: ["Без вопросов", "Зависит от ситуации", "Скорее нет", "Точно нет"] },
    { id: 4, text: "Как часто вы делитесь личными переживаниями?", options: ["Постоянно", "Часто", "Редко", "Почти никогда"] },
    { id: 5, text: "Готовы ли вы одолжить другу крупную сумму денег?", options: ["Да, без проблем", "Да, но с оговорками", "Скорее нет", "Нет"] },
    { id: 6, text: "Делитесь ли вы секретами с друзьями?", options: ["Да, полностью доверяю", "Да, но не всё", "Редко", "Никогда"] },
    { id: 7, text: "Как вы справляетесь с конфликтами в дружбе?", options: ["Обсуждаю открыто", "Жду, пока пройдёт", "Избегаю", "Прекращаю общение"] },
    { id: 8, text: "Как долго обычно длятся ваши дружеские отношения?", options: ["Годами и десятилетиями", "Несколько лет", "Пару лет", "Меньше года"] },
    { id: 9, text: "Готовы ли вы изменить свои планы ради друга?", options: ["Всегда", "Обычно", "Иногда", "Редко"] },
    { id: 10, text: "Что вы готовы простить другу?", options: ["Практически всё", "Многое", "Немногое", "Почти ничего"] }
  ],
  fr: [
    { id: 1, text: "À quelle fréquence préférez-vous communiquer avec vos amis?", options: ["Tous les jours", "Plusieurs fois par semaine", "Une fois par semaine", "Une fois par mois"] },
    { id: 2, text: "Qu'est-ce qui est le plus important pour vous dans l'amitié?", options: ["Le soutien émotionnel", "Les intérêts communs", "S'amuser ensemble", "L'aide pratique"] },
    { id: 3, text: "Iriez-vous chez un ami au milieu de la nuit s'il se sent mal?", options: ["Sans hésitation", "Ça dépend de la situation", "Probablement pas", "Certainement pas"] },
    { id: 4, text: "À quelle fréquence partagez-vous vos sentiments personnels?", options: ["Constamment", "Souvent", "Rarement", "Presque jamais"] },
    { id: 5, text: "Prêteriez-vous une grosse somme d'argent à un ami?", options: ["Oui, sans problème", "Oui, mais avec des conditions", "Probablement pas", "Non"] },
    { id: 6, text: "Partagez-vous vos secrets avec vos amis?", options: ["Oui, je fais totalement confiance", "Oui, mais pas tout", "Rarement", "Jamais"] },
    { id: 7, text: "Comment gérez-vous les conflits en amitié?", options: ["J'en discute ouvertement", "J'attends que ça passe", "J'évite", "Je romps la communication"] },
    { id: 8, text: "Combien de temps durent généralement vos amitiés?", options: ["Des années et des décennies", "Plusieurs années", "Quelques années", "Moins d'un an"] },
    { id: 9, text: "Changeriez-vous vos plans pour un ami?", options: ["Toujours", "Généralement", "Parfois", "Rarement"] },
    { id: 10, text: "Que pardonneriez-vous à un ami?", options: ["Presque tout", "Beaucoup", "Peu de choses", "Presque rien"] }
  ],
  es: [
    { id: 1, text: "¿Con qué frecuencia prefieres comunicarte con tus amigos?", options: ["Todos los días", "Varias veces a la semana", "Una vez a la semana", "Una vez al mes"] },
    { id: 2, text: "¿Qué es más importante para ti en la amistad?", options: ["Apoyo emocional", "Intereses compartidos", "Divertirse juntos", "Ayuda práctica"] },
    { id: 3, text: "¿Irías a ver a un amigo en mitad de la noche si se siente mal?", options: ["Sin dudarlo", "Depende de la situación", "Probablemente no", "Definitivamente no"] },
    { id: 4, text: "¿Con qué frecuencia compartes sentimientos personales?", options: ["Constantemente", "A menudo", "Raramente", "Casi nunca"] },
    { id: 5, text: "¿Le prestarías una gran suma de dinero a un amigo?", options: ["Sí, sin problema", "Sí, pero con condiciones", "Probablemente no", "No"] },
    { id: 6, text: "¿Compartes secretos con tus amigos?", options: ["Sí, confío completamente", "Sí, pero no todo", "Raramente", "Nunca"] },
    { id: 7, text: "¿Cómo manejas los conflictos en la amistad?", options: ["Discuto abiertamente", "Espero a que pase", "Lo evito", "Termino la comunicación"] },
    { id: 8, text: "¿Cuánto suelen durar tus amistades?", options: ["Años y décadas", "Varios años", "Un par de años", "Menos de un año"] },
    { id: 9, text: "¿Cambiarías tus planes por un amigo?", options: ["Siempre", "Generalmente", "A veces", "Raramente"] },
    { id: 10, text: "¿Qué le perdonarías a un amigo?", options: ["Casi todo", "Mucho", "Poco", "Casi nada"] }
  ],
  pt: [
    { id: 1, text: "Com que frequência você prefere se comunicar com amigos?", options: ["Todos os dias", "Várias vezes por semana", "Uma vez por semana", "Uma vez por mês"] },
    { id: 2, text: "O que é mais importante para você na amizade?", options: ["Apoio emocional", "Interesses em comum", "Diversão juntos", "Ajuda prática"] },
    { id: 3, text: "Você iria ver um amigo no meio da noite se ele estivesse mal?", options: ["Sem dúvida", "Depende da situação", "Provavelmente não", "Definitivamente não"] },
    { id: 4, text: "Com que frequência você compartilha sentimentos pessoais?", options: ["Constantemente", "Frequentemente", "Raramente", "Quase nunca"] },
    { id: 5, text: "Você emprestaria uma grande quantia de dinheiro a um amigo?", options: ["Sim, sem problema", "Sim, mas com condições", "Provavelmente não", "Não"] },
    { id: 6, text: "Você compartilha segredos com amigos?", options: ["Sim, confio completamente", "Sim, mas não tudo", "Raramente", "Nunca"] },
    { id: 7, text: "Como você lida com conflitos na amizade?", options: ["Discuto abertamente", "Espero passar", "Evito", "Encerro a comunicação"] },
    { id: 8, text: "Quanto tempo suas amizades costumam durar?", options: ["Anos e décadas", "Vários anos", "Alguns anos", "Menos de um ano"] },
    { id: 9, text: "Você mudaria seus planos por um amigo?", options: ["Sempre", "Geralmente", "Às vezes", "Raramente"] },
    { id: 10, text: "O que você perdoaria a um amigo?", options: ["Quase tudo", "Muito", "Pouco", "Quase nada"] }
  ],
  uk: [
    { id: 1, text: "Як часто ви спілкуєтеся з друзями?", options: ["Щодня", "Кілька разів на тиждень", "Раз на тиждень", "Раз на місяць"] },
    { id: 2, text: "Що для вас важливіше у дружбі?", options: ["Емоційна підтримка", "Спільні інтереси", "Веселощі разом", "Практична допомога"] },
    { id: 3, text: "Чи поїхали б ви до друга серед ночі, якщо йому погано?", options: ["Без питань", "Залежить від ситуації", "Скоріше ні", "Точно ні"] },
    { id: 4, text: "Як часто ви ділитеся особистими переживаннями?", options: ["Постійно", "Часто", "Рідко", "Майже ніколи"] },
    { id: 5, text: "Чи позичили б ви другу велику суму грошей?", options: ["Так, без проблем", "Так, але з умовами", "Скоріше ні", "Ні"] },
    { id: 6, text: "Чи ділитеся ви секретами з друзями?", options: ["Так, повністю довіряю", "Так, але не все", "Рідко", "Ніколи"] },
    { id: 7, text: "Як ви вирішуєте конфлікти у дружбі?", options: ["Обговорюю відкрито", "Чекаю, поки мине", "Уникаю", "Припиняю спілкування"] },
    { id: 8, text: "Як довго зазвичай тривають ваші дружні стосунки?", options: ["Роками і десятиліттями", "Кілька років", "Пару років", "Менше року"] },
    { id: 9, text: "Чи готові ви змінити свої плани заради друга?", options: ["Завжди", "Зазвичай", "Іноді", "Рідко"] },
    { id: 10, text: "Що ви готові пробачити другу?", options: ["Практично все", "Багато", "Небагато", "Майже нічого"] }
  ],
  ko: [
    { id: 1, text: "친구와 얼마나 자주 연락하시나요?", options: ["매일", "일주일에 여러 번", "일주일에 한 번", "한 달에 한 번"] },
    { id: 2, text: "우정에서 가장 중요한 것은?", options: ["정서적 지지", "공통 관심사", "함께 즐기기", "실질적 도움"] },
    { id: 3, text: "친구가 힘들어하면 한밤중에라도 달려가시겠어요?", options: ["당연히", "상황에 따라", "아마 아닐 것", "절대 아니"] },
    { id: 4, text: "개인적인 감정을 얼마나 자주 나누시나요?", options: ["항상", "자주", "드물게", "거의 안 함"] },
    { id: 5, text: "친구에게 큰 돈을 빌려주시겠어요?", options: ["네, 문제없이", "네, 조건부로", "아마 안 할 것", "아니요"] },
    { id: 6, text: "친구와 비밀을 나누시나요?", options: ["네, 완전히 신뢰", "네, 전부는 아니지만", "드물게", "안 함"] },
    { id: 7, text: "우정에서 갈등을 어떻게 해결하시나요?", options: ["솔직하게 대화", "지나가길 기다림", "피함", "연락 끊음"] },
    { id: 8, text: "우정이 보통 얼마나 지속되나요?", options: ["수년~수십 년", "몇 년", "1~2년", "1년 미만"] },
    { id: 9, text: "친구를 위해 계획을 바꾸시겠어요?", options: ["항상", "보통", "가끔", "드물게"] },
    { id: 10, text: "친구에게 무엇을 용서하시겠어요?", options: ["거의 모든 것", "많은 것", "별로 없음", "거의 없음"] }
  ],
  zh: [
    { id: 1, text: "你多久和朋友联系一次？", options: ["每天", "每周几次", "每周一次", "每月一次"] },
    { id: 2, text: "友谊中什么对你更重要？", options: ["情感支持", "共同兴趣", "一起玩乐", "实际帮助"] },
    { id: 3, text: "如果朋友半夜需要帮助，你会去吗？", options: ["毫不犹豫", "看情况", "可能不会", "绝对不会"] },
    { id: 4, text: "你多久分享一次个人感受？", options: ["经常", "常常", "很少", "几乎从不"] },
    { id: 5, text: "你会借给朋友一大笔钱吗？", options: ["是的，没问题", "是的，有条件", "可能不会", "不会"] },
    { id: 6, text: "你会和朋友分享秘密吗？", options: ["是的，完全信任", "是的，但不是全部", "很少", "从不"] },
    { id: 7, text: "你如何处理友谊中的冲突？", options: ["公开讨论", "等待过去", "回避", "断绝联系"] },
    { id: 8, text: "你的友谊通常持续多久？", options: ["数年甚至数十年", "几年", "一两年", "不到一年"] },
    { id: 9, text: "你会为朋友改变计划吗？", options: ["总是", "通常", "有时", "很少"] },
    { id: 10, text: "你会原谅朋友什么？", options: ["几乎一切", "很多", "不多", "几乎没有"] }
  ]
};

// Get questions based on age group
export const getQuestionsByAgeGroup = (ageGroup: AgeGroup, language: Language): LocalizedQuizQuestion[] => {
  switch (ageGroup) {
    case 'kids':
      return KIDS_QUESTIONS[language];
    case 'teens':
      return TEENS_QUESTIONS[language];
    case 'young_adults':
      return YOUNG_ADULTS_QUESTIONS[language];
    case 'adults':
    default:
      return ADULTS_QUESTIONS[language];
  }
};

// Legacy export for backward compatibility
export const QUIZ_QUESTIONS_LOCALIZED = ADULTS_QUESTIONS;
