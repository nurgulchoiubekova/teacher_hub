export type Language = "ky" | "ru" | "en";

export const LANGUAGES = [
  { code: "ky", name: "Кыргызча" },
  { code: "ru", name: "Русский" },
  { code: "en", name: "English" }
];

export const TRANSLATIONS: Record<string, Record<Language, string>> = {
  // Navigation
  logo_subhead: {
    ky: "Санариптик мектеп",
    ru: "Цифровая школа",
    en: "Digital School"
  },
  nav_home: {
    ky: "Башкы бет",
    ru: "Главная",
    en: "Home"
  },
  nav_materials: {
    ky: "Материалдар",
    ru: "Материалы",
    en: "Materials"
  },
  nav_tools: {
    ky: "AI Инструменттер",
    ru: "AI Инструменты",
    en: "AI Tools"
  },
  nav_faq: {
    ky: "Суроо-Жооп",
    ru: "Вопросы-Ответы",
    en: "FAQ"
  },
  nav_subscription: {
    ky: "Жазылуу",
    ru: "Подписка",
    en: "Subscription"
  },
  nav_dashboard: {
    ky: "Кабинет",
    ru: "Кабинет",
    en: "Cabinet"
  },
  nav_admin: {
    ky: "Админ",
    ru: "Админ",
    en: "Admin"
  },
  quick_tool_header: {
    ky: "Сабак Пландоо",
    ru: "План урока",
    en: "Lesson Planning"
  },
  btn_login: {
    ky: "Кирүү",
    ru: "Войти",
    en: "Login"
  },
  btn_logout: {
    ky: "Чыгуу",
    ru: "Выйти",
    en: "Logout"
  },

  // Hero Section
  hero_tagline: {
    ky: "Кыргызстандын заманбап мугалимдеринин борбору",
    ru: "Центр современных учителей Кыргызстана",
    en: "Center for Modern Teachers of Kyrgyzstan"
  },
  hero_title_1: {
    ky: "Мугалимдик кесиптин",
    ru: "Цифровая эра",
    en: "Digital era of"
  },
  hero_title_2: {
    ky: "санариптик доору",
    ru: "учительской профессии",
    en: "the teaching profession"
  },
  hero_desc: {
    ky: "Сабак пландары, тесттер, ачык сабактар, презентациялар жана AI жардамчы куралдары. Бардык элементтер толугу менен ишке даяр!",
    ru: "Планы уроков, тесты, открытые уроки, презентации и ИИ помощники. Все функции полностью готовы к использованию!",
    en: "Lesson plans, quizzes, open lessons, presentations, and AI assistants. All features are completely ready to use!"
  },
  search_placeholder: {
    ky: "Тема, предмет же автор боюнча издөө...",
    ru: "Поиск по теме, предмету или автору...",
    en: "Search by topic, subject, or author..."
  },
  btn_search: {
    ky: "Издөө",
    ru: "Поиск",
    en: "Search"
  },

  // Homepage sections
  subjects_header: {
    ky: "Предметтер",
    ru: "Предметы",
    en: "Subjects"
  },
  see_all: {
    ky: "Бардыгын көрүү",
    ru: "Посмотреть все",
    en: "See all"
  },
  classes_header: {
    ky: "Класстар",
    ru: "Классы",
    en: "Classes"
  },
  popular_materials: {
    ky: "Популярдуу материалдар",
    ru: "Популярные материалы",
    en: "Popular Materials"
  },
  new_materials: {
    ky: "Жаңы материалдар",
    ru: "Новые материалы",
    en: "New Materials"
  },
  views_count: {
    ky: "көрүү",
    ru: "просмотров",
    en: "views"
  },
  downloads_count: {
    ky: "жүндөө",
    ru: "загрузок",
    en: "downloads"
  },

  // AI Tool banner
  ai_banner_tag: {
    ky: "AI ЖАРДАМЧЫ",
    ru: "ИИ ПОМОЩНИК",
    en: "AI ASSISTANT"
  },
  ai_banner_header: {
    ky: "AI менен сабакты пландаңыз",
    ru: "Планируйте уроки с помощью ИИ",
    en: "Plan Lessons with AI Support"
  },
  ai_banner_desc: {
    ky: "Мугалимдерге ылайыкташтырылган AI инструменттерибиз аркылуу бир нече секундда сабак пландарын, тесттерди же баалоо критерийлерин кыргыз тилинде генерациялап алыңыз!",
    ru: "Генерируйте планы уроков, тесты и критерии оценки за считанные секунды с помощью наших инструментов ИИ, адаптированных для учителей!",
    en: "Generate lesson plans, quizzes, and assessment criteria in seconds with our specialized AI tools for teachers!"
  },
  ai_banner_button: {
    ky: "Инструменттерди ачуу",
    ru: "Открыть инструменты",
    en: "Open Tools"
  },

  // Materials Archive
  materials_header: {
    ky: "Методикалык материалдар жыйнагы",
    ru: "Коллекция методических материалов",
    en: "Methodological Materials Archive"
  },
  materials_subhead: {
    ky: "Тандалган фильтрлерге жараша мектеп сабактарынын материалдары.",
    ru: "Материалы школьных уроков в соответствии с выбранными фильтрами.",
    en: "School lesson materials based on the selected filters."
  },
  clear_filters: {
    ky: "Бардык фильтрлерди тазалоо",
    ru: "Очистить все фильтры",
    en: "Clear all filters"
  },
  filter_subject: {
    ky: "Предмет боюнча",
    ru: "По предмету",
    en: "By subject"
  },
  filter_class: {
    ky: "Класс боюнча",
    ru: "По классу",
    en: "By class"
  },
  filter_type: {
    ky: "Файл тиби",
    ru: "Тип файла",
    en: "File type"
  },
  filter_search_label: {
    ky: "Издөө тексти",
    ru: "Текст поиска",
    en: "Search text"
  },
  filter_search_placeholder: {
    ky: "Тема же автор...",
    ru: "Тема или автор...",
    en: "Topic or author..."
  },
  all_subjects: {
    ky: "Бардык предметтер",
    ru: "Все предметы",
    en: "All subjects"
  },
  all_classes: {
    ky: "Бардык класстар (1-11)",
    ru: "Все классы (1-11)",
    en: "All classes (1-11)"
  },
  all_types: {
    ky: "Бардык файлдар",
    ru: "Все файлы",
    en: "All files"
  },
  loading_materials: {
    ky: "Материалдар жүктөлүүдө...",
    ru: "Материалы загружаются...",
    en: "Loading materials..."
  },
  no_materials: {
    ky: "Материал табылган жок",
    ru: "Материалы не найдены",
    en: "No materials found"
  },
  no_materials_desc: {
    ky: "Тандалган предмет, класс же издөө суроосу боюнча эч кандай маалымат табылган жок. Башка критерийлерди байкап көрүңүз.",
    ru: "По выбранному предмету, классу или поисковому запросу ничего не найдено. Пожалуйста, попробуйте другие критерии.",
    en: "Nothing found for the selected subject, class, or search query. Please try other criteria."
  },

  // Detail Page / Slideshow Viewer
  btn_back: {
    ky: "Артка кайтуу",
    ru: "Назад",
    en: "Go Back"
  },
  rating_title: {
    ky: "Баалоо:",
    ru: "Рейтинг:",
    en: "Rating:"
  },
  author_title: {
    ky: "Автор:",
    ru: "Автор:",
    en: "Author:"
  },
  date_title: {
    ky: "Кошулган күнү:",
    ru: "Дата добавления:",
    en: "Date added:"
  },
  btn_download_file: {
    ky: "Жүктөп алуу",
    ru: "Скачать файл",
    en: "Download File"
  },
  btn_share: {
    ky: "Бөлүшүү",
    ru: "Поделиться",
    en: "Share"
  },
  btn_print: {
    ky: "Принтерден чыгаруу",
    ru: "Распечатать",
    en: "Print"
  },
  comments_header: {
    ky: "Колдонуучулардын пикирлери",
    ru: "Комментарии пользователей",
    en: "User Comments"
  },
  comment_input_placeholder: {
    ky: "Пикириңизди жазыңыз...",
    ru: "Напишите ваш комментарий...",
    en: "Write your comment..."
  },
  btn_comment_submit: {
    ky: "Пикир калтыруу",
    ru: "Оставить комментарий",
    en: "Submit Comment"
  },
  edit_comment: {
    ky: "Оңдоо",
    ru: "Редактировать",
    en: "Edit"
  },
  delete_comment: {
    ky: "Өчүрүү",
    ru: "Удалить",
    en: "Delete"
  },
  reply_comment: {
    ky: "Жооп берүү",
    ru: "Ответить",
    en: "Reply"
  },
  save_comment: {
    ky: "Сактоо",
    ru: "Сохранить",
    en: "Save"
  },
  cancel_comment: {
    ky: "Жокко чыгаруу",
    ru: "Отмена",
    en: "Cancel"
  },

  // FAQ Page
  faq_title: {
    ky: "Көп берилүүчү суроолор (FAQ)",
    ru: "Часто задаваемые вопросы (FAQ)",
    en: "Frequently Asked Questions (FAQ)"
  },
  faq_desc: {
    ky: "Teacher Hub платформасы жана андагы AI жардамчы куралдар боюнча суроолорго жооптор.",
    ru: "Ответы на вопросы о платформе Teacher Hub и ее инструментах ИИ.",
    en: "Answers to questions about the Teacher Hub platform and its AI assistant tools."
  },

  // Auth modal
  auth_title_login: {
    ky: "Платформага кирүү",
    ru: "Вход на платформу",
    en: "Platform Login"
  },
  auth_title_register: {
    ky: "Катталуу",
    ru: "Регистрация",
    en: "Register"
  },
  auth_title_forgot: {
    ky: "Сырсөздү калыбына келтирүү",
    ru: "Восстановление пароля",
    en: "Password Recovery"
  },
  auth_fullname_label: {
    ky: "Аты-жөнүңүз *",
    ru: "Ваше имя и фамилия *",
    en: "Full Name *"
  },
  auth_email_label: {
    ky: "Электрондук дарек *",
    ru: "Электронная почта *",
    en: "Email Address *"
  },
  auth_password_label: {
    ky: "Сырсөз *",
    ru: "Пароль *",
    en: "Password *"
  },
  auth_role_label: {
    ky: "Платформадагы ролуңуз",
    ru: "Ваша роль на платформе",
    en: "Your Role on Platform"
  },
  auth_role_teacher: {
    ky: "Мугалим",
    ru: "Учитель",
    en: "Teacher"
  },
  auth_role_admin: {
    ky: "Администратор",
    ru: "Администратор",
    en: "Administrator"
  },
  auth_btn_login: {
    ky: "Кирүү",
    ru: "Войти",
    en: "Login"
  },
  auth_btn_register: {
    ky: "Катталуу",
    ru: "Зарегистрироваться",
    en: "Register"
  },
  auth_btn_forgot: {
    ky: "Калыбына келтирүү шилтемесин жөнөтүү",
    ru: "Отправить ссылку восстановления",
    en: "Send Recovery Link"
  },
  auth_switch_register: {
    ky: "Катталуу барагына өтүү",
    ru: "Перейти к регистрации",
    en: "Go to registration page"
  },
  auth_switch_login: {
    ky: "Мурунтан эле катталгансызбы? Кирүү",
    ru: "Уже зарегистрированы? Войти",
    en: "Already registered? Login"
  },
  auth_switch_forgot: {
    ky: "Сырсөздү унутуп калдыңызбы?",
    ru: "Забыли пароль?",
    en: "Forgot password?"
  },
  auth_switch_back_login: {
    ky: "Кирүү барагына кайтуу",
    ru: "Вернуться ко входу",
    en: "Back to login"
  },

  // AI Chat Bot Widget
  ai_chat_title: {
    ky: "AI Методист Жардамчы",
    ru: "ИИ Методист Помощник",
    en: "AI Methodologist Assistant"
  },
  ai_chat_welcome: {
    ky: "Саламатсызбы! Мен сиздин санариптик AI жардамчыңызмын. Мага сабак пландарын түзүү, тесттерди даярдоо же методикалык суроолоруңуз боюнча жазсаңыз болот.",
    ru: "Здравствуйте! Я ваш цифровой ИИ-помощник. Вы можете написать мне, чтобы составить планы уроков, подготовить тесты или задать методические вопросы.",
    en: "Hello! I am your digital AI assistant. You can write to me to create lesson plans, prepare tests, or ask methodological questions."
  },
  ai_chat_input_placeholder: {
    ky: "Методикалык суроо жазыңыз...",
    ru: "Напишите методический вопрос...",
    en: "Write a methodological question..."
  },
  ai_chat_send: {
    ky: "Жөнөтүү",
    ru: "Отправить",
    en: "Send"
  },

  // Cabinet & Admin
  cabinet_title: {
    ky: "Жеке Кабинет",
    ru: "Личный Кабинет",
    en: "Personal Cabinet"
  },
  admin_panel_title: {
    ky: "Башкаруу панели",
    ru: "Панель управления",
    en: "Admin Panel"
  }
};
