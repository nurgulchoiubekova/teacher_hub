import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, ArrowRight, Maximize2, Minimize2, Sparkles, 
  Palette, Download, Copy, FileText, MonitorPlay, Presentation, 
  Lightbulb, BookOpen, Star, HelpCircle, GraduationCap,
  Edit, Plus, Trash2, Image, Link, ChevronUp, ChevronDown, Check, PlusCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Slide {
  number: number;
  title: string;
  bullets: string[];
  designNote?: string;
  imageKeyword?: string;
  customImageUrl?: string;
}

interface SlideshowViewerProps {
  rawMarkdown: string;
  topic: string;
  subject: string;
}

const THEMES = [
  {
    id: "royal_blue",
    name: "Классикалык Көк",
    class: "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-500/20",
    headerColor: "text-indigo-200",
    titleColor: "text-white font-sans tracking-tight",
    bulletColor: "bg-indigo-500/30 text-indigo-200",
    noteBg: "bg-indigo-950/40 border-indigo-900/40 text-slate-300",
    badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    accent: "#6366f1"
  },
  {
    id: "emerald_nature",
    name: "Жаратылыш Жашыл",
    class: "bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-emerald-50 border-emerald-500/20",
    headerColor: "text-emerald-200",
    titleColor: "text-emerald-100 font-sans tracking-tight",
    bulletColor: "bg-emerald-500/30 text-emerald-200",
    noteBg: "bg-emerald-950/40 border-emerald-900/40 text-slate-300",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    accent: "#10b981"
  },
  {
    id: "sunset_warm",
    name: "Жылуу Күн Батыш",
    class: "bg-gradient-to-br from-amber-50 via-orange-50/70 to-yellow-50 text-slate-800 border-orange-200/50",
    headerColor: "text-orange-600",
    titleColor: "text-slate-900 font-sans font-extrabold tracking-tight",
    bulletColor: "bg-orange-100 text-orange-700",
    noteBg: "bg-orange-50/80 border-orange-100 text-slate-600",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    accent: "#f97316"
  },
  {
    id: "cosmic_dark",
    name: "Космостук Кара",
    class: "bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-purple-50 border-purple-500/20",
    headerColor: "text-purple-300",
    titleColor: "text-white font-sans tracking-tight",
    bulletColor: "bg-purple-500/30 text-purple-200",
    noteBg: "bg-purple-950/40 border-purple-900/40 text-slate-300",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    accent: "#a855f7"
  }
];

const EDUCATIONAL_IMAGES: Record<string, string> = {
  // General Schooling / Classroom
  "classroom": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80",
  "school": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
  "education": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
  "study": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
  "student": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  "learn": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
  "practice": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80",
  "concept": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80",
  "facts": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  "welcome": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
  "thank": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
  "meeting": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
  
  // Math & Physics
  "math": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
  "mathematics": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
  "algebra": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
  "geometry": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
  "physics": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
  "numbers": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
  "formula": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
  
  // Chemistry & Biology
  "chemistry": "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&w=800&q=80",
  "chemical": "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&w=800&q=80",
  "biology": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80",
  "biologia": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80",
  "science": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
  "lab": "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&w=800&q=80",
  "experiment": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
  
  // History & Geography / Nature
  "history": "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=800&q=80",
  "ancient": "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=800&q=80",
  "past": "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=800&q=80",
  "geography": "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
  "earth": "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80",
  "globe": "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
  "map": "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
  "nature": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
  "plants": "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=800&q=80",
  "animals": "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=80",
  "space": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "star": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "planet": "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80",
  "solar": "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=800&q=80",
  
  // Language & Literature
  "language": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
  "english": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
  "kyrgyz": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
  "book": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80",
  "books": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
  "reading": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80",
  "library": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
  
  // Creative / Art / Music
  "art": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
  "creative": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
  "paint": "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
  "music": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
  "song": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
  
  // Computer / Informatics / Tech
  "computer": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
  "coding": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
  "informatics": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
  "tech": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  "technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  "digital": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  
  // Sports & Physical Ed
  "sports": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
  "gym": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
  "health": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
  "exercise": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
  
  // Kyrgyz/Russian Key matches
  "мектеп": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
  "класс": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80",
  "сабак": "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80",
  "китеп": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80",
  "тарых": "https://images.unsplash.com/photo-1447069387593-a5de0862481e?auto=format&fit=crop&w=800&q=80",
  "биология": "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80",
  "география": "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
  "жаратылыш": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
  "космос": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  "физика": "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80",
  "химия": "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&w=800&q=80",
  "спорт": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
  "рахмат": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
};

