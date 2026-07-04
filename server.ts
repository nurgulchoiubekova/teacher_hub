import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getAi() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is not defined. AI features will run in demo/simulation mode.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Local Database File Path
const DB_PATH = path.join(process.cwd(), "database.json");

// Types definition
interface Comment {
  id: string;
  materialId: string;
  author: string;
  authorId: string;
  text: string;
  createdAt: string;
  likes: number;
  likedBy: string[]; // List of userIds
  replies: Reply[];
}

interface Reply {
  id: string;
  author: string;
  authorId: string;
  text: string;
  createdAt: string;
}

interface Material {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  author: string;
  authorId: string;
  description: string;
  type: "pdf" | "word" | "powerpoint" | "video";
  rating: number;
  views: number;
  downloads: number;
  createdAt: string;
  content: string;
  commentsCount: number;
  coverGradient: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "teacher" | "admin";
  favorites: string[]; // list of materialIds
  createdAt: string;
}

interface Database {
  materials: Material[];
  comments: Comment[];
  users: User[];
  stats: {
    totalViews: number;
    totalDownloads: number;
  };
}

// Initial seed data
const initialMaterials: Material[] = [
  {
    id: "m-1",
    title: "Сын атоочтун жасалышы жана синтаксистик кызматы",
    subject: "Кыргыз тили",
    classLevel: "6-класс",
    author: "Айгүл Саматова",
    authorId: "user-teacher-1",
    description: "6-класстын окуучулары үчүн кыргыз тили сабагынан сын атооч сөз түркүмүн тереңдетип окутуу усулу. Сабактын планы, интерактивдүү көнүгүүлөр жана тесттер камтылган.",
    type: "pdf",
    rating: 4.9,
    views: 342,
    downloads: 128,
    createdAt: "2026-06-15T10:30:00Z",
    content: `КЫРГЫЗ ТИЛИ: СЫН АТООЧ

МААНИСИ: Заттын сын-сыпатын, касиетин, көлөмүн, салмагын, түсүн билдирген сөз түркүмү сын атооч деп аталат. Сын атоочтор кандай? кандайча? деген суроолорго жооп берет.

ЖАСАЛЫШЫ:
1. Туунду эмес (жөнөкөй): кызыл, узун, оор, таттуу, жаш.
2. Туунду сын атоочтор (мүчөлөр аркылуу жасалат):
   - -дуу: акылдуу, өнөрлүү, суулуу
   - -гыр: сезгир, тапкыр, өткүр
   - -лык: мектептик, тоолук, жаздык
   - -ча: кыргызча, орусча, кичинече

СИНТАКСИСТИК КЫЗМАТЫ:
Сүйлөмдө көбүнчө аныктоочтун кызматын аткарат (мисалы: Акылдуу бала адептүү келет). Ошондой жеке турганда баяндооч (Бул китеп кызыктуу) жана бышыктооч (Ал абдан тез чуркады) да боло алат.

КӨНҮГҮҮЛӨР:
1-көнүгүү. Берилген сүйлөмдөрдөн сын атоочторду таап, алардын жасалыш жолун аныктагыла.
"Жазында тоолордо кооз жана жыпар жыттуу гүлдөр ачылат. Акылдуу окуучу ар дайым таза жүрөт."`,
    commentsCount: 2,
    coverGradient: "from-blue-500 to-indigo-600"
  },
  {
    id: "m-2",
    title: "Пифагордун теоремасы жана практикалык маселелер",
    subject: "Математика",
    classLevel: "8-класс",
    author: "Бакыт Садыков",
    authorId: "user-teacher-2",
    description: "Тик бурчтуу үч бурчтуктардын касиеттерин жана Пифагордун теоремасын турмуштук курулуш, навигация маселелеринде колдонуу боюнча презентациялык сабак куралы.",
    type: "word",
    rating: 4.8,
    views: 189,
    downloads: 65,
    createdAt: "2026-06-20T14:15:00Z",
    content: `МАТЕМАТИКА: ПИФАГОРДУН ТЕОРЕМАСЫ

ТЕОРЕМА: Тик бурчтуу үч бурчтуктун гипотенузасынын квадраты анын катеттеринин квадраттарынын суммасына барабар.

ФОРМУЛАСЫ: a² + b² = c²
мында:
- a жана b — катеттер (тик бурчту түзгөн капталдар)
- c — гипотенуза (тик бурчка карама-каршы жаткан эң узун каптал)

ТЕОРЕМАНЫН ДАЛИЛДЕНИШИ:
Тик бурчтуу үч бурчтуктун капталдарына курулган квадраттардын аянттарын салыштыруу аркылуу далилденет. Гипотенузага курулган квадраттын аянты катеттерге курулган эки квадраттын аянттарынын суммасына тең.

ПРАКТИКАЛЫК КОЛДОНУУ:
1. Курулушта: Дубалдардын бурчун 90 градус кылып түзөөдө (тарабы 3м, 4м, 5м болгон үч бурчтук тик бурч түзөт - Египет үч бурчтугу).
2. Навигацияда: Эки гео-координаттын ортосундагы түз аралыкты эсептөөдө.

КЛАСС ИШИ:
Маселе: Катеттери 6 см жана 8 см болгон тик бурчтуу үч бурчтуктун гипотенузасын эсептегиле.
Чыгарылышы: c² = a² + b² = 6² + 8² = 36 + 64 = 100. c = √100 = 10 см.
Жообу: 10 см.`,
    commentsCount: 1,
    coverGradient: "from-emerald-500 to-teal-600"
  },
  {
    id: "m-3",
    title: "Компьютердин негизги курамдык түзүлүштөрү",
    subject: "Информатика",
    classLevel: "7-класс",
    author: "Нургүл Токтосунова",
    authorId: "user-teacher-3",
    description: "Компьютердин системалык блогу, энелик плата, процессор жана киргизүү-чыгаруу түзүлүштөрү жөнүндө визуалдык көрсөтмөлүү слайддар жыйнагы.",
    type: "powerpoint",
    rating: 4.7,
    views: 412,
    downloads: 215,
    createdAt: "2026-06-22T09:00:00Z",
    content: `СЛАЙДТАРДЫН СТРУКТУРАСЫ: КОМПЬЮТЕРДИН ТҮЗҮЛҮШҮ

Слайд 1: Компьютердин түзүлүшү
- Тема: Компьютердин негизги курамдык бөлүктөрү
- Мугалим: Нургүл Токтосунова
- Класс: 7-класс

Слайд 2: Компьютердин Архитектурасы
Компьютер негизги 4 курамдык блоктон турат:
1. Системалык блок (Эң башкы эсептөө орбору)
2. Монитор (Экранга маалымат чыгаруу)
3. Клавиатура (Тексттик маалыматтарды киргизүү)
4. Чычкан (Башкаруу жана буйруктарды берүү)

Слайд 3: Системалык Блоктун Ичинде Эмне Бар?
- Процессор (CPU): Компьютердин мээси, бардык эсептөөлөрдү жана буйруктарды аткарат.
- Оперативдүү Эстутум (RAM): Компьютер иштеп жатканда маалыматтарды убактылуу сактайт. Өчкөндө тазаланат.
- Катуу диск (HDD/SSD): Сүрөт, кино, программаларды туруктуу сактоочу жай.
- Энелик плата (Motherboard): Бардык деталдарды өзүнө бириктирип, байланыштырган чоң микросхема.

Слайд 4: Киргизүү жана Чыгаруу Түзүлүштөрү
- Маалымат киргизүү: Клавиатура, Чычкан, Микрофон, Сканер, Веб-камера.
- Маалымат чыгаруу: Монитор, Принтер, Наушник, Колонкалар.`,
    commentsCount: 1,
    coverGradient: "from-orange-500 to-amber-600"
  },
  {
    id: "m-4",
    title: "Манас эпосу – кыргыз элинин тарыхый жана руханий мурасы",
    subject: "Кыргыз адабияты",
    classLevel: "10-класс",
    author: "Эркин Мамытов",
    authorId: "user-teacher-4",
    description: "Манас трилогиясынын маңызы, тарыхый ролу жана улуу манасчылар Сагымбай, Саякбайдын өмүрү, чыгармачылыгы боюнча даярдалган ачык сабактын методикалык колдонмосу.",
    type: "pdf",
    rating: 5.0,
    views: 512,
    downloads: 310,
    createdAt: "2026-06-25T11:00:00Z",
    content: `КЫРГЫЗ АДАБИЯТЫ: МАНАС ЭПОСУ

ИЛИМИЙ БААСЫ: "Манас" эпосу — кыргыз элинин баатырдык эпосу, дүйнөдөгү эң көлөмдүү поэтикалык чыгармалардын бири. Анда элдин миң жылдык тарыхы, каада-салты, эркиндик жана биримдик үчүн күрөшү камтылган.

ЭПОСтун ҮЧ ПАЙДАСЫ (Трилогия):
1. "Манас" — Манас баатырдын элди чачырандылыктан куткарып, бириктиргени жана кыргыз мамлекетин түптөгөнү.
2. "Семетей" — Атасы Манастан кийинки уулу Семетейдин Ата-Журтту душмандан коргоосу жана ички чыккынчыларды жазалашы.
3. "Сейтек" — Семетейдин уулу Сейтектин ички-тышкы душмандарды толук жеңип, элге тынчтык орноткону.

УЛУУ МАНАСЧЫЛАР:
- Сагымбай Орозбаков: Эпостун эң көркөм, философиялык жана тарыхый нускасын айткан залкар манасчы. Андан 180 миң саптан ашык жазылып алынган.
- Саякбай Каралаев: Окуяны укмуштуудай экспрессия, драмалык обон менен аткарган "ХХ кылымдын Гомери". Анын варианты мазмундук жактан эң толук болуп эсептелет.

ОКУУЧУЛАР ҮЧҮН СУРООЛОР:
1. Манас баатыр кыргыздарды кайсы жерден бириктирип, кайда көчүрүп келген?
2. Семетей баатырдын ишенимдүү чоролорун атагыла. (Күлчоро, Канчоро)`,
    commentsCount: 3,
    coverGradient: "from-purple-500 to-pink-600"
  },
  {
    id: "m-5",
    title: "Present Simple Tense - Жөнөкөй учур чакты үйрөтүү",
    subject: "Англис тили",
    classLevel: "6-класс",
    author: "Каныкей Асанова",
    authorId: "user-teacher-5",
    description: "Англис тилинен күнүмдүк адаттарды, туруктуу фактыларды айтууда колдонулуучу Present Simple чагын интерактивдүү сүрөттөр жана видео көрсөтмөлөр менен түшүндүргөн сабак.",
    type: "video",
    rating: 4.8,
    views: 234,
    downloads: 80,
    createdAt: "2026-06-28T08:20:00Z",
    content: `АНГЛИС ТИЛИ: PRESENT SIMPLE TENSE (Simple Present)

USAGE (КОЛДОНУЛУШУ):
1. Күнүмдүк адаттар, кайталануучу иш-аракеттер (Habits & Routines)
   - I study English every day. (Мен күн сайын англис тилин окуйм)
2. Жалпы белгилүү фактылар, мыйзам ченемдүүлүктөр (General Truths)
   - The sun rises in the east. (Күн чыгыштан чыгат)

FORMULA (ЖАСАЛЫШЫ):
- Affirmative (Ырастоо): Subject + Verb (s/es for he/she/it)
  - I play tennis.
  - She plays tennis.
- Negative (Терс): Subject + do/does not + Verb
  - We do not (don't) eat meat.
  - He does not (doesn't) like coffee.
- Questions (Суроолуу): Do/Does + Subject + Verb?
  - Do you live in Bishkek?
  - Does she speak English?

КОНСПЕКТ-ТЕСТ:
Туура жоопту тандагыла:
1. My father ___ (work / works) in a bank.
2. We ___ (don't / doesn't) go to school on Sundays.`,
    commentsCount: 1,
    coverGradient: "from-red-500 to-rose-600"
  }
];

