import { Language } from './translations';

export interface LocalizedQuizQuestion {
  id: number;
  text: string;
  options: string[];
}

export const QUIZ_QUESTIONS_LOCALIZED: Record<Language, LocalizedQuizQuestion[]> = {
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
