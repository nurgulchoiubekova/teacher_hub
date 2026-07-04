import React, { useState, useEffect, useRef } from "react";
import { 
  Search, BookOpen, GraduationCap, ArrowRight, Star, Download, 
  Eye, Share2, Heart, MessageSquare, Printer, ChevronRight, 
  Send, User as UserIcon, LogIn, LogOut, Sun, Moon, Sparkles, 
  Trash2, Edit, AlertCircle, CheckCircle, Smartphone, Globe, 
  Mail, ExternalLink, HelpCircle, FileText, Play, Users, Settings, 
  FileCheck, ShieldAlert, ArrowLeft, RefreshCw, Paperclip, X, Menu
} from "lucide-react";
import { Material, Comment, User, Reply } from "./types";
import { SUBJECTS, CLASSES, FAQ_ITEMS } from "./utils/constants";
import { TRANSLATIONS } from "./utils/translations";
import ToolsContainer from "./components/ToolsContainer";
import AdminPanel from "./components/AdminPanel";
import TeacherDashboard from "./components/TeacherDashboard";
import { InteractiveGame } from "./components/InteractiveGame";
import { SubscriptionView } from "./components/SubscriptionView";

export default function App() {
  // Theme State (Read from localStorage or default to false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      return saved === "dark";
    }
    return false;
  });

  // Language State (Read from localStorage or default to "ky")
  const [lang, setLang] = useState<"ky" | "ru" | "en">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lang");
      if (saved === "ky" || saved === "ru" || saved === "en") return saved;
    }
    return "ky";
  });

  const t = (key: string) => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[lang] || entry["ky"] || key;
  };

  // Router State
  const [activeView, setActiveView] = useState<"home" | "materials" | "detail" | "tools" | "dashboard" | "admin" | "about" | "contact" | "faq" | "subscription">("home");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [selectedToolId, setSelectedToolId] = useState<string>("lesson_plan");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFullName, setAuthFullName] = useState("");
  const [authRole, setAuthRole] = useState<"teacher" | "admin">("teacher");

  // Database Data States
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Баары");
  const [selectedClass, setSelectedClass] = useState("Баары");
  const [selectedType, setSelectedType] = useState("Баары");
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Detail Page Specifics
  const [pptSlideIndex, setPptSlideIndex] = useState(0);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareMaterial, setShareMaterial] = useState<Material | null>(null);

  // AI Chat Widget States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([
    { role: "ai", text: "Саламатсызбы! Мен сиздин санариптик AI жардамчыңызмын. Мага сабак пландарын түзүү, тесттерди даярдоо же методикалык суроолоруңуз боюнча жазсаңыз болот." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Notification States
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Admin / Edit material bridge
  const [editingMaterialFromAdmin, setEditingMaterialFromAdmin] = useState<Material | null>(null);

  const autocompleteRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Trigger notification toast
  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

  // Load Initial Materials
  const loadMaterials = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedSubject !== "Баары") queryParams.append("subject", selectedSubject);
      if (selectedClass !== "Баары") queryParams.append("classLevel", selectedClass);
      if (selectedType !== "Баары") queryParams.append("type", selectedType);

      const res = await fetch(`/api/materials?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch (e) {
      console.error("Error loading materials", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [selectedSubject, selectedClass, selectedType]);

  // Handle Autocomplete Click Away
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch individual material on detail view
  useEffect(() => {
    if (selectedMaterialId) {
      setActiveView("detail");
      const fetchMaterialDetails = async () => {
        try {
          const res = await fetch(`/api/materials/${selectedMaterialId}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedMaterial(data);
            setPptSlideIndex(0); // Reset slideshow index
            
            // Also load comments
            const commentsRes = await fetch(`/api/comments/${selectedMaterialId}`);
            if (commentsRes.ok) {
              const commentsData = await commentsRes.json();
              setComments(commentsData);
            }
          }
        } catch (e) {
          console.error("Error fetching material details", e);
        }
      };
      fetchMaterialDetails();
    } else {
      setSelectedMaterial(null);
      setComments([]);
    }
  }, [selectedMaterialId]);

  // Dark Mode side effects
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Toggle Favorite
  const handleToggleFavorite = async (matId: string) => {
    const userId = currentUser?.id || "user-teacher-1"; // fallback for logged in
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, materialId: matId })
      });
      const data = await res.json();
      if (res.ok) {
        if (currentUser) {
          setCurrentUser({ ...currentUser, favorites: data.favorites });
        }
        showNotification(data.isFavorite ? "Сүйүктүүлөргө сакталды!" : "Сүйүктүүлөрдөн өчүрүлдү!");
      }
    } catch (e) {
      showNotification("Тармак катасы", "error");
    }
  };

  // Download Trigger
  const handleDownloadFile = async (material: Material) => {
    try {
      window.open(`/api/materials/${material.id}/download`, "_blank");
      showNotification("Жүктөө башталды!", "success");
      // Update download count on client
      if (selectedMaterial && selectedMaterial.id === material.id) {
        setSelectedMaterial({ ...selectedMaterial, downloads: selectedMaterial.downloads + 1 });
      }
      setMaterials(prev => prev.map(m => m.id === material.id ? { ...m, downloads: m.downloads + 1 } : m));
    } catch (e) {
      showNotification("Файлды жүктөөдө ката кетти", "error");
    }
  };

  // Auth Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) {
      showNotification("Сураныч, электрондук даректи жазыңыз", "error");
      return;
    }

    try {
      if (authMode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data);
          setIsAuthModalOpen(false);
          showNotification(`Кош келиңиз, ${data.fullName}!`);
        } else {
          showNotification(data.error || "Ката кетти", "error");
        }
      } else if (authMode === "register") {
        if (!authFullName.trim()) {
          showNotification("Толук атыңызды жазыңыз", "error");
          return;
        }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, fullName: authFullName, role: authRole })
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data);
          setIsAuthModalOpen(false);
          showNotification("Каттоо ийгиликтүү бүттү!");
        } else {
          showNotification(data.error || "Ката кетти", "error");
        }
      } else {
        // Forgot password
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail })
        });
        const data = await res.json();
        if (res.ok) {
          setIsAuthModalOpen(false);
          showNotification(data.message);
        } else {
          showNotification(data.error || "Ката кетти", "error");
        }
      }
    } catch (err) {
      showNotification("Тармак катасы кетти", "error");
    }
  };

  // Social Sharing builder
  const handleOpenShare = (mat: Material) => {
    setShareMaterial(mat);
    setIsShareModalOpen(true);
  };

  const getShareLink = (platform: "whatsapp" | "telegram" | "facebook" | "email" | "copy") => {
    if (!shareMaterial) return "";
    const siteUrl = window.location.href;
    const text = `Teacher Hub платформасында сонун жаңы сабак материалын таптым: "${shareMaterial.title}". Бул жерден жүктөп алсаңыз болот:`;
    const fullText = encodeURIComponent(`${text} ${siteUrl}`);

    switch (platform) {
      case "whatsapp":
        return `https://api.whatsapp.com/send?text=${fullText}`;
      case "telegram":
        return `https://t.me/share/url?url=${encodeURIComponent(siteUrl)}&text=${encodeURIComponent(shareMaterial.title)}`;
      case "facebook":
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`;
      case "email":
        return `mailto:?subject=${encodeURIComponent(shareMaterial.title)}&body=${fullText}`;
      default:
        return siteUrl;
    }
  };

  const copyShareLink = () => {
    const link = getShareLink("copy");
    navigator.clipboard.writeText(link);
    showNotification("Шилтеме алмашууга көчүрүлдү!");
    setIsShareModalOpen(false);
  };

  // Comment Posting
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch(`/api/comments/${selectedMaterialId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: currentUser?.fullName || "Конок Колдонуучу",
          authorId: currentUser?.id || "user-anonymous",
          text: newCommentText
        })
      });
      const data = await res.json();
      if (res.ok) {
        setComments([data, ...comments]);
        setNewCommentText("");
        showNotification("Пикириңиз кабыл алынды!");
        // Increment comment count on selectedMaterial
        if (selectedMaterial) {
          setSelectedMaterial({ ...selectedMaterial, commentsCount: selectedMaterial.commentsCount + 1 });
        }
      }
    } catch (e) {
      showNotification("Комментарий жөнөтүүдө ката кетти", "error");
    }
  };

  // Like comment
  const handleLikeComment = async (id: string) => {
    const userId = currentUser?.id || "user-anonymous";
    try {
      const res = await fetch(`/api/comments/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (res.ok) {
        setComments(comments.map(c => c.id === id ? data : c));
      }
    } catch (e) {
      console.error("Error liking comment", e);
    }
  };

  // Delete comment
  const handleDeleteComment = async (id: string) => {
    if (!window.confirm("Бул пикирди өчүрүүнү каалайсызбы?")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== id));
        showNotification("Пикириңиз ийгиликтүү өчүрүлдү!");
        if (selectedMaterial) {
          setSelectedMaterial({ ...selectedMaterial, commentsCount: Math.max(0, selectedMaterial.commentsCount - 1) });
        }
      }
    } catch (e) {
      showNotification("Өчүрүүдө ката кетти", "error");
    }
  };

  // Edit comment
  const handleStartEditComment = (id: string, text: string) => {
    setEditingCommentId(id);
    setEditingCommentText(text);
  };

  const handleSaveEditComment = async (id: string) => {
    if (!editingCommentText.trim()) return;
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingCommentText })
      });
      const data = await res.json();
      if (res.ok) {
        setComments(comments.map(c => c.id === id ? data : c));
        setEditingCommentId(null);
        setEditingCommentText("");
        showNotification("Пикириңиз жаңыланды!");
      }
    } catch (e) {
      showNotification("Ката кетти", "error");
    }
  };

  // Reply Comment
  const handlePostReply = async (commentId: string) => {
    const text = replyTexts[commentId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/comments/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: currentUser?.fullName || "Конок Колдонуучу",
          authorId: currentUser?.id || "user-anonymous",
          text: text
        })
      });
      const data = await res.json();
      if (res.ok) {
        setComments(comments.map(c => c.id === commentId ? data : c));
        setReplyTexts({ ...replyTexts, [commentId]: "" });
        setActiveReplyBox(null);
        showNotification("Жообуңуз кошулду!");
      }
    } catch (e) {
      showNotification("Ката кетти", "error");
    }
  };

  // AI Chat Messenger
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg })
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages(prev => [...prev, { role: "ai", text: data.text }]);
      } else {
        setChatMessages(prev => [...prev, { role: "ai", text: "Кечириңиз, AI серверден жооп ала алган жок. Кайра аракет кылыңыз." }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: "ai", text: "Тармак катасы кетти. Сураныч, байланышты текшериңиз." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Simulate Document Printing
  const handlePrintDocument = () => {
    window.print();
  };

  // Filter materials based on search bar & selections
  const filteredMaterials = materials.filter(m => {
    if (searchQuery.trim() === "") return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.author.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`min-h-screen font-sans antialiased text-slate-800 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300`}>
      
      {/* Toast Notification */}
      {notification && (
        <div id="toast-notification" className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border ${
          notification.type === "success" 
            ? "bg-emerald-50 dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-400" 
            : "bg-rose-50 dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-400"
        }`}>
          {notification.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-bold">{notification.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/80 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <button 
            id="btn-logo-home"
            onClick={() => { setActiveView("home"); setSelectedMaterialId(null); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 hover:opacity-90 transition shrink-0"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <GraduationCap className="h-5.5 w-5.5" />
            </div>
            <div className="text-left">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white block">Teacher Hub</span>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block -mt-1">{t("logo_subhead")}</span>
            </div>
          </button>

          {/* Nav Links - lg viewports and up */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/60 dark:bg-slate-950/40 p-1 rounded-2xl border border-slate-100 dark:border-slate-850">
            {[
              { id: "home", label: t("nav_home") },
              { id: "materials", label: t("nav_materials") },
              { id: "tools", label: t("nav_tools") },
              { id: "subscription", label: `💎 ${t("nav_subscription")}` },
              { id: "faq", label: t("nav_faq") }
            ].map((link) => (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => {
                  setActiveView(link.id as any);
                  setSelectedMaterialId(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition duration-200 ${
                  activeView === link.id && !selectedMaterialId
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : link.id === "subscription"
                      ? "text-indigo-600 dark:text-indigo-400 hover:bg-white/40 dark:hover:bg-slate-800/40"
                      : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {link.label}
              </button>
            ))}

            {currentUser && (
              <button
                id="nav-link-dashboard"
                onClick={() => { setActiveView("dashboard"); setSelectedMaterialId(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1 ${
                  activeView === "dashboard"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                {t("nav_dashboard")}
              </button>
            )}

            {currentUser?.role === "admin" && (
              <button
                id="nav-link-admin"
                onClick={() => { setActiveView("admin"); setSelectedMaterialId(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1 ${
                  activeView === "admin"
                    ? "bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <Settings className="h-3.5 w-3.5 text-red-500 shrink-0" />
                {t("nav_admin")}
              </button>
            )}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Tool Trigger */}
            <button
              id="btn-header-quick-tool"
              onClick={() => { setActiveView("tools"); setSelectedToolId("lesson_plan"); setSelectedMaterialId(null); setIsMobileMenuOpen(false); }}
              className="hidden md:flex px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition items-center gap-1.5 shadow shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              {t("quick_tool_header")}
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <select
                id="lang-select"
                value={lang}
                onChange={(e) => {
                  const newLang = e.target.value as "ky" | "ru" | "en";
                  setLang(newLang);
                  localStorage.setItem("lang", newLang);
                  showNotification(
                    newLang === "ky" 
                      ? "Тил кыргызчага өзгөртүлдү!" 
                      : newLang === "ru" 
                      ? "Язык изменен на русский!" 
                      : "Language changed to English!"
                  );
                }}
                className="appearance-none pl-7 pr-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition text-xs font-bold cursor-pointer focus:outline-none border border-slate-150 dark:border-slate-800"
              >
                <option value="ky">KG</option>
                <option value="ru">RU</option>
                <option value="en">EN</option>
              </select>
              <Globe className="h-3.5 w-3.5 text-slate-400 absolute left-2 pointer-events-none" />
            </div>

            {/* Dark Mode Toggle */}
            <button
              id="btn-dark-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl transition border border-slate-150 dark:border-slate-800"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Profile Dropdown or Login */}
            {currentUser ? (
              <div id="profile-dropdown-container" className="flex items-center gap-2 border-l border-slate-150 dark:border-slate-800 pl-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-extrabold text-slate-850 dark:text-white line-clamp-1 max-w-[100px]">{currentUser.fullName}</div>
                  <div className="text-[9px] text-slate-450 font-bold uppercase tracking-wider mt-0.5">{currentUser.role === "admin" ? t("auth_role_admin") : t("auth_role_teacher")}</div>
                </div>
                <button
                  id="btn-logout"
                  onClick={() => { setCurrentUser(null); showNotification(lang === "ky" ? "Системадан чыктыңыз." : lang === "ru" ? "Вы вышли из системы." : "You logged out."); setActiveView("home"); setIsMobileMenuOpen(false); }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                  title={t("btn_logout")}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-header-login"
                onClick={() => { setAuthMode("login"); setIsAuthModalOpen(true); }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("btn_login")}</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex lg:hidden p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl transition border border-slate-150 dark:border-slate-800"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {isMobileMenuOpen && (
          <div id="mobile-menu-drawer" className="lg:hidden w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-xl py-4 px-4 space-y-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {[
                { id: "home", label: t("nav_home") },
                { id: "materials", label: t("nav_materials") },
                { id: "tools", label: t("nav_tools") },
                { id: "subscription", label: `💎 ${t("nav_subscription")}` },
                { id: "faq", label: t("nav_faq") }
              ].map((link) => (
                <button
                  key={link.id}
                  id={`mobile-nav-link-${link.id}`}
                  onClick={() => {
                    setActiveView(link.id as any);
                    setSelectedMaterialId(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200 ${
                    activeView === link.id && !selectedMaterialId
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold"
                      : link.id === "subscription"
                        ? "text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {currentUser && (
                <button
                  id="mobile-nav-link-dashboard"
                  onClick={() => { 
                    setActiveView("dashboard"); 
                    setSelectedMaterialId(null); 
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
                    activeView === "dashboard"
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  {t("nav_dashboard")}
                </button>
              )}

              {currentUser?.role === "admin" && (
                <button
                  id="mobile-nav-link-admin"
                  onClick={() => { 
                    setActiveView("admin"); 
                    setSelectedMaterialId(null); 
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
                    activeView === "admin"
                      ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850"
                  }`}
                >
                  <Settings className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  {t("nav_admin")}
                </button>
              )}
            </nav>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Mobile Quick Tool Button */}
            <button
              id="btn-mobile-quick-tool"
              onClick={() => { 
                setActiveView("tools"); 
                setSelectedToolId("lesson_plan"); 
                setSelectedMaterialId(null); 
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              {t("quick_tool_header")}
            </button>
          </div>
        )}
      </header>

      {/* AUTHENTICATION MODAL */}
      {isAuthModalOpen && (
        <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-indigo-500" />
                  <span className="text-lg font-black text-slate-900 dark:text-white">Платформага кирүү</span>
                </div>
                <button
                  id="btn-close-auth"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Аты-жөнүңүз *</label>
                    <input
                      id="auth-fullname"
                      type="text"
                      required
                      placeholder="Асанов Үсөн"
                      value={authFullName}
                      onChange={(e) => setAuthFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Электрондук дарек *</label>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white text-sm"
                  />
                </div>

                {authMode !== "forgot" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Сырсөз *</label>
                    <input
                      id="auth-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white text-sm"
                    />
                  </div>
                )}

                {authMode === "register" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">Платформадагы ролуңуз</label>
                    <div className="grid grid-cols-2 gap-3 mt-1.5">
                      <button
                        id="btn-role-teacher"
                        type="button"
                        onClick={() => setAuthRole("teacher")}
                        className={`py-2 px-3 border rounded-xl text-xs font-semibold transition ${
                          authRole === "teacher" 
                            ? "bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/40" 
                            : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-500"
                        }`}
                      >
                        Мугалим
                      </button>
                      <button
                        id="btn-role-admin"
                        type="button"
                        onClick={() => setAuthRole("admin")}
                        className={`py-2 px-3 border rounded-xl text-xs font-semibold transition ${
                          authRole === "admin" 
                            ? "bg-red-50 border-red-500 text-red-600 dark:bg-red-950/40" 
                            : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-500"
                        }`}
                      >
                        Администратор
                      </button>
                    </div>
                  </div>
                )}

                <button
                  id="btn-auth-submit"
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20 mt-2"
                >
                  {authMode === "login" ? "Кирүү" : authMode === "register" ? "Катталуу" : "Сырсөздү калыбына келтирүү"}
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-2 items-center text-xs text-slate-400">
                {authMode === "login" ? (
                  <>
                    <button id="btn-switch-register" onClick={() => setAuthMode("register")} className="text-indigo-500 font-semibold hover:underline">Катталуу барагына өтүү</button>
                    <button id="btn-switch-forgot" onClick={() => setAuthMode("forgot")} className="hover:underline mt-1 text-slate-500">Сырсөздү унутуп калдыңызбы?</button>
                  </>
                ) : authMode === "register" ? (
                  <button id="btn-switch-login" onClick={() => setAuthMode("login")} className="text-indigo-500 font-semibold hover:underline">Мурунтан эле катталгансызбы? Кирүү</button>
                ) : (
                  <button id="btn-switch-back-login" onClick={() => setAuthMode("login")} className="text-indigo-500 font-semibold hover:underline">Кирүү барагына кайтуу</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {isShareModalOpen && shareMaterial && (
        <div id="share-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-bold text-slate-850 dark:text-white">Шилтеме бөлүшүү</h4>
              <button
                id="btn-close-share"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-6 font-medium line-clamp-1">"{shareMaterial.title}"</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <a
                id="share-whatsapp"
                href={getShareLink("whatsapp")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs font-semibold transition border border-emerald-100"
              >
                WhatsApp
              </a>
              <a
                id="share-telegram"
                href={getShareLink("telegram")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 text-blue-800 dark:text-blue-400 rounded-xl text-xs font-semibold transition border border-blue-100"
              >
                Telegram
              </a>
              <a
                id="share-facebook"
                href={getShareLink("facebook")}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 text-indigo-800 dark:text-indigo-400 rounded-xl text-xs font-semibold transition border border-indigo-100"
              >
                Facebook
              </a>
              <a
                id="share-email"
                href={getShareLink("email")}
                className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-100 dark:border-slate-700"
              >
                Email дарек
              </a>
            </div>

            <button
              id="btn-copy-share-link"
              onClick={copyShareLink}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
            >
              Шилтемени көчүрүү
            </button>
          </div>
        </div>
      )}

      {/* CORE CONTENT ROUTER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* VIEW: HOME VIEW */}
        {activeView === "home" && !selectedMaterialId && (
          <div id="view-home" className="space-y-16">
            
            {/* HERO HERO HERO */}
            <div className="relative py-16 sm:py-20 md:py-24 overflow-hidden rounded-3xl border border-indigo-950/20 px-6 sm:px-10 lg:px-12 shadow-xl bg-slate-950 text-white transition-all duration-300">
              {/* Main Background Image with opacity and subtle zoom */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center opacity-25 dark:opacity-20 scale-105 transition-transform duration-[10s] hover:scale-100"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80')" }}
              />

              {/* Gradient Overlays for perfect readability & premium look */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-950/90 via-slate-950/85 to-indigo-900/95 pointer-events-none" />
              
              {/* Decorative blurred background lights */}
              <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-10 right-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
              
              {/* Dot Grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

              <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-indigo-300 border border-white/10">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                  {t("hero_tagline")}
                </span>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] font-display">
                  {t("hero_title_1")} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400 font-extrabold">{t("hero_title_2")}</span>
                </h1>
                
                <p className="text-sm sm:text-md text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
                  {t("hero_desc")}
                </p>

                {/* Advanced Search & Autocomplete Hub */}
                <div ref={autocompleteRef} className="relative max-w-2xl mx-auto pt-2">
                  <div className="flex p-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-400/20 transition duration-300">
                    <div className="flex-1 flex items-center gap-2.5 px-3">
                      <Search className="h-5 w-5 text-indigo-350 shrink-0" />
                      <input
                        id="search-input-main"
                        type="text"
                        placeholder={t("search_placeholder")}
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setShowAutocomplete(true);
                        }}
                        onFocus={() => setShowAutocomplete(true)}
                        className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-xs sm:text-sm font-medium"
                      />
                    </div>
                    <button
                      id="btn-search-trigger"
                      onClick={() => setActiveView("materials")}
                      className="px-5 py-2.5 sm:px-6 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/20 active:scale-98 cursor-pointer shrink-0"
                    >
                      {t("btn_search")}
                    </button>
                  </div>

                  {/* Autocomplete Results Box */}
                  {showAutocomplete && searchQuery.trim().length > 0 && (
                    <div id="autocomplete-box" className="absolute left-0 right-0 top-full mt-2 z-50 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[250px] overflow-y-auto">
                      {filteredMaterials.slice(0, 5).map((m) => (
                        <button
                          key={m.id}
                          id={`btn-auto-${m.id}`}
                          onClick={() => {
                            setSelectedMaterialId(m.id);
                            setShowAutocomplete(false);
                          }}
                          className="w-full text-left p-3.5 hover:bg-slate-800 border-b border-slate-850 flex items-center justify-between text-xs sm:text-sm transition text-white"
                        >
                          <div>
                            <div className="font-bold line-clamp-1 text-slate-100">{m.title}</div>
                            <div className="text-[10px] text-slate-400 mt-1 flex gap-2">
                              <span>{m.subject}</span>
                              <span>•</span>
                              <span>{m.classLevel}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                        </button>
                      ))}
                      {filteredMaterials.length === 0 && (
                        <div className="p-4 text-center text-xs text-slate-400 italic">Эч нерсе табылган жок.</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Interactive Dynamic Badges Row */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                  {/* Badge 1: AI Assistant */}
                  <div className="bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3 transition duration-300 hover:bg-white/10 hover:-translate-y-0.5">
                    <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-white leading-none">AI Мугалим</div>
                      <div className="text-[9px] text-indigo-300 font-bold mt-1 uppercase tracking-wider">Жардамчысы</div>
                    </div>
                  </div>

                  {/* Badge 2: Active Materials */}
                  <div className="bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3 transition duration-300 hover:bg-white/10 hover:-translate-y-0.5">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <FileText className="h-4.5 w-4.5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black text-white leading-none">1000+ Сабак</div>
                      <div className="text-[9px] text-emerald-300 font-bold mt-1 uppercase tracking-wider">Пландары</div>
                    </div>
                  </div>

                  {/* Badge 3: Premium Club */}
                  <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-500/30 flex items-center gap-3 transition duration-300 hover:scale-[1.02]">
                    <span className="text-lg">👑</span>
                    <div className="text-left">
                      <div className="text-xs font-black text-amber-200 leading-none">Премиум Класс</div>
                      <div className="text-[9px] text-amber-400 font-bold mt-1 uppercase tracking-wider">Жазылуучулар үчүн</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* SUBJECTS RAIL */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">{t("subjects_header")}</h3>
                <button 
                  id="btn-see-all-subjects"
                  onClick={() => { setSelectedSubject("Баары"); setActiveView("materials"); }}
                  className="text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  {t("see_all")} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {SUBJECTS.map((sub, i) => {
                  const style = (() => {
                    switch (sub) {
                      case "Кыргыз тили":
                      case "Кыргыз адабияты":
                        return { icon: "🇰🇬", bg: "bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 hover:border-red-350" };
                      case "Математика":
                        return { icon: "📐", bg: "bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 hover:border-blue-350" };
                      case "Информатика":
                        return { icon: "💻", bg: "bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/30 hover:border-cyan-350" };
                      case "Англис тили":
                        return { icon: "🇬🇧", bg: "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-350" };
                      case "Орус тили":
                        return { icon: "🇷🇺", bg: "bg-sky-50/50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/30 hover:border-sky-350" };
                      case "Физика":
                        return { icon: "⚡", bg: "bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30 hover:border-amber-350" };
                      case "Химия":
                        return { icon: "🧪", bg: "bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-350" };
                      case "Биология":
                        return { icon: "🌿", bg: "bg-green-50/50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30 hover:border-green-350" };
                      case "Тарых":
                        return { icon: "📜", bg: "bg-stone-50/50 dark:bg-stone-950/20 text-stone-600 dark:text-stone-400 border-stone-100 dark:border-stone-900/30 hover:border-stone-350" };
                      case "География":
                        return { icon: "🌍", bg: "bg-teal-50/50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/30 hover:border-teal-350" };
                      default:
                        return { icon: "📚", bg: "bg-slate-50/50 dark:bg-slate-800/50 text-slate-650 dark:text-slate-350 border-slate-150 dark:border-slate-800 hover:border-indigo-200" };
                    }
                  })();

                  return (
                    <button
                      key={i}
                      id={`btn-subject-${i}`}
                      onClick={() => {
                        setSelectedSubject(sub);
                        setActiveView("materials");
                      }}
                      className={`p-5 text-left rounded-2xl border transition duration-350 flex flex-col justify-between h-32 hover:scale-[1.03] active:scale-97 cursor-pointer hover:shadow-md ${
                        selectedSubject === sub
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                          : `bg-white dark:bg-slate-900 ${style.bg}`
                      }`}
                    >
                      <span className="text-2xl filter drop-shadow-sm select-none">{style.icon}</span>
                      <span className="font-extrabold text-xs tracking-tight line-clamp-2 mt-2">{sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CLASSES GRID */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">{t("classes_header")}</h3>
              </div>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {CLASSES.map((cls, i) => (
                  <button
                    key={i}
                    id={`btn-class-${i}`}
                    onClick={() => {
                      setSelectedClass(cls);
                      setActiveView("materials");
                    }}
                    className={`px-4.5 py-2.5 rounded-2xl text-xs font-bold border transition duration-300 hover:scale-[1.05] active:scale-95 cursor-pointer ${
                      selectedClass === cls
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-white hover:bg-slate-50 dark:bg-slate-900 border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm"
                    }`}
                  >
                    🏫 {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* POPULAR AND NEW MATERIALS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
              {/* Popular Materials */}
              <div className="space-y-5">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  {t("popular_materials")}
                </h3>
                <div className="space-y-4">
                  {materials.slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/60 rounded-3xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:shadow-lg hover:scale-[1.01] transition duration-300 flex gap-4"
                    >
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${m.coverGradient || "from-blue-500 to-indigo-600"} shrink-0 flex items-center justify-center text-white shadow-md shadow-indigo-600/10`}>
                        <Star className="h-5.5 w-5.5" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <button
                          id={`btn-pop-${m.id}`}
                          onClick={() => setSelectedMaterialId(m.id)}
                          className="font-extrabold text-slate-850 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition text-left line-clamp-1 block leading-snug"
                        >
                          {m.title}
                        </button>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 font-medium">
                          <span className="bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400">{m.subject}</span>
                          <span>•</span>
                          <span className="text-[11px]">{m.classLevel}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col justify-center items-end">
                        <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400">{m.rating} ★</span>
                        <span className="text-[10px] text-slate-400 mt-1.5 font-bold">{m.views} {t("views_count")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Materials */}
              <div className="space-y-5">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  {t("new_materials")}
                </h3>
                <div className="space-y-4">
                  {[...materials].reverse().slice(0, 3).map((m) => (
                    <div
                      key={m.id}
                      className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/60 rounded-3xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:shadow-lg hover:scale-[1.01] transition duration-300 flex gap-4"
                    >
                      <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${m.coverGradient || "from-teal-500 to-emerald-600"} shrink-0 flex items-center justify-center text-white shadow-md shadow-emerald-650/10`}>
                        <FileText className="h-5.5 w-5.5" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <button
                          id={`btn-new-${m.id}`}
                          onClick={() => setSelectedMaterialId(m.id)}
                          className="font-extrabold text-slate-850 dark:text-white text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition text-left line-clamp-1 block leading-snug"
                        >
                          {m.title}
                        </button>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 font-medium">
                          <span className="bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400">{m.subject}</span>
                          <span>•</span>
                          <span className="text-[11px]">{m.classLevel}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col justify-center items-end">
                        <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-xl text-[10px] font-extrabold text-indigo-600 dark:text-indigo-450 uppercase tracking-wider">{m.type}</span>
                        <span className="text-[10px] text-slate-400 mt-1.5 font-bold">{m.downloads} {t("downloads_count")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BANNER FOR AI TOOL */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-8 sm:p-12 md:p-14 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl border border-indigo-900/30">
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-4 max-w-xl text-center md:text-left">
                <span className="inline-block bg-indigo-600 text-white text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-wider shadow">
                  ✨ {t("ai_banner_tag")}
                </span>
                <h3 className="text-2xl sm:text-3.5xl font-black tracking-tight leading-tight">{t("ai_banner_header")}</h3>
                <p className="text-sm text-slate-350 leading-relaxed">
                  {t("ai_banner_desc")}
                </p>
              </div>
              <button
                id="btn-banner-ai-tool"
                onClick={() => { setActiveView("tools"); setSelectedToolId("lesson_plan"); }}
                className="relative z-10 px-7 py-4 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition shrink-0 shadow-lg hover:shadow-white/10 hover:scale-[1.03] active:scale-97 cursor-pointer"
              >
                🚀 {t("ai_banner_button")}
              </button>
            </div>
          </div>
        )}

        {/* VIEW: MATERIALS ARCHIVE / LIST VIEW */}
        {activeView === "materials" && !selectedMaterialId && (
          <div id="view-materials" className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t("materials_header")}</h2>
                <p className="text-xs text-slate-450 mt-1">{t("materials_subhead")}</p>
              </div>

              {/* Reset Filters Quick Button */}
              {(selectedSubject !== "Баары" || selectedClass !== "Баары" || selectedType !== "Баары" || searchQuery !== "") && (
                <button
                  id="btn-reset-filters"
                  onClick={() => {
                    setSelectedSubject("Баары");
                    setSelectedClass("Баары");
                    setSelectedType("Баары");
                    setSearchQuery("");
                  }}
                  className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-xl text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  {t("clear_filters")}
                </button>
              )}
            </div>

            {/* Filter Rails */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("filter_subject")}</label>
                <select
                  id="filter-subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-xs text-slate-800 dark:text-white"
                >
                  <option value="Баары">{t("all_subjects")}</option>
                  {SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("filter_class")}</label>
                <select
                  id="filter-class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-xs text-slate-800 dark:text-white"
                >
                  <option value="Баары">{t("all_classes")}</option>
                  {CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("filter_type")}</label>
                <select
                  id="filter-type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-xs text-slate-800 dark:text-white"
                >
                  <option value="Баары">{t("all_types")}</option>
                  <option value="pdf">PDF</option>
                  <option value="word">Word</option>
                  <option value="powerpoint">PowerPoint</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("filter_search_label")}</label>
                <div className="relative">
                  <input
                    id="filter-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("filter_search_placeholder")}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-xs text-slate-800 dark:text-white"
                  />
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* List Results Grid */}
            {loading ? (
              <div className="text-center py-20">
                <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-400">{t("loading_materials")}</p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <BookOpen className="h-12 w-12 text-slate-350 mx-auto mb-3" />
                <p className="text-slate-850 dark:text-white font-bold">{t("no_materials")}</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{t("no_materials_desc")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredMaterials.map((m) => {
                  const isFavorite = currentUser?.favorites?.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-900 transition duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Header Image Gradient representator */}
                        <div className={`h-40 bg-gradient-to-br ${m.coverGradient || "from-blue-500 to-indigo-600"} p-5 text-white flex flex-col justify-between relative`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                {m.type.toUpperCase()}
                              </span>
                              <span className="bg-amber-500 text-white px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                                🎮 Оюн
                              </span>
                            </div>
                            <button
                              id={`btn-fav-card-${m.id}`}
                              onClick={() => handleToggleFavorite(m.id)}
                              className="p-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition"
                            >
                              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
                            </button>
                          </div>
                          <div>
                            <span className="text-[10px] font-black tracking-widest text-white/80 block uppercase">{m.subject}</span>
                            <span className="text-xs font-semibold block mt-0.5">{m.classLevel}</span>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-5 space-y-3">
                          <button
                            id={`btn-card-title-${m.id}`}
                            onClick={() => setSelectedMaterialId(m.id)}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 transition text-sm text-left line-clamp-2 block leading-snug"
                          >
                            {m.title}
                          </button>
                          <p className="text-xs text-slate-450 line-clamp-2 leading-relaxed">
                            {m.description}
                          </p>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Автор: <span className="font-bold text-slate-600 dark:text-slate-350">{m.author}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 py-4 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" /> {m.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="h-3.5 w-3.5" /> {m.downloads}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            id={`btn-card-share-${m.id}`}
                            onClick={() => handleOpenShare(m)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition"
                            title="Бөлүшүү"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button
                            id={`btn-card-preview-${m.id}`}
                            onClick={() => setSelectedMaterialId(m.id)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            Алдын-ала көрүү
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW: DETAIL PAGE */}
        {activeView === "detail" && (
          <div id="view-detail" className="space-y-8 animate-fade-in">
            {/* Breadcrumb / Back button */}
            <button
              id="btn-back-to-list"
              onClick={() => { setSelectedMaterialId(null); setActiveView("materials"); }}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Материалдарга кайтуу
            </button>

            {!selectedMaterial ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm">
                <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-400">Материал жүктөлүүдө...</p>
              </div>
            ) : (
              /* Split layout */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left & Middle columns: Preview & content details */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Material Header Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] uppercase font-black px-2.5 py-1 rounded-full tracking-wider dark:bg-indigo-950/40 dark:text-indigo-400">
                      {selectedMaterial.subject}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{selectedMaterial.classLevel}</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white leading-tight">
                    {selectedMaterial.title}
                  </h1>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-50 dark:border-slate-850 pt-4 text-xs text-slate-400 font-medium">
                    <div>Автор: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedMaterial.author}</span></div>
                    <div className="flex gap-4">
                      <span>Көрүүлөр: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedMaterial.views}</span></span>
                      <span>Жүктөөлөр: <span className="font-bold text-slate-700 dark:text-slate-200">{selectedMaterial.downloads}</span></span>
                      <span>Рейтинг: <span className="font-bold text-amber-500">{selectedMaterial.rating} ★</span></span>
                    </div>
                  </div>
                </div>

                {/* THEMATIC PREVIEW PANELS */}
                <div id="preview-section-detail" className="bg-slate-100 dark:bg-slate-950 rounded-3xl p-6 border border-slate-200 dark:border-slate-850 shadow-inner">
                  <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <FileText className="h-4.5 w-4.5 text-indigo-500" />
                    Документти алдын ала көрүү (Preview)
                  </h3>

                  {/* 1. PDF PREVIEW MODE */}
                  {selectedMaterial.type === "pdf" && (
                    <div id="pdf-preview-box" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg mx-auto overflow-hidden">
                      {/* PDF Editor Mock Header */}
                      <div className="bg-slate-100 dark:bg-slate-950 px-4 py-2.5 border-b border-slate-250 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full shrink-0" />
                          <span className="font-mono truncate max-w-[150px]">{selectedMaterial.title.replace(/\s+/g, "_")}.pdf</span>
                        </div>
                        <span>Барак 1 / 1</span>
                      </div>
                      {/* Document Sheet layout */}
                      <div className="p-6 sm:p-10 min-h-[500px] text-slate-800 dark:text-slate-200 prose dark:prose-invert text-xs leading-relaxed max-h-[600px] overflow-y-auto whitespace-pre-wrap font-sans">
                        {selectedMaterial.content}
                      </div>
                    </div>
                  )}

                  {/* 2. WORD PREVIEW MODE */}
                  {selectedMaterial.type === "word" && (
                    <div id="word-preview-box" className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg mx-auto overflow-hidden">
                      {/* Word Mock Ribbon Header */}
                      <div className="bg-indigo-700 px-4 py-3 text-white flex items-center justify-between text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                          <FileCheck className="h-4 w-4" /> Microsoft Word - Түзөтүү усулу
                        </span>
                        <span className="opacity-75">100% Көрүнүш</span>
                      </div>
                      {/* Sheet padding representing actual editor margins */}
                      <div className="p-6 sm:p-10 min-h-[500px] bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-x border-b border-slate-100 dark:border-slate-850 text-xs leading-relaxed max-h-[600px] overflow-y-auto whitespace-pre-wrap font-serif">
                        {selectedMaterial.content}
                      </div>
                    </div>
                  )}

                  {/* 3. POWERPOINT PREVIEW MODE */}
                  {selectedMaterial.type === "powerpoint" && (
                    <div id="ppt-preview-box" className="bg-slate-800 rounded-2xl shadow-xl max-w-2xl mx-auto overflow-hidden border border-slate-700">
                      {/* Slide widescreen frame */}
                      <div className="aspect-[16/9] bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 sm:p-12 flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">
                          Слайд {pptSlideIndex + 1}
                        </div>
                        
                        {/* Slide content dispatcher */}
                        <div className="space-y-4 my-auto">
                          <h4 className="text-lg sm:text-xl font-bold tracking-tight border-b border-white/20 pb-2">
                            {selectedMaterial.content.split("\n\n")[pptSlideIndex]?.split("\n")[0] || selectedMaterial.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed line-clamp-5 font-medium">
                            {selectedMaterial.content.split("\n\n")[pptSlideIndex]?.split("\n").slice(1).join("\n") || "Презентациянын мазмуну."}
                          </p>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-white/10 pt-3">
                          <span>Teacher Hub Слайд Мастер</span>
                          <div className="flex gap-2">
                            <button
                              id="btn-prev-slide"
                              disabled={pptSlideIndex === 0}
                              onClick={() => setPptSlideIndex(prev => Math.max(0, prev - 1))}
                              className="px-2 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded text-white"
                            >
                              Мурунку
                            </button>
                            <button
                              id="btn-next-slide"
                              disabled={pptSlideIndex >= selectedMaterial.content.split("\n\n").length - 1}
                              onClick={() => setPptSlideIndex(prev => prev + 1)}
                              className="px-2 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded text-white"
                            >
                              Кийинки
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. VIDEO PREVIEW MODE */}
                  {selectedMaterial.type === "video" && (
                    <div id="video-preview-box" className="bg-slate-950 rounded-2xl shadow-xl max-w-xl mx-auto overflow-hidden aspect-video relative flex flex-col justify-between p-6 text-white">
                      <div className="flex justify-between items-center z-10">
                        <span className="bg-red-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded">Видео сабак</span>
                        <span className="text-xs text-slate-300">10:24 мүнөт</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <button
                          id="btn-play-simulated-video"
                          onClick={() => showNotification("Видео сабак башталды! (Симуляцияланган ойноткуч)", "success")}
                          className="h-16 w-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-105"
                        >
                          <Play className="h-8 w-8 fill-white ml-1" />
                        </button>
                        <p className="text-xs font-semibold text-slate-300">Урматтуу мугалим! Бул жерден видео сабакты толугу менен көрө аласыз.</p>
                      </div>

                      <div className="flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-slate-400">
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-indigo-500" />
                        </div>
                        <span>3:15 / 10:24</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* INTERACTIVE GAME SECTION */}
                <InteractiveGame material={selectedMaterial} onShowNotification={showNotification} />

                {/* DESCRIPTION DETAIL AREA */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
                  <h3 className="text-md font-bold text-slate-850 dark:text-white">Методикалык көрсөтмөнүн сыпаттамасы</h3>
                  <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">
                    {selectedMaterial.description}
                  </p>
                </div>

                {/* COMMENT SECTION COMMENT SECTION COMMENT SECTION */}
                <div id="comments-section" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <h3 className="text-md font-bold text-slate-850 dark:text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-indigo-500" />
                    Пикирлер жана суроолор ({comments.length})
                  </h3>

                  {/* Comment input form */}
                  <form onSubmit={handleAddComment} className="flex gap-3">
                    <input
                      id="input-comment-text"
                      type="text"
                      placeholder="Материал жөнүндө пикириңизди жазыңыз..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white text-sm"
                    />
                    <button
                      id="btn-comment-submit"
                      type="submit"
                      className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow"
                    >
                      <Send className="h-4 w-4" />
                      Жөнөтүү
                    </button>
                  </form>

                  {/* Comment thread */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="font-bold text-sm text-slate-800 dark:text-white block">{comment.author}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(comment.createdAt).toLocaleString("ky-KG")}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Edit / Delete commenting options if author is currentUser */}
                            {comment.authorId === (currentUser?.id || "user-anonymous") && (
                              <div className="flex gap-1 mr-2">
                                <button
                                  id={`btn-edit-comment-${comment.id}`}
                                  onClick={() => handleStartEditComment(comment.id, comment.text)}
                                  className="p-1 text-slate-400 hover:text-indigo-500 transition"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  id={`btn-del-comment-${comment.id}`}
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}

                            <button
                              id={`btn-like-comment-${comment.id}`}
                              onClick={() => handleLikeComment(comment.id)}
                              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-550 transition flex items-center gap-1"
                            >
                              ❤️ {comment.likes}
                            </button>
                          </div>
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="flex gap-2">
                            <input
                              id="input-edit-comment-text"
                              type="text"
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border rounded-lg text-xs"
                            />
                            <button
                              id="btn-save-edit-comment"
                              onClick={() => handleSaveEditComment(comment.id)}
                              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                            >
                              Сактоо
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {comment.text}
                          </p>
                        )}

                        {/* Replies thread */}
                        {comment.replies && comment.replies.map((reply) => (
                          <div key={reply.id} className="ml-6 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-850 space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-bold text-slate-800 dark:text-white">{reply.author}</span>
                              <span className="text-slate-400">{new Date(reply.createdAt).toLocaleDateString("ky-KG")}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{reply.text}</p>
                          </div>
                        ))}

                        {/* Reply box trigger */}
                        <div className="ml-6">
                          {activeReplyBox === comment.id ? (
                            <div className="flex gap-2 mt-2">
                              <input
                                id={`input-reply-${comment.id}`}
                                type="text"
                                placeholder="Жооп жазуу..."
                                value={replyTexts[comment.id] || ""}
                                onChange={(e) => setReplyTexts({ ...replyTexts, [comment.id]: e.target.value })}
                                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border rounded-lg text-xs"
                              />
                              <button
                                id={`btn-reply-submit-${comment.id}`}
                                onClick={() => handlePostReply(comment.id)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold"
                              >
                                Жооп берүү
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`btn-show-reply-box-${comment.id}`}
                              onClick={() => setActiveReplyBox(comment.id)}
                              className="text-[11px] font-bold text-indigo-500 hover:underline"
                            >
                              Жооп кайтаруу
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {comments.length === 0 && (
                      <p className="text-xs text-slate-400 italic text-center py-4">Бул материалга азырынча пикир калтырыла элек. Биринчи болуп жазыңыз!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column: Sticky metadata and Quick Action toolbar */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-24 space-y-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-850 pb-3">
                    Материалдын куралдары
                  </h3>

                  <div className="space-y-3">
                    <button
                      id="btn-download-detail"
                      onClick={() => handleDownloadFile(selectedMaterial)}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
                    >
                      <Download className="h-4.5 w-4.5" />
                      Файлды жүктөө
                    </button>

                    <button
                      id="btn-share-detail"
                      onClick={() => handleOpenShare(selectedMaterial)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Бөлүшүү
                    </button>

                    <button
                      id="btn-print-detail"
                      onClick={handlePrintDocument}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      Басып чыгаруу (Print)
                    </button>

                    <button
                      id="btn-fav-detail"
                      onClick={() => handleToggleFavorite(selectedMaterial.id)}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2"
                    >
                      <Heart className={`h-4 w-4 ${currentUser?.favorites?.includes(selectedMaterial.id) ? "fill-red-500 text-red-500" : ""}`} />
                      {currentUser?.favorites?.includes(selectedMaterial.id) ? "Сүйүктүүлөрдөн өчүрүү" : "Сүйүктүүлөргө кошуу"}
                    </button>
                  </div>

                  {/* Similarity recommendation engine */}
                  <div className="border-t border-slate-50 dark:border-slate-850 pt-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-450 uppercase tracking-wider">Окшош материалдар</h4>
                    <div className="space-y-2">
                      {materials
                        .filter(m => m.id !== selectedMaterial.id && (m.subject === selectedMaterial.subject || m.classLevel === selectedMaterial.classLevel))
                        .slice(0, 2)
                        .map(m => (
                          <button
                            key={m.id}
                            id={`btn-similar-${m.id}`}
                            onClick={() => setSelectedMaterialId(m.id)}
                            className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-between transition text-xs"
                          >
                            <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{m.title}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        )}

        {/* VIEW: TOOLS PAGE */}
        {activeView === "tools" && (
          <div id="view-tools" className="space-y-8 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Мугалимдер үчүн Санариптик AI Куралдар</h2>
              <p className="text-sm text-slate-500">Сабакта күнүмдүк колдонулуучу 10дон ашык куралдар топтому. Баары толугу менен реалдуу иштеп, сизге убакытты үнөмдөөгө жардам берет.</p>
            </div>
            <ToolsContainer 
              initialTool={selectedToolId} 
              onShowNotification={showNotification} 
            />
          </div>
        )}

        {/* VIEW: TEACHER CABIN / DASHBOARD VIEW */}
        {activeView === "dashboard" && (
          <div id="view-dashboard" className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-850 pb-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Жеке Кабинетиңиз</h2>
                <p className="text-xs text-slate-400 mt-1">Иш кагаздарын, сабак материалдарын жана аналитикаларды башкаруу жайы.</p>
              </div>
            </div>
            <TeacherDashboard
              currentUser={currentUser}
              onShowNotification={showNotification}
              onSelectMaterial={setSelectedMaterialId}
              editingMaterialFromAdmin={editingMaterialFromAdmin}
              clearAdminEditing={() => setEditingMaterialFromAdmin(null)}
            />
          </div>
        )}

        {/* VIEW: ADMIN PANEL */}
        {activeView === "admin" && (
          <div id="view-admin" className="space-y-8 animate-fade-in">
            <AdminPanel
              onShowNotification={showNotification}
              onEditMaterial={(mat) => {
                setEditingMaterialFromAdmin(mat);
                setActiveView("dashboard"); // redirect to Dashboard form
              }}
              onSelectMaterial={setSelectedMaterialId}
            />
          </div>
        )}

        {/* VIEW: FAQ PAGE */}
        {activeView === "faq" && (
          <div id="view-faq" className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">Көп берилүүчү суроолор (FAQ)</h2>
              <p className="text-sm text-slate-500">Teacher Hub санариптик уюлдук платформасы жөнүндө кенен маалыматтар.</p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, idx) => (
                <div key={idx} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="h-4.5 w-4.5 text-indigo-500" />
                    {item.q}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pl-6">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: SUBSCRIPTION PAGE */}
        {activeView === "subscription" && (
          <SubscriptionView
            lang={lang}
            currentUser={currentUser}
            onUpdateUser={setCurrentUser}
            onShowNotification={showNotification}
            onOpenAuth={() => { setAuthMode("login"); setIsAuthModalOpen(true); }}
          />
        )}

        {/* VIEW: ABOUT PAGE */}
        {activeView === "about" && (
          <div id="view-about" className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-8 space-y-6 animate-fade-in">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Биз жөнүндө</h2>
            <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">
              Teacher Hub — бул Кыргызстандагы мектеп билим берүү стандарттарын санариптештирүү жана заманбап залкар усулдарды жайылтуу максатында түзүлгөн платформа. Биздин максат — заманбап кыргыз тилдүү мугалимдерди технологиялык куралдар жана инновациялык AI жардамчылары менен камсыз кылып, сабакка даярдануу убактысын 90%га кыскартуу.
            </p>
            <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">
              Платформада колдонулган ар бир баскыч, курал, конвертер жана маалымат базасы толугу менен функционалдуу болуп, мугалимдердин чыныгы муктаждыктарына негизделген.
            </p>
          </div>
        )}

        {/* VIEW: CONTACT PAGE */}
        {activeView === "contact" && (
          <div id="view-contact" className="max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl p-8 space-y-6 animate-fade-in text-center">
            <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Байланыш маалыматтары</h2>
              <p className="text-xs text-slate-400">Платформа боюнча суроо же сунуштарыңыз болсо, каалаган убакта жазыңыз.</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-between">
                <span className="text-slate-400 text-xs">Email дарек:</span>
                <span className="font-semibold text-slate-800 dark:text-white">ramis220813@gmail.com</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-between">
                <span className="text-slate-400 text-xs">Телефон/WhatsApp:</span>
                <span className="font-semibold text-slate-800 dark:text-white">+996 (500) 123-456</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-md font-black text-slate-900 dark:text-white">Teacher Hub</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Мугалимдер үчүн Кыргызстандагы эң заманбап санариптик жардамчы платформасы.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Биз жөнүндө</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button id="btn-footer-about" onClick={() => { setActiveView("about"); setSelectedMaterialId(null); }} className="text-slate-500 hover:text-indigo-600">Платформа жөнүндө</button>
              </li>
              <li>
                <button id="btn-footer-contact" onClick={() => { setActiveView("contact"); setSelectedMaterialId(null); }} className="text-slate-500 hover:text-indigo-600">Байланыш</button>
              </li>
              <li>
                <button id="btn-footer-faq" onClick={() => { setActiveView("faq"); setSelectedMaterialId(null); }} className="text-slate-500 hover:text-indigo-600">Көп берилүүчү суроолор</button>
              </li>
              <li>
                <button id="btn-footer-subscription" onClick={() => { setActiveView("subscription"); setSelectedMaterialId(null); }} className="text-slate-500 hover:text-indigo-600 font-bold text-indigo-500">Жазылуу жана тарифтер</button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Байланыштар</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a id="footer-telegram" href="https://t.me" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600">Telegram канал</a>
              </li>
              <li>
                <a id="footer-whatsapp" href="https://wa.me" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-600">WhatsApp группа</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Коопсуздук</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button id="btn-footer-privacy" onClick={() => showNotification("Купуялуулук саясаты жүктөлдү (Кыргызстан мектептер кодекси).")} className="text-slate-500 hover:text-indigo-600">Privacy Policy</button>
              </li>
              <li>
                <button id="btn-footer-terms" onClick={() => showNotification("Платформанын шарттары жана эрежелери кабыл алынды.")} className="text-slate-500 hover:text-indigo-600">Terms of Service</button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 dark:border-slate-900 mt-8 pt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Teacher Hub. Бардык укуктар корголгон.
        </div>
      </footer>

      {/* FLOATING AI CHAT WIDGET */}
      <div className="fixed bottom-6 right-6 z-40">
        {isChatOpen ? (
          <div id="ai-chat-box" className="bg-white dark:bg-slate-900 w-[350px] sm:w-[400px] h-[500px] rounded-3xl shadow-2xl border border-indigo-100 dark:border-slate-800 flex flex-col justify-between overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="bg-indigo-600 px-5 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <div>
                  <h4 className="font-bold text-sm">Санариптик AI Жардамчы</h4>
                  <span className="text-[10px] opacity-75">Тез жана коопсуз жооптор</span>
                </div>
              </div>
              <button
                id="btn-close-chat"
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`p-3.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm"
                  }`}>
                    {msg.text}

                    {/* Quick export helper for AI answer */}
                    {msg.role === "ai" && i > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 justify-end text-[10px]">
                        <button
                          id={`btn-copy-chat-${i}`}
                          onClick={() => { navigator.clipboard.writeText(msg.text); showNotification("Жооп көчүрүлдү!"); }}
                          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                        >
                          Көчүрүү
                        </button>
                        <span>•</span>
                        <button
                          id={`btn-export-chat-word-${i}`}
                          onClick={() => {
                            const blob = new Blob([msg.text], { type: "text/plain;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            const element = document.createElement("a");
                            element.href = url;
                            element.download = "AI_Сунуш.docx";
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                            showNotification("Документ жүктөлүп жатат...");
                          }}
                          className="text-emerald-600 font-bold hover:underline"
                        >
                          Word (DOCX)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-850 border p-3 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center gap-1.5 shadow-sm">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    AI жооп даярдап жатат...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900 shrink-0">
              <input
                id="input-chat"
                type="text"
                placeholder="Сабак суроосун жазыңыз..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-xs text-slate-850 dark:text-white"
              />
              <button
                id="btn-chat-send"
                type="submit"
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shrink-0"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        ) : (
          <button
            id="btn-open-chat"
            onClick={() => setIsChatOpen(true)}
            className="h-14 w-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-2xl transition transform hover:scale-105"
            title="AI Жардамчы"
          >
            <Sparkles className="h-6 w-6 animate-pulse" />
          </button>
        )}
      </div>

    </div>
  );
}