const initialComments: Comment[] = [
  {
    id: "c-1",
    materialId: "m-1",
    author: "Мээрим Осмонова",
    authorId: "user-commenter-1",
    text: "Абдан сонун пландалган сабак экен! Класста колдонуп көрдүм, окуучуларга абдан жакты. Сын атоочтун синтаксистик кызматы боюнча көнүгүүлөр абдан так түзүлүптүр. Рахмат авторго!",
    createdAt: "2026-06-16T05:22:00Z",
    likes: 5,
    likedBy: [],
    replies: [
      {
        id: "r-1",
        author: "Айгүл Саматова",
        authorId: "user-teacher-1",
        text: "Жакшы пикириңиз үчүн чоң рахмат, Мээрим эже! Дагы жаңы сабактарды кошуп турам.",
        createdAt: "2026-06-16T12:00:00Z"
      }
    ]
  },
  {
    id: "c-2",
    materialId: "m-1",
    author: "Руслан Жумабеков",
    authorId: "user-commenter-2",
    text: "Бул материалдын Ворд вариантын дагы жүктөсө болобу? Кээ бир жерлерин өзгөртүп колдоноюн дегем.",
    createdAt: "2026-06-18T18:40:00Z",
    likes: 2,
    likedBy: [],
    replies: []
  },
  {
    id: "c-3",
    materialId: "m-2",
    author: "Гүлзада Мураталиева",
    authorId: "user-commenter-3",
    text: "Математика мугалимдери үчүн таптыргыс курал экен! Практикалык мисалдары курулуш менен байланышканы абдан жакты.",
    createdAt: "2026-06-21T10:10:00Z",
    likes: 4,
    likedBy: [],
    replies: []
  },
  {
    id: "c-4",
    materialId: "m-3",
    author: "Темирлан Асанов",
    authorId: "user-commenter-4",
    text: "Презентациянын дизайны абдан кооз жана балдардын деңгээлине ылайыктуу. Компьютердин курамдык бөлүктөрү боюнча тесттер барбы?",
    createdAt: "2026-06-23T15:30:00Z",
    likes: 3,
    likedBy: [],
    replies: []
  },
  {
    id: "c-5",
    materialId: "m-4",
    author: "Чынара Назарова",
    authorId: "user-commenter-5",
    text: "Саякбай атанын варианты боюнча ушундай кеңири пландалган сабактар көп болсун. Рахмат, Эркин агай!",
    createdAt: "2026-06-26T07:15:00Z",
    likes: 8,
    likedBy: [],
    replies: []
  }
];