const t = (key: string, lang: string) => {
  const dict: Record<string, Record<string, string>> = {
    slide: {
      ky: "Слайд",
      ru: "Слайд",
      en: "Slide"
    },
    slides_parsing: {
      ky: "Слайддар талданууда...",
      ru: "Идет разбор слайдов...",
      en: "Parsing slides..."
    },
    design_theme: {
      ky: "Дизайн темасы:",
      ru: "Тема дизайна:",
      en: "Design Theme:"
    },
    copy_plan: {
      ky: "Планды көчүрүү",
      ru: "Копировать план",
      en: "Copy Plan"
    },
    copied: {
      ky: "Көчүрүлдү",
      ru: "Скопировано",
      en: "Copied"
    },
    download_html: {
      ky: "HTML слайд жүктөп алуу",
      ru: "Скачать слайды HTML",
      en: "Download HTML Slides"
    },
    present_fullscreen: {
      ky: "Көрсөтүү (Толук экран)",
      ru: "Показ (Полный экран)",
      en: "Present (Fullscreen)"
    },
    edit_slide: {
      ky: "Слайдды оңдоо / өзгөртүү",
      ru: "Редактировать слайд",
      en: "Edit Slide"
    },
    view_mode: {
      ky: "Кароо режими",
      ru: "Режим просмотра",
      en: "View Mode"
    },
    subject: {
      ky: "Предмет:",
      ru: "Предмет:",
      en: "Subject:"
    },
    topic: {
      ky: "Тема:",
      ru: "Тема:",
      en: "Topic:"
    },
    visual_suggestion: {
      ky: "Визуалдык дизайн сунушу:",
      ru: "Рекомендация по дизайну:",
      en: "Visual Design Suggestion:"
    },
    prev: {
      ky: "Мурунку",
      ru: "Назад",
      en: "Previous"
    },
    next: {
      ky: "Кийинки",
      ru: "Далее",
      en: "Next"
    },
    custom_url: {
      ky: "Өздүк URL",
      ru: "Свой URL",
      en: "Custom URL"
    },
    image: {
      ky: "Сүрөт",
      ru: "Изображение",
      en: "Image"
    },
    editor_title_label: {
      ky: "Слайддын темасы:",
      ru: "Тема слайда:",
      en: "Slide Title:"
    },
    editor_bullets_label: {
      ky: "Тезистер (Тизмек):",
      ru: "Тезисы (Список):",
      en: "Bullets (List):"
    },
    editor_add_bullet: {
      ky: "Жаңы тезис кошуу",
      ru: "Добавить тезис",
      en: "Add Bullet Point"
    },
    editor_image_label: {
      ky: "Сүрөттү алмаштыруу:",
      ru: "Замена картинки:",
      en: "Replace Image:"
    },
    editor_keyword_label: {
      ky: "Ачкыч сөз (англисче же кыргызча):",
      ru: "Ключевое слово (eng/kyr):",
      en: "Keyword (eng/kyr):"
    },
    editor_keyword_placeholder: {
      ky: "Мисалы: space, book, classroom...",
      ru: "Например: space, book, classroom...",
      en: "Example: space, book, classroom..."
    },
    editor_suggest_label: {
      ky: "Ыкчам тандап коюу:",
      ru: "Быстрый выбор:",
      en: "Quick Selection:"
    },
    editor_search_tab: {
      ky: "Издөө сөзү",
      ru: "Ключевое слово",
      en: "Search Word"
    },
    editor_url_tab: {
      ky: "Шилтеме коюу (URL)",
      ru: "Ссылка (URL)",
      en: "Insert Link (URL)"
    },
    editor_url_label: {
      ky: "Сүрөттүн толук интернет шилтемеси (URL):",
      ru: "Полная ссылка на картинку (URL):",
      en: "Full image URL:"
    },
    editor_url_placeholder: {
      ky: "https://images.unsplash.com/... же башка сүрөт шилтемеси",
      ru: "https://images.unsplash.com/... или другая ссылка",
      en: "https://images.unsplash.com/... or other URL"
    },
    editor_url_help: {
      ky: "Каалаган сүрөт шилтемесин бул жерге койсоңуз болот. Ал слайдда дароо көрсөтүлөт.",
      ru: "Сюда можно вставить любую ссылку на изображение. Оно сразу отобразится на слайде.",
      en: "You can paste any image URL here. It will immediately show on the slide."
    },
    editor_design_label: {
      ky: "Дизайн кеңеши:",
      ru: "Совет по дизайну:",
      en: "Design Advice:"
    },
    editor_design_placeholder: {
      ky: "Слайддын дизайны боюнча кошумча кеңеш...",
      ru: "Дополнительный совет по оформлению слайда...",
      en: "Additional advice on slide design..."
    },
    editor_add_slide: {
      ky: "Кошуу",
      ru: "Добавить",
      en: "Add"
    },
    editor_delete_slide: {
      ky: "Өчүрүү",
      ru: "Удалить",
      en: "Delete"
    },
    editor_move_up: {
      ky: "Солго",
      ru: "Влево",
      en: "Left"
    },
    editor_move_down: {
      ky: "Оңго",
      ru: "Вправо",
      en: "Right"
    },
    theme_royal_blue: {
      ky: "Классикалык Көк",
      ru: "Классический Синий",
      en: "Classic Blue"
    },
    theme_emerald_nature: {
      ky: "Жаратылыш Жашыл",
      ru: "Природный Зеленый",
      en: "Natural Green"
    },
    theme_sunset_warm: {
      ky: "Жылуу Күн Батыш",
      ru: "Теплый Закат",
      en: "Warm Sunset"
    },
    theme_cosmic_dark: {
      ky: "Космостук Кара",
      ru: "Космический Темный",
      en: "Cosmic Dark"
    },
    presentation_label: {
      ky: "Презентация",
      ru: "Презентация",
      en: "Presentation"
    },
    total_slides: {
      ky: "Жалпы:",
      ru: "Всего:",
      en: "Total:"
    },
    edit_mode_title: {
      ky: "оңдоо",
      ru: "редактирование",
      en: "editing"
    },
    bullet_placeholder: {
      ky: "Тезис жазыңыз...",
      ru: "Введите тезис...",
      en: "Enter bullet point..."
    },
    title_placeholder: {
      ky: "Теманы жазыңыз...",
      ru: "Введите тему...",
      en: "Enter title..."
    },
    fullscreen_close: {
      ky: "Кайтуу (Esc)",
      ru: "Назад (Esc)",
      en: "Close (Esc)"
    }
  };
  return dict[key]?.[lang] || dict[key]?.ky || key;
};

