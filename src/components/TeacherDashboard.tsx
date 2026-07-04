import React, { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash2, Eye, Download, MessageSquare, BookOpen, 
  ChevronRight, Sparkles, Check, X, FileText, Image, Film, HelpCircle 
} from "lucide-react";
import { Material, Comment, User } from "../types";
import { SUBJECTS, CLASSES } from "../utils/constants";

interface TeacherDashboardProps {
  currentUser: User | null;
  onShowNotification: (msg: string, type: "success" | "error") => void;
  onSelectMaterial: (materialId: string) => void;
  // Triggered when editing from Admin panel as well
  editingMaterialFromAdmin?: Material | null;
  clearAdminEditing?: () => void;
}

export default function TeacherDashboard({ 
  currentUser, 
  onShowNotification, 
  onSelectMaterial,
  editingMaterialFromAdmin,
  clearAdminEditing
}: TeacherDashboardProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formSubject, setFormSubject] = useState(SUBJECTS[0]);
  const [formClass, setFormClass] = useState(CLASSES[4]); // 5th class
  const [formType, setFormType] = useState<"pdf" | "word" | "powerpoint" | "video">("pdf");
  const [formDesc, setFormDesc] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCoverGradient, setFormCoverGradient] = useState("from-blue-500 to-indigo-600");

  const gradients = [
    { name: "Көк-Асман", value: "from-blue-500 to-indigo-600" },
    { name: "Изумруд", value: "from-emerald-500 to-teal-600" },
    { name: "Жалын", value: "from-orange-500 to-amber-600" },
    { name: "Фиолет", value: "from-purple-500 to-pink-600" },
    { name: "Анар", value: "from-red-500 to-rose-600" }
  ];

  const fetchMyMaterials = async () => {
    setLoading(true);
    try {
      // In a real database, we would query materials by author/authorId. 
      // We will filter by authorId = currentUser.id on client side for extreme simplicity and correctness
      const res = await fetch("/api/materials");
      if (res.ok) {
        const data: Material[] = await res.json();
        if (currentUser) {
          // Keep materials owned by currentUser OR show all if currentUser is admin so they can manage
          const myData = currentUser.role === "admin" 
            ? data 
            : data.filter(m => m.authorId === currentUser.id);
          setMaterials(myData);
        } else {
          setMaterials(data);
        }
      }
    } catch (e) {
      console.error("Error fetching my materials", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyMaterials();
  }, [currentUser]);

  // Handle external editing triggers (from Admin Panel)
  useEffect(() => {
    if (editingMaterialFromAdmin) {
      handleOpenEdit(editingMaterialFromAdmin);
    }
  }, [editingMaterialFromAdmin]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormTitle("");
    setFormSubject(SUBJECTS[0]);
    setFormClass(CLASSES[4]);
    setFormType("pdf");
    setFormDesc("");
    setFormContent("");
    setFormCoverGradient("from-blue-500 to-indigo-600");
    setIsFormOpen(true);
  };

  const handleOpenEdit = (material: Material) => {
    setIsEditing(true);
    setEditingId(material.id);
    setFormTitle(material.title);
    setFormSubject(material.subject);
    setFormClass(material.classLevel);
    setFormType(material.type);
    setFormDesc(material.description);
    setFormContent(material.content);
    setFormCoverGradient(material.coverGradient || "from-blue-500 to-indigo-600");
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsEditing(false);
    setEditingId(null);
    if (clearAdminEditing) clearAdminEditing();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formDesc.trim() || !formContent.trim()) {
      onShowNotification("Бардык милдеттүү талааларды толтуруңуз!", "error");
      return;
    }

    const payload = {
      title: formTitle,
      subject: formSubject,
      classLevel: formClass,
      description: formDesc,
      type: formType,
      content: formContent,
      coverGradient: formCoverGradient,
      author: currentUser?.fullName || "Мугалим",
      authorId: currentUser?.id || "user-teacher-1"
    };

    try {
      let res;
      if (isEditing && editingId) {
        res = await fetch(`/api/materials/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch("/api/materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        onShowNotification(
          isEditing ? "Материал ийгиликтүү өзгөртүлдү!" : "Жаңы материал ийгиликтүү кошулду!",
          "success"
        );
        handleCloseForm();
        fetchMyMaterials();
      } else {
        const errorData = await res.json();
        onShowNotification(errorData.error || "Сактоодо ката кетти", "error");
      }
    } catch (err) {
      onShowNotification("Тармак катасы кетти", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Бул материалды өчүрүүнү каалайсызбы?")) return;
    try {
      const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
      if (res.ok) {
        onShowNotification("Материал өчүрүлдү", "success");
        fetchMyMaterials();
      } else {
        onShowNotification("Өчүрүүдө ката кетти", "error");
      }
    } catch (e) {
      onShowNotification("Тармак катасы", "error");
    }
  };

  // Stats calculation
  const totalMyViews = materials.reduce((acc, curr) => acc + curr.views, 0);
  const totalMyDownloads = materials.reduce((acc, curr) => acc + curr.downloads, 0);
  const totalMyComments = materials.reduce((acc, curr) => acc + curr.commentsCount, 0);

  return (
    <div id="teacher-dashboard-section" className="space-y-8">
      {/* Overview Stats for teacher */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
          <BookOpen className="h-8 w-8 opacity-75 mb-3" />
          <div className="text-xs font-semibold uppercase tracking-wider opacity-90">Материалдарым</div>
          <div className="text-3xl font-black mt-1">{materials.length}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Көрүүлөрдүн саны</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalMyViews}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Жүктөлгөндөрдүн саны</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalMyDownloads}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Пикирлер/Комментарийлер</div>
            <div className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{totalMyComments}</div>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
              Менин методикалык материалдарым
            </h3>
            <p className="text-xs text-slate-450 mt-1">
              Бул жерден сиз жаңы сабак усулдарын кошуп, өзгөртүп же өчүрө аласыз.
            </p>
          </div>

          {!isFormOpen && (
            <button
              id="btn-open-create-material"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              <Plus className="h-4.5 w-4.5" />
              Материал кошуу
            </button>
          )}
        </div>

        {isFormOpen ? (
          /* Create / Edit Form */
          <form id="material-form" onSubmit={handleSave} className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-md font-bold text-slate-800 dark:text-white">
                {isEditing ? "Материалды түзөтүү" : "Жаңы материал кошуу"}
              </h4>
              <button
                id="btn-close-form"
                type="button"
                onClick={handleCloseForm}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Материалдын темасы *</label>
                <input
                  id="form-title"
                  type="text"
                  required
                  placeholder="Мисалы: Зат атоочтун синтаксистик кызматы"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Файлдын тиби *</label>
                <select
                  id="form-type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-850 dark:text-white text-sm"
                >
                  <option value="pdf">PDF Документ (.pdf)</option>
                  <option value="word">Microsoft Word (.docx)</option>
                  <option value="powerpoint">Microsoft PowerPoint (.pptx)</option>
                  <option value="video">Видео сабак (.mp4)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Предмет *</label>
                <select
                  id="form-subject"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-850 dark:text-white text-sm"
                >
                  {SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Класс *</label>
                <select
                  id="form-class"
                  value={formClass}
                  onChange={(e) => setFormClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-850 dark:text-white text-sm"
                >
                  {CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Визуалдык карточканын градиенти</label>
                <div className="flex gap-3 flex-wrap">
                  {gradients.map((g, i) => (
                    <button
                      key={i}
                      id={`btn-gradient-${i}`}
                      type="button"
                      onClick={() => setFormCoverGradient(g.value)}
                      className={`h-10 px-4 rounded-xl text-white text-xs font-bold bg-gradient-to-r ${g.value} transition relative ${
                        formCoverGradient === g.value ? "ring-2 ring-indigo-500 scale-105" : "opacity-80 hover:opacity-100"
                      }`}
                    >
                      {g.name}
                      {formCoverGradient === g.value && (
                        <Check className="h-3 w-3 absolute -top-1 -right-1 bg-indigo-600 rounded-full text-white p-0.5 border" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Кыскача сыпаттамасы (Description) *</label>
                <textarea
                  id="form-desc"
                  rows={2}
                  required
                  placeholder="Бул материалдын мазмуну жана максаты жөнүндө кыскача маалымат..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Толук контенти же Тест/Пландын тексти *</label>
                <textarea
                  id="form-content"
                  rows={8}
                  required
                  placeholder="Сабактын планын, маселелерин же суроолорун ушул жерге толук жазыңыз..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-white text-sm font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                id="btn-cancel-form"
                type="button"
                onClick={handleCloseForm}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition"
              >
                Жокко чыгаруу
              </button>
              <button
                id="btn-save-form"
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/20"
              >
                {isEditing ? "Өзгөртүүлөрдү сактоо" : "Материалды сактоо"}
              </button>
            </div>
          </form>
        ) : (
          /* Materials list table / list */
          <div className="mt-4">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-sm text-slate-450">Жүктөлүүдө...</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-900">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-850 dark:text-slate-300 font-bold">Сизде азырынча материалдар жок</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Мугалимдерге тиешелүү методдорду же тесттерди кошуу үчүн жогорудагы "Материал кошуу" баскычын басыңыз.
                </p>
                <button
                  id="btn-empty-add"
                  onClick={handleOpenCreate}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                >
                  Биринчи материалды кошуу
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 hover:shadow-md transition duration-200 gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${m.coverGradient || "from-blue-500 to-indigo-600"} flex items-center justify-center text-white font-bold shrink-0 shadow`}>
                        {m.type === "pdf" && <FileText className="h-5 w-5" />}
                        {m.type === "word" && <FileText className="h-5 w-5" />}
                        {m.type === "powerpoint" && <FileText className="h-5 w-5" />}
                        {m.type === "video" && <Film className="h-5 w-5" />}
                      </div>
                      <div>
                        <button
                          id={`btn-dashboard-view-${m.id}`}
                          onClick={() => onSelectMaterial(m.id)}
                          className="font-bold text-slate-850 dark:text-white text-sm hover:text-indigo-600 transition text-left line-clamp-1"
                        >
                          {m.title}
                        </button>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-450">
                          <span className="font-semibold bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-850">{m.subject}</span>
                          <span>•</span>
                          <span>{m.classLevel}</span>
                          <span>•</span>
                          <span className="font-medium text-indigo-500 uppercase">{m.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-0 pt-3 sm:pt-0 border-slate-50">
                      <div className="flex items-center gap-4 mr-4 text-xs text-slate-400">
                        <div className="text-center">
                          <div className="font-black text-slate-700 dark:text-slate-300">{m.views}</div>
                          <div>Көрүү</div>
                        </div>
                        <div className="text-center">
                          <div className="font-black text-slate-700 dark:text-slate-300">{m.downloads}</div>
                          <div>Жүктөө</div>
                        </div>
                      </div>

                      <button
                        id={`btn-dashboard-edit-${m.id}`}
                        onClick={() => handleOpenEdit(m)}
                        className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition"
                      >
                        <Edit className="h-4.5 w-4.5" />
                      </button>
                      <button
                        id={`btn-dashboard-del-${m.id}`}
                        onClick={() => handleDelete(m.id)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