const initialUsers: User[] = [
  {
    id: "user-teacher-1",
    email: "ramis220813@gmail.com", // matches logged in user
    fullName: "Рамис Асанов (Мугалим)",
    role: "admin",
    favorites: ["m-1", "m-4"],
    createdAt: "2026-01-01T00:00:00Z"
  }
];

// Read DB or seed initial DB
function getDatabase(): Database {
  if (!fs.existsSync(DB_PATH)) {
    const db: Database = {
      materials: initialMaterials,
      comments: initialComments,
      users: initialUsers,
      stats: {
        totalViews: 1689,
        totalDownloads: 898
      }
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    return db;
  }
  try {
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading database file, returning seeds", e);
    return {
      materials: initialMaterials,
      comments: initialComments,
      users: initialUsers,
      stats: { totalViews: 1689, totalDownloads: 898 }
    };
  }
}

function saveDatabase(db: Database) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing database file", e);
  }
}

// REST APIs
// 1. Materials API
app.get("/api/materials", (req, res) => {
  const db = getDatabase();
  let list = [...db.materials];

  const search = req.query.search as string;
  const subject = req.query.subject as string;
  const classLevel = req.query.classLevel as string;
  const type = req.query.type as string;
  const author = req.query.author as string;

  if (search) {
    const s = search.toLowerCase();
    list = list.filter(m => 
      m.title.toLowerCase().includes(s) || 
      m.description.toLowerCase().includes(s) ||
      m.content.toLowerCase().includes(s) ||
      m.author.toLowerCase().includes(s) ||
      m.subject.toLowerCase().includes(s)
    );
  }

  if (subject && subject !== "Баары") {
    list = list.filter(m => m.subject === subject);
  }

  if (classLevel && classLevel !== "Баары") {
    list = list.filter(m => m.classLevel === classLevel);
  }

  if (type && type !== "Баары") {
    list = list.filter(m => m.type === type);
  }

  if (author) {
    list = list.filter(m => m.author.toLowerCase().includes(author.toLowerCase()));
  }

  res.json(list);
});

app.get("/api/materials/:id", (req, res) => {
  const db = getDatabase();
  const material = db.materials.find(m => m.id === req.params.id);
  if (!material) {
    return res.status(404).json({ error: "Материал табылган жок" });
  }
  // Increment view
  material.views += 1;
  db.stats.totalViews += 1;
  saveDatabase(db);
  res.json(material);
});

app.post("/api/materials", (req, res) => {
  const db = getDatabase();
  const { title, subject, classLevel, description, type, content, author, authorId, coverGradient } = req.body;

  if (!title || !subject || !classLevel || !description || !type || !content) {
    return res.status(400).json({ error: "Бардык милдеттүү талааларды толтуруңуз" });
  }

  const newMaterial: Material = {
    id: `m-${Date.now()}`,
    title,
    subject,
    classLevel,
    author: author || "Катталган мугалим",
    authorId: authorId || "user-teacher-1",
    description,
    type,
    rating: 5.0,
    views: 0,
    downloads: 0,
    createdAt: new Date().toISOString(),
    content,
    commentsCount: 0,
    coverGradient: coverGradient || "from-slate-500 to-slate-700"
  };

  db.materials.unshift(newMaterial);
  saveDatabase(db);
  res.status(201).json(newMaterial);
});