export const SlideshowViewer: React.FC<SlideshowViewerProps> = ({ rawMarkdown, topic, subject }) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedThemeId, setSelectedThemeId] = useState("royal_blue");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const lang = (localStorage.getItem("lang") as "ky" | "ru" | "en") || "ky";

  // Parse Raw Markdown into Structured Slides
  useEffect(() => {
    if (!rawMarkdown) return;

    const parsedSlides: Slide[] = [];
    const sections = rawMarkdown.split(/(?=###?\s*Слайд|Слайд\s*\d+:)/i);

    for (const sec of sections) {
      if (!sec.trim()) continue;

      // Extract Slide Number and Header
      const slideMatch = sec.match(/(?:###?\s*)?Слайд\s*(\d+)[:.]?\s*(.*)/i);
      if (slideMatch) {
        const num = parseInt(slideMatch[1], 10);
        const headerRaw = slideMatch[2] ? slideMatch[2].trim() : "";

        // Extract Title
        let title = "";
        const titleMatch = sec.match(/(?:-\s*\*\*Аталышы:\*\*\s*|\*\*Аталышы:\*\*\s*)(.*)/i);
        if (titleMatch) {
          title = titleMatch[1].replace(/^\s*["'“«]|["'”»]\s*$/g, "").trim();
        } else {
          title = headerRaw.replace(/^\s*[-:]\s*/, "").trim();
        }

        // Extract Bullets
        const bullets: string[] = [];
        const lines = sec.split("\n");
        let isCollectingBullets = false;

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.includes("**Аталышы:**") || trimmed.includes("Аталышы:")) continue;
          if (trimmed.includes("**Визуалдык дизайн") || trimmed.includes("Визуалдык дизайн")) continue;

          if (trimmed.includes("**Тезистер:**") || trimmed.includes("Тезистер:")) {
            isCollectingBullets = true;
            continue;
          }

          const bulletMatch = trimmed.match(/^[-*+]\s+(.*)/);
          if (bulletMatch) {
            const bulletContent = bulletMatch[1].trim();
            if (bulletContent) {
              bullets.push(bulletContent.replace(/^\*\*(.*?)\*\*/, "$1"));
            }
          }
        }

        // Extract Image Keyword
        let imageKeyword = "";
        const imageMatch = sec.match(/(?:-\s*\*\*Сүрөт үчүн англисче ачкыч сөз:\*\*\s*|\*\*Сүрөт үчүн англисче ачкыч сөз:\*\*\s*)(.*)/i);
        if (imageMatch) {
          imageKeyword = imageMatch[1].replace(/^\s*["'“«]|["'”»]\s*$/g, "").trim();
        } else {
          const alternativeImageMatch = sec.match(/ачкыч сөз:\s*(.*)/i);
          if (alternativeImageMatch) {
            imageKeyword = alternativeImageMatch[1].replace(/^\s*["'“«]|["'”»]\s*$/g, "").trim();
          }
        }

        // Extract Design Note
        let designNote = "";
        const designMatch = sec.match(/(?:-\s*\*\*Визуалдык дизайн[^:]*:\*\*\s*|\*\*Визуалдык дизайн[^:]*:\*\*\s*)(.*)/i);
        if (designMatch) {
          designNote = designMatch[1].trim();
        } else {
          // Fallback check for design advice inside section
          const alternativeDesignMatch = sec.match(/дизайн боюнча сунуш:\s*(.*)/i);
          if (alternativeDesignMatch) {
            designNote = alternativeDesignMatch[1].trim();
          }
        }

        parsedSlides.push({
          number: num || parsedSlides.length + 1,
          title: title || headerRaw || `Слайд ${num}`,
          bullets: bullets.length > 0 ? bullets : ["Презентация маалыматтары"],
          designNote: designNote || undefined,
          imageKeyword: imageKeyword || undefined
        });
      }
    }

    // Fallback if split failed or parsed nothing
    if (parsedSlides.length === 0) {
      // Create reasonable default slides from text
      const lines = rawMarkdown.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      let textBullets = lines.filter(l => l.startsWith("-")).map(l => l.replace(/^[-*\s]+/, ""));
      if (textBullets.length === 0) {
        textBullets = [rawMarkdown.slice(0, 100) + "..."];
      }

      // Chunk bullets to simulate 3 slides
      const chunkSize = Math.max(2, Math.ceil(textBullets.length / 3));
      const fallbackKeywords = ["classroom", "study", "thank you"];
      for (let i = 0; i < 3; i++) {
        const chunk = textBullets.slice(i * chunkSize, (i + 1) * chunkSize);
        if (chunk.length > 0) {
          parsedSlides.push({
            number: i + 1,
            title: i === 0 ? `Киришүү: ${topic}` : `Мазмуну ${i + 1}: ${subject}`,
            bullets: chunk,
            designNote: "Класстык теманы кооздоп көрсөтүү сунушталат.",
            imageKeyword: fallbackKeywords[i] || "classroom"
          });
        }
      }
    }

    setSlides(parsedSlides);
    setCurrentIndex(0);
  }, [rawMarkdown, topic, subject]);

  const updateActiveSlideField = (field: keyof Slide, value: any) => {
    setSlides(prev => prev.map((slide, idx) => {
      if (idx === currentIndex) {
        return { ...slide, [field]: value };
      }
      return slide;
    }));
  };

  const updateSlideBullet = (bulletIdx: number, value: string) => {
    setSlides(prev => prev.map((slide, idx) => {
      if (idx === currentIndex) {
        const updatedBullets = [...slide.bullets];
        updatedBullets[bulletIdx] = value;
        return { ...slide, bullets: updatedBullets };
      }
      return slide;
    }));
  };

  const deleteSlideBullet = (bulletIdx: number) => {
    setSlides(prev => prev.map((slide, idx) => {
      if (idx === currentIndex) {
        const updatedBullets = slide.bullets.filter((_, bIdx) => bIdx !== bulletIdx);
        return { ...slide, bullets: updatedBullets.length > 0 ? updatedBullets : [""] };
      }
      return slide;
    }));
  };

  const addSlideBullet = () => {
    setSlides(prev => prev.map((slide, idx) => {
      if (idx === currentIndex) {
        return { ...slide, bullets: [...slide.bullets, "Жаңы тезис..."] };
      }
      return slide;
    }));
  };

  const addNewSlide = () => {
    const newSlide: Slide = {
      number: slides.length + 1,
      title: "Жаңы слайддын аталышы",
      bullets: ["Жаңы маанилүү тезис"],
      designNote: "Бул слайд үчүн дизайн сунушу...",
      imageKeyword: "classroom"
    };
    
    const updatedSlides = [...slides];
    updatedSlides.splice(currentIndex + 1, 0, newSlide);
    
    const renumberedSlides = updatedSlides.map((slide, idx) => ({
      ...slide,
      number: idx + 1
    }));
    
    setSlides(renumberedSlides);
    setCurrentIndex(currentIndex + 1);
  };

  const deleteCurrentSlide = () => {
    if (slides.length <= 1) return;
    
    const updatedSlides = slides.filter((_, idx) => idx !== currentIndex);
    const renumberedSlides = updatedSlides.map((slide, idx) => ({
      ...slide,
      number: idx + 1
    }));
    
    setSlides(renumberedSlides);
    if (currentIndex >= renumberedSlides.length) {
      setCurrentIndex(renumberedSlides.length - 1);
    }
  };

  const moveSlideUp = () => {
    if (currentIndex === 0) return;
    const updatedSlides = [...slides];
    const temp = updatedSlides[currentIndex];
    updatedSlides[currentIndex] = updatedSlides[currentIndex - 1];
    updatedSlides[currentIndex - 1] = temp;
    
    const renumberedSlides = updatedSlides.map((slide, idx) => ({
      ...slide,
      number: idx + 1
    }));
    
    setSlides(renumberedSlides);
    setCurrentIndex(currentIndex - 1);
  };

  const moveSlideDown = () => {
    if (currentIndex === slides.length - 1) return;
    const updatedSlides = [...slides];
    const temp = updatedSlides[currentIndex];
    updatedSlides[currentIndex] = updatedSlides[currentIndex + 1];
    updatedSlides[currentIndex + 1] = temp;
    
    const renumberedSlides = updatedSlides.map((slide, idx) => ({
      ...slide,
      number: idx + 1
    }));
    
    setSlides(renumberedSlides);
    setCurrentIndex(currentIndex + 1);
  };

  const activeTheme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, slides.length, isFullscreen]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(rawMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to get beautiful context-sensitive decorative icon
  const getDecorativeIcon = (slideIndex: number) => {
    const iconClass = "h-10 w-10 text-slate-400 opacity-20 absolute top-6 right-6 pointer-events-none";
    if (slideIndex === 0) return <GraduationCap className={iconClass} />;
    if (slideIndex === slides.length - 1) return <Star className={iconClass} />;
    
    const icons = [
      <Sparkles key="sparkle" className={iconClass} />,
      <Lightbulb key="light" className={iconClass} />,
      <BookOpen key="book" className={iconClass} />,
      <Presentation key="pres" className={iconClass} />
    ];
    return icons[slideIndex % icons.length];
  };

  const getSlideImageUrl = (slide: Slide, index: number) => {
    if (slide.customImageUrl && slide.customImageUrl.trim().startsWith("http")) {
      return slide.customImageUrl.trim();
    }
    const rawKeyword = (slide.imageKeyword || "").toLowerCase().trim();
    const rawTopic = (topic || "").toLowerCase().trim();
    const rawSubject = (subject || "").toLowerCase().trim();

    // Helper to find a matching photo in EDUCATIONAL_IMAGES
    const findImage = (term: string): string | null => {
      if (!term) return null;
      if (EDUCATIONAL_IMAGES[term]) return EDUCATIONAL_IMAGES[term];
      
      // Look for any key that is contained in or contains the search term
      const keys = Object.keys(EDUCATIONAL_IMAGES);
      for (const key of keys) {
        if (term.includes(key) || key.includes(term)) {
          return EDUCATIONAL_IMAGES[key];
        }
      }
      return null;
    };

    let url = findImage(rawKeyword) || findImage(rawTopic) || findImage(rawSubject);

    if (!url) {
      // Beautiful educational slide index-based fallback images (pre-cached Unsplash URLs that work perfectly)
      const fallbackUrls = [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80", // welcome / intro
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80", // study / books
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80", // practice / writing
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80", // workspace / desk
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", // facts / stats
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80", // classroom
      ];
      url = fallbackUrls[index % fallbackUrls.length];
    }

    return url;
  };

  // Export Full Interactive HTML Presentation
  const exportHTMLPresentation = () => {
    const slideItemsHTML = slides.map((slide, idx) => `
      <div class="slide ${idx === 0 ? 'active' : ''}" id="slide-${idx}">
        <div class="slide-header">Слайд ${slide.number} жетишкендик (Тексттерди басып, каалагандай оңдоңуз)</div>
        <div class="slide-content-grid">
          <div class="slide-text-side">
            <div class="slide-title" contenteditable="true" title="Өзгөртүү үчүн бул жерди басыңыз">${slide.title}</div>
            <ul class="slide-bullets">
              ${slide.bullets.map(b => `<li contenteditable="true" title="Өзгөртүү үчүн бул жерди басыңыз">${b}</li>`).join("")}
            </ul>
          </div>
          <div class="slide-image-side">
            <div class="slide-image-container" onclick="changeImageSrc(this.querySelector('img'))" title="Сүрөттү алмаштыруу үчүн басыңыз">
              <img src="${getSlideImageUrl(slide, idx)}" class="slide-image" alt="${slide.title}" referrerpolicy="no-referrer" />
              <div class="slide-img-tag">📷 Сүрөттү алмаштыруу</div>
            </div>
          </div>
        </div>
        ${slide.designNote ? `<div class="slide-note">💡 <strong>Сунушталган дизайн:</strong> <span contenteditable="true">${slide.designNote}</span></div>` : ""}
      </div>
    `).join("");

    const indicatorsHTML = slides.map((_, idx) => `
      <div class="dot ${idx === 0 ? 'active' : ''}" onclick="goToSlide(${idx})" id="dot-${idx}"></div>
    `).join("");

    const allThemeColors = {
      royal_blue: {
        bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        text: "#ffffff",
        title: "#ffffff",
        accent: "#6366f1",
        bulletBg: "rgba(99, 102, 241, 0.2)",
        bulletText: "#e2e8f0",
        noteBg: "rgba(30, 27, 75, 0.4)",
        noteBorder: "rgba(99, 102, 241, 0.3)"
      },
      emerald_nature: {
        bg: "linear-gradient(135deg, #022c22 0%, #042f2e 50%, #020617 100%)",
        text: "#f0fdf4",
        title: "#f0fdf4",
        accent: "#10b981",
        bulletBg: "rgba(16, 185, 129, 0.2)",
        bulletText: "#f0fdf4",
        noteBg: "rgba(2, 44, 34, 0.4)",
        noteBorder: "rgba(16, 185, 129, 0.3)"
      },
      sunset_warm: {
        bg: "linear-gradient(135deg, #fef3c7 0%, #ffedd5 50%, #fef9c3 100%)",
        text: "#1e293b",
        title: "#0f172a",
        accent: "#f97316",
        bulletBg: "#ffedd5",
        bulletText: "#334155",
        noteBg: "#fffbeb",
        noteBorder: "#fed7aa"
      },
      cosmic_dark: {
        bg: "linear-gradient(135deg, #030712 0%, #3b0764 50%, #030712 100%)",
        text: "#fbfbfe",
        title: "#ffffff",
        accent: "#a855f7",
        bulletBg: "rgba(168, 85, 247, 0.2)",
        bulletText: "#f3e8ff",
        noteBg: "rgba(59, 7, 100, 0.4)",
        noteBorder: "rgba(168, 85, 247, 0.3)"
      }
    };

    const themeColors = allThemeColors[selectedThemeId as keyof typeof allThemeColors] || allThemeColors.royal_blue;

    const htmlContent = `<!DOCTYPE html>
<html lang="ky">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Презентация: ${topic}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: ${themeColors.bg};
            color: ${themeColors.text};
            font-family: system-ui, -apple-system, sans-serif;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }
        .container {
            width: 85%;
            max-width: 1000px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 48px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            position: relative;
            min-height: 480px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .slide {
            display: none;
            opacity: 0;
            transition: opacity 0.4s ease-in-out;
        }
        .slide.active {
            display: block;
            opacity: 1;
        }
        .slide-content-grid {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 32px;
            align-items: center;
            margin-bottom: 24px;
        }
        @media (max-width: 768px) {
            .slide-content-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
        }
        .slide-text-side {
            display: flex;
            flex-direction: column;
        }
        .slide-image-side {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .slide-image-container {
            position: relative;
            width: 100%;
            aspect-ratio: 4/3;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .slide-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .slide-img-tag {
            position: absolute;
            bottom: 12px;
            right: 12px;
            background: rgba(0,0,0,0.65);
            color: #ffffff;
            font-size: 0.75rem;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
            text-transform: uppercase;
        }
        .slide-header {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            color: ${themeColors.accent};
            font-weight: 700;
            margin-bottom: 12px;
        }
        .slide-title {
            font-size: 2rem;
            font-weight: 800;
            color: ${themeColors.title};
            margin-bottom: 24px;
            line-height: 1.25;
        }
        .slide-bullets {
            list-style: none;
            padding: 0;
            margin: 0 0 32px 0;
        }
        .slide-bullets li {
            font-size: 1.15rem;
            margin-bottom: 14px;
            padding-left: 28px;
            position: relative;
            line-height: 1.5;
        }
        .slide-bullets li::before {
            content: "";
            position: absolute;
            left: 0;
            top: 10px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${themeColors.accent};
        }
        .slide-note {
            background: ${themeColors.noteBg};
            border-left: 4px solid ${themeColors.accent};
            padding: 16px;
            border-radius: 8px;
            font-size: 0.9rem;
            margin-top: auto;
            color: opacity(0.8);
        }
        .controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 32px;
            width: 85%;
            max-width: 900px;
        }
        .nav-btn {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: ${themeColors.title};
            padding: 12px 24px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.2s;
        }
        .nav-btn:hover {
            background: ${themeColors.accent};
            color: white;
        }
        .nav-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            background: rgba(255, 255, 255, 0.05);
        }
        .progress {
            display: flex;
            gap: 8px;
        }
        .dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            cursor: pointer;
            transition: all 0.2s;
        }
        .dot.active {
            background: ${themeColors.accent};
            transform: scale(1.2);
        }
        .instruction {
            position: absolute;
            bottom: 20px;
            font-size: 0.8rem;
            opacity: 0.4;
            letter-spacing: 0.05em;
        }
    </style>
</head>
<body>

    <div class="container">
        <div id="slides-container">
            ${slideItemsHTML}
        </div>
    </div>

    <div class="controls">
        <button class="nav-btn" id="prev-btn" onclick="prevSlide()" disabled>Мурунку</button>
        <div class="progress">
            ${indicatorsHTML}
        </div>
        <button class="nav-btn" id="next-btn" onclick="nextSlide()">Кийинки</button>
    </div>

    <div class="instruction">Багыт баскычтарын (← же →) же Боштук (Space) баскычын колдонуңуз</div>

    <script>
        let currentSlide = 0;
        const totalSlides = ${slides.length};

        function updateSlide() {
            // Update Active Slide
            for (let i = 0; i < totalSlides; i++) {
                const s = document.getElementById('slide-' + i);
                const d = document.getElementById('dot-' + i);
                if (i === currentSlide) {
                    s.classList.add('active');
                    d.classList.add('active');
                } else {
                    s.classList.remove('active');
                    d.classList.remove('active');
                }
            }

            // Update Buttons State
            document.getElementById('prev-btn').disabled = currentSlide === 0;
            document.getElementById('next-btn').disabled = currentSlide === totalSlides - 1;
        }

        function nextSlide() {
            if (currentSlide < totalSlides - 1) {
                currentSlide++;
                updateSlide();
            }
        }

        function prevSlide() {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlide();
            }
        }

        function goToSlide(idx) {
            currentSlide = idx;
            updateSlide();
        }

        function changeImageSrc(imgElement) {
            if (!imgElement) return;
            const newUrl = prompt("Бул слайд үчүн жаңы сүрөттүн интернеттеги шилтемесин (URL) жазыңыз:", imgElement.src);
            if (newUrl && newUrl.trim() !== "") {
                imgElement.src = newUrl.trim();
            }
        }

        document.addEventListener('keydown', function(e) {
            if (e.target.hasAttribute('contenteditable')) {
                // Ignore hotkeys when editing text content directly
                return;
            }
            if (e.key === 'ArrowRight' || e.key === ' ') {
                nextSlide();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
            }
        });
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${topic.replace(/\s+/g, "_")}_презентация.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (slides.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t("slides_parsing", lang)}
      </div>
    );
  }

  const activeSlide = slides[currentIndex];

  return (
    <div className="space-y-6">
      {/* Upper Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        {/* Theme Picker */}
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">{t("design_theme", lang)}</span>
          <div className="flex flex-wrap gap-1.5">
            {THEMES.map(tItem => (
              <button
                key={tItem.id}
                onClick={() => setSelectedThemeId(tItem.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition border ${
                  selectedThemeId === tItem.id 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {t(`theme_${tItem.id}`, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyMarkdown}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? t("copied", lang) : t("copy_plan", lang)}
          </button>
          
          <button
            onClick={exportHTMLPresentation}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            {t("download_html", lang)}
          </button>

          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <MonitorPlay className="h-3.5 w-3.5" />
            {t("present_fullscreen", lang)}
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm border ${
              isEditing
                ? "bg-amber-500 hover:bg-amber-600 border-amber-500 text-white animate-pulse"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Edit className="h-3.5 w-3.5" />
            {isEditing ? t("view_mode", lang) : t("edit_slide", lang)}
          </button>
        </div>
      </div>

      {/* Grid Layout for Play and Edit Mode */}
      <div className={`grid grid-cols-1 ${isEditing ? "lg:grid-cols-12" : ""} gap-6 items-start`}>
        {/* Slide Viewer Column */}
        <div className={`${isEditing ? "lg:col-span-7" : ""} space-y-6`}>
          {/* Main Slideshow Player Area */}
          <div 
            ref={containerRef}
            className={`relative flex flex-col justify-between rounded-3xl border shadow-xl p-8 min-h-[460px] transition duration-500 overflow-hidden ${
              activeTheme.class
            }`}
          >
            {/* Watermark / Context decorations */}
            {getDecorativeIcon(currentIndex)}

            {/* Top Header of the slide */}
            <div className="flex items-center justify-between mb-6 z-10 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full border ${activeTheme.badgeColor}`}>
                  {subject || t("presentation_label", lang)}
                </span>
                <span className="text-xs opacity-60 font-mono">
                  {t("topic", lang)} {topic}
                </span>
              </div>
              <span className="text-sm font-bold opacity-85 font-mono">
                {currentIndex + 1} / {slides.length}
              </span>
            </div>

            {/* Slide Body */}
            <div className="flex-1 flex flex-col justify-center py-4 z-10 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
                >
                  {/* Text side */}
                  <div className="md:col-span-7 space-y-6">
                    {/* Slide Title */}
                    <h3 className={`text-2xl md:text-3.5xl font-extrabold leading-tight ${activeTheme.titleColor}`}>
                      {activeSlide.title}
                    </h3>

                    {/* Bullet Points */}
                    <ul className="space-y-3.5 pl-1">
                      {activeSlide.bullets.map((bullet, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1, duration: 0.3 }}
                          className="flex items-start gap-3.5 text-base md:text-lg leading-relaxed"
                        >
                          <span className={`h-6 w-6 mt-0.5 flex-shrink-0 flex items-center justify-center rounded-full text-xs font-bold ${activeTheme.bulletColor}`}>
                            {idx + 1}
                          </span>
                          <span className="opacity-95 select-text">{bullet}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Image side */}
                  <div className="md:col-span-5 flex justify-center">
                    <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-lg border border-white/10 group bg-slate-800/35">
                      <img
                        src={getSlideImageUrl(activeSlide, currentIndex)}
                        alt={activeSlide.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
                      <span className="absolute bottom-3 right-3 text-[10px] uppercase tracking-wider bg-black/50 text-white/80 px-2.5 py-0.5 rounded backdrop-blur-xs font-mono">
                        {activeSlide.customImageUrl ? t("custom_url", lang) : (activeSlide.imageKeyword || t("image", lang))}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide Footer / Visual suggestion or advice */}
            {activeSlide.designNote && (
              <div className={`mt-6 p-4 rounded-xl border z-10 text-xs leading-relaxed flex items-start gap-2 ${activeTheme.noteBg}`}>
                <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold">{t("visual_suggestion", lang)}</span> {activeSlide.designNote}
                </div>
              </div>
            )}
          </div>

          {/* Slideshow Player Navigation Controllers */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed font-semibold rounded-xl text-sm transition flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("prev", lang)}
            </button>

            {/* Progress circles indicators */}
            <div className="hidden sm:flex items-center gap-2 overflow-x-auto max-w-[200px] md:max-w-xs scrollbar-none py-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300 ${
                    currentIndex === idx 
                      ? "bg-indigo-600 scale-125 shadow-sm" 
                      : "bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700"
                  }`}
                  title={`${t("slide", lang)} ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === slides.length - 1}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed font-semibold rounded-xl text-sm transition flex items-center gap-2"
            >
              {t("next", lang)}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Slide Editor Panel (Active Slide Editing Side) */}
        {isEditing && (
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 h-fit z-10 sticky top-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {t("slide", lang)} {currentIndex + 1} ({t("edit_mode_title", lang)})
                </h4>
              </div>
              <span className="text-xs bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md font-mono font-bold">
                {t("total_slides", lang)} {slides.length}
              </span>
            </div>

            {/* Slide Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t("editor_title_label", lang)}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition dark:text-slate-100"
                value={activeSlide.title}
                onChange={(e) => updateActiveSlideField("title", e.target.value)}
                placeholder={t("title_placeholder", lang)}
              />
            </div>

            {/* Slide Bullets */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t("editor_bullets_label", lang)}
              </label>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {activeSlide.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-400 w-5 text-right">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none dark:text-slate-100"
                      value={bullet}
                      onChange={(e) => updateSlideBullet(idx, e.target.value)}
                      placeholder={t("bullet_placeholder", lang)}
                    />
                    <button
                      onClick={() => deleteSlideBullet(idx)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title={lang === "en" ? "Delete bullet" : lang === "ru" ? "Удалить тезис" : "Тезисти өчүрүү"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addSlideBullet}
                className="w-full py-1.5 border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("editor_add_bullet", lang)}
              </button>
            </div>

            {/* Image Manager */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t("editor_image_label", lang)}
              </label>
              
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => {
                    updateActiveSlideField("customImageUrl", undefined);
                  }}
                  className={`py-1 text-xs font-medium rounded-lg transition ${
                    !activeSlide.customImageUrl
                      ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {t("editor_search_tab", lang)}
                </button>
                <button
                  onClick={() => {
                    if (!activeSlide.customImageUrl) {
                      updateActiveSlideField("customImageUrl", getSlideImageUrl(activeSlide, currentIndex));
                    }
                  }}
                  className={`py-1 text-xs font-medium rounded-lg transition ${
                    activeSlide.customImageUrl
                      ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                      : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {t("editor_url_tab", lang)}
                </button>
              </div>

              {activeSlide.customImageUrl ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Link className="h-3 w-3" />
                    <span>{t("editor_url_label", lang)}</span>
                  </div>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                    value={activeSlide.customImageUrl}
                    onChange={(e) => updateActiveSlideField("customImageUrl", e.target.value)}
                    placeholder={t("editor_url_placeholder", lang)}
                  />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    {t("editor_url_help", lang)}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Image className="h-3.5 w-3.5" />
                    <span>{t("editor_keyword_label", lang)}</span>
                  </div>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 dark:text-slate-100"
                    value={activeSlide.imageKeyword || ""}
                    onChange={(e) => updateActiveSlideField("imageKeyword", e.target.value)}
                    placeholder={t("editor_keyword_placeholder", lang)}
                  />
                  
                  {/* Suggest keywords quick selection */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{t("editor_suggest_label", lang)}</span>
                    <div className="flex flex-wrap gap-1 max-h-[75px] overflow-y-auto pr-1 scrollbar-thin">
                      {Object.keys(EDUCATIONAL_IMAGES).slice(0, 20).map(kw => (
                        <button
                          key={kw}
                          onClick={() => {
                            updateActiveSlideField("imageKeyword", kw);
                            updateActiveSlideField("customImageUrl", undefined);
                          }}
                          className={`px-1.5 py-0.5 text-[10px] font-medium rounded border transition ${
                            activeSlide.imageKeyword === kw
                              ? "bg-indigo-600 border-indigo-200 text-white dark:bg-indigo-950/40 dark:border-indigo-900"
                              : "bg-white dark:bg-slate-850 border-slate-150 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Design Note */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t("editor_design_label", lang)}
              </label>
              <textarea
                className="w-full h-12 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none resize-none dark:text-slate-100"
                value={activeSlide.designNote || ""}
                onChange={(e) => updateActiveSlideField("designNote", e.target.value)}
                placeholder={t("editor_design_placeholder", lang)}
              />
            </div>

            {/* Slide Navigation and Modification */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex gap-1">
                <button
                  onClick={moveSlideUp}
                  disabled={currentIndex === 0}
                  className="flex-1 py-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1"
                  title={lang === "en" ? "Move slide left" : lang === "ru" ? "Переместить слайд влево" : "Слайдды солго жылдыруу"}
                >
                  <ChevronUp className="h-3.5 w-3.5 -rotate-90" />
                  {t("editor_move_up", lang)}
                </button>
                <button
                  onClick={moveSlideDown}
                  disabled={currentIndex === slides.length - 1}
                  className="flex-1 py-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1"
                  title={lang === "en" ? "Move slide right" : lang === "ru" ? "Переместить слайд вправо" : "Слайдды оңго жылдыруу"}
                >
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                  {t("editor_move_down", lang)}
                </button>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={addNewSlide}
                  className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t("editor_add_slide", lang)}
                </button>
                <button
                  onClick={deleteCurrentSlide}
                  disabled={slides.length <= 1}
                  className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("editor_delete_slide", lang)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN MODE PRESENTATION MODAL */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-9999 flex flex-col justify-between p-12 transition-all duration-500 select-none ${
              activeTheme.class
            }`}
          >
            {/* Fullscreen Close/Back bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 z-50">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm font-semibold uppercase tracking-widest rounded-full border ${activeTheme.badgeColor}`}>
                  {subject || t("presentation_label", lang)}
                </span>
                <span className="text-sm opacity-60">{t("topic", lang)} {topic}</span>
              </div>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition flex items-center gap-1.5"
                title={lang === "en" ? "Close fullscreen" : lang === "ru" ? "Выйти из полноэкранного режима" : "Толук экрандан чыгуу"}
              >
                <Minimize2 className="h-5 w-5" />
                <span className="text-xs font-semibold pr-1">{t("fullscreen_close", lang)}</span>
              </button>
            </div>

            {/* Huge Fullscreen Slide body */}
            <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto py-12 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
                >
                  <div className="lg:col-span-7 space-y-10">
                    <h2 className={`text-4xl md:text-5.5xl font-extrabold leading-tight tracking-tight ${activeTheme.titleColor}`}>
                      {activeSlide.title}
                    </h2>

                    <ul className="space-y-6">
                      {activeSlide.bullets.map((bullet, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.12, duration: 0.35 }}
                          className="flex items-start gap-5 text-xl md:text-2.5xl leading-relaxed"
                        >
                          <span className={`h-8 w-8 mt-1 flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold ${activeTheme.bulletColor}`}>
                            {idx + 1}
                          </span>
                          <span className="opacity-95 select-text">{bullet}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="lg:col-span-5 flex justify-center">
                    <div className="w-full aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative group bg-white/5">
                      <img
                        src={getSlideImageUrl(activeSlide, currentIndex)}
                        alt={activeSlide.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                      {activeSlide.imageKeyword && (
                        <span className="absolute bottom-4 right-4 text-xs font-semibold tracking-wider bg-black/65 text-white/90 px-3 py-1 rounded-full backdrop-blur-sm font-mono uppercase">
                          {activeSlide.customImageUrl ? t("custom_url", lang) : (activeSlide.imageKeyword || t("image", lang))}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Fullscreen Controls */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 z-50">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white font-semibold rounded-2xl transition flex items-center gap-2"
              >
                <ArrowLeft className="h-5 w-5" />
                {t("prev", lang)}
              </button>

              <div className="flex items-center gap-3">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                      currentIndex === idx 
                        ? "bg-white scale-125 shadow-md" 
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
                <span className="text-sm font-bold opacity-80 font-mono pl-3">
                  {currentIndex + 1} / {slides.length}
                </span>
              </div>

              <button
                onClick={handleNext}
                disabled={currentIndex === slides.length - 1}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-20 text-white font-semibold rounded-2xl transition flex items-center gap-2"
              >
                {t("next", lang)}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
