import React, { useState, useEffect, useRef } from "react";
import { 
  Wand2, FileText, Image, RefreshCw, QrCode, Timer, Clock, 
  UserCheck, Calculator, Download, Copy, Play, Pause, RotateCcw, 
  Plus, Trash2, CheckCircle, Volume2
} from "lucide-react";
import { SUBJECTS, CLASSES } from "../utils/constants";
import { SlideshowViewer } from "./SlideshowViewer";

interface ToolsContainerProps {
  initialTool?: string;
  onShowNotification: (msg: string, type: "success" | "error") => void;
}

export default function ToolsContainer({ initialTool = "lesson_plan", onShowNotification }: ToolsContainerProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTool);

  // 1. AI Generators State
  const [aiTopic, setAiTopic] = useState("");
  const [aiSubject, setAiSubject] = useState(SUBJECTS[0]);
  const [aiClass, setAiClass] = useState(CLASSES[4]); // 5-class default
  const [aiDuration, setAiDuration] = useState("45 мүнөт");
  const [aiQuestionsCount, setAiQuestionsCount] = useState("5");
  const [aiDifficulty, setAiDifficulty] = useState("Орто");
  const [aiSlidesCount, setAiSlidesCount] = useState("5");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  // Playable AI Generated Game State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [showGameFinished, setShowGameFinished] = useState(false);

  // When AI topic changes or aiResult is updated, reset game play state!
  useEffect(() => {
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setIsAnswerChecked(false);
    setScore(0);
    setShowGameFinished(false);
  }, [aiResult]);

  // 2. Converters State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertedDownloadUrl, setConvertedDownloadUrl] = useState("");
  const [convertedName, setConvertedName] = useState("");

  // 3. QR Generator State
  const [qrText, setQrText] = useState("https://teacherhub.kg");
  const [qrCodeUrl, setQrCodeUrl] = useState(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent("https://teacherhub.kg")}`);

  // 4. Timer State
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerLeft, setTimerLeft] = useState(300); // 5 mins in secs
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 5. Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0); // in deciseconds (1/10s)
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<string[]>([]);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  // 6. Random Picker State
  const [studentInput, setStudentInput] = useState("");
  const [students, setStudents] = useState<string[]>([
    "Айбек Маматов", "Бакыт уулу Темир", "Гулиза Асанова", 
    "Жылдыз Садыкова", "Канат Касымов", "Нурбек Токтосунов"
  ]);
  const [picking, setPicking] = useState(false);
  const [pickedStudent, setPickedStudent] = useState<string | null>(null);

  // 7. Grade Calculator State
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [wrongAnswers, setWrongAnswers] = useState(3);
  const [calculatedGrade, setCalculatedGrade] = useState<{
    score: number;
    percent: number;
    grade: string;
    description: string;
  } | null>(null);

  // Ensure active tool matches if passed from outside
  useEffect(() => {
    if (initialTool) {
      setActiveTab(initialTool);
    }
  }, [initialTool]);

  // Grade Calculation hook
  useEffect(() => {
    if (totalQuestions <= 0) return;
    const correct = Math.max(0, totalQuestions - wrongAnswers);
    const percent = Math.round((correct / totalQuestions) * 100);
    
    let grade = "2";
    let desc = "Канааттандырарлык эмес (Жетишсиз)";
    if (percent >= 85) {
      grade = "5";
      desc = "Эң жакшы (Эң жогорку жетишкендик)";
    } else if (percent >= 70) {
      grade = "4";
      desc = "Жакшы (Жогорку деңгээл)";
    } else if (percent >= 50) {
      grade = "3";
      desc = "Канааттандырарлык (Орто деңгээл)";
    }

    setCalculatedGrade({
      score: correct,
      percent,
      grade,
      description: desc
    });
  }, [totalQuestions, wrongAnswers]);

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            onShowNotification("Убакыт бүттү!", "success");
            // Simple audio beep simulation
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              osc.type = "sine";
              osc.frequency.setValueAtTime(440, audioCtx.currentTime);
              osc.connect(audioCtx.destination);
              osc.start();
              osc.stop(audioCtx.currentTime + 1);
            } catch(e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  // Stopwatch logic
  useEffect(() => {
    if (stopwatchRunning) {
      stopwatchRef.current = setInterval(() => {
        setStopwatchTime((prev) => prev + 1);
      }, 100);
    } else {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    }
    return () => {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    };
  }, [stopwatchRunning]);

  // AI Generation Trigger
  const handleAiGenerate = async (type: string) => {
    if (!aiTopic.trim()) {
      onShowNotification("Сураныч, теманы киргизиңиз", "error");
      return;
    }

    setAiLoading(true);
    setAiResult("");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolType: type,
          topic: aiTopic,
          subject: aiSubject,
          classLevel: aiClass,
          duration: aiDuration,
          questionsCount: aiQuestionsCount,
          difficulty: aiDifficulty,
          slidesCount: aiSlidesCount
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAiResult(data.text);
        onShowNotification("Ийгиликтүү түзүлдү!", "success");
      } else {
        onShowNotification(data.error || "Генерация катасы", "error");
      }
    } catch (err) {
      onShowNotification("Тармак катасы кетти", "error");
    } finally {
      setAiLoading(false);
    }
  };

  // Convert PDF to Word
  const handlePdfToWord = async () => {
    if (!pdfFile) {
      onShowNotification("Сураныч, PDF файлын тандаңыз", "error");
      return;
    }
    setConverting(true);
    setConvertedDownloadUrl("");
    try {
      const res = await fetch("/api/tools/pdf-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: pdfFile.name })
      });
      const data = await res.json();
      if (res.ok) {
        setConvertedDownloadUrl(data.downloadUrl);
        setConvertedName(data.convertedName);
        onShowNotification("Конвертация ийгиликтүү аяктады!", "success");
      } else {
        onShowNotification("Ката кетти", "error");
      }
    } catch (e) {
      onShowNotification("Конвертация катасы", "error");
    } finally {
      setConverting(false);
    }
  };

  // Convert Word to PDF
  const handleWordToPdf = async () => {
    if (!wordFile) {
      onShowNotification("Сураныч, Word файлын тандаңыз", "error");
      return;
    }
    setConverting(true);
    setConvertedDownloadUrl("");
    try {
      const res = await fetch("/api/tools/word-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: wordFile.name })
      });
      const data = await res.json();
      if (res.ok) {
        setConvertedDownloadUrl(data.downloadUrl);
        setConvertedName(data.convertedName);
        onShowNotification("Конвертация ийгиликтүү аяктады!", "success");
      } else {
        onShowNotification("Ката кетти", "error");
      }
    } catch (e) {
      onShowNotification("Конвертация катасы", "error");
    } finally {
      setConverting(false);
    }
  };

  // QR Code generator trigger
  const handleQrGenerate = () => {
    if (!qrText.trim()) return;
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrText)}`);
    onShowNotification("QR код жаңыланды", "success");
  };

  // Timer helper
  const handleStartTimer = () => {
    setTimerLeft(timerMinutes * 60 + timerSeconds);
    setTimerRunning(true);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimerLeft(timerMinutes * 60 + timerSeconds);
  };

  const formatTimerTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Stopwatch helper
  const formatStopwatchTime = (time: number) => {
    const totalSecs = Math.floor(time / 10);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const ds = time % 10;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${ds}`;
  };

  const handleAddLap = () => {
    setLaps((prev) => [...prev, formatStopwatchTime(stopwatchTime)]);
  };

  const handleResetStopwatch = () => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  // Student Picker helper
  const handleAddStudent = () => {
    if (!studentInput.trim()) return;
    setStudents((prev) => [...prev, studentInput.trim()]);
    setStudentInput("");
  };

  const handleRemoveStudent = (idx: number) => {
    setStudents((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePickStudent = () => {
    if (students.length === 0) {
      onShowNotification("Окуучулардын тизмеси бош!", "error");
      return;
    }
    setPicking(true);
    setPickedStudent(null);
    let counter = 0;
    const interval = setInterval(() => {
      const tempIdx = Math.floor(Math.random() * students.length);
      setPickedStudent(students[tempIdx]);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setPicking(false);
        onShowNotification("Жеңүүчү тандалды!", "success");
      }
    }, 120);
  };

  // Copy result helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    onShowNotification("Алмашууга көчүрүлдү!", "success");
  };

  // Simulated export to download file
  const exportAsFile = (text: string, title: string, ext: "docx" | "pdf") => {
    const filename = `${title.replace(/\s+/g, "_")}.${ext}`;
    const element = document.createElement("a");
    const headerText = `=====================================================\nTEACHER HUB AI GENERATOR: ${title.toUpperCase()}\nКүнү: ${new Date().toLocaleDateString("ky-KG")}\n=====================================================\n\n`;
    const file = new Blob([headerText + text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    onShowNotification(`${ext.toUpperCase()} форматында жүктөлүп жатат...`, "success");
  };

  return (
    <div id="tools-section" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[600px]">
        {/* Left Side: Navigation tabs */}
        <div className="bg-slate-50 dark:bg-slate-950 p-6 border-r border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 tracking-tight px-2 flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-indigo-500 animate-pulse" />
            Санариптик Инструменттер
          </h3>
          <nav className="space-y-1.5">
            {[
              { id: "lesson_plan", label: "Сабак планы генератору", icon: FileText, category: "AI Куралдар" },
              { id: "game_generator", label: "Оюн генератору", icon: Play, category: "AI Куралдар" },
              { id: "quiz", label: "Тест генератору", icon: CheckCircle, category: "AI Куралдар" },
              { id: "presentation", label: "Презентация генератору", icon: Image, category: "AI Куралдар" },
              { id: "pdf_to_word", label: "PDF ➔ Word", icon: RefreshCw, category: "Файлдар" },
              { id: "word_to_pdf", label: "Word ➔ PDF", icon: RefreshCw, category: "Файлдар" },
              { id: "qr_generator", label: "QR код генератору", icon: QrCode, category: "Класстык куралдар" },
              { id: "timer", label: "Класстык таймер", icon: Timer, category: "Класстык куралдар" },
              { id: "stopwatch", label: "Секундомер", icon: Clock, category: "Класстык куралдар" },
              { id: "picker", label: "Окуучу тандагыч", icon: UserCheck, category: "Класстык куралдар" },
              { id: "grade_calculator", label: "Баа калькулятору", icon: Calculator, category: "Эсептөөлөр" },
            ].map((tool, idx, arr) => {
              const showCategory = idx === 0 || arr[idx - 1].category !== tool.category;
              return (
                <div key={tool.id}>
                  {showCategory && (
                    <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mt-4 mb-1.5">
                      {tool.category}
                    </div>
                  )}
                  <button
                    id={`btn-tab-${tool.id}`}
                    onClick={() => {
                      setActiveTab(tool.id);
                      setAiResult("");
                      setConvertedDownloadUrl("");
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition duration-200 flex items-center gap-3 ${
                      activeTab === tool.id
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                    }`}
                  >
                    <tool.icon className={`h-4.5 w-4.5 ${activeTab === tool.id ? "text-white" : "text-slate-400 dark:text-slate-500"}`} />
                    <span>{tool.label}</span>
                  </button>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Tab Contents */}
        <div className="lg:col-span-3 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-slate-900">
          <div>
            {/* 1. LESSON PLAN GENERATOR */}
            {activeTab === "lesson_plan" && (
              <div id="tool-lesson-plan" className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Сабак планынын AI генератору</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Бир нече секундда кадам-кадам менен иштелип чыккан, Кыргызстандын мектеп стандартындагы кооз сабак пландарын түзүңүз.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Сабактын темасы</label>
                    <input
                      id="input-topic"
                      type="text"
                      placeholder="Мисалы: Сын атоочтун жасалышы же Эки белгисиздүү теңдемелер..."
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Предмет</label>
                    <select
                      id="select-subject"
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      {SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Класс</label>
                    <select
                      id="select-class"
                      value={aiClass}
                      onChange={(e) => setAiClass(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Сабактын узактыгы</label>
                    <select
                      id="select-duration"
                      value={aiDuration}
                      onChange={(e) => setAiDuration(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      <option value="45 мүнөт">45 мүнөт (Стандарт)</option>
                      <option value="90 мүнөт">90 мүнөт (Кош сабак)</option>
                      <option value="30 мүнөт">30 мүнөт (Кыскартылган)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    id="btn-generate-lesson"
                    onClick={() => handleAiGenerate("lesson_plan")}
                    disabled={aiLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition duration-200 flex items-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                  >
                    <Wand2 className="h-4 w-4 animate-spin-slow" />
                    {aiLoading ? "Генерацияланууда..." : "Сабак планын түзүү"}
                  </button>
                </div>
              </div>
            )}

            {/* 1.5. GAME GENERATOR */}
            {activeTab === "game_generator" && (
              <div id="tool-game-generator" className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Интерактивдүү оюндун AI генератору</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Сиз тандаган тема, предмет жана класс деңгээлине жараша окуучулар үчүн интерактивдүү оюн-тест түзүңүз.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Сабактын / Оюндун темасы</label>
                    <input
                      id="input-game-topic"
                      type="text"
                      placeholder="Мисалы: Сын атоочтун жасалышы же Эки белгисиздүү теңдемелер..."
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Предмет</label>
                    <select
                      id="select-game-subject"
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      {SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Класс</label>
                    <select
                      id="select-game-class"
                      value={aiClass}
                      onChange={(e) => setAiClass(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Кыйындыгы</label>
                    <select
                      id="select-game-difficulty"
                      value={aiDifficulty}
                      onChange={(e) => setAiDifficulty(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      <option value="Оңой">Оңой</option>
                      <option value="Орто">Орто</option>
                      <option value="Кыйын">Кыйын</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    id="btn-generate-game"
                    onClick={() => handleAiGenerate("game_generator")}
                    disabled={aiLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition duration-200 flex items-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                  >
                    <Wand2 className="h-4 w-4 animate-spin-slow" />
                    {aiLoading ? "Оюн куралууда..." : "Интерактивдүү оюн түзүү"}
                  </button>
                </div>
              </div>
            )}

            {/* 2. QUIZ GENERATOR */}
            {activeTab === "quiz" && (
              <div id="tool-quiz" className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Тесттин AI генератору</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Сиз тандаган тема боюнча варианттары жана ачкыч жооптору бар мектеп тесттерин заматта даярдаңыз.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Тема</label>
                    <input
                      id="input-quiz-topic"
                      type="text"
                      placeholder="Мисалы: Клетканын түзүлүшү же Координаттар системасы..."
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Предмет</label>
                    <select
                      id="select-quiz-subject"
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      {SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Класс</label>
                    <select
                      id="select-quiz-class"
                      value={aiClass}
                      onChange={(e) => setAiClass(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Суроолордун саны</label>
                    <select
                      id="select-quiz-questions"
                      value={aiQuestionsCount}
                      onChange={(e) => setAiQuestionsCount(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      <option value="5">5 суроо</option>
                      <option value="10">10 суроо</option>
                      <option value="15">15 суроо</option>
                      <option value="20">20 суроо</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    id="btn-generate-quiz"
                    onClick={() => handleAiGenerate("quiz")}
                    disabled={aiLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition duration-200 flex items-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                  >
                    <Wand2 className="h-4 w-4 animate-spin-slow" />
                    {aiLoading ? "Түзүлүүдө..." : "Тест суроолорун түзүү"}
                  </button>
                </div>
              </div>
            )}

            {/* 3. PRESENTATION GENERATOR */}
            {activeTab === "presentation" && (
              <div id="tool-presentation" className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Презентация структурасынын AI генератору</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Слайд-слайд менен бөлүнгөн мазмунду, максаттарды жана сүрөт сунуштарын камтыган презентация шаблонун алыңыз.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Презентациянын темасы</label>
                    <input
                      id="input-pres-topic"
                      type="text"
                      placeholder="Мисалы: Кыргызстандын кооз жерлери же Глобалдык жылуулануу..."
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Предмет</label>
                    <select
                      id="select-pres-subject"
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      {SUBJECTS.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Класс</label>
                    <select
                      id="select-pres-class"
                      value={aiClass}
                      onChange={(e) => setAiClass(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Слайддардын саны</label>
                    <select
                      id="select-pres-slides"
                      value={aiSlidesCount}
                      onChange={(e) => setAiSlidesCount(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-white text-sm"
                    >
                      <option value="5">5 Слайд</option>
                      <option value="8">8 Слайд</option>
                      <option value="10">10 Слайд</option>
                      <option value="12">12 Слайд</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    id="btn-generate-pres"
                    onClick={() => handleAiGenerate("presentation")}
                    disabled={aiLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition duration-200 flex items-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                  >
                    <Wand2 className="h-4 w-4 animate-spin-slow" />
                    {aiLoading ? "Генерацияланууда..." : "Презентация түзүү"}
                  </button>
                </div>
              </div>
            )}

            {/* AI Generator Result Viewer */}
            {aiResult && (
              activeTab === "presentation" ? (
                <div id="presentation-result-panel" className="mt-8 space-y-4">
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    Мугалимдин презентациясы даяр болду! Төмөндөн көрүп, теманы тандап, же толук экранда көрсөтүңүз:
                  </div>
                  <SlideshowViewer rawMarkdown={aiResult} topic={aiTopic} subject={aiSubject} />
                </div>
              ) : activeTab === "game_generator" ? (
                (() => {
                  let questions: any[] = [];
                  try {
                    let cleanJson = aiResult.trim();
                    if (cleanJson.startsWith("```")) {
                      cleanJson = cleanJson.replace(/^```(json)?/, "").replace(/```$/, "").trim();
                    }
                    questions = JSON.parse(cleanJson);
                  } catch (e) {
                    console.error("JSON parse error in ToolsContainer:", e);
                  }

                  if (!Array.isArray(questions) || questions.length === 0) {
                    return (
                      <div className="mt-8 p-6 bg-red-50 dark:bg-slate-950 rounded-2xl border border-red-100 dark:border-slate-800">
                        <p className="text-sm text-red-600 dark:text-red-400">Оюн маалыматын окууда ката кетти. Төмөнкү текстти көчүрүп алсаңыз болот:</p>
                        <pre className="text-xs mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-auto whitespace-pre-wrap text-slate-800 dark:text-white">{aiResult}</pre>
                      </div>
                    );
                  }

                  const currentQ = questions[currentQuestionIdx];

                  return (
                    <div id="game-preview-panel" className="mt-8 p-6 bg-indigo-50/50 dark:bg-slate-950 rounded-2xl border border-indigo-100 dark:border-slate-800 transition duration-300">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-indigo-100/50 dark:border-slate-800 pb-3">
                        <div className="text-sm font-bold text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
                          <Play className="h-4.5 w-4.5 text-indigo-500 fill-indigo-500 animate-pulse" />
                          Түзүлгөн оюнду текшерип көрүңүз! ({currentQuestionIdx + 1}/{questions.length})
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            id="btn-copy-game-json"
                            onClick={() => copyToClipboard(aiResult)}
                            className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Оюндун кодун көчүрүү
                          </button>
                        </div>
                      </div>

                      {showGameFinished ? (
                        <div className="text-center py-8 space-y-4">
                          <div className="inline-flex items-center justify-center p-4 bg-emerald-100 dark:bg-emerald-950 rounded-full text-emerald-600 dark:text-emerald-400 mb-2 animate-bounce">
                            <CheckCircle className="h-10 w-10" />
                          </div>
                          <h5 className="text-lg font-bold text-slate-900 dark:text-white">Оюн аяктады!</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Сиздин жыйынтык: <span className="font-bold text-indigo-600 dark:text-indigo-400">{score}</span> / {questions.length} туура жооп</p>
                          <button
                            id="btn-restart-game"
                            onClick={() => {
                              setCurrentQuestionIdx(0);
                              setSelectedOptionIdx(null);
                              setIsAnswerChecked(false);
                              setScore(0);
                              setShowGameFinished(false);
                            }}
                            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
                          >
                            Кайра ойноо
                          </button>
                        </div>
                      ) : currentQ ? (
                        <div className="space-y-6">
                          <div className="text-base font-semibold text-slate-800 dark:text-white">
                            {currentQ.q}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentQ.options?.map((option: string, idx: number) => {
                              let optionStyle = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800";
                              if (isAnswerChecked) {
                                if (idx === currentQ.correct) {
                                  optionStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400";
                                } else if (idx === selectedOptionIdx) {
                                  optionStyle = "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400";
                                }
                              } else if (idx === selectedOptionIdx) {
                                optionStyle = "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400";
                              }

                              return (
                                <button
                                  key={idx}
                                  disabled={isAnswerChecked}
                                  onClick={() => setSelectedOptionIdx(idx)}
                                  className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition duration-200 ${optionStyle}`}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>

                          {isAnswerChecked && (
                            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl space-y-1">
                              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Түшүндүрмө:</div>
                              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{currentQ.explanation}</div>
                            </div>
                          )}

                          <div className="flex justify-end gap-2">
                            {!isAnswerChecked ? (
                              <button
                                id="btn-check-answer"
                                disabled={selectedOptionIdx === null}
                                onClick={() => {
                                  setIsAnswerChecked(true);
                                  if (selectedOptionIdx === currentQ.correct) {
                                    setScore((prev) => prev + 1);
                                  }
                                }}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition animate-pulse"
                              >
                                Текшерүү
                              </button>
                            ) : (
                              <button
                                id="btn-next-question"
                                onClick={() => {
                                  if (currentQuestionIdx + 1 < questions.length) {
                                    setCurrentQuestionIdx((prev) => prev + 1);
                                    setSelectedOptionIdx(null);
                                    setIsAnswerChecked(false);
                                  } else {
                                    setShowGameFinished(true);
                                  }
                                }}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
                              >
                                {currentQuestionIdx + 1 < questions.length ? "Кийинки суроо" : "Жыйынтыктоо"}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })()
              ) : (
                <div id="ai-result-panel" className="mt-8 p-6 bg-indigo-50/50 dark:bg-slate-950 rounded-2xl border border-indigo-100 dark:border-slate-800 transition duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-indigo-100/50 dark:border-slate-800 pb-3">
                    <div className="text-sm font-bold text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Жыйынтык даяр болду!
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-copy-result"
                        onClick={() => copyToClipboard(aiResult)}
                        className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Көчүрүү
                      </button>
                      <button
                        id="btn-export-word"
                        onClick={() => exportAsFile(aiResult, aiTopic || "генерация", "docx")}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Word (DOCX)
                      </button>
                      <button
                        id="btn-export-pdf"
                        onClick={() => exportAsFile(aiResult, aiTopic || "генерация", "pdf")}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </button>
                    </div>
                  </div>
                  <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans max-h-[400px] overflow-y-auto pr-2">
                    {aiResult}
                  </div>
                </div>
              )
            )}

            {/* 4. PDF TO WORD CONVERTER */}
            {activeTab === "pdf_to_word" && (
              <div id="tool-pdf-word" className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">PDF ➔ Word Конвертер</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Өзүңүздүн PDF файлыңызды тандаңыз, биз аны Word (DOCX) форматына реалдуу убакытта конвертациялап беребиз.
                  </p>
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-950 transition hover:bg-slate-100/50">
                  <input
                    id="input-pdf-file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPdfFile(e.target.files[0]);
                        setConvertedDownloadUrl("");
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="input-pdf-file" className="cursor-pointer block">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <span className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 block">
                      {pdfFile ? pdfFile.name : "Файлды тандоо же бул жерге таштоо"}
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">Максималдуу файл көлөмү: 25 MB (.pdf гана)</span>
                  </label>
                </div>

                {pdfFile && !convertedDownloadUrl && (
                  <div className="flex justify-end">
                    <button
                      id="btn-convert-pdf"
                      onClick={handlePdfToWord}
                      disabled={converting}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${converting ? "animate-spin" : ""}`} />
                      {converting ? "Конвертацияланууда..." : "Word форматына айландыруу"}
                    </button>
                  </div>
                )}

                {convertedDownloadUrl && (
                  <div id="download-panel-pdf" className="p-4 bg-emerald-50 dark:bg-slate-950 border border-emerald-100 dark:border-emerald-950/40 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Конвертация ийгиликтүү бүттү!</p>
                      <p className="text-xs text-slate-500 mt-0.5">{convertedName}</p>
                    </div>
                    <a
                      id="btn-download-converted-pdf"
                      href={convertedDownloadUrl}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Жүктөп алуу
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* 5. WORD TO PDF CONVERTER */}
            {activeTab === "word_to_pdf" && (
              <div id="tool-word-pdf" className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Word ➔ PDF Конвертер</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Өзүңүздүн Word (.docx, .doc) файлыңызды тандаңыз, биз аны кооз жана басып чыгарууга даяр PDF файлына айландырабыз.
                  </p>
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-950 transition hover:bg-slate-100/50">
                  <input
                    id="input-word-file"
                    type="file"
                    accept=".docx,.doc"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setWordFile(e.target.files[0]);
                        setConvertedDownloadUrl("");
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="input-word-file" className="cursor-pointer block">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <span className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 block">
                      {wordFile ? wordFile.name : "Файлды тандоо же бул жерге таштоо"}
                    </span>
                    <span className="text-xs text-slate-400 block mt-1">Максималдуу файл көлөмү: 25 MB (.docx, .doc гана)</span>
                  </label>
                </div>

                {wordFile && !convertedDownloadUrl && (
                  <div className="flex justify-end">
                    <button
                      id="btn-convert-word"
                      onClick={handleWordToPdf}
                      disabled={converting}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${converting ? "animate-spin" : ""}`} />
                      {converting ? "Конвертацияланууда..." : "PDF форматына айландыруу"}
                    </button>
                  </div>
                )}

                {convertedDownloadUrl && (
                  <div id="download-panel-word" className="p-4 bg-emerald-50 dark:bg-slate-950 border border-emerald-100 dark:border-emerald-950/40 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Конвертация ийгиликтүү бүттү!</p>
                      <p className="text-xs text-slate-500 mt-0.5">{convertedName}</p>
                    </div>
                    <a
                      id="btn-download-converted-word"
                      href={convertedDownloadUrl}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Жүктөп алуу
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* 6. QR CODE GENERATOR */}
            {activeTab === "qr_generator" && (
              <div id="tool-qr" className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">QR код генератору</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Шилтемени, телефон номерин же текстти жазып, окуучуларыңыздын телефондон ачуусу үчүн чыныгы QR код түзүңүз.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">QR коддогу текст же шилтеме</label>
                      <textarea
                        id="textarea-qr"
                        rows={3}
                        value={qrText}
                        onChange={(e) => setQrText(e.target.value)}
                        placeholder="Мисалы: https://youtube.com/сабак же окуучуларга жашыруун кат..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white text-sm"
                      />
                    </div>
                    <button
                      id="btn-generate-qr"
                      onClick={handleQrGenerate}
                      className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition"
                    >
                      QR кодун түзүү
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <img
                      id="img-qr-code"
                      src={qrCodeUrl}
                      alt="Teacher Hub QR Code"
                      className="w-48 h-48 bg-white p-2 rounded-lg shadow-inner border border-slate-200"
                    />
                    <a
                      id="btn-download-qr"
                      href={qrCodeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                    >
                      <Download className="h-3.5 w-3.5" />
                      QR кодун сактоо
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* 7. CLASS TIMER */}
            {activeTab === "timer" && (
              <div id="tool-timer" className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Класстык таймер</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Сабактагы өз алдынча иштер, тесттер же группалык талкуу убактысын башкаруу үчүн эң сонун таймер.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center py-6">
                  <div className="text-6xl sm:text-7xl font-mono font-bold text-slate-800 dark:text-white tracking-widest bg-slate-50 dark:bg-slate-950 px-8 py-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner mb-6">
                    {timerRunning ? formatTimerTime(timerLeft) : `${String(timerMinutes).padStart(2, "0")}:${String(timerSeconds).padStart(2, "0")}`}
                  </div>

                  {/* Settings slider/inputs if not running */}
                  {!timerRunning && (
                    <div className="flex items-center gap-4 mb-6">
                      <div>
                        <label className="block text-center text-xs text-slate-400 mb-1">Мүнөт</label>
                        <input
                          id="input-timer-min"
                          type="number"
                          min="0"
                          max="90"
                          value={timerMinutes}
                          onChange={(e) => setTimerMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-semibold text-slate-800 dark:text-white"
                        />
                      </div>
                      <span className="text-xl font-bold mt-4 text-slate-400">:</span>
                      <div>
                        <label className="block text-center text-xs text-slate-400 mb-1">Секунд</label>
                        <input
                          id="input-timer-sec"
                          type="number"
                          min="0"
                          max="59"
                          value={timerSeconds}
                          onChange={(e) => setTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                          className="w-16 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-semibold text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    {timerRunning ? (
                      <button
                        id="btn-pause-timer"
                        onClick={() => setTimerRunning(false)}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition flex items-center gap-1.5 shadow-md"
                      >
                        <Pause className="h-4 w-4" />
                        Пауза
                      </button>
                    ) : (
                      <button
                        id="btn-start-timer"
                        onClick={handleStartTimer}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                      >
                        <Play className="h-4 w-4" />
                        Баштоо
                      </button>
                    )}
                    <button
                      id="btn-reset-timer"
                      onClick={handleResetTimer}
                      className="px-6 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-xl text-sm transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Калыбына келтирүү
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 8. STOPWATCH */}
            {activeTab === "stopwatch" && (
              <div id="tool-stopwatch" className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Секундомер</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Сабактагы ар кандай ылдамдык, таймаш же интеллектуалдык оюндар үчүн убакытты так өлчөөчү секундомер.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center py-4">
                  <div className="flex-1 text-center md:text-left space-y-6">
                    <div className="text-6xl sm:text-7xl font-mono font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-950 px-8 py-5 rounded-3xl border border-slate-200 dark:border-slate-800 inline-block shadow-inner">
                      {formatStopwatchTime(stopwatchTime)}
                    </div>

                    <div className="flex justify-center md:justify-start gap-4">
                      {stopwatchRunning ? (
                        <button
                          id="btn-pause-stopwatch"
                          onClick={() => setStopwatchRunning(false)}
                          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition flex items-center gap-1.5"
                        >
                          <Pause className="h-4 w-4" />
                          Токтотуу
                        </button>
                      ) : (
                        <button
                          id="btn-start-stopwatch"
                          onClick={() => setStopwatchRunning(true)}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                        >
                          <Play className="h-4 w-4" />
                          Баштоо
                        </button>
                      )}
                      <button
                        id="btn-lap-stopwatch"
                        onClick={handleAddLap}
                        disabled={!stopwatchRunning}
                        className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-semibold rounded-xl text-sm transition"
                      >
                        Айлампа (Lap)
                      </button>
                      <button
                        id="btn-reset-stopwatch"
                        onClick={handleResetStopwatch}
                        className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-xl text-sm transition"
                      >
                        Калыбына келтирүү
                      </button>
                    </div>
                  </div>

                  <div className="w-full md:w-64 max-h-[220px] overflow-y-auto border border-slate-100 dark:border-slate-850 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Айлампалар (Laps)</h5>
                    {laps.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Айлампа белгилене элек.</p>
                    ) : (
                      <ul className="space-y-1.5 font-mono text-sm">
                        {laps.map((lap, i) => (
                          <li key={i} className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-1 text-slate-600 dark:text-slate-300">
                            <span>#{i + 1}</span>
                            <span className="font-bold">{lap}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 9. RANDOM STUDENT PICKER */}
            {activeTab === "picker" && (
              <div id="tool-picker" className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Окуучу тандагыч (Random Picker)</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Класстагы окуучулардын ичинен туш келди бирөөнү тандап, доскага чыгаруу же суроо берүү үчүн сонун усул.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Student list configuration */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-bold text-slate-800 dark:text-white">Окуучулардын тизмеси</h5>
                    <div className="flex gap-2">
                      <input
                        id="input-student-name"
                        type="text"
                        value={studentInput}
                        onChange={(e) => setStudentInput(e.target.value)}
                        placeholder="Окуучунун аты-жөнү..."
                        onKeyDown={(e) => { if (e.key === "Enter") handleAddStudent(); }}
                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none"
                      />
                      <button
                        id="btn-add-student"
                        onClick={handleAddStudent}
                        className="px-3.5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        <Plus className="h-4.5 w-4.5" />
                      </button>
                    </div>

                    <div className="max-h-[200px] overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 space-y-1.5">
                      {students.map((st, i) => (
                        <div key={i} className="flex justify-between items-center text-sm px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                          <span className="text-slate-800 dark:text-slate-200">{st}</span>
                          <button
                            id={`btn-remove-student-${i}`}
                            onClick={() => handleRemoveStudent(i)}
                            className="text-slate-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic selection view */}
                  <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                    <div className={`text-2xl font-bold p-8 rounded-2xl text-center min-h-[110px] flex items-center justify-center transition-all duration-300 ${
                      picking 
                        ? "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 scale-105 animate-pulse" 
                        : pickedStudent 
                        ? "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-900 dark:text-white border-2 border-indigo-500" 
                        : "bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 italic"
                    }`}>
                      {picking ? "Тандалууда..." : pickedStudent || "Окуучу тандала элек"}
                    </div>

                    <button
                      id="btn-pick-student"
                      onClick={handlePickStudent}
                      disabled={picking}
                      className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md disabled:opacity-50"
                    >
                      Туш келди тандоо
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 10. GRADE CALCULATOR */}
            {activeTab === "grade_calculator" && (
              <div id="tool-calculator" className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">Баа калькулятору</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Суроолордун санын жана каталардын санын жазып, кыргыз мектептеринин стандартындагы бааны чыгарыңыз.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Суроолордун жалпы саны</label>
                      <input
                        id="input-calc-total"
                        type="number"
                        min="1"
                        value={totalQuestions}
                        onChange={(e) => setTotalQuestions(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Окуучунун кетирген каталары</label>
                      <input
                        id="input-calc-wrong"
                        type="number"
                        min="0"
                        max={totalQuestions}
                        value={wrongAnswers}
                        onChange={(e) => setWrongAnswers(Math.max(0, Math.min(totalQuestions, parseInt(e.target.value) || 0)))}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {calculatedGrade && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-3">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Эсептөө жыйынтыгы</div>
                      <div className={`text-6xl font-black ${
                        calculatedGrade.grade === "5" ? "text-emerald-500" :
                        calculatedGrade.grade === "4" ? "text-blue-500" :
                        calculatedGrade.grade === "3" ? "text-amber-500" : "text-red-500"
                      }`}>
                        {calculatedGrade.grade}
                      </div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {calculatedGrade.description}
                      </div>
                      <div className="text-xs text-slate-400">
                        Туура жооптор: <span className="font-bold text-slate-600 dark:text-slate-300">{calculatedGrade.score}/{totalQuestions}</span> ({calculatedGrade.percent}%)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