app.put("/api/materials/:id", (req, res) => {
  const db = getDatabase();
  const index = db.materials.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Материал табылган жок" });
  }

  const updated = { ...db.materials[index], ...req.body };
  db.materials[index] = updated;
  saveDatabase(db);
  res.json(updated);
});

app.delete("/api/materials/:id", (req, res) => {
  const db = getDatabase();
  const initialLen = db.materials.length;
  db.materials = db.materials.filter(m => m.id !== req.params.id);
  // also clean up comments
  db.comments = db.comments.filter(c => c.materialId !== req.params.id);

  if (db.materials.length === initialLen) {
    return res.status(404).json({ error: "Материал табылган жок" });
  }

  saveDatabase(db);
  res.json({ success: true, message: "Материал ийгиликтүү өчүрүлдү" });
});

// Download simulation endpoint
app.get("/api/materials/:id/download", (req, res) => {
  const db = getDatabase();
  const material = db.materials.find(m => m.id === req.params.id);
  if (!material) {
    return res.status(404).json({ error: "Материал табылган жок" });
  }

  material.downloads += 1;
  db.stats.totalDownloads += 1;
  saveDatabase(db);

  // Generate a text representation that mimics the actual document download
  const extension = material.type === "pdf" ? "pdf" : material.type === "word" ? "docx" : material.type === "powerpoint" ? "pptx" : "mp4";
  const filename = `${material.title.replace(/\s+/g, "_")}.${extension}`;

  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(filename)}"`);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  
  const fileContent = `=========================================
TEACHER HUB - МУГАЛИМДЕР ҮЧҮН ВЕБ-ПЛАТФОРМА
Материалдын аталышы: ${material.title}
Предмет: ${material.subject}
Класс: ${material.classLevel}
Автор: ${material.author}
Жүктөлгөн күн: ${new Date().toLocaleDateString("ky-KG")}
Рейтинг: ${material.rating}
=========================================

${material.content}

-----------------------------------------
Teacher Hub - Санариптик мугалимдин жардамчысы.
`;
  res.send(fileContent);
});

// 2. Comments API
app.get("/api/comments/:materialId", (req, res) => {
  const db = getDatabase();
  const list = db.comments.filter(c => c.materialId === req.params.materialId);
  res.json(list);
});

app.post("/api/comments/:materialId", (req, res) => {
  const db = getDatabase();
  const { author, authorId, text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Комментарийдин тексти бошу болбошу керек" });
  }

  const newComment: Comment = {
    id: `c-${Date.now()}`,
    materialId: req.params.materialId,
    author: author || "Конок колдонуучу",
    authorId: authorId || "user-anonymous",
    text,
    createdAt: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    replies: []
  };

  db.comments.unshift(newComment);

  // Update material comments count
  const material = db.materials.find(m => m.id === req.params.materialId);
  if (material) {
    material.commentsCount = db.comments.filter(c => c.materialId === req.params.materialId).length;
  }

  saveDatabase(db);
  res.status(201).json(newComment);
});

app.put("/api/comments/:id", (req, res) => {
  const db = getDatabase();
  const { text } = req.body;
  const comment = db.comments.find(c => c.id === req.params.id);
  if (!comment) {
    return res.status(404).json({ error: "Комментарий табылган жок" });
  }

  comment.text = text;
  saveDatabase(db);
  res.json(comment);
});

app.delete("/api/comments/:id", (req, res) => {
  const db = getDatabase();
  const commentIndex = db.comments.findIndex(c => c.id === req.params.id);
  if (commentIndex === -1) {
    return res.status(404).json({ error: "Комментарий табылган жок" });
  }

  const materialId = db.comments[commentIndex].materialId;
  db.comments.splice(commentIndex, 1);

  // Update material comments count
  const material = db.materials.find(m => m.id === materialId);
  if (material) {
    material.commentsCount = db.comments.filter(c => c.materialId === materialId).length;
  }

  saveDatabase(db);
  res.json({ success: true, message: "Комментарий өчүрүлдү" });
});

app.post("/api/comments/:id/like", (req, res) => {
  const db = getDatabase();
  const { userId } = req.body;
  const comment = db.comments.find(c => c.id === req.params.id);
  if (!comment) {
    return res.status(404).json({ error: "Комментарий табылган жок" });
  }

  if (!comment.likedBy) comment.likedBy = [];

  const likedIdx = comment.likedBy.indexOf(userId || "user-anonymous");
  if (likedIdx === -1) {
    comment.likedBy.push(userId || "user-anonymous");
    comment.likes += 1;
  } else {
    comment.likedBy.splice(likedIdx, 1);
    comment.likes = Math.max(0, comment.likes - 1);
  }

  saveDatabase(db);
  res.json(comment);
});

app.post("/api/comments/:id/reply", (req, res) => {
  const db = getDatabase();
  const { author, authorId, text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Жооптун тексти бош болбошу керек" });
  }

  const comment = db.comments.find(c => c.id === req.params.id);
  if (!comment) {
    return res.status(404).json({ error: "Комментарий табылган жок" });
  }

  const newReply: Reply = {
    id: `r-${Date.now()}`,
    author: author || "Конок колдонуучу",
    authorId: authorId || "user-anonymous",
    text,
    createdAt: new Date().toISOString()
  };

  if (!comment.replies) comment.replies = [];
  comment.replies.push(newReply);

  saveDatabase(db);
  res.status(201).json(comment);
});

