export type Language = 'en' | 'fr' | 'es' | 'ru' | 'pt' | 'uk' | 'ko' | 'zh';

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  ru: 'Русский',
  pt: 'Português',
  uk: 'Українська',
  ko: '한국어',
  zh: '中文'
};

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Auth
    'auth.title': 'BuddyBe',
    'auth.subtitle': 'Discover your friendship style and strengthen relationships',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.name': 'Name',
    'auth.name_placeholder': 'What is your name?',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.password_min': 'Minimum 6 characters',
    'auth.submit_login': 'Sign In',
    'auth.submit_register': 'Create Account',
    'auth.loading': 'Loading...',
    'auth.terms': 'By continuing, you agree to the terms of service',
    'auth.error_login': 'Login Error',
    'auth.error_credentials': 'Invalid email or password',
    'auth.error_exists': 'User Already Exists',
    'auth.error_exists_desc': 'This email is already registered. Try logging in.',
    'auth.error_register': 'Registration Error',
    'auth.error_generic': 'Something went wrong. Please try again.',
    'auth.welcome': 'Welcome!',
    'auth.welcome_login': 'You have successfully logged in',
    'auth.register_success': 'Registration Successful!',
    'auth.register_welcome': 'Welcome to BuddyBe',

    // Quiz
    'quiz.title': 'Discover Your Friendship Style',
    'quiz.subtitle': 'Answer 25 questions to create your profile',
    'quiz.question': 'Question',
    'quiz.of': 'of',
    'quiz.back': 'Back',
    'quiz.next': 'Next',
    'quiz.complete': 'Complete',
    'quiz.skip': 'Skip for now',
    'quiz.fill_later': 'You can fill it out later',

    // Profile
    'profile.analysis_complete': 'Analysis Complete',
    'profile.ready': 'Your Profile is Ready!',
    'profile.your_type': 'Your Friendship Type',
    'profile.about_type': 'About Your Type:',
    'profile.depth': 'Depth',
    'profile.loyalty': 'Loyalty',
    'profile.openness': 'Openness',
    'profile.share': 'Share with Friends',
    'profile.share_desc': 'Discover their type and compatibility',
    'profile.continue': 'Go to Friends',
    'profile.logout': 'Logout',
    'profile.goodbye': 'Goodbye!',
    'profile.logout_success': 'You have logged out',
    'profile.logout_error': 'Could not log out',

    // Friends
    'friends.title': 'Friends',
    'friends.friend': 'friend',
    'friends.friends_few': 'friends',
    'friends.friends_many': 'friends',
    'friends.search': 'Search friends...',
    'friends.not_found': 'No Friends Found',
    'friends.not_found_search': 'Try changing your search',
    'friends.invite': 'Invite friends to take the test',
    'friends.all': 'All',
    'friends.awaiting_analysis': 'Awaiting analysis',

    // Categories
    'category.soul_mate': 'Soul Mate',
    'category.close_friend': 'Close Friend',
    'category.good_buddy': 'Good Buddy',
    'category.situational': 'Situational',
    'category.distant': 'Distant',

    // Loading
    'loading.analyzing': 'Analyzing your answers...',
    'loading.ai': 'AI is studying your friendship style',

    // Score
    'score.title': 'Friendship Score',
    'score.history': 'Score History (30 days)',
    'score.average': 'Average',
    'score.min': 'Min',
    'score.max': 'Max',

    // Share
    'share.title': 'Share with Friends',
    'share.subtitle': 'Invite friends to discover their friendship type',
    'share.copy': 'Copy Link',
    'share.copied': 'Copied!',
    'share.link_copied': 'Link copied to clipboard',
    'share.qr': 'QR Code',
    'share.telegram': 'Telegram',
    'share.whatsapp': 'WhatsApp',
    'share.message': 'Discover your friendship style with BuddyBe!',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.birthday': 'Birthday',
    'notifications.contact': 'Time to Connect',

    // Bottom nav
    'nav.friends': 'Friends',
    'nav.share': 'Share',
    'nav.profile': 'Profile',

    // Friend Registration
    'friend_reg.invited_you': 'invited you',
    'friend_reg.subtitle': 'Tell us about yourself to discover your friendship style',
    'friend_reg.first_name': 'First Name',
    'friend_reg.first_name_placeholder': 'Your first name',
    'friend_reg.last_name': 'Last Name',
    'friend_reg.last_name_placeholder': 'Your last name',
    'friend_reg.birthday': 'Birthday',
    'friend_reg.birthday_placeholder': 'Select your birthday',
    'friend_reg.continue': 'Continue to Quiz',
    'friend_reg.added': 'Great!',
    'friend_reg.added_desc': 'You have been added as a friend',

    // Account Prompt
    'account_prompt.title': 'Quiz Complete!',
    'account_prompt.subtitle': 'Create an account to save your results and invite your friends',
    'account_prompt.benefits_title': 'Why create an account?',
    'account_prompt.benefit_1': 'Invite your friends',
    'account_prompt.benefit_1_desc': 'Share your link and see compatibility',
    'account_prompt.benefit_2': 'Track your friendship score',
    'account_prompt.benefit_2_desc': 'Monitor how your relationships grow',
    'account_prompt.benefit_3': 'Never miss important dates',
    'account_prompt.benefit_3_desc': 'Get reminders for birthdays',
    'account_prompt.create_account': 'Create Account',
    'account_prompt.skip': 'Skip for now',

    // Common
    'common.error': 'Error',
  },

  fr: {
    // Auth
    'auth.title': 'BuddyBe',
    'auth.subtitle': "Découvrez votre style d'amitié et renforcez vos relations",
    'auth.login': 'Connexion',
    'auth.register': 'Inscription',
    'auth.name': 'Nom',
    'auth.name_placeholder': 'Comment vous appelez-vous?',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.password_min': 'Minimum 6 caractères',
    'auth.submit_login': 'Se connecter',
    'auth.submit_register': 'Créer un compte',
    'auth.loading': 'Chargement...',
    'auth.terms': "En continuant, vous acceptez les conditions d'utilisation",
    'auth.error_login': 'Erreur de connexion',
    'auth.error_credentials': 'Email ou mot de passe invalide',
    'auth.error_exists': 'Utilisateur existant',
    'auth.error_exists_desc': 'Cet email est déjà enregistré. Essayez de vous connecter.',
    'auth.error_register': "Erreur d'inscription",
    'auth.error_generic': "Une erreur s'est produite. Veuillez réessayer.",
    'auth.welcome': 'Bienvenue!',
    'auth.welcome_login': 'Vous êtes connecté avec succès',
    'auth.register_success': 'Inscription réussie!',
    'auth.register_welcome': 'Bienvenue sur BuddyBe',

    // Quiz
    'quiz.title': "Découvrez votre style d'amitié",
    'quiz.subtitle': 'Répondez à 25 questions pour créer votre profil',
    'quiz.question': 'Question',
    'quiz.of': 'sur',
    'quiz.back': 'Retour',
    'quiz.next': 'Suivant',
    'quiz.complete': 'Terminer',
    'quiz.skip': 'Passer pour le moment',
    'quiz.fill_later': 'Vous pouvez le remplir plus tard',

    // Profile
    'profile.analysis_complete': 'Analyse terminée',
    'profile.ready': 'Votre profil est prêt!',
    'profile.your_type': "Votre type d'amitié",
    'profile.about_type': 'À propos de votre type:',
    'profile.depth': 'Profondeur',
    'profile.loyalty': 'Fidélité',
    'profile.openness': 'Ouverture',
    'profile.share': 'Partager avec des amis',
    'profile.share_desc': 'Découvrez leur type et compatibilité',
    'profile.continue': 'Voir les amis',
    'profile.logout': 'Déconnexion',
    'profile.goodbye': 'Au revoir!',
    'profile.logout_success': 'Vous êtes déconnecté',
    'profile.logout_error': 'Impossible de se déconnecter',

    // Friends
    'friends.title': 'Amis',
    'friends.friend': 'ami',
    'friends.friends_few': 'amis',
    'friends.friends_many': 'amis',
    'friends.search': 'Rechercher des amis...',
    'friends.not_found': 'Aucun ami trouvé',
    'friends.not_found_search': 'Essayez de modifier votre recherche',
    'friends.invite': 'Invitez des amis à passer le test',
    'friends.all': 'Tous',
    'friends.awaiting_analysis': "En attente d'analyse",

    // Categories
    'category.soul_mate': 'Âme sœur',
    'category.close_friend': 'Ami proche',
    'category.good_buddy': 'Bon copain',
    'category.situational': 'Situationnel',
    'category.distant': 'Distant',

    // Loading
    'loading.analyzing': 'Analyse de vos réponses...',
    'loading.ai': "L'IA étudie votre style d'amitié",

    // Score
    'score.title': "Score d'amitié",
    'score.history': 'Historique (30 jours)',
    'score.average': 'Moyenne',
    'score.min': 'Min',
    'score.max': 'Max',

    // Share
    'share.title': 'Partager avec des amis',
    'share.subtitle': "Invitez vos amis à découvrir leur type d'amitié",
    'share.copy': 'Copier le lien',
    'share.copied': 'Copié!',
    'share.link_copied': 'Lien copié dans le presse-papiers',
    'share.qr': 'Code QR',
    'share.telegram': 'Telegram',
    'share.whatsapp': 'WhatsApp',
    'share.message': "Découvrez votre style d'amitié avec BuddyBe!",

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.birthday': 'Anniversaire',
    'notifications.contact': 'Temps de se connecter',

    // Bottom nav
    'nav.friends': 'Amis',
    'nav.share': 'Partager',
    'nav.profile': 'Profil',

    // Account Prompt
    'account_prompt.title': 'Quiz terminé!',
    'account_prompt.subtitle': 'Créez un compte pour sauvegarder vos résultats et inviter vos amis',
    'account_prompt.benefits_title': 'Pourquoi créer un compte?',
    'account_prompt.benefit_1': 'Invitez vos amis',
    'account_prompt.benefit_1_desc': 'Partagez votre lien et découvrez la compatibilité',
    'account_prompt.benefit_2': 'Suivez votre score d\'amitié',
    'account_prompt.benefit_2_desc': 'Observez comment vos relations évoluent',
    'account_prompt.benefit_3': 'Ne manquez pas les dates importantes',
    'account_prompt.benefit_3_desc': 'Recevez des rappels d\'anniversaire',
    'account_prompt.create_account': 'Créer un compte',
    'account_prompt.skip': 'Passer',

    // Common
    'common.error': 'Erreur',
  },

  es: {
    // Auth
    'auth.title': 'BuddyBe',
    'auth.subtitle': 'Descubre tu estilo de amistad y fortalece tus relaciones',
    'auth.login': 'Iniciar sesión',
    'auth.register': 'Registrarse',
    'auth.name': 'Nombre',
    'auth.name_placeholder': '¿Cómo te llamas?',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.password_min': 'Mínimo 6 caracteres',
    'auth.submit_login': 'Entrar',
    'auth.submit_register': 'Crear cuenta',
    'auth.loading': 'Cargando...',
    'auth.terms': 'Al continuar, aceptas los términos de servicio',
    'auth.error_login': 'Error de inicio de sesión',
    'auth.error_credentials': 'Correo electrónico o contraseña inválidos',
    'auth.error_exists': 'Usuario ya existe',
    'auth.error_exists_desc': 'Este correo ya está registrado. Intenta iniciar sesión.',
    'auth.error_register': 'Error de registro',
    'auth.error_generic': 'Algo salió mal. Por favor, inténtalo de nuevo.',
    'auth.welcome': '¡Bienvenido!',
    'auth.welcome_login': 'Has iniciado sesión exitosamente',
    'auth.register_success': '¡Registro exitoso!',
    'auth.register_welcome': 'Bienvenido a BuddyBe',

    // Quiz
    'quiz.title': 'Descubre tu estilo de amistad',
    'quiz.subtitle': 'Responde 25 preguntas para crear tu perfil',
    'quiz.question': 'Pregunta',
    'quiz.of': 'de',
    'quiz.back': 'Atrás',
    'quiz.next': 'Siguiente',
    'quiz.complete': 'Completar',
    'quiz.skip': 'Omitir por ahora',
    'quiz.fill_later': 'Puedes llenarlo después',

    // Profile
    'profile.analysis_complete': 'Análisis completado',
    'profile.ready': '¡Tu perfil está listo!',
    'profile.your_type': 'Tu tipo de amistad',
    'profile.about_type': 'Sobre tu tipo:',
    'profile.depth': 'Profundidad',
    'profile.loyalty': 'Lealtad',
    'profile.openness': 'Apertura',
    'profile.share': 'Compartir con amigos',
    'profile.share_desc': 'Descubre su tipo y compatibilidad',
    'profile.continue': 'Ir a amigos',
    'profile.logout': 'Cerrar sesión',
    'profile.goodbye': '¡Adiós!',
    'profile.logout_success': 'Has cerrado sesión',
    'profile.logout_error': 'No se pudo cerrar sesión',

    // Friends
    'friends.title': 'Amigos',
    'friends.friend': 'amigo',
    'friends.friends_few': 'amigos',
    'friends.friends_many': 'amigos',
    'friends.search': 'Buscar amigos...',
    'friends.not_found': 'No se encontraron amigos',
    'friends.not_found_search': 'Intenta cambiar tu búsqueda',
    'friends.invite': 'Invita a amigos a hacer el test',
    'friends.all': 'Todos',
    'friends.awaiting_analysis': 'Esperando análisis',

    // Categories
    'category.soul_mate': 'Alma gemela',
    'category.close_friend': 'Amigo cercano',
    'category.good_buddy': 'Buen compañero',
    'category.situational': 'Situacional',
    'category.distant': 'Distante',

    // Loading
    'loading.analyzing': 'Analizando tus respuestas...',
    'loading.ai': 'La IA estudia tu estilo de amistad',

    // Score
    'score.title': 'Puntuación de amistad',
    'score.history': 'Historial (30 días)',
    'score.average': 'Promedio',
    'score.min': 'Mín',
    'score.max': 'Máx',

    // Share
    'share.title': 'Compartir con amigos',
    'share.subtitle': 'Invita a amigos a descubrir su tipo de amistad',
    'share.copy': 'Copiar enlace',
    'share.copied': '¡Copiado!',
    'share.link_copied': 'Enlace copiado al portapapeles',
    'share.qr': 'Código QR',
    'share.telegram': 'Telegram',
    'share.whatsapp': 'WhatsApp',
    'share.message': '¡Descubre tu estilo de amistad con BuddyBe!',

    // Notifications
    'notifications.title': 'Notificaciones',
    'notifications.birthday': 'Cumpleaños',
    'notifications.contact': 'Hora de conectar',

    // Bottom nav
    'nav.friends': 'Amigos',
    'nav.share': 'Compartir',
    'nav.profile': 'Perfil',

    // Account Prompt
    'account_prompt.title': '¡Cuestionario completado!',
    'account_prompt.subtitle': 'Crea una cuenta para guardar tus resultados e invitar a tus amigos',
    'account_prompt.benefits_title': '¿Por qué crear una cuenta?',
    'account_prompt.benefit_1': 'Invita a tus amigos',
    'account_prompt.benefit_1_desc': 'Comparte tu enlace y descubre la compatibilidad',
    'account_prompt.benefit_2': 'Sigue tu puntuación de amistad',
    'account_prompt.benefit_2_desc': 'Observa cómo crecen tus relaciones',
    'account_prompt.benefit_3': 'No te pierdas fechas importantes',
    'account_prompt.benefit_3_desc': 'Recibe recordatorios de cumpleaños',
    'account_prompt.create_account': 'Crear cuenta',
    'account_prompt.skip': 'Omitir',

    // Common
    'common.error': 'Error',
  },

  ru: {
    // Auth
    'auth.title': 'BuddyBe',
    'auth.subtitle': 'Узнай свой стиль дружбы и укрепи отношения',
    'auth.login': 'Вход',
    'auth.register': 'Регистрация',
    'auth.name': 'Имя',
    'auth.name_placeholder': 'Как вас зовут?',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.password_min': 'Минимум 6 символов',
    'auth.submit_login': 'Войти',
    'auth.submit_register': 'Создать аккаунт',
    'auth.loading': 'Загрузка...',
    'auth.terms': 'Продолжая, вы соглашаетесь с условиями использования сервиса',
    'auth.error_login': 'Ошибка входа',
    'auth.error_credentials': 'Неверный email или пароль',
    'auth.error_exists': 'Пользователь существует',
    'auth.error_exists_desc': 'Этот email уже зарегистрирован. Попробуйте войти.',
    'auth.error_register': 'Ошибка регистрации',
    'auth.error_generic': 'Что-то пошло не так. Попробуйте снова.',
    'auth.welcome': 'Добро пожаловать!',
    'auth.welcome_login': 'Вы успешно вошли в аккаунт',
    'auth.register_success': 'Регистрация успешна!',
    'auth.register_welcome': 'Добро пожаловать в BuddyBe',

    // Quiz
    'quiz.title': 'Узнай свой тип дружбы',
    'quiz.subtitle': 'Ответь на 25 вопросов, чтобы мы создали твой профиль',
    'quiz.question': 'Вопрос',
    'quiz.of': 'из',
    'quiz.back': 'Назад',
    'quiz.next': 'Далее',
    'quiz.complete': 'Завершить',
    'quiz.skip': 'Пропустить',
    'quiz.fill_later': 'Вы можете заполнить позже',

    // Profile
    'profile.analysis_complete': 'Анализ завершён',
    'profile.ready': 'Ваш профиль готов!',
    'profile.your_type': 'Ваш тип дружбы',
    'profile.about_type': 'О вашем типе:',
    'profile.depth': 'Глубина',
    'profile.loyalty': 'Преданность',
    'profile.openness': 'Открытость',
    'profile.share': 'Поделитесь с друзьями',
    'profile.share_desc': 'Узнайте их тип и совместимость',
    'profile.continue': 'Перейти к друзьям',
    'profile.logout': 'Выйти',
    'profile.goodbye': 'До свидания!',
    'profile.logout_success': 'Вы вышли из аккаунта',
    'profile.logout_error': 'Не удалось выйти из аккаунта',

    // Friends
    'friends.title': 'Друзья',
    'friends.friend': 'друг',
    'friends.friends_few': 'друга',
    'friends.friends_many': 'друзей',
    'friends.search': 'Поиск друзей...',
    'friends.not_found': 'Друзья не найдены',
    'friends.not_found_search': 'Попробуйте изменить запрос',
    'friends.invite': 'Пригласите друзей пройти тест',
    'friends.all': 'Все',
    'friends.awaiting_analysis': 'Ожидает анализа',

    // Categories
    'category.soul_mate': 'Душа в душу',
    'category.close_friend': 'Близкий друг',
    'category.good_buddy': 'Хороший приятель',
    'category.situational': 'Ситуативный',
    'category.distant': 'Дальний',

    // Loading
    'loading.analyzing': 'Анализируем ваши ответы...',
    'loading.ai': 'Искусственный интеллект изучает ваш стиль дружбы',

    // Score
    'score.title': 'Оценка дружбы',
    'score.history': 'История оценки (30 дней)',
    'score.average': 'Среднее',
    'score.min': 'Мин',
    'score.max': 'Макс',

    // Share
    'share.title': 'Поделиться с друзьями',
    'share.subtitle': 'Пригласите друзей узнать их тип дружбы',
    'share.copy': 'Копировать ссылку',
    'share.copied': 'Скопировано!',
    'share.link_copied': 'Ссылка скопирована',
    'share.qr': 'QR-код',
    'share.telegram': 'Telegram',
    'share.whatsapp': 'WhatsApp',
    'share.message': 'Узнай свой стиль дружбы с BuddyBe!',

    // Notifications
    'notifications.title': 'Уведомления',
    'notifications.birthday': 'День рождения',
    'notifications.contact': 'Пора связаться',

    // Bottom nav
    'nav.friends': 'Друзья',
    'nav.share': 'Поделиться',
    'nav.profile': 'Профиль',

    // Friend Registration
    'friend_reg.invited_you': 'пригласил(а) вас',
    'friend_reg.subtitle': 'Расскажите о себе, чтобы узнать свой стиль дружбы',
    'friend_reg.first_name': 'Имя',
    'friend_reg.first_name_placeholder': 'Ваше имя',
    'friend_reg.last_name': 'Фамилия',
    'friend_reg.last_name_placeholder': 'Ваша фамилия',
    'friend_reg.birthday': 'Дата рождения',
    'friend_reg.birthday_placeholder': 'Выберите дату рождения',
    'friend_reg.continue': 'Перейти к тесту',
    'friend_reg.added': 'Отлично!',
    'friend_reg.added_desc': 'Вы добавлены в друзья',

    // Account Prompt
    'account_prompt.title': 'Анкета заполнена!',
    'account_prompt.subtitle': 'Создайте аккаунт, чтобы сохранить результаты и приглашать друзей',
    'account_prompt.benefits_title': 'Зачем создавать аккаунт?',
    'account_prompt.benefit_1': 'Приглашайте друзей',
    'account_prompt.benefit_1_desc': 'Делитесь ссылкой и смотрите совместимость',
    'account_prompt.benefit_2': 'Следите за оценкой дружбы',
    'account_prompt.benefit_2_desc': 'Наблюдайте, как развиваются отношения',
    'account_prompt.benefit_3': 'Не пропускайте важные даты',
    'account_prompt.benefit_3_desc': 'Получайте напоминания о днях рождения',
    'account_prompt.create_account': 'Создать аккаунт',
    'account_prompt.skip': 'Пропустить',

    // Common
    'common.error': 'Ошибка',
  },

  pt: {
    // Auth
    'auth.title': 'BuddyBe',
    'auth.subtitle': 'Descubra seu estilo de amizade e fortaleça seus relacionamentos',
    'auth.login': 'Entrar',
    'auth.register': 'Cadastrar',
    'auth.name': 'Nome',
    'auth.name_placeholder': 'Qual é o seu nome?',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.password_min': 'Mínimo 6 caracteres',
    'auth.submit_login': 'Entrar',
    'auth.submit_register': 'Criar conta',
    'auth.loading': 'Carregando...',
    'auth.terms': 'Ao continuar, você concorda com os termos de serviço',
    'auth.error_login': 'Erro de login',
    'auth.error_credentials': 'Email ou senha inválidos',
    'auth.error_exists': 'Usuário já existe',
    'auth.error_exists_desc': 'Este email já está cadastrado. Tente fazer login.',
    'auth.error_register': 'Erro de cadastro',
    'auth.error_generic': 'Algo deu errado. Por favor, tente novamente.',
    'auth.welcome': 'Bem-vindo!',
    'auth.welcome_login': 'Você entrou com sucesso',
    'auth.register_success': 'Cadastro realizado!',
    'auth.register_welcome': 'Bem-vindo ao BuddyBe',

    // Quiz
    'quiz.title': 'Descubra seu estilo de amizade',
    'quiz.subtitle': 'Responda 25 perguntas para criar seu perfil',
    'quiz.question': 'Pergunta',
    'quiz.of': 'de',
    'quiz.back': 'Voltar',
    'quiz.next': 'Próximo',
    'quiz.complete': 'Concluir',
    'quiz.skip': 'Pular por enquanto',
    'quiz.fill_later': 'Você pode preencher depois',

    // Profile
    'profile.analysis_complete': 'Análise concluída',
    'profile.ready': 'Seu perfil está pronto!',
    'profile.your_type': 'Seu tipo de amizade',
    'profile.about_type': 'Sobre seu tipo:',
    'profile.depth': 'Profundidade',
    'profile.loyalty': 'Lealdade',
    'profile.openness': 'Abertura',
    'profile.share': 'Compartilhar com amigos',
    'profile.share_desc': 'Descubra o tipo e compatibilidade deles',
    'profile.continue': 'Ver amigos',
    'profile.logout': 'Sair',
    'profile.goodbye': 'Até logo!',
    'profile.logout_success': 'Você saiu da conta',
    'profile.logout_error': 'Não foi possível sair',

    // Friends
    'friends.title': 'Amigos',
    'friends.friend': 'amigo',
    'friends.friends_few': 'amigos',
    'friends.friends_many': 'amigos',
    'friends.search': 'Buscar amigos...',
    'friends.not_found': 'Nenhum amigo encontrado',
    'friends.not_found_search': 'Tente mudar sua busca',
    'friends.invite': 'Convide amigos para fazer o teste',
    'friends.all': 'Todos',
    'friends.awaiting_analysis': 'Aguardando análise',

    // Categories
    'category.soul_mate': 'Alma gêmea',
    'category.close_friend': 'Amigo próximo',
    'category.good_buddy': 'Bom colega',
    'category.situational': 'Situacional',
    'category.distant': 'Distante',

    // Loading
    'loading.analyzing': 'Analisando suas respostas...',
    'loading.ai': 'A IA está estudando seu estilo de amizade',

    // Score
    'score.title': 'Pontuação de amizade',
    'score.history': 'Histórico (30 dias)',
    'score.average': 'Média',
    'score.min': 'Mín',
    'score.max': 'Máx',

    // Share
    'share.title': 'Compartilhar com amigos',
    'share.subtitle': 'Convide amigos para descobrir seu tipo de amizade',
    'share.copy': 'Copiar link',
    'share.copied': 'Copiado!',
    'share.link_copied': 'Link copiado para a área de transferência',
    'share.qr': 'Código QR',
    'share.telegram': 'Telegram',
    'share.whatsapp': 'WhatsApp',
    'share.message': 'Descubra seu estilo de amizade com o BuddyBe!',

    // Notifications
    'notifications.title': 'Notificações',
    'notifications.birthday': 'Aniversário',
    'notifications.contact': 'Hora de conectar',

    // Bottom nav
    'nav.friends': 'Amigos',
    'nav.share': 'Compartilhar',
    'nav.profile': 'Perfil',

    // Account Prompt
    'account_prompt.title': 'Quiz concluído!',
    'account_prompt.subtitle': 'Crie uma conta para salvar seus resultados e convidar amigos',
    'account_prompt.benefits_title': 'Por que criar uma conta?',
    'account_prompt.benefit_1': 'Convide seus amigos',
    'account_prompt.benefit_1_desc': 'Compartilhe seu link e veja a compatibilidade',
    'account_prompt.benefit_2': 'Acompanhe sua pontuação de amizade',
    'account_prompt.benefit_2_desc': 'Observe como seus relacionamentos crescem',
    'account_prompt.benefit_3': 'Não perca datas importantes',
    'account_prompt.benefit_3_desc': 'Receba lembretes de aniversário',
    'account_prompt.create_account': 'Criar conta',
    'account_prompt.skip': 'Pular',

    // Common
    'common.error': 'Erro',
  },

  uk: {
    // Auth
    'auth.title': 'BuddyBe',
    'auth.subtitle': "Дізнайся свій стиль дружби та зміцни відносини",
    'auth.login': 'Вхід',
    'auth.register': 'Реєстрація',
    'auth.name': "Ім'я",
    'auth.name_placeholder': 'Як вас звати?',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.password_min': 'Мінімум 6 символів',
    'auth.submit_login': 'Увійти',
    'auth.submit_register': 'Створити акаунт',
    'auth.loading': 'Завантаження...',
    'auth.terms': 'Продовжуючи, ви погоджуєтесь з умовами використання сервісу',
    'auth.error_login': 'Помилка входу',
    'auth.error_credentials': 'Невірний email або пароль',
    'auth.error_exists': 'Користувач існує',
    'auth.error_exists_desc': 'Цей email вже зареєстрований. Спробуйте увійти.',
    'auth.error_register': 'Помилка реєстрації',
    'auth.error_generic': 'Щось пішло не так. Спробуйте ще раз.',
    'auth.welcome': 'Ласкаво просимо!',
    'auth.welcome_login': 'Ви успішно увійшли в акаунт',
    'auth.register_success': 'Реєстрація успішна!',
    'auth.register_welcome': 'Ласкаво просимо до BuddyBe',

    // Quiz
    'quiz.title': 'Дізнайся свій тип дружби',
    'quiz.subtitle': 'Дай відповідь на 25 питань, щоб ми створили твій профіль',
    'quiz.question': 'Питання',
    'quiz.of': 'з',
    'quiz.back': 'Назад',
    'quiz.next': 'Далі',
    'quiz.complete': 'Завершити',
    'quiz.skip': 'Пропустити',
    'quiz.fill_later': 'Ви можете заповнити пізніше',

    // Profile
    'profile.analysis_complete': 'Аналіз завершено',
    'profile.ready': 'Ваш профіль готовий!',
    'profile.your_type': 'Ваш тип дружби',
    'profile.about_type': 'Про ваш тип:',
    'profile.depth': 'Глибина',
    'profile.loyalty': 'Відданість',
    'profile.openness': 'Відкритість',
    'profile.share': 'Поділіться з друзями',
    'profile.share_desc': 'Дізнайтеся їхній тип та сумісність',
    'profile.continue': 'Перейти до друзів',
    'profile.logout': 'Вийти',
    'profile.goodbye': 'До побачення!',
    'profile.logout_success': 'Ви вийшли з акаунту',
    'profile.logout_error': 'Не вдалося вийти з акаунту',

    // Friends
    'friends.title': 'Друзі',
    'friends.friend': 'друг',
    'friends.friends_few': 'друга',
    'friends.friends_many': 'друзів',
    'friends.search': 'Пошук друзів...',
    'friends.not_found': 'Друзів не знайдено',
    'friends.not_found_search': 'Спробуйте змінити запит',
    'friends.invite': 'Запросіть друзів пройти тест',
    'friends.all': 'Усі',
    'friends.awaiting_analysis': 'Очікує аналізу',

    // Categories
    'category.soul_mate': 'Споріднена душа',
    'category.close_friend': 'Близький друг',
    'category.good_buddy': 'Хороший приятель',
    'category.situational': 'Ситуативний',
    'category.distant': 'Далекий',

    // Loading
    'loading.analyzing': 'Аналізуємо ваші відповіді...',
    'loading.ai': 'Штучний інтелект вивчає ваш стиль дружби',

    // Score
    'score.title': 'Оцінка дружби',
    'score.history': 'Історія оцінки (30 днів)',
    'score.average': 'Середнє',
    'score.min': 'Мін',
    'score.max': 'Макс',

    // Share
    'share.title': 'Поділитися з друзями',
    'share.subtitle': 'Запросіть друзів дізнатися їхній тип дружби',
    'share.copy': 'Копіювати посилання',
    'share.copied': 'Скопійовано!',
    'share.link_copied': 'Посилання скопійовано',
    'share.qr': 'QR-код',
    'share.telegram': 'Telegram',
    'share.whatsapp': 'WhatsApp',
    'share.message': 'Дізнайся свій стиль дружби з BuddyBe!',

    // Notifications
    'notifications.title': 'Сповіщення',
    'notifications.birthday': 'День народження',
    'notifications.contact': 'Час зв\'язатися',

    // Bottom nav
    'nav.friends': 'Друзі',
    'nav.share': 'Поділитися',
    'nav.profile': 'Профіль',

    // Account Prompt
    'account_prompt.title': 'Анкету завершено!',
    'account_prompt.subtitle': 'Створіть акаунт, щоб зберегти результати та запрошувати друзів',
    'account_prompt.benefits_title': 'Навіщо створювати акаунт?',
    'account_prompt.benefit_1': 'Запрошуйте друзів',
    'account_prompt.benefit_1_desc': 'Діліться посиланням та дивіться сумісність',
    'account_prompt.benefit_2': 'Слідкуйте за оцінкою дружби',
    'account_prompt.benefit_2_desc': 'Спостерігайте, як розвиваються стосунки',
    'account_prompt.benefit_3': 'Не пропускайте важливі дати',
    'account_prompt.benefit_3_desc': 'Отримуйте нагадування про дні народження',
    'account_prompt.create_account': 'Створити акаунт',
    'account_prompt.skip': 'Пропустити',

    // Common
    'common.error': 'Помилка',
  },

  ko: {
    // Auth
    'auth.title': 'BuddyBe',
    'auth.subtitle': '당신의 우정 스타일을 발견하고 관계를 강화하세요',
    'auth.login': '로그인',
    'auth.register': '회원가입',
    'auth.name': '이름',
    'auth.name_placeholder': '이름이 무엇인가요?',
    'auth.email': '이메일',
    'auth.password': '비밀번호',
    'auth.password_min': '최소 6자',
    'auth.submit_login': '로그인',
    'auth.submit_register': '계정 만들기',
    'auth.loading': '로딩 중...',
    'auth.terms': '계속하면 서비스 약관에 동의하는 것입니다',
    'auth.error_login': '로그인 오류',
    'auth.error_credentials': '이메일 또는 비밀번호가 잘못되었습니다',
    'auth.error_exists': '사용자가 이미 존재합니다',
    'auth.error_exists_desc': '이 이메일은 이미 등록되어 있습니다. 로그인을 시도해 보세요.',
    'auth.error_register': '가입 오류',
    'auth.error_generic': '문제가 발생했습니다. 다시 시도해 주세요.',
    'auth.welcome': '환영합니다!',
    'auth.welcome_login': '성공적으로 로그인했습니다',
    'auth.register_success': '가입 성공!',
    'auth.register_welcome': 'BuddyBe에 오신 것을 환영합니다',

    // Quiz
    'quiz.title': '당신의 우정 스타일을 발견하세요',
    'quiz.subtitle': '프로필을 만들기 위해 25개의 질문에 답하세요',
    'quiz.question': '질문',
    'quiz.of': '/',
    'quiz.back': '뒤로',
    'quiz.next': '다음',
    'quiz.complete': '완료',
    'quiz.skip': '나중에 하기',
    'quiz.fill_later': '나중에 작성할 수 있습니다',

    // Profile
    'profile.analysis_complete': '분석 완료',
    'profile.ready': '프로필이 준비되었습니다!',
    'profile.your_type': '당신의 우정 유형',
    'profile.about_type': '유형에 대하여:',
    'profile.depth': '깊이',
    'profile.loyalty': '충성도',
    'profile.openness': '개방성',
    'profile.share': '친구와 공유',
    'profile.share_desc': '그들의 유형과 호환성을 알아보세요',
    'profile.continue': '친구 보기',
    'profile.logout': '로그아웃',
    'profile.goodbye': '안녕히 가세요!',
    'profile.logout_success': '로그아웃되었습니다',
    'profile.logout_error': '로그아웃할 수 없습니다',

    // Friends
    'friends.title': '친구',
    'friends.friend': '친구',
    'friends.friends_few': '친구',
    'friends.friends_many': '친구',
    'friends.search': '친구 검색...',
    'friends.not_found': '친구를 찾을 수 없습니다',
    'friends.not_found_search': '검색을 변경해 보세요',
    'friends.invite': '친구를 초대하여 테스트를 받게 하세요',
    'friends.all': '전체',
    'friends.awaiting_analysis': '분석 대기 중',

    // Categories
    'category.soul_mate': '소울메이트',
    'category.close_friend': '친한 친구',
    'category.good_buddy': '좋은 친구',
    'category.situational': '상황적',
    'category.distant': '먼 사이',

    // Loading
    'loading.analyzing': '답변을 분석 중...',
    'loading.ai': 'AI가 당신의 우정 스타일을 연구하고 있습니다',

    // Score
    'score.title': '우정 점수',
    'score.history': '점수 기록 (30일)',
    'score.average': '평균',
    'score.min': '최소',
    'score.max': '최대',

    // Share
    'share.title': '친구와 공유',
    'share.subtitle': '친구를 초대하여 우정 유형을 알아보세요',
    'share.copy': '링크 복사',
    'share.copied': '복사됨!',
    'share.link_copied': '링크가 클립보드에 복사되었습니다',
    'share.qr': 'QR 코드',
    'share.telegram': '텔레그램',
    'share.whatsapp': '왓츠앱',
    'share.message': 'BuddyBe로 당신의 우정 스타일을 발견하세요!',

    // Notifications
    'notifications.title': '알림',
    'notifications.birthday': '생일',
    'notifications.contact': '연락할 시간',

    // Bottom nav
    'nav.friends': '친구',
    'nav.share': '공유',
    'nav.profile': '프로필',

    // Account Prompt
    'account_prompt.title': '퀴즈 완료!',
    'account_prompt.subtitle': '계정을 만들어 결과를 저장하고 친구를 초대하세요',
    'account_prompt.benefits_title': '왜 계정을 만들어야 하나요?',
    'account_prompt.benefit_1': '친구 초대',
    'account_prompt.benefit_1_desc': '링크를 공유하고 호환성을 확인하세요',
    'account_prompt.benefit_2': '우정 점수 추적',
    'account_prompt.benefit_2_desc': '관계가 어떻게 성장하는지 관찰하세요',
    'account_prompt.benefit_3': '중요한 날짜를 놓치지 마세요',
    'account_prompt.benefit_3_desc': '생일 알림을 받으세요',
    'account_prompt.create_account': '계정 만들기',
    'account_prompt.skip': '건너뛰기',

    // Common
    'common.error': '오류',
  },

  zh: {
    // Auth
    'auth.title': 'BuddyBe',
    'auth.subtitle': '发现你的友谊风格，加强人际关系',
    'auth.login': '登录',
    'auth.register': '注册',
    'auth.name': '姓名',
    'auth.name_placeholder': '你叫什么名字？',
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.password_min': '至少6个字符',
    'auth.submit_login': '登录',
    'auth.submit_register': '创建账户',
    'auth.loading': '加载中...',
    'auth.terms': '继续即表示您同意服务条款',
    'auth.error_login': '登录错误',
    'auth.error_credentials': '邮箱或密码错误',
    'auth.error_exists': '用户已存在',
    'auth.error_exists_desc': '此邮箱已注册。请尝试登录。',
    'auth.error_register': '注册错误',
    'auth.error_generic': '出了点问题。请重试。',
    'auth.welcome': '欢迎！',
    'auth.welcome_login': '您已成功登录',
    'auth.register_success': '注册成功！',
    'auth.register_welcome': '欢迎来到BuddyBe',

    // Quiz
    'quiz.title': '发现你的友谊风格',
    'quiz.subtitle': '回答25个问题来创建你的个人资料',
    'quiz.question': '问题',
    'quiz.of': '/',
    'quiz.back': '返回',
    'quiz.next': '下一个',
    'quiz.complete': '完成',
    'quiz.skip': '暂时跳过',
    'quiz.fill_later': '您可以稍后填写',

    // Profile
    'profile.analysis_complete': '分析完成',
    'profile.ready': '您的个人资料已准备好！',
    'profile.your_type': '你的友谊类型',
    'profile.about_type': '关于你的类型：',
    'profile.depth': '深度',
    'profile.loyalty': '忠诚',
    'profile.openness': '开放',
    'profile.share': '与朋友分享',
    'profile.share_desc': '了解他们的类型和兼容性',
    'profile.continue': '查看朋友',
    'profile.logout': '退出',
    'profile.goodbye': '再见！',
    'profile.logout_success': '您已退出账户',
    'profile.logout_error': '无法退出账户',

    // Friends
    'friends.title': '朋友',
    'friends.friend': '朋友',
    'friends.friends_few': '朋友',
    'friends.friends_many': '朋友',
    'friends.search': '搜索朋友...',
    'friends.not_found': '未找到朋友',
    'friends.not_found_search': '尝试更改搜索内容',
    'friends.invite': '邀请朋友参加测试',
    'friends.all': '全部',
    'friends.awaiting_analysis': '等待分析',

    // Categories
    'category.soul_mate': '灵魂伴侣',
    'category.close_friend': '亲密朋友',
    'category.good_buddy': '好伙伴',
    'category.situational': '情境性',
    'category.distant': '疏远',

    // Loading
    'loading.analyzing': '正在分析您的答案...',
    'loading.ai': 'AI正在研究您的友谊风格',

    // Score
    'score.title': '友谊分数',
    'score.history': '分数历史（30天）',
    'score.average': '平均',
    'score.min': '最低',
    'score.max': '最高',

    // Share
    'share.title': '与朋友分享',
    'share.subtitle': '邀请朋友发现他们的友谊类型',
    'share.copy': '复制链接',
    'share.copied': '已复制！',
    'share.link_copied': '链接已复制到剪贴板',
    'share.qr': '二维码',
    'share.telegram': 'Telegram',
    'share.whatsapp': 'WhatsApp',
    'share.message': '用BuddyBe发现你的友谊风格！',

    // Notifications
    'notifications.title': '通知',
    'notifications.birthday': '生日',
    'notifications.contact': '联系时间',

    // Bottom nav
    'nav.friends': '朋友',
    'nav.share': '分享',
    'nav.profile': '个人资料',

    // Account Prompt
    'account_prompt.title': '问卷完成！',
    'account_prompt.subtitle': '创建账户以保存结果并邀请朋友',
    'account_prompt.benefits_title': '为什么要创建账户？',
    'account_prompt.benefit_1': '邀请朋友',
    'account_prompt.benefit_1_desc': '分享链接并查看兼容性',
    'account_prompt.benefit_2': '跟踪友谊分数',
    'account_prompt.benefit_2_desc': '观察你的关系如何成长',
    'account_prompt.benefit_3': '不要错过重要日期',
    'account_prompt.benefit_3_desc': '收到生日提醒',
    'account_prompt.create_account': '创建账户',
    'account_prompt.skip': '跳过',

    // Common
    'common.error': '错误',
  },
};
