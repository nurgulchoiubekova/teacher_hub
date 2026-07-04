import React, { useState, useEffect } from "react";
import { 
  Users, BookOpen, MessageSquare, TrendingUp, BarChart2, Trash2, 
  Settings, CheckCircle, RefreshCw, Layers, GraduationCap 
} from "lucide-react";
import { Material, Comment, User, AdminStats } from "../types";

interface AdminPanelProps {
  onShowNotification: (msg: string, type: "success" | "error") => void;
  onEditMaterial: (material: Material) => void;
  onSelectMaterial: (materialId: string) => void;
}

export default function AdminPanel({ onShowNotification, onEditMaterial, onSelectMaterial }: AdminPanelProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<"stats" | "materials" | "users" | "comments">("stats");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Error fetching stats", e);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materials");
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      }
    } catch (e) {
      console.error("Error fetching materials", e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Error fetching users", e);
    }
  };

  const fetchAllComments = async () => {
    // In our backend, we can load all materials then fetch comments for each, 
    // or simulate loading comments. Let's load the comments by scanning some materials 
    // or getting them from the server. Let's make sure we have comments.
    try {
      const res = await fetch("/api/materials");
      if (res.ok) {
        const mats: Material[] = await res.json();
        let allComments: Comment[] = [];
        for (const m of mats) {
          const cres = await fetch(`/api/comments/${m.id}`);
          if (cres.ok) {
            const list = await cres.json();
            allComments = [...allComments, ...list];
          }
        }
        setComments(allComments);
      }
    } catch (e) {
      console.error("Error fetching comments", e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchMaterials(), fetchUsers(), fetchAllComments()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteMaterial = async (id: string) => {
    if (!window.confirm("Бул материалды өчүрүүнү каалайсызбы?")) return;
    try {
      const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
      if (res.ok) {
        onShowNotification("Материал ийгиликтүү өчүрүлдү", "success");
        fetchMaterials();
        fetchStats();
      } else {
        onShowNotification("Өчүрүүдө ката кетти", "error");
      }
    } catch (e) {
      onShowNotification("Тармак катасы", "error");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === "user-teacher-1") {
      onShowNotification("Башкы администраторду өчүрүүгө болбойт!", "error");
      return;
    }
    if (!window.confirm("Бул колдонуучуну өчүрүүнү каалайсызбы?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        onShowNotification("Колдонуучу өчүрүлдү", "success");
        fetchUsers();
        fetchStats();
      } else {
        onShowNotification(data.error || "Өчүрүүдө ката кетти", "error");
      }
    } catch (e) {
      onShowNotification("Тармак катасы", "error");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm("Бул комментарийди өчүрүүнү каалайсызбы?")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        onShowNotification("Комментарий өчүрүлдү", "success");
        fetchAllComments();
        fetchStats();
      } else {
        onShowNotification("Өчүрүүдө ката кетти", "error");
      }
    } catch (e) {
      onShowNotification("Тармак катасы", "error");
    }
  };

  return (
    <div id="admin-panel-section" className="bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-500 animate-spin-slow" />
            Администратор Панели
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Платформадагы колдонуучуларды, материалдарды жана комментарийлерди толук башкаруу борбору.
          </p>
        </div>
        <button
          id="btn-refresh-admin"
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Маалыматтарды жаңылоо
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto gap-2">
        {[
          { id: "stats", label: "Статистика", icon: BarChart2 },
          { id: "materials", label: "Материалдарды башкаруу", icon: BookOpen },
          { id: "users", label: "Колдонуучуларды башкаруу", icon: Users },
          { id: "comments", label: "Комментарийлерди башкаруу", icon: MessageSquare }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`btn-admin-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition duration-200 flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-slate-200"
            }`}
          >
            <tab.icon className="h-4.5 w-4.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-400">Жүктөлүүдө...</p>
        </div>
      )}

      {!loading && (
        <div>
          {/* STATS VIEW */}
          {activeTab === "stats" && stats && (
            <div id="admin-tab-stats" className="space-y-8">
              {/* Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Колдонуучулар", value: stats.usersCount, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
                  { label: "Материалдар", value: stats.materialsCount, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
                  { label: "Комментарийлер", value: stats.commentsCount, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/20" },
                  { label: "Жалпы көрүүлөр", value: stats.totalViews, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
                  { label: "Жүктөөлөр саны", value: stats.totalDownloads, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" }
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-slate-100 dark:border-slate-900`}>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                    <div className={`text-2xl sm:text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Chart simulation / Visual distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-indigo-500" />
                    Предметтер боюнча материалдардын бөлүнүшү
                  </h4>
                  <div className="space-y-3">
                    {stats.subjectStats.map((sub, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <span>{sub.name}</span>
                          <span>{sub.value} материал</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${Math.min(100, (sub.value / (stats.materialsCount || 1)) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    {stats.subjectStats.length === 0 && (
                      <p className="text-xs text-slate-400 italic">Азырынча статистика жок.</p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                      <GraduationCap className="h-4.5 w-4.5 text-emerald-500" />
                      Башкаруу Категориялары
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Мугалимдерге предмет жана класс деңгээлдерин туура тандап жүктөөнү камсыздоо үчүн атайын индекстер түзүлгөн.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Жалпы Класстар</span>
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] px-2 py-0.5 rounded font-bold">11 Класс</span>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Категориялык файл түрлөрү</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">PDF, Word, PPTX, Video</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MATERIALS LIST */}
          {activeTab === "materials" && (
            <div id="admin-tab-materials" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4">Материал</th>
                      <th className="p-4">Предмет & Класс</th>
                      <th className="p-4">Автор</th>
                      <th className="p-4">Статистика</th>
                      <th className="p-4 text-right">Аракеттер</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                    {materials.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-950/20">
                        <td className="p-4">
                          <div>
                            <button 
                              onClick={() => onSelectMaterial(m.id)}
                              className="font-bold text-slate-850 dark:text-white hover:text-indigo-600 text-left line-clamp-1"
                            >
                              {m.title}
                            </button>
                            <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 block">Тиби: {m.type.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300">
                          <div>{m.subject}</div>
                          <div className="text-xs text-slate-400">{m.classLevel}</div>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">{m.author}</td>
                        <td className="p-4 text-xs text-slate-400">
                          <div>Көрүүлөр: <span className="font-bold text-slate-600 dark:text-slate-300">{m.views}</span></div>
                          <div>Жүктөөлөр: <span className="font-bold text-slate-600 dark:text-slate-300">{m.downloads}</span></div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              id={`btn-admin-edit-${m.id}`}
                              onClick={() => onEditMaterial(m)}
                              className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 hover:bg-indigo-100 rounded text-xs font-semibold transition"
                            >
                              Оңдоо
                            </button>
                            <button
                              id={`btn-admin-del-${m.id}`}
                              onClick={() => handleDeleteMaterial(m.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {materials.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">Азырынча эч кандай материал жок.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* USERS LIST */}
          {activeTab === "users" && (
            <div id="admin-tab-users" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4">Аты-жөнү</th>
                      <th className="p-4">Электрондук дарек</th>
                      <th className="p-4">Ролу</th>
                      <th className="p-4">Катталган күн</th>
                      <th className="p-4 text-right">Аракеттер</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-950/20">
                        <td className="p-4 font-bold text-slate-850 dark:text-white">{u.fullName}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{u.email}</td>
                        <td className="p-4">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            u.role === "admin" ? "bg-red-100 text-red-800" : "bg-indigo-100 text-indigo-800"
                          }`}>
                            {u.role === "admin" ? "Администратор" : "Мугалим"}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString("ky-KG")}</td>
                        <td className="p-4 text-right">
                          <button
                            id={`btn-admin-deluser-${u.id}`}
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.id === "user-teacher-1"}
                            className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 transition"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMMENTS LIST */}
          {activeTab === "comments" && (
            <div id="admin-tab-comments" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4">Автор</th>
                      <th className="p-4">Комментарий тексти</th>
                      <th className="p-4">Лайктар</th>
                      <th className="p-4">Күнү</th>
                      <th className="p-4 text-right">Аракеттер</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                    {comments.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-950/20">
                        <td className="p-4 font-bold text-slate-850 dark:text-white">{c.author}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">{c.text}</td>
                        <td className="p-4 font-bold text-indigo-600">{c.likes} ❤️</td>
                        <td className="p-4 text-slate-400 text-xs">{new Date(c.createdAt).toLocaleDateString("ky-KG")}</td>
                        <td className="p-4 text-right">
                          <button
                            id={`btn-admin-delcomment-${c.id}`}
                            onClick={() => handleDeleteComment(c.id)}
                            className="p-1 text-slate-400 hover:text-red-500 transition"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {comments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">Азырынча комментарийлер жок.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