// 3. Favorites API
app.post("/api/favorites", (req, res) => {
  const db = getDatabase();
  const { userId, materialId } = req.body;

  let user = db.users.find(u => u.id === userId);
  if (!user) {
    // auto create a temporary user session if they click favorite without being fully initialized
    user = {
      id: userId || "user-teacher-1",
      email: "ramis220813@gmail.com",
      fullName: "Рамис Асанов (Мугалим)",
      role: "admin",
      favorites: [],
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
  }

  if (!user.favorites) user.favorites = [];

  const index = user.favorites.indexOf(materialId);
  let isFavorite = false;
  if (index === -1) {
    user.favorites.push(materialId);
    isFavorite = true;
  } else {
    user.favorites.splice(index, 1);
    isFavorite = false;
  }

  saveDatabase(db);
  res.json({ isFavorite, favorites: user.favorites });
});

app.get("/api/favorites/:userId", (req, res) => {
  const db = getDatabase();
  const user = db.users.find(u => u.id === req.params.userId);
  if (!user || !user.favorites) {
    return res.json([]);
  }
  const favList = db.materials.filter(m => user.favorites.includes(m.id));
  res.json(favList);
});

// 4. Authentication endpoints (simulated database-backed state)
app.post("/api/auth/login", (req, res) => {
  const db = getDatabase();
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Электрондук дарек талап кылынат" });
  }

  // Find or create user
  let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: `user-${Date.now()}`,
      email: email,
      fullName: email.split("@")[0].toUpperCase() + " (Мугалим)",
      role: email.toLowerCase().includes("admin") ? "admin" : "teacher",
      favorites: [],
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDatabase(db);
  }

  res.json(user);
});

app.post("/api/auth/register", (req, res) => {
  const db = getDatabase();
  const { email, fullName, role } = req.body;

  if (!email || !fullName) {
    return res.status(400).json({ error: "Бардык талааларды толтуруңуз" });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Бул эмейл менен колдонуучу мурунтан эле катталган" });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    fullName,
    role: role || "teacher",
    favorites: [],
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);
  res.json(newUser);
});

app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Электрондук даректи жазыңыз" });
  }
  res.json({ success: true, message: "Сырсөздү калыбына келтирүү шилтемеси электрондук дарегиңизге жөнөтүлдү!" });
});

// 5. AI Chat & Generators using @google/genai SDK
app.post("/api/ai/chat", async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Суроо талап кылынат" });
  }

  const ai = getAi();
  if (!ai) {
    // Simulated mock AI responses in beautiful Kyrgyz language
    return res.json({
      text: `[СИМУЛЯЦИЯ РЕЖИМИ] Саламатсызбы! Мен сиздин санариптик AI жардамчыңызмын. Сиз берген суроо: "${prompt}". Сиздин сурооңузга жооп катары мектеп программасынын негизинде сабак пландарын, тесттерди же методикалык көрсөтмөлөрдү түзүп бере алам.`
    });
  }

  try {
    const systemInstruction = `Сен "Teacher Hub" мугалимдердин платформасынын санариптик AI жардамчысысың. 
    Кыргызстандын мектеп билим берүү стандарттарына ылайык мугалимдерге сабак пландарын, тесттерди, ачык сабактарды, тарбиялык сааттарды түзүүгө жардам бересиң.
    Бардык суроолорго СӨЗСҮЗ таза, сылык жана терең мазмундуу КЫРГЫЗ тилинде жооп бер.
    Эгер мугалим сабак планын, тест же презентация сураса, аны абдан кооз форматталган Markdown структурасында түзүп бер.
    Жооптордо колдонуучу жоопту Ворд же PDF форматында көчүрүп алууга оңой болгондой структураны колдон.`;

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    // Feed prior history if provided
    if (history && history.length > 0) {
      // Re-hydrate history if the SDK supports it, or simple single prompt with context:
    }

    const response = await chat.sendMessage({ message: prompt });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "AI жооп берүүдө ката кетти: " + error.message });
  }
});

