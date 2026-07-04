import React, { useState, useEffect } from "react";
import { Trophy, Sparkles, CheckCircle2, XCircle, RotateCcw, Gamepad2, Award, ArrowRight } from "lucide-react";

interface Question {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface InteractiveGameProps {
  material: {
    id: string;
    title: string;
    subject: string;
    classLevel: string;
  };
  onShowNotification: (message: string, type: "success" | "error" | "info") => void;
}

// Full suite of custom interactive educational games mapped specifically to each of the 20 materials
const GAMES_DATA: Record<string, Question[]> = {
  "m-1": [
    {
      q: "\"Акылдуу\" деген сөз кандай сын атоочко кирет?",
      options: ["Жөнөкөй (туунду эмес)", "Туунду сын атооч", "Татаал сын атооч", "Кыскартылган"],
      correct: 1,
      explanation: "\"-дуу\" мүчөсү аркылуу зат атоочтон (акыл) туунду сын атооч жасалды."
    },
    {
      q: "\"Кооз гүлдөр тоодо ачылды\" сүйлөмүндө \"кооз\" сөзү кайсы синтаксистик кызматты аткарат?",
      options: ["Баяндооч", "Ээ", "Аныктооч", "Бышыктооч"],
      correct: 2,
      explanation: "\"Кооз\" сөзү кандай? деген суроого жооп берип, \"гүлдөр\" затын аныктап турат."
    }
  ],
  "m-2": [
    {
      q: "Катеттери 3 см жана 4 см болгон тик бурчтуу үч бурчтуктун гипотенузасы канчага барабар?",
      options: ["5 см", "7 см", "12 см", "25 см"],
      correct: 0,
      explanation: "Пифагордун теоремасы боюнча: c² = a² + b² = 3² + 4² = 9 + 16 = 25. √25 = 5 см (Египет үч бурчтугу)."
    },
    {
      q: "Пифагордун теоремасы кайсы үч бурчтуктарга гана колдонулат?",
      options: ["Жактары барабар үч бурчтукка", "Каалаган үч бурчтукка", "Тик бурчтуу үч бурчтукка", "Доол бурчтуу үч бурчтукка"],
      correct: 2,
      explanation: "Пифагордун теоремасы тик бурчтуу үч бурчтуктун гана катеттери менен гипотенузасынын ортосундагы байланышты аныктайт."
    }
  ],
  "m-3": [
    {
      q: "Компьютердин \"мээси\" деп кайсы негизги түзүлүштү аташат?",
      options: ["Оперативдүү эстутум (RAM)", "Процессор (CPU)", "Катуу диск (SSD)", "Энелик плата"],
      correct: 1,
      explanation: "Процессор (CPU) — бардык негизги эсептөөлөрдү жана командаларды аткаруучу эң башкы борбордук деталь."
    },
    {
      q: "Төмөнкүлөрдүн ичинен маалыматты экранга же сыртка *чыгаруучу* түзүлүштү белгилегиле:",
      options: ["Клавиатура", "Сканер", "Монитор", "Чычкан"],
      correct: 2,
      explanation: "Монитор — компьютердин ичиндеги маалыматты экранга сүрөт же текст түрүндө чыгарып берет."
    }
  ],
  "m-4": [
    {
      q: "\"Манас\" трилогиясынын экинчи бөлүгү кандай аталат?",
      options: ["Сейтек", "Семетей", "Алмамбет", "Каныкей"],
      correct: 1,
      explanation: "\"Манас\" трилогиясынын 1-бөлүгү \"Манас\", 2-бөлүгү \"Семетей\", 3-бөлүгү \"Сейтек\" деп аталат."
    },
    {
      q: "Эпостогу Манас баатырдын эң ишенимдүү, акылман кеңешчиси ким болгон?",
      options: ["Чубак", "Кошой", "Бакай", "Сыргак"],
      correct: 2,
      explanation: "Бакай ата — Манастын жана анын укум-тукумунун эң ишенимдүү, акылман кеңешчиси, жол көрсөтүүчүсү болгон."
    }
  ],
  "m-5": [
    {
      q: "\"He (work/works) in a bank\" сүйлөмүндө кайсынысы туура келет?",
      options: ["work", "works", "working", "worked"],
      correct: 1,
      explanation: "Present Simple чагында үчүнчү жакта (he, she, it) этишке \"s\" же \"es\" мүчөсү уланат."
    },
    {
      q: "Present Simple чагында терс сүйлөм жасоодо \"We\" жагына кайсы көмөкчү этиш колдонулат?",
      options: ["doesn't", "don't", "not", "isn't"],
      correct: 1,
      explanation: "\"I, We, You, They\" жагы үчүн \"don't\" (do not), ал эми \"He, She, It\" үчүн \"doesn't\" (does not) колдонулат."
    }
  ],
  "m-6": [
    {
      q: "Нерсеге башка күчтөр таасир этпесе, анын өзүнүн тынчтык же бир калыптагы түз сызыктуу кыймыл абалын сактоо касиети эмне деп аталат?",
      options: ["Ылдамдануу", "Инерция кубулушу", "Тартылуу күчү", "Басым күчү"],
      correct: 1,
      explanation: "Бул физикалык кубулуш инерция деп аталат жана Ньютондун биринчи мыйзамынын негизин түзөт."
    },
    {
      q: "Автобус капысынан токтогондо ичиндеги жүргүнчүлөр эмне үчүн алдыга ийилишет?",
      options: ["Тартылуу күчүнөн улам", "Кыймылын инерция боюнча сактап калууга умтулгандыктан", "Абанын каршылыгынан улам", "Буту тайгаланып кеткендиктен"],
      correct: 1,
      explanation: "Жүргүнчүлөр автобус токтогондо да өздөрүнүн мурунку кыймыл ылдамдыгын сактап калууга умтулушат."
    }
  ],
  "m-7": [
    {
      q: "Бирдей металл эместердин ортосундагы орток электрондук жуптар аркылуу пайда болгон байланыш кандай аталат?",
      options: ["Иондук байланыш", "Коваленттик уюлсуз байланыш", "Коваленттик уюлдуу байланыш", "Металлдык байланыш"],
      correct: 1,
      explanation: "Эгер атомдор бирдей металл эместер болсо (мисалы, H2, O2), электрондук жуптар борбордо тең салмакта турат, бул уюлсуз байланыш деп аталат."
    },
    {
      q: "Кадимки аш тузунда (NaCl) химиялык байланыштын кайсы түрү кездешет?",
      options: ["Коваленттик байланыш", "Металлдык байланыш", "Иондук байланыш", "Суутектик байланыш"],
      correct: 2,
      explanation: "Натрий (металл) электронду хлорго (металл эмес) толук берип, карама-каршы заряддалган иондорду түзөт, алардын тартылуусунан иондук байланыш жаралат."
    }
  ],
  "m-8": [
    {
      q: "Өсүмдүк клеткасына гана мүнөздүү болгон, фотосинтез процессин аткаруучу жашыл түстөгү пластиддер эмне деп аталат?",
      options: ["Лейкопласттар", "Хромопласттар", "Хлоропласттар", "Вакуоль"],
      correct: 2,
      explanation: "Хлоропласттар курамында жашыл хлорофилл пигментин сактап, фотосинтез аркылуу органикалык заттарды өндүрөт."
    },
    {
      q: "Өсүмдүк клеткасынын кайсы органоиди клетка ширеси менен толтурулуп, ички басымды сактап турат?",
      options: ["Ядро", "Вакуоль", "Цитоплазма", "Рибосома"],
      correct: 1,
      explanation: "Вакуоль — бул суу жана андагы эриген туздар, канттар толтурулган чоң көңдөй шире."
    }
  ],
  "m-9": [
    {
      q: "Кыргызстандагы эң бийик тоо чокусун атагыла:",
      options: ["Ленин чокусу", "Жеңиш чокусу", "Хан-Тенгри чокусу", "Адигине чокусу"],
      correct: 1,
      explanation: "Жеңиш чокусу — Кыргызстандын гана эмес, бүткүл Теңир-Тоо системасынын эң бийик жери (7439 метр)."
    },
    {
      q: "Төмөнкү көлдөрдүн кайсынысы жер титирөөдөн улам капчыгайдын бөгөлүп калышынан пайда болгон?",
      options: ["Ысык-Көл", "Сон-Көл", "Сары-Челек көлү", "Чатыр-Көл"],
      correct: 2,
      explanation: "Кооз Сары-Челек көлү тоо кулап капчыгайдын суусун бөгөп калгандан улам жаралган тосмо көл болуп саналат."
    }
  ],
  "m-10": [
    {
      q: "Энесай кыргыздарынын улуу каганы Барсбек кайсы жылы салгылашууда курман болгон?",
      options: ["711-жылы", "840-жылы", "1206-жылы", "201-жылы б.з.ч."],
      correct: 0,
      explanation: "711-жылдын кышында Түрк каганатынын аскерлери капысынан кол салып, Барсбек каган Чер көлүндөгү салгылашууда баатырларча курман болгон."
    },
    {
      q: "Энесай кыргыздарынын негизги жазуу маданияты кайсы болгон?",
      options: ["Араб жазуусу", "Кытай иероглифтери", "Байыркы руникалык (Орхон-Енисей) жазуусу", "Кириллица"],
      correct: 2,
      explanation: "Кыргыздар таштарга жана куралдарга өздөрүнүн руна сымал Орхон-Енисей жазууларын чегип калтырышкан."
    }
  ],
  "m-11": [
    {
      q: "Кыргыз тилинде канча жөндөмө бар?",
      options: ["4 жөндөмө", "6 жөндөмө", "7 жөндөмө", "12 жөндөмө"],
      correct: 1,
      explanation: "Кыргыз тилинде 6 жөндөмө бар: Атооч, Илик, Барыш, Табыш, Жатыш, Чыгыш."
    },
    {
      q: "\"Китептер\" деген сөз зат атоочтун кайсы категориясына кирет?",
      options: ["Таандык категориясы", "Көптүк сан (сан категориясы)", "Жөндөмө категориясы", "Жактама категориясы"],
      correct: 1,
      explanation: "\"-тер\" көптүк мүчөсү уланып, заттын көп экеүн билдирип турат (сан категориясы)."
    }
  ],
  "m-12": [
    {
      q: "3/8 + 2/8 бөлчөгүн кошкондо канча болот?",
      options: ["5/16", "5/8", "1/8", "6/8"],
      correct: 1,
      explanation: "Бөлүмдөрү бирдей бөлчөктөрдү кошуу усулунда алымы гана кошулуп (3+2=5), бөлүмү өзгөрүүсүз калат (8)."
    },
    {
      q: "Бөлчөктүн сызыгынын үстүндө жайгашкан сан эмне деп аталат?",
      options: ["Бөлүмү", "Алымы", "Бүтүн бөлүгү", "Көбөйтүүчү"],
      correct: 1,
      explanation: "Бөлчөктүн үстүндөгү сан \"алымы\" деп аталып, бүтүн нерседен канча тең бөлүк алынганын көрсөтөт."
    }
  ],
  "m-13": [
    {
      q: "Python тилинде экранга маалымат чыгаруу үчүн кайсы функция колдонулат?",
      options: ["input()", "print()", "output()", "write()"],
      correct: 1,
      explanation: "`print()` функциясы экранга же консолго каалаган маалыматтарды, текстти жана өзгөрмөлөрдү чыгарат."
    },
    {
      q: "Python программасында `x = 5.5` болсо, х өзгөрмөсүнүн тиби кандай болот?",
      options: ["int (бүтүн сан)", "float (бөлчөк сан)", "str (текст)", "bool (логикалык)"],
      correct: 1,
      explanation: "Бөлчөк сандар Python программалоо тилинде `float` маалымат тиби деп аталат."
    }
  ],
  "m-14": [
    {
      q: "Ч. Айтматовдун \"Биринчи мугалим\" повестиндеги билимге умтулган жетим кыздын аты ким?",
      options: ["Жамиля", "Алтынай", "Асел", "Толгонай"],
      correct: 1,
      explanation: "Алтынай Сүлайманова повесттин негизги каарманы. Ал Дүйшөн агайдын жардамы менен окуп, академик болгон."
    },
    {
      q: "Повесттеги биринчи мектепти өз колу менен салып, балдарды кыйынчылык менен окуткан каарман ким?",
      options: ["Байтемир", "Ысмайыл", "Дүйшөн", "Данияр"],
      correct: 2,
      explanation: "Дүйшөн — билимдүү болбосо да, зор дилгирлик жана сүйүү менен айылда алгачкы мектепти ачкан улуу мугалим."
    }
  ],
  "m-15": [
    {
      q: "\"Кутмандуу таңыңыз менен!\" фразасы англисче кандай которулат?",
      options: ["Good afternoon!", "Good morning!", "Good evening!", "Goodbye!"],
      correct: 1,
      explanation: "\"Good morning\" эртең менен учурашууда колдонулуучу эң негизги англис тилиндеги саламдашуу сөзү."
    },
    {
      q: "\"Nice to meet you\" деген сөзгө кандай жооп кайтаруу ылайыктуу?",
      options: ["I am fine, thank you.", "Nice to meet you too!", "Good evening.", "What is your name?"],
      correct: 1,
      explanation: "\"Nice to meet you too!\" (Сиз менен да таанышканыма кубанычтамын!) деп жооп берүү сыпайылык болуп эсептелет."
    }
  ],
  "m-16": [
    {
      q: "Нерсе кыймылда болгондо гана ээ болуучу энергиянын түрү эмне деп аталат?",
      options: ["Потенциалдык энергия", "Кинетикалык энергия", "Ички энергия", "Жылуулук энергиясы"],
      correct: 1,
      explanation: "Кыймылдагы нерсенин энергиясы кинетикалык энергия (Ek = mv²/2) деп аталат."
    },
    {
      q: "Эркин түшкөн таштын жерге жакындаган сайын потенциалдык энергиясы эмне болот?",
      options: ["Көбөйөт", "Азаят", "Өзгөрбөйт", "Нөлгө барабар бойдон калат"],
      correct: 1,
      explanation: "Бийиктик (h) азайган сайын потенциалдык энергия (Ep = mgh) азаят, бирок ал толугу менен кинетикалык энергияга айланат."
    }
  ],
  "m-17": [
    {
      q: "Органикалык кошулмаларда көмүртек атому ар дайым канча валенттүү болот?",
      options: ["II валенттүү", "III валенттүү", "IV валенттүү", "VI валенттүү"],
      correct: 2,
      explanation: "Органикалык химияда көмүртек ар дайым 4 коваленттик байланыш түзүп, IV валенттүүлүктү көрсөтөт."
    },
    {
      q: "Эң жөнөкөй органикалык углеводород — Метандын химиялык формуласын көрсөткүлө:",
      options: ["C2H4", "CH4", "CO2", "C2H2"],
      correct: 1,
      explanation: "CH4 — кадимки жаратылыш газынын негизги курамы болуп саналган метандын формуласы."
    }
  ],
  "m-18": [
    {
      q: "Адамдын жүрөгү канча камерадан турат?",
      options: ["2 камералуу", "3 камералуу", "4 камералуу", "5 камералуу"],
      correct: 2,
      explanation: "Адамдын жүрөгү эки дүлөйчөдөн жана эки карынчадан турган төрт камералуу орган болуп саналат."
    },
    {
      q: "Канды жүрөктөн башка органдарга жана ткандарга ташуучу калың дубалдуу кан тамырлар кандай аталат?",
      options: ["Веналар", "Артериялар", "Капиллярлар", "Лимфалар"],
      correct: 1,
      explanation: "Жүрөктөн канды денеге ташуучу тамырлар — артериялар, ал эми кайра жүрөккө алып келүүчүлөр — веналар."
    }
  ],
  "m-19": [
    {
      q: "Жыл сайын миллиондогон тонна океанга төгүлүп, деңиз жаныбарларына эң чоң коркунуч туудурган чирибей турган зат:",
      options: ["Мунайзат калдыктары", "Пластик жана полиэтилен калдыктары", "Металл калдыктары", "Көмүр кислотасы"],
      correct: 1,
      explanation: "Пластик жүздөгөн жылдар бою чирибейт, майдаланып микропластикке айланып бүткүл океан жаныбарларын уулайт."
    },
    {
      q: "Океан суусунун глобалдык жылышы суу астындагы кайсы абдан назик жана маанилүү экосистеманын өлүп агарышына алып келет?",
      options: ["Жашыл балырларга", "Коралл рифтерине (маржандар)", "Деңиз балыктарына", "Медузаларга"],
      correct: 1,
      explanation: "Коралл рифтери температура өзгөрүүсүнө өтө сезимтал келип, суу жылыганда агарып өлүп калышат."
    }
  ],
  "m-20": [
    {
      q: "Кыргыз Республикасынын Мамлекеттик Көз көз карандысыздыгы жөнүндө Декларация кайсы күнү кабыл алынган?",
      options: ["1991-жылдын 31-августунда", "1993-жылдын 5-майында", "1992-жылдын 3-мартында", "1990-жылдын 15-декабрында"],
      correct: 0,
      explanation: "1991-жылдын 31-августунда өлкөнүн көз карандысыздыгы жарыяланып, ушул күн Эгемендүүлүк күнү катары белгиленет."
    },
    {
      q: "Эгемендүү Кыргызстандын туңгуч Конституциясы кайсы жылы кабыл алынган?",
      options: ["1991-жылы", "1992-жылы", "1993-жылы", "2010-жылы"],
      correct: 2,
      explanation: "Туңгуч Конституция (Баш мыйзам) 1993-жылдын 5-майында Жогорку Кеңеш тарабынан кабыл алынган."
    }
  ],
  "m-21": [
    {
      q: "Какое имя существительное относится к мужскому роду?",
      options: ["Солнце", "Тетрадь", "Ученик", "Книга"],
      correct: 2,
      explanation: "Слово 'ученик' мужского рода (он, мой). 'Солнце' — среднего, 'тетрадь' и 'книга' — женского рода."
    },
    {
      q: "На какой вопрос отвечает неодушевленное имя существительное?",
      options: ["Кто?", "Что?", "Как?", "Где?"],
      correct: 1,
      explanation: "Неодушевленные имена существительные обозначают неживые предметы и отвечают на вопрос 'Что?'."
    }
  ],
  "m-22": [
    {
      q: "Каким союзом соединяются части сложноподчиненного предложения с придаточным изъяснительным?",
      options: ["Потому что", "Что", "Когда", "Если"],
      correct: 1,
      explanation: "Придаточные изъяснительные обычно отвечают на падежные вопросы и присоединяются союзом 'что' (например: Он сказал, что придет)."
    },
    {
      q: "Где может находиться придаточное предложение по отношению к главному в СПП?",
      options: ["Только после главного", "Только перед главным", "В любом месте (перед, после или внутри главного)", "Только в середине главного"],
      correct: 2,
      explanation: "Придаточное предложение может стоять перед главным, после главного или находиться внутри него."
    }
  ],
  "m-23": [
    {
      q: "Күн системасындагы эң чоң алп планета кайсы?",
      options: ["Марс", "Сатурн", "Юпитер", "Нептун"],
      correct: 2,
      explanation: "Юпитер — Күн системасындагы эң чоң жана эң оор планета (газ гиганты)."
    },
    {
      q: "Күнгө эң жакын жайгашкан биринчи планетаны атагыла:",
      options: ["Чолпон (Венера)", "Меркурий", "Жер", "Марс"],
      correct: 1,
      explanation: "Меркурий — Күнгө эң жакын жайгашкан, атмосферасы өтө жука жана температурасы кескин өзгөрүп туруучу планета."
    }
  ],
  "m-24": [
    {
      q: "Төмөнкүлөрдүн кайсынысы негизги үч түскө кирет?",
      options: ["Жашыл", "Көк", "Кызгылт сары", "Сыя түс"],
      correct: 1,
      explanation: "Көркөм өнөрдө негизги үч түс бар: Кызыл, Сары жана Көк. Калган түстөр ушулардын аралашуусунан алынат."
    },
    {
      q: "Жансыз нерселердин (гүлдөр, идиштер, мөмө-жемиштер) тизилишин тартуу өнөрү кандай аталат?",
      options: ["Пейзаж", "Портрет", "Натюрморт", "Графика"],
      correct: 2,
      explanation: "Натюрморт — жансыз жаратылыш элементтерин жана тиричилик буюмдарын сүрөттөөчү көркөм жанр."
    }
  ],
  "m-25": [
    {
      q: "Үч кылдуу, өрүк же жаңгак жыгачынан жасалган кыргыздын эң негизги улуттук аспабы кайсы?",
      options: ["Темир комуз", "Комуз", "Кыл кыяк", "Чоор"],
      correct: 1,
      explanation: "Комуз — кыргыз элинин эң байыркы жана негизги үч кылдуу чертме улуттук музыкалык аспабы."
    },
    {
      q: "Белгилүү күүчү Карамолдо Орозовдун философиялык терең залкар күүнүн аталышын белгилегиле:",
      options: ["Маш ботой", "Сынган бугу", "Ибарат", "Кара өзгөй"],
      correct: 2,
      explanation: "Карамолдо Орозовдун 'Ибарат' күүсү кыргыз комуз музыкасынын эң бийик, философиялык шедеври болуп саналат."
    }
  ],
  "m-26": [
    {
      q: "Жеңил атлетиканы спорттук оюндардын ичинен кандай аташат?",
      options: ["Спорттун атасы", "Спорттун канышасы", "Олимп оюну", "Биринчи спорт"],
      correct: 1,
      explanation: "Жеңил атлетика өзүнүн көп түрдүүлүгү жана табигый кыймылдары үчүн 'Спорттун канышасы' (Королева спорта) деп аталат."
    },
    {
      q: "Кыска аралыкка чуркоодо (спринтте) кайсы старт алуу техникасы колдонулат?",
      options: ["Бийик старт", "Төмөнкү старт", "Ортоңку старт", "Эркин старт"],
      correct: 1,
      explanation: "Кыска аралыкка эң жогорку ылдамдыкты тез алуу үчүн спринтерлер колодкаларды коюп, төмөнкү старт алышат."
    }
  ],
  "m-27": [
    {
      q: "Ой толук бүтүп, бир гана грамматикалык негизге (ээ, баяндооч же алардын бирине) ээ болгон сүйлөм кандай аталат?",
      options: ["Жөнөкөй сүйлөм", "Татаал сүйлөм", "Жайылма сүйлөм", "Бир тутумдуу сүйлөм"],
      correct: 0,
      explanation: "Бир гана грамматикалык борбордон турган сүйлөм жөнөкөй сүйлөм деп аталат."
    },
    {
      q: "\"Эртең биз тоого барабыз.\" деген сүйлөм айтылыш максатына карай кайсы түргө кирет?",
      options: ["Суроолуу сүйлөм", "Жай сүйлөм", "Буйрук сүйлөм", "Илептүү сүйлөм"],
      correct: 1,
      explanation: "Бул сүйлөм белгилүү бир окуя жөнүндө кабар берип жаткандыктан жай сүйлөм болот жана аягына чекит коюлат."
    }
  ],
  "m-28": [
    {
      q: "Повесттеги эң биринчи мектеп ачкан мугалимдин аты ким?",
      options: ["Каратай", "Дүйшөн", "Алтынай", "Сулайман"],
      correct: 1,
      explanation: "Дүйшөн — Чыңгыз Айтматовдун 'Биринчи мугалим' чыгармасындагы башкы каарман, жаш балдарды окуткан биринчи мугалим."
    },
    {
      q: "Дүйшөн мугалимдин колунан окуп, кийин улуу академик, илимпоз болгон кыз ким?",
      options: ["Алтынай Сулайманова", "Жамиля", "Толгонай", "Асел"],
      correct: 0,
      explanation: "Алтынай Сулайманова Дүйшөндүн мектебинен билим алып, кийин чоң илимпоз академикке айланат."
    }
  ],
  "m-29": [
    {
      q: "Бөлчөктүн сызыгынын астындагы сан (бөлүмү) эмнени билдирет?",
      options: ["Бөлүүчүнү", "Бөлүмүн (бүтүн нерсе канча барабар бөлүккө бөлүнгөнүн)", "Алымын", "Көбөйтүндүнү"],
      correct: 1,
      explanation: "Бөлчөктүн бөлүмү (бөөнү) бүтүн бир нерсе канча барабар бөлүккө бөлүнгөнүн, ал эми алымы андан канча бөлүк алынганын көрсөтөт."
    },
    {
      q: "1/4 жана 2/4 бөлчөктөрүнүн суммасы канча болот?",
      options: ["3/8", "3/4", "1/2", "3/16"],
      correct: 1,
      explanation: "Бөлүмдөрү бирдей бөлчөктөрдү кошууда алымдары кошулуп (1+2=3), бөлүмү өзгөрүүсүз калат (4). Натыйжа: 3/4."
    }
  ],
  "m-30": [
    {
      q: "Python тилинде экранга маалымат же текст чыгаруу үчүн кайсы функция колдонулат?",
      options: ["input()", "print()", "output()", "def()"],
      correct: 1,
      explanation: "Python программалоо тилинде маалыматтарды же текстти экранга чыгаруу үчүн стандарттык print() функциясы кызмат кылат."
    },
    {
      q: "Python тилинде бүтүн сандарды сактоочу өзгөрмөнүн тиби кандай аталат?",
      options: ["float", "str", "int", "bool"],
      correct: 2,
      explanation: "int (integer) — Python тилинде бүтүн сандарды (мисалы: 5, -20, 100) сактоочу маалымат тиби."
    }
  ],
  "m-31": [
    {
      q: "Температураны өлчөө үчүн колдонулуучу негизги курал кандай аталат?",
      options: ["Барометр", "Термометр", "Динамометр", "Вольтметр"],
      correct: 1,
      explanation: "Термометр — нерселердин же чөйрөнүн температурасын өлчөөчү атайын физикалык аспап."
    },
    {
      q: "Суунун кайноо температурасы Цельсий шкаласы боюнча кадимки шартта канча градуска тең?",
      options: ["0 °C", "50 °C", "100 °C", "200 °C"],
      correct: 2,
      explanation: "Цельсий шкаласы боюнча суунун кадимки атмосфералык басымда кайноо чекити 100 °C деп белгиленген."
    }
  ],
  "m-32": [
    {
      q: "Мезгилдик таблицадагы эң жеңил жана биринчи турган химиялык элемент кайсы?",
      options: ["Гелий (He)", "Көмүртек (C)", "Суутек (H)", "Кычкылтек (O)"],
      correct: 2,
      explanation: "Суутек (H) — атомдук номери 1 болгон, мезгилдик системадагы эң биринчи, эң жөнөкөй жана эң жеңил элемент."
    },
    {
      q: "Суунун (H2O) курамында кайсы элементтер бар?",
      options: ["Суутек жана хлор", "Көмүртек жана кычкылтек", "Суутек жана кычкылтек", "Азот жана суутек"],
      correct: 2,
      explanation: "Суунун молекуласы (H2O) эки суутек (H) атомунан жана бир кычкылтек (O) атомунан турат."
    }
  ],
  "m-33": [
    {
      q: "Өсүмдүктүн бардык бөлүктөрүн каптап, аны сырткы зыяндардан коргоп туруучу ткань кандай аталат?",
      options: ["Негизги ткань", "Жапкыч ткань", "Өткөргүч ткань", "Механикалык ткань"],
      correct: 1,
      explanation: "Жапкыч ткань (покровная ткань) өсүмдүктүн сыртын каптап, аны кургап кетүүдөн, механикалык соккулардан жана оору козгогучтардан сактайт."
    },
    {
      q: "Клетканын бардык жашоо иштерин башкарган жана тукум куучулук маалыматты сактаган борбору кайсы?",
      options: ["Митохондрия", "Рибосома", "Ядро", "Вакуоль"],
      correct: 2,
      explanation: "Ядро — клетканын эң маанилүү бөлүгү, анда хромосомалар (ДНК) жайгашып, бардык процесстерди башкарат."
    }
  ],
  "m-34": [
    {
      q: "Байыркы Египет мамлекети кайсы улуу дарыянын жээгинде түптөлгөн?",
      options: ["Тигр дарыясы", "Евфрат дарыясы", "Нил дарыясы", "Амазонка"],
      correct: 2,
      explanation: "Байыркы Египет дүйнөдөгү эң узун Нил дарыясынын өрөөнүндө жаралып, өнүккөн. Нилди 'жашоо булагы' деп аташкан."
    },
    {
      q: "Египет падышаларынын (фараондордун) урматына курулган залкар таш күмөздөр кандай аталат?",
      options: ["Храмдар", "Пирамидалар", "Саркофагдар", "Обелисктер"],
      correct: 1,
      explanation: "Пирамидалар — фараондордун өздөрүнүн өлүмүнөн кийинки жашоосу үчүн тирүү кезинде курулган эбегейсиз зор таш мүрзөлөрү."
    }
  ],
  "m-35": [
    {
      q: "Дүйнөдөгү эң чоң жана эң ысык чөл Сахара кайсы материкте жайгашкан?",
      options: ["Евразия", "Австралия", "Африка", "Түштүк Америка"],
      correct: 2,
      explanation: "Сахара — дүйнөдөгү эң чоң ысык кумдуу чөл, ал Африка материгинин дээрлик үчтөн бир бөлүгүн каптап турат."
    },
    {
      q: "Африканын эң узун жана суусу эң мол дарыяларын белгилегиле:",
      options: ["Нил жана Конго", "Амазонка", "Миссисипи", "Энесай"],
      correct: 0,
      explanation: "Африкадагы Нил дүйнөдөгү эң узун дарыя болуп саналат, ал эми Конго суусунун молдугу жана тереңдиги боюнча экинчи орунда турат."
    }
  ]
};

export const InteractiveGame: React.FC<InteractiveGameProps> = ({ material, onShowNotification }) => {
  const questions = GAMES_DATA[material.id] || GAMES_DATA["m-1"]; // Fallback if not found
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [streak, setStreak] = useState(0);

  // Reset game state when material changes
  useEffect(() => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setAnswered(false);
    setScore(0);
    setGameFinished(false);
    setStreak(0);
  }, [material.id]);