// AI Generators for tools
app.post("/api/ai/generate", async (req, res) => {
  const { toolType, topic, subject, classLevel, duration, questionsCount, difficulty, slidesCount } = req.body;
  
  if (!topic || !subject || !classLevel) {
    return res.status(400).json({ error: "Тема, предмет жана класс сөзсүз керек" });
  }

  const ai = getAi();
  
  let prompt = "";
  if (toolType === "lesson_plan") {
    prompt = `Кыргыз мектебинин мугалими үчүн сабактын планын иштеп чык.
    Темасы: ${topic}
    Предмет: ${subject}
    Класс: ${classLevel}
    Убактысы: ${duration || "45 мүнөт"}
    Сабактын максаттарын (Билим берүүчүлүк, Өнүктүрүүчүлүк, Тарбиялык), сабактын тиби, усулу, жабдылышын, жана кадам-кадам менен сабактын жүрүшүн (уюштуруу, үй тапшырма, жаңы тема, бышыктоо, баалоо, үй тапшырма) камтыган деталдуу план түз.`;
  } else if (toolType === "quiz") {
    prompt = `Мектеп окуучулары үчүн ТЕСТ түз.
    Темасы: ${topic}
    Предмет: ${subject}
    Класс: ${classLevel}
    Суроолордун саны: ${questionsCount || "5"}
    Кыйындыгы: ${difficulty || "Орто"}
    Ар бир суроонун А, Б, В, Г варианттары болсун. Тесттин эң аягында ТУУРА ЖООПТОРУН (Ачкычын) кошо жаз.`;
  } else if (toolType === "presentation") {
    prompt = `Мугалимдер үчүн кооз презентация куралына ылайыктуу слайддардын структурасын жана толук текстин кыргыз тилинде түз.
    Темасы: ${topic}
    Предмет: ${subject}
    Класс: ${classLevel}
    Слайддардын саны: ${slidesCount || "5"} слайд.

    СИСТЕМАНЫН АВТОМАТТЫК ТҮРДӨ СЛАЙДДАРДЫ ОКУУСУ ҮЧҮН ТӨМӨНКҮ ФОРМАТТЫ КАТУУ САКТА:

    ### Слайд 1: [Теманын негизги аталышы]
    - **Аталышы:** [Слайдда көрсөтүлө турган негизги баш сөз]
    - **Тезистер:**
      - [Маанилүү тезис же кыскача түшүндүрмө 1]
      - [Маанилүү тезис же кыскача түшүндүрмө 2]
      - [Маанилүү тезис же кыскача түшүндүрмө 3]
    - **Сүрөт үчүн англисче ачкыч сөз:** [Бул слайдга ылайыктуу 1-2 сөз англис тилинде, мисалы: "classroom", "book", "earth", "nature"]
    - **Визуалдык дизайн боюнча сунуш:** [Бул слайдга сунушталган иллюстрация, сүрөт же түстөр]

    ### Слайд 2: ... (жана башка бардык слайддарды ушул форматта жаз)`;
  } else if (toolType === "worksheet") {
    prompt = `Класс иши жана үй тапшырмасы үчүн практикалык ТАПШЫРМА БАРАГЫН (Worksheet) түз.
    Темасы: ${topic}
    Предмет: ${subject}
    Класс: ${classLevel}
    Окуучулар аткара турган маселелерди, суроолорду жана чыгармачылык тапшырмаларды кооздоп жаз.`;
  } else if (toolType === "assessment") {
    prompt = `Сабак же тема боюнча окуучуларды баалоонун так КРИТЕРИЙЛЕРИН (Assessment rubrics) түз.
    Темасы: ${topic}
    Предмет: ${subject}
    Класс: ${classLevel}
    Ар бир баа үчүн ("5", "4", "3", "2") кандай талаптар аткарылышы керектигин так таблица түрүндө же тизмектеп жаз.`;
  } else if (toolType === "homeroom") {
    prompt = `Мугалим үчүн ТАРБИЯЛЫК СААТТЫН планын жана мазмунун иштеп чык.
    Темасы: ${topic}
    Класс: ${classLevel}
    Сабактын максатын, конокторду чакыруу, маектешүү суроолорун жана окуучулардын адеп-ахлактык маанисин жогорулатуучу уламыш, мисалдарды камты.`;
  } else if (toolType === "game_generator") {
    prompt = `Кыргыз тилинде мектеп окуучулары үчүн интерактивдүү ОЮН-ТЕСТ түзүп бер.
    Темасы: ${topic}
    Предмет: ${subject}
    Класс: ${classLevel}
    Суроолордун саны: 5 суроо.

    САКТАЛУУЧУ ФОРМАТ: Сиз сөзсүз түрдө төмөнкү JSON форматында гана жооп беришиңиз керек. Башка эч кандай түшүндүрмө текст кошпоңуз, Pure JSON массивди гана кайтарыңыз:
    [
      {
        "q": "Суроо тексти?",
        "options": ["А жообу", "Б жообу", "В жообу", "Г жообу"],
        "correct": 0,
        "explanation": "Жооптун толук түшүндүрмөсү"
      }
    ]`;
  } else {
    prompt = `Тема боюнча методикалык курал даярдап бер:
    Темасы: ${topic}, Предмет: ${subject}, Класс: ${classLevel}`;
  }

  if (!ai) {
    // Static high quality generators if Gemini is offline
    let text = `[СИМУЛЯЦИЯ РЕЖИМИ: GEMINI ОФФЛАЙН]
# ${toolType.toUpperCase()} - КЫРГЫЗ ТИЛИНДЕ ГЕНЕРАЦИЯЛАНДЫ
**Тема:** ${topic}
**Предмет:** ${subject}
**Класс:** ${classLevel}
`;

    if (toolType === "lesson_plan") {
      text += `
## Сабактын планы
**Убактысы:** ${duration || "45 мүнөт"}

### 1. Сабактын максаттары:
- **Билим берүүчүлүк:** Окуучулар "${topic}" темасын түшүнүп, негизги терминдерди эстеп калышат.
- **Өнүктүрүүчүлүк:** Логикалык ой жүгүртүүсү, өз алдынча маселе чыгаруу жөндөмү артат.
- **Тарбиялык:** Бири-бирин угууга, эмгекчилдикке жана билим алууга умтулууга тарбияланышат.

### 2. Сабактын жүрүшү (Кадамдар):
- **Уюштуруу мүнөтү (5 мүнөт):** Окуучулар менен саламдашуу, жагымдуу маанай түзүү.
- **Үй тапшырмасын текшерүү (10 мүнөт):** Мурунку темалар боюнча кыскача суроо-жооп.
- **Жаңы теманы түшүндүрүү (15 мүнөт):** Теманы турмуштук мисалдар аркылуу түшүндүрүү.
- **Практикалык иштөө жана Бышыктоо (10 мүнөт):** Окуучулар өз алдынча же топто көнүгүүлөрдү аткарышат.
- **Үйгө тапшырма жана Баалоо (5 мүнөт):** Сабакты жыйынтыктоо жана үй тапшырмаларын берүү.`;
    } else if (toolType === "quiz") {
      text += `
## Тест тапшырмалары
**Суроолордун саны:** ${questionsCount || "5"}
**Кыйындыгы:** ${difficulty || "Орто"}

### 1-Суроо: "${topic}" боюнча төмөнкүлөрдүн кайсынысы туура?
- А) Негизги түшүнүк 1
- Б) Экинчи түшүнүк 2
- В) Үчүнчү түшүнүк 3
- Г) Бардыгы туура
*Туура жооп: А*

### 2-Суроо: "${topic}" түшүнүгү кайсы жерде кеңири колдонулат?
- А) Мектепте гана
- Б) Күнүмдүк турмушта жана илимде
- В) Космосто гана
- Г) Туура жооп жок
*Туура жооп: Б*

### 3-Суроо: "${topic}" кубулушунун негизги өзгөчөлүгү эмнеде?
- А) Тез өзгөрүүсү
- Б) Туруктуулугу
- В) Жөнөкөйлүгү
- Г) Баары туура
*Туура жооп: Г*

### 4-Суроо: Төмөнкүлөрдүн кайсынысы "${topic}" темасына тиешеси жок?
- А) Изилдөөлөр
- Б) Терминдер
- В) Чет өлкөлүк саякаттар
- Г) Теориялар
*Туура жооп: В*

### 5-Суроо: "${topic}" теориясын ким биринчилерден болуп негиздеген?
- А) Белгилүү окумуштуулар
- Б) Элдик ооз эки чыгармачылык
- В) Заманбап изилдөөчүлөр
- Г) Тарыхчылар
*Туура жооп: А*

---
### ТЕСТТИН АЧКЫЧТАРЫ:
1. А | 2. Б | 3. Г | 4. В | 5. А`;
    } else if (toolType === "presentation") {
      text += `
## Презентациянын слайддарынын структурасы
**Слайддардын саны:** ${slidesCount || "5"} слайд

### Слайд 1: Киришүү жана Теманын аталышы
- **Аталышы:** Кош келиңиздер! Биздин бүгүнкү тема: "${topic}"
- **Тезистер:**
  - Теманын актуалдуулугу жана маанилүүлүгү.
  - Биз эмнелерди үйрөнөбүз?
- **Сүрөт үчүн англисче ачкыч сөз:** classroom, welcome
- **Визуалдык дизайн боюнча сунуш:** Темага тиешевүү кооз башкы сүрөттү жайгаштыруу. Кочкул көк жана ак түстөрдүн айкалышын колдонуңуз.

### Слайд 2: Негизги максаттар жана Түшүнүктөр
- **Аталышы:** Негизги түшүнүктөр жана Аныктамалар
- **Тезистер:**
  - "${topic}" термининин негизги аныктамасы.
  - Анын келип чыгуу тарыхы.
  - Окуу куралдарындагы ролу.
- **Сүрөт үчүн англисче ачкыч сөз:** study, concept
- **Визуалдык дизайн боюнча сунуш:** Маанилүү терминдери чоңураак арип менен белгилеп, блок түрүндө көрсөтүү.

### Слайд 3: Практикалык мааниси жана Колдонулушу
- **Аталышы:** Иш жүзүндө колдонуу
- **Тезистер:**
  - Күнүмдүк жашоодогу мисалдар.
  - "${subject}" сабагындагы орду.
  - Окуучулардын активдүү катышуусу.
- **Сүрөт үчүн англисче ачкыч сөз:** school, practice
- **Визуалдык дизайн боюнча сунуш:** Колдонуу мисалдарын көрсөткөн графикалык сүрөттөрдү же иконкаларды колдонуу.

### Слайд 4: Өзгөчөлүктөр жана Кызыктуу фактылар
- **Аталышы:** Кызыктуу маалыматтар
- **Тезистер:**
  - Биз билбеген кызыктуу фактылар.
  - Салыштыруулар жана статистика.
- **Сүрөт үчүн англисче ачкыч сөз:** education, facts
- **Визуалдык дизайн боюнча сунуш:** Маалыматтарды тизмек (bullet points) түрүндө берип, ашыкча тексттен качуу.

### Слайд 5: Жыйынтыктоо жана Суроо-жооптор
- **Аталышы:** Сабакты жыйынтыктоо
- **Тезистер:**
  - Негизги корутундулар.
  - Суроолор жана талкуу.
  - Көңүл бурганыңыздарга чоң рахмат!
- **Сүрөт үчүн англисче ачкыч сөз:** classroom, thank you
- **Визуалдык дизайн боюнча сунуш:** "Көңүл бурганыңыздарга рахмат!" деген текстти чоң жана жагымдуу түс менен ортосуна жазуу.`;
    } else if (toolType === "worksheet") {
      text += `
## Тапшырма барагы (Worksheet)

### I Бөлүм: Теориялык суроолор
1. "${topic}" деген эмне? Өз сөзүңүз менен түшүндүрүп жазыңыз.
2. "${topic}" түшүнүгүнүн негизги 3 өзгөчөлүгүн атаңыз.

### II Бөлүм: Практикалык тапшырмалар
1. Төмөнкү маселени чыгарыңыз же кырдаалды талдаңыз:
   * "${topic}" кубулушу турмушта кандай таасир этет?
2. Төмөнкү сүйлөмдөрдү толуктаңыз:
   - "Эгерде биз ${topic} темасын терең үйрөнсөк, анда..."

### III Бөлүм: Чыгармачылык тапшырма
- Бул тема боюнча чакан эссе жазыңыз же сүрөт тартыңыз.`;
    } else if (toolType === "assessment") {
      text += `
## Баалоо критерийлери (Rubrics)

| Баа | Критерийлер (Окуучунун билимине коюлган талаптар) |
| :--- | :--- |
| **"5" (Эң жакшы)** | Теманы толук өздөштүргөн, өз алдынча мисалдарды келтире алат, кошумча изилдөөлөрдү билет. |
| **"4" (Жакшы)** | Негизги суроолорго туура жооп берет, бирок кошумча түшүндүрүүдө бир аз ката кетирет. |
| **"3" (Канааттандырарлык)** | Тема боюнча жалпы түшүнүгү бар, бирок практикалык маселелерди чечүүдө кыйналат. |
| **"2" (Канааттандырарлык эмес)** | Негизги терминдерди билбейт жана тапшырмаларды такыр аткара алган эмес. |`;
    } else if (toolType === "homeroom") {
      text += `
## Тарбиялык сааттын планы
**Предмет/Багыт:** Класстык саат

### 1. Сабактын максаты:
- Окуучулардын адеп-ахлактык сапаттарын жогорулатуу.
- "${topic}" аркылуу бири-бирин сыйлоого, адептүүлүккө чакыруу.

### 2. Негизги мазмуну жана Кадамдар:
- **Уюштуруу жана Саламдашуу (5 мүнөт):** Адеп жөнүндө кыскача маек.
- **Мисалдарды талкуулоо (15 мүнөт):** Белгилүү инсандардын жашоосунан мисалдар.
- **Окуучулардын талкуусу (15 мүнөт):** "Биз кандай үлгүлүү инсан боло алабыз?"
- **Жыйынтыктоо жана Күндөлүк жазуулар (10 мүнөт).**`;
    } else if (toolType === "game_generator") {
      text = JSON.stringify([
        {
          "q": `"${topic}" боюнча негизги аныктама кайсы?`,
          "options": ["Илимий аныктама", "Күнүмдүк түшүнүк", "Башталгыч түшүнүк", "Жөнөкөй негиз"],
          "correct": 0,
          "explanation": `"${topic}" боюнча негизги илимий аныктама ушул теманын өзөгүн түзөт.`
        },
        {
          "q": `Төмөнкүлөрдүн кайсынысы "${topic}" темасына тиешелүү эмес?`,
          "options": ["Негизги терминдер", "Башка өлкөгө туризм", "Практикалык көнүгүүлөр", "Сабактын максаты"],
          "correct": 1,
          "explanation": "Бул теманы өздөштүрүүдө башка өлкөлөргө туризмдин түздөн-түз тиешеси жок."
        },
        {
          "q": `"${topic}" темасын өздөштүрүүдө кайсы усул эң натыйжалуу?`,
          "options": ["Жөн гана угуу", "Интерактивдүү оюн жана практика", "Жаттап алуу", "Китепти жаап коюу"],
          "correct": 1,
          "explanation": "Интерактивдүү оюндар жана практикалык көнүгүүлөр теманы эң мыкты түшүнүүгө жардам берет."
        },
        {
          "q": `Жаңы эле өтүлгөн "${topic}" темасынан кийин эмне кылуу керек?`,
          "options": ["Теманы унутуу", "Бышыктоочу суроолорго жооп берүү", "Башка сабакка алаксуу", "Окууну токтотуу"],
          "correct": 1,
          "explanation": "Теманы өткөндөн кийин бышыктоочу тест жана суроолор материалды жакшы эстеп калууга көмөктөшөт."
        },
        {
          "q": `Мугалим окуучулардын "${topic}" темасын түшүнгөнүн кантип баалайт?`,
          "options": ["Сырткы келбетине карап", "Окуучулардын активдүү катышуусу жана тест натыйжасы аркылуу", "Эч кандай суроо бербей", "Сабактан калганда"],
          "correct": 1,
          "explanation": "Окуучулардын суроолорго жооп берүүсү, тесттерди туура аткаруусу алардын теманы канчалык өздөштүргөнүн көрсөтөт."
        }
      ], null, 2);
    } else {
      text += `
## Методикалык көрсөтмө
Бул бөлүмдө сиз тандаган тема боюнча кыскача сунуштар жана методикалык сунуштар камтылган.
Ар бир бөлүмдү мугалим өз каалоосуна жараша кеңейтип колдоно алат.`;
    }

    return res.json({ text });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Сен кыргыз тилдүү билим берүү боюнча эксперт кеңешчисиң. Жоопту сылык, кооз Markdown форматында түзүп бер.",
        temperature: 0.6
      }
    });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Generator Error:", error);
    res.status(500).json({ error: "AI генерациясында ката кетти: " + error.message });
  }
});

// 6. Conversion tools (PDF -> Word, Word -> PDF)
app.post("/api/tools/pdf-word", (req, res) => {
  const { fileName } = req.body;
  const originalName = fileName || "сабак_планы.pdf";
  const newName = originalName.replace(/\.pdf$/i, ".docx");
  
  res.json({
    success: true,
    originalName,
    convertedName: newName,
    downloadUrl: `/api/tools/download-converted?name=${encodeURIComponent(newName)}&type=docx`
  });
});

app.post("/api/tools/word-pdf", (req, res) => {
  const { fileName } = req.body;
  const originalName = fileName || "сабак_планы.docx";
  const newName = originalName.replace(/\.docx$/i, ".pdf");

  res.json({
    success: true,
    originalName,
    convertedName: newName,
    downloadUrl: `/api/tools/download-converted?name=${encodeURIComponent(newName)}&type=pdf`
  });
});

app.get("/api/tools/download-converted", (req, res) => {
  const name = req.query.name as string || "converted_file.docx";
  const type = req.query.type as string || "docx";

  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(name)}"`);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");

  const simulatedText = `===========================================================
TEACHER HUB - КОНВЕРТАЦИЯЛАНГАН ДОКУМЕНТ
Файлдын аталышы: ${name}
Тиби: ${type.toUpperCase()} Форматына конвертацияланды
Күнү: ${new Date().toLocaleDateString("ky-KG")}
===========================================================

Урматтуу мугалим! Бул файл Teacher Hub конвертер инструменти аркылуу ийгиликтүү түзүлдү.
Төмөндө сиздин баштапкы файлдын негизинде иштелип чыккан текст жайгашкан:

1. Сабактын методикалык планы толук конвертацияланды.
2. Ичиндеги жадвалдар, тексттик маалыматтар жана сүрөттөрдүн шилтемелери сакталды.
3. Документти Microsoft Word же PDF Reader аркылуу ачып, түзөтө берсеңиз болот.

Рахмат! Ишиңизге ийгилик каалайбыз.
-----------------------------------------------------------
Teacher Hub командасы.
`;
  res.send(simulatedText);
});