  const activeQuestion = questions[currentIdx];

  const handleOptionClick = (optIdx: number) => {
    if (answered) return;
    setSelectedOpt(optIdx);
    setAnswered(true);

    const isCorrect = optIdx === activeQuestion.correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      onShowNotification("Туура жооп! Азаматсыз! 🎉", "success");
    } else {
      setStreak(0);
      onShowNotification("Туура эмес жооп. Түшүндүрмөнү окуңуз. ✍️", "error");
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setAnswered(false);
    } else {
      setGameFinished(true);
      onShowNotification(`Оюн аяктады! Жалпы упайыңыз: ${score}/${questions.length} ⭐`, "info");
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setAnswered(false);
    setScore(0);
    setGameFinished(false);
    setStreak(0);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900/60 dark:to-slate-950 border border-indigo-100 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-md space-y-6 relative overflow-hidden">
      {/* Decorative vector absolute patterns */}
      <div className="absolute top-0 right-0 h-28 w-28 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-24 w-24 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-100/60 dark:border-slate-800/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500 text-white rounded-2xl shadow-md shadow-indigo-500/20">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black tracking-widest text-indigo-500 dark:text-indigo-400 uppercase">
              Мугалимдер & Окуучулар үчүн
            </span>
            <h3 className="text-md font-black text-slate-850 dark:text-white flex items-center gap-1.5">
              Интерактивдүү оюн: \"Билим Ордо\" 🏰
            </h3>
          </div>
        </div>

        {/* Level badge */}
        <div className="px-3 py-1 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 rounded-xl text-[10px] font-black text-indigo-600 dark:text-indigo-400 tracking-wide shadow-sm">
          {material.classLevel}
        </div>
      </div>

      {!gameFinished ? (
        <div className="space-y-5">
          {/* Progress state */}
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400">
              Суроо: <span className="text-indigo-600 dark:text-indigo-400">{currentIdx + 1}</span> / {questions.length}
            </span>
            <div className="flex items-center gap-3">
              {streak > 1 && (
                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" /> {streak} ТУУРА КАТАРЫНАН!
                </span>
              )}
              <span className="text-slate-400">Упай: <span className="font-bold text-slate-700 dark:text-white">{score}</span></span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4.5 rounded-2xl shadow-sm">
            <p className="text-sm font-bold text-slate-850 dark:text-white leading-relaxed">
              {activeQuestion.q}
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeQuestion.options.map((opt, oIdx) => {
              let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900 text-slate-700 dark:text-slate-200 hover:bg-indigo-50/20";
              
              if (answered) {
                if (oIdx === activeQuestion.correct) {
                  // Correct option
                  btnStyle = "bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold";
                } else if (selectedOpt === oIdx) {
                  // Wrong selected option
                  btnStyle = "bg-rose-500/10 dark:bg-rose-950/30 border-rose-500 text-rose-700 dark:text-rose-400";
                } else {
                  // Other options after answering
                  btnStyle = "bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-850 text-slate-400 opacity-60";
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleOptionClick(oIdx)}
                  disabled={answered}
                  className={`p-3.5 text-xs text-left rounded-2xl border transition duration-200 flex items-center justify-between gap-2.5 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {answered && oIdx === activeQuestion.correct && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                  {answered && selectedOpt === oIdx && oIdx !== activeQuestion.correct && (
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation block */}
          {answered && (
            <div className="bg-indigo-50/65 dark:bg-slate-950/80 border border-indigo-100/50 dark:border-slate-850/50 p-4 rounded-2xl animate-fade-in space-y-1">
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Түшүндүрмө:</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {activeQuestion.explanation}
              </p>
              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  {currentIdx === questions.length - 1 ? "Аяктоо" : "Кийинки суроо"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Scorecard view
        <div className="text-center py-6 space-y-5 animate-fade-in">
          <div className="relative inline-block">
            <div className="h-20 w-20 bg-amber-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
              <Trophy className="h-10 w-10 animate-bounce" />
            </div>
            <div className="absolute -top-1 -right-1 bg-indigo-600 text-white p-1 rounded-full">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-lg font-black text-slate-850 dark:text-white">Оюн аяктады! Ийгиликтүү өттүңүз!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Куттуктайбыз! Сиз бул теманы интерактивдүү оюн аркылуу бышыктап, өз билимиңизди көрсөттүңүз.
            </p>
          </div>

          {/* Score stats widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl max-w-xs mx-auto flex items-center justify-around">
            <div className="text-center">
              <span className="text-[9px] text-slate-400 uppercase font-black block">Жалпы упай</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{score} / {questions.length}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-[9px] text-slate-400 uppercase font-black block">Рейтинг</span>
              <span className="text-xl font-black text-amber-500">
                {score === questions.length ? "⭐⭐⭐" : score >= 1 ? "⭐⭐" : "⭐"}
              </span>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 mx-auto shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            Кайрадан баштоо
          </button>
        </div>
      )}
    </div>
  );
};