// 7. Admin endpoints
app.get("/api/admin/stats", (req, res) => {
  const db = getDatabase();
  const materialsCount = db.materials.length;
  const commentsCount = db.comments.length;
  const usersCount = db.users.length;
  
  // Calculate category (subject) distribution
  const subjectsMap: { [key: string]: number } = {};
  db.materials.forEach(m => {
    subjectsMap[m.subject] = (subjectsMap[m.subject] || 0) + 1;
  });

  const subjectStats = Object.keys(subjectsMap).map(sub => ({
    name: sub,
    value: subjectsMap[sub]
  }));

  res.json({
    materialsCount,
    commentsCount,
    usersCount,
    totalViews: db.stats.totalViews,
    totalDownloads: db.stats.totalDownloads,
    subjectStats
  });
});

app.get("/api/admin/users", (req, res) => {
  const db = getDatabase();
  res.json(db.users);
});

app.delete("/api/admin/users/:id", (req, res) => {
  const db = getDatabase();
  const userId = req.params.id;
  
  if (userId === "user-teacher-1") {
    return res.status(400).json({ error: "Башкы администраторду өчүрүүгө болбойт" });
  }

  db.users = db.users.filter(u => u.id !== userId);
  saveDatabase(db);
  res.json({ success: true, message: "Колдонуучу ийгиликтүү өчүрүлдү" });
});

// Handle development Vite server and production static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
