import React, { useState } from "react";
import { 
  Check, 
  X, 
  CreditCard, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Calendar, 
  CheckCircle2, 
  Mail, 
  ArrowRight, 
  Gift, 
  Building,
  GraduationCap
} from "lucide-react";
import { User } from "../types";

interface SubscriptionViewProps {
  lang: "ky" | "ru" | "en";
  currentUser: User | null;
  onUpdateUser: (user: User | null) => void;
  onShowNotification: (msg: string) => void;
  onOpenAuth: () => void;
}

const SUBSCRIPTION_TRANSLATIONS = {
  header_title: {
    ky: "Премиум Жазылуу жана Пландар",
    ru: "Премиум Подписка и Тарифы",
    en: "Premium Subscription & Plans"
  },
  header_subtitle: {
    ky: "Чексиз AI куралдары, премиум материалдарды толук жүктөө жана Кыргызстандын мугалимдери үчүн алдыңкы технологиялар.",
    ru: "Безлимитные инструменты ИИ, полное скачивание премиум материалов и передовые технологии для учителей Кыргызстана.",
    en: "Unlimited AI tools, full downloads of premium materials, and cutting-edge technologies for teachers of Kyrgyzstan."
  },
  monthly: {
    ky: "Айына",
    ru: "В месяц",
    en: "Monthly"
  },
  yearly: {
    ky: "Жылына",
    ru: "В год",
    en: "Yearly"
  },
  save_badge: {
    ky: "Үнөмдөө 30%",
    ru: "Скидка 30%",
    en: "Save 30%"
  },
  popular_badge: {
    ky: "Эң популярдуу",
    ru: "Популярный",
    en: "Most Popular"
  },
  features_title: {
    ky: "Планга кирген кызматтар:",
    ru: "Что входит в тариф:",
    en: "What's included in the plan:"
  },
  btn_current: {
    ky: "Азыркы тарифиңиз",
    ru: "Текущий тариф",
    en: "Current Plan"
  },
  btn_activate: {
    ky: "Катталуу",
    ru: "Подключить",
    en: "Subscribe Now"
  },
  btn_buy: {
    ky: "Сатып алуу",
    ru: "Купить",
    en: "Purchase"
  },
  need_login: {
    ky: "Жазылуу үчүн алгач системага кириңиз",
    ru: "Для подписки сначала войдите в систему",
    en: "Please login first to subscribe"
  },
  payment_title: {
    ky: "Ыкчам төлөм",
    ru: "Быстрая оплата",
    en: "Fast Payment"
  },
  payment_desc: {
    ky: "Кыргызстандын алдыңкы капчыктары же банктык карталары аркылуу коопсуз төлөңүз.",
    ru: "Безопасная оплата через популярные кошельки Кыргызстана или банковские карты.",
    en: "Secure payment via popular Kyrgyz mobile wallets or bank cards."
  },
  phone_label: {
    ky: "Капчыкка катталган телефон номери",
    ru: "Номер телефона, привязанный к кошельку",
    en: "Phone number linked to wallet"
  },
  card_label: {
    ky: "Картанын номери",
    ru: "Номер карты",
    en: "Card number"
  },
  expiry_cvc: {
    ky: "Мөөнөтү / CVC",
    ru: "Срок / CVC",
    en: "Expiry / CVC"
  },
  btn_confirm_pay: {
    ky: "Төлөмдү ырастоо",
    ru: "Подтвердить оплату",
    en: "Confirm Payment"
  },
  processing: {
    ky: "Төлөм текшерилүүдө...",
    ru: "Проверка платежа...",
    en: "Verifying payment..."
  },
  success_title: {
    ky: "Куттуктайбыз! Жазылуу ийгиликтүү кошулду!",
    ru: "Поздравляем! Подписка успешно активирована!",
    en: "Congratulations! Subscription activated successfully!"
  },
  success_desc: {
    ky: "Эми сизде бардык премиум сабак пландары, AI куралдары жана чексиз жүктөөлөр жеткиликтүү болду.",
    ru: "Теперь вам доступны все премиум планы уроков, ИИ инструменты и безлимитные скачивания.",
    en: "Now you have full access to all premium lesson plans, AI tools, and unlimited downloads."
  },
  newsletter_title: {
    ky: "Мугалимдер үчүн пайдалуу маалыматтар (Жаңылыктарга жазылуу)",
    ru: "Полезная рассылка для учителей (Подписка на новости)",
    en: "Useful newsletter for teachers (Subscribe to news)"
  },
  newsletter_subtitle: {
    ky: "Жаңы методикалык куралдар, AI жаңылыктары жана КР Билим берүү министрлигинин акыркы стандарттары тууралуу маалыматтарды электрондук почтаңызга түз алыңыз.",
    ru: "Получайте новые методические пособия, новости ИИ и последние стандарты МОиН КР прямо на вашу почту.",
    en: "Receive new methodological resources, AI updates, and the latest Ministry of Education standards directly in your inbox."
  },
  newsletter_placeholder: {
    ky: "Сиздин электрондук почтаңыз (Email)...",
    ru: "Ваш электронный адрес (Email)...",
    en: "Your email address..."
  },
  newsletter_btn: {
    ky: "Катталуу",
    ru: "Подписаться",
    en: "Subscribe"
  },
  newsletter_success: {
    ky: "Ийгиликтүү жазылдыңыз! Жаңы маалыматтар почтаңызга жөнөтүлөт.",
    ru: "Успешная подписка! Новые материалы будут отправлены на почту.",
    en: "Successfully subscribed! New updates will be sent to your email."
  }
};

export function SubscriptionView({ lang, currentUser, onUpdateUser, onShowNotification, onOpenAuth }: SubscriptionViewProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [paymentStep, setPaymentStep] = useState<"plan" | "payment" | "processing" | "success">("plan");
  const [paymentMethod, setPaymentMethod] = useState<"mbank" | "megapay" | "omoney" | "card">("mbank");
  
  // Payment Form States
  const [phoneNumber, setPhoneNumber] = useState("0");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Newsletter Form States
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isNewsletterSubscribed, setIsNewsletterSubscribed] = useState(false);

  const tLocal = (key: keyof typeof SUBSCRIPTION_TRANSLATIONS) => {
    return SUBSCRIPTION_TRANSLATIONS[key][lang] || SUBSCRIPTION_TRANSLATIONS[key]["ky"];
  };

  const PLANS = [
    {
      id: "free",
      name: {
        ky: "Базовый",
        ru: "Базовый",
        en: "Basic"
      },
      price: 0,
      description: {
        ky: "Санариптик мектеп дүйнөсү менен таанышуу үчүн",
        ru: "Для ознакомления с миром цифровой школы",
        en: "To explore the digital school platform"
      },
      features: {
        ky: [
          "Күнүнө 3 AI мууну (Сабак планы же оюн)",
          "Жөнөкөй материалдарды издөө жана көрүү",
          "Тест генератору куралына чектелген кирүү",
          "Стандарттык колдоо"
        ],
        ru: [
          "3 ИИ генерации в день (План урока или игра)",
          "Поиск и просмотр базовых материалов",
          "Ограниченный доступ к генератору тестов",
          "Стандартная поддержка"
        ],
        en: [
          "3 AI generations per day (Lesson plan or game)",
          "Search and view basic materials",
          "Limited access to test generator tool",
          "Standard support"
        ]
      }
    },
    {
      id: "pro",
      name: {
        ky: "Мугалим Про ✨",
        ru: "Учитель Про ✨",
        en: "Teacher Pro ✨"
      },
      price: billingPeriod === "monthly" ? 290 : 2400, // Monthly is 290 KGS, Yearly is 2400 KGS
      description: {
        ky: "Заманбап активдүү мугалимдер үчүн толук мүмкүнчүлүктөр",
        ru: "Полные возможности для современных активных учителей",
        en: "Full features for modern and active educators"
      },
      features: {
        ky: [
          "ЧЕКСИЗ AI генерациялары (План, Тест, Презентация, Оюн)",
          "Бардык материалдарды толук жүктөө (Word / PDF форматта)",
          "Жаңы тил, класс жана предмет деңгээлдери",
          "Рекламасыз колдонуу жана ылдам иштөө",
          "Премиум коомчулукка кирүү жана жардам",
          "Атайын министрликтин стандарттык калыптары"
        ],
        ru: [
          "БЕЗЛИМИТНЫЕ ИИ генерации (Планы, Тесты, Презентации, Игры)",
          "Полное скачивание всех материалов (в формате Word / PDF)",
          "Доступ к новым языкам, классам и предметам",
          "Работа без рекламы и на высокой скорости",
          "Доступ к премиум сообществу и техподдержка",
          "Специальные стандартные шаблоны министерства"
        ],
        en: [
          "UNLIMITED AI generations (Plans, Tests, Slides, Games)",
          "Full download of all files (Word & PDF formats)",
          "Access to advanced languages, grades, and subjects",
          "Ad-free experience and top speed",
          "Premium community access & priority support",
          "Special Ministry standard formats & templates"
        ]
      },
      isPopular: true
    },
    {
      id: "school",
      name: {
        ky: "Мектеп / Лицей Лицензиясы",
        ru: "Лицензия Школы / Лицея",
        en: "School / Lyceum License"
      },
      price: billingPeriod === "monthly" ? 990 : 8400,
      description: {
        ky: "Мектеп жамааттары жана усулдук бирикмелер үчүн",
        ru: "Для школьных коллективов и метод-объединений",
        en: "For school communities and methodologies"
      },
      features: {
        ky: [
          "50 мугалимге чейин толук Pro лицензиясы",
          "Мектептин өздүк материалдар архиви",
          "Аналитика жана мугалимдердин активдүүлүгү",
          "Окуучулар үчүн өз алдынча онлайн тест баракчасы",
          "Методикалык семинарлар жана эксперттик жардам",
          "Мектепке тиешелүү атайын брендинг"
        ],
        ru: [
          "Полная лицензия Pro для группы до 50 учителей",
          "Собственный архив материалов школы",
          "Аналитика и статистика активности учителей",
          "Индивидуальные тестовые страницы для учеников",
          "Методические семинары и экспертное сопровождение",
          "Уникальный брендинг для вашей школы"
        ],
        en: [
          "Full Pro license for up to 50 teachers",
          "Custom school-wide material archives",
          "Analytics and teacher activity dashboards",
          "Individual test pages for students",
          "Methodological seminars & expert mentorship",
          "Custom branding for the school"
        ]
      }
    }
  ];

  const handleSelectPlan = (plan: any) => {
    if (plan.id === "free") {
      // Free plan
      if (!currentUser) {
        onOpenAuth();
        onShowNotification(tLocal("need_login"));
        return;
      }
      const updatedUser: User = {
        ...currentUser,
        isPremium: false,
        subscriptionPlan: "free"
      };
      onUpdateUser(updatedUser);
      onShowNotification(lang === "ky" ? "Сиз бекер тарифти тандадыңыз." : "Вы выбрали бесплатный тариф.");
      return;
    }

    if (!currentUser) {
      onOpenAuth();
      onShowNotification(tLocal("need_login"));
      return;
    }

    setSelectedPlan(plan);
    setPaymentStep("payment");
    // Pre-fill dummy based on method
    setPhoneNumber("0550123456");
    setCardNumber("");
  };

  const handleConfirmPayment = () => {
    setPaymentStep("processing");
    setTimeout(() => {
      // payment complete simulation
      const expiresDate = new Date();
      expiresDate.setMonth(expiresDate.getMonth() + (billingPeriod === "monthly" ? 1 : 12));
      
      const updatedUser: User = {
        ...currentUser!,
        isPremium: true,
        subscriptionPlan: selectedPlan.id === "pro" ? "pro" : "school",
        subscriptionExpires: expiresDate.toLocaleDateString()
      };
      
      onUpdateUser(updatedUser);
      setPaymentStep("success");
      onShowNotification(lang === "ky" ? "Жазылуу ийгиликтүү кошулду!" : "Подписка успешно активирована!");
    }, 1800);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      onShowNotification(lang === "ky" ? "Туура почта дарегин жазыңыз." : "Введите корректный адрес почты.");
      return;
    }
    setIsNewsletterSubscribed(true);
    onShowNotification(tLocal("newsletter_success"));
    setNewsletterEmail("");
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold uppercase tracking-wider">
          {lang === "ky" ? "Жазылуулар" : lang === "ru" ? "Подписки" : "Subscriptions"}
        </span>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
          {tLocal("header_title")}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
          {tLocal("header_subtitle")}
        </p>

        {/* MONTHLY / YEARLY TOGGLE */}
        <div className="pt-4 flex justify-center">
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl inline-flex items-center gap-1 border border-slate-200 dark:border-slate-800">
            <button
              id="btn-billing-monthly"
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 ${
                billingPeriod === "monthly" 
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              {tLocal("monthly")}
            </button>
            <button
              id="btn-billing-yearly"
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
                billingPeriod === "yearly" 
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              <span>{tLocal("yearly")}</span>
              <span className="px-1.5 py-0.5 bg-indigo-500 text-white rounded-md text-[9px] font-bold">
                {tLocal("save_badge")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {PLANS.map((plan) => {
          const isUserPlan = currentUser && (
            (plan.id === "free" && !currentUser.subscriptionPlan) ||
            currentUser.subscriptionPlan === plan.id
          );

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between bg-white dark:bg-slate-900 border transition duration-300 ${
                plan.isPopular 
                  ? "border-indigo-500 shadow-xl shadow-indigo-500/5 ring-1 ring-indigo-500" 
                  : "border-slate-150 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-750 shadow-sm"
              }`}
            >
              {plan.isPopular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-md">
                  {tLocal("popular_badge")}
                </span>
              )}

              {/* Plan Title & Price */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {plan.id === "free" ? (
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-lg">
                      <Gift className="h-5 w-5" />
                    </div>
                  ) : plan.id === "pro" ? (
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 rounded-lg">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-500 rounded-lg">
                      <Building className="h-5 w-5" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name[lang] || plan.name["ky"]}</h3>
                </div>

                <p className="text-xs text-slate-450 leading-relaxed min-h-[32px]">
                  {plan.description[lang] || plan.description["ky"]}
                </p>

                <div className="pt-2 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-slate-400 text-xs font-bold">KGS / {billingPeriod === "monthly" ? (lang === "ky" ? "ай" : "мес") : (lang === "ky" ? "жыл" : "год")}</span>
                </div>

                <hr className="border-slate-100 dark:border-slate-800 pt-2" />

                {/* Features list */}
                <div className="space-y-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{tLocal("features_title")}</p>
                  <ul className="space-y-3">
                    {(plan.features[lang] || plan.features["ky"]).map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-650 dark:text-slate-350">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                {isUserPlan ? (
                  <div className="w-full text-center py-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    {tLocal("btn_current")}
                  </div>
                ) : (
                  <button
                    id={`btn-select-plan-${plan.id}`}
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 rounded-2xl text-xs font-bold transition duration-200 flex items-center justify-center gap-1.5 ${
                      plan.isPopular 
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10" 
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {plan.id === "free" ? tLocal("btn_activate") : tLocal("btn_buy")}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}

                {isUserPlan && currentUser?.subscriptionExpires && (
                  <p className="text-[10px] text-center text-slate-450 mt-2 font-medium">
                    {lang === "ky" ? "Мөөнөтү:" : "Действителен до:"} {currentUser.subscriptionExpires}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECURE CHECKOUT / SIMULATED PAYMENT DIALOG */}
      {selectedPlan && paymentStep !== "plan" && (
        <div id="payment-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-indigo-50 dark:border-slate-800 transition">
            
            {/* Payment Header */}
            <div className="p-6 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 rounded-xl">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-md font-bold text-slate-900 dark:text-white">{tLocal("payment_title")}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedPlan.name[lang] || selectedPlan.name["ky"]} ({selectedPlan.price} KGS)</p>
                </div>
              </div>
              <button
                id="btn-close-payment"
                onClick={() => { setSelectedPlan(null); setPaymentStep("plan"); }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {paymentStep === "payment" && (
                <div className="space-y-6">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {tLocal("payment_desc")}
                  </p>

                  {/* Wallet Logos Selection */}
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { id: "mbank", label: "MBank", color: "bg-red-500 text-white border-red-500" },
                      { id: "megapay", label: "MegaPay", color: "bg-emerald-500 text-white border-emerald-500" },
                      { id: "omoney", label: "O!Money", color: "bg-amber-500 text-slate-950 border-amber-500" },
                      { id: "card", label: "Карта", color: "bg-slate-800 text-white border-slate-800" }
                    ].map((method) => (
                      <button
                        key={method.id}
                        id={`payment-method-${method.id}`}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`py-3 px-1 rounded-xl text-[11px] font-black border transition-all text-center ${
                          paymentMethod === method.id 
                            ? `${method.color} shadow-lg shadow-indigo-500/10 scale-102` 
                            : "border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>

                  {/* Form input based on selection */}
                  {paymentMethod !== "card" ? (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {tLocal("phone_label")}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">+996</span>
                        <input
                          id="input-pay-phone"
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full pl-16 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-800 dark:text-white font-bold tracking-wider"
                          placeholder="550 123 456"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {tLocal("card_label")}
                        </label>
                        <input
                          id="input-pay-card-num"
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4000 1234 5678 9010"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-800 dark:text-white font-bold tracking-widest"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Мөөнөтү (MM/YY)
                          </label>
                          <input
                            id="input-pay-card-expiry"
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-sm text-slate-800 dark:text-white font-bold tracking-widest"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            CVC
                          </label>
                          <input
                            id="input-pay-card-cvc"
                            type="password"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="***"
                            maxLength={3}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-sm text-slate-800 dark:text-white font-bold tracking-widest"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pay Action Button */}
                  <button
                    id="btn-confirm-payment"
                    onClick={handleConfirmPayment}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="h-4.5 w-4.5" />
                    {tLocal("btn_confirm_pay")}
                  </button>
                </div>
              )}

              {/* Processing Spinner State */}
              {paymentStep === "processing" && (
                <div className="py-12 text-center space-y-4">
                  <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent align-[-0.125em]" role="status" />
                  <p className="text-sm font-bold text-slate-800 dark:text-white">{tLocal("processing")}</p>
                </div>
              )}

              {/* Success Screen */}
              {paymentStep === "success" && (
                <div className="py-6 text-center space-y-6">
                  <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                    🎉
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="text-lg font-extrabold text-slate-900 dark:text-white">{tLocal("success_title")}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      {tLocal("success_desc")}
                    </p>
                  </div>

                  <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100/50 max-w-sm mx-auto flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-white">
                      {selectedPlan.name[lang] || selectedPlan.name["ky"]}
                    </span>
                    <span className="text-slate-400">
                      {billingPeriod === "monthly" ? "1-айлык тариф" : "1-жылдык тариф"}
                    </span>
                  </div>

                  <button
                    id="btn-finish-payment"
                    onClick={() => { setSelectedPlan(null); setPaymentStep("plan"); }}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
                  >
                    Аяктоо / Башкы бетке өтүү
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. EMAIL NEWSLETTER SUBSCRIPTION FORM */}
      <div className="bg-gradient-to-br from-indigo-550 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white max-w-5xl mx-auto shadow-xl relative overflow-hidden">
        {/* Absolute Background shapes for high-end look */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 opacity-80" />
              <span className="text-xs font-bold uppercase tracking-wider opacity-85">Жаңылыктарга катталуу</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">{tLocal("newsletter_title")}</h3>
            <p className="text-xs opacity-80 leading-relaxed max-w-xl">
              {tLocal("newsletter_subtitle")}
            </p>
          </div>

          <div className="lg:col-span-2">
            {isNewsletterSubscribed ? (
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center text-xs font-bold space-y-1">
                <div>🎉 Рахмат!</div>
                <div className="opacity-90 font-medium">{tLocal("newsletter_success")}</div>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                  id="input-newsletter-email"
                  type="email"
                  required
                  placeholder={tLocal("newsletter_placeholder")}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 hover:border-white/40 focus:bg-white text-slate-900 focus:text-slate-900 rounded-2xl text-xs font-medium focus:outline-none flex-grow placeholder-white/60 focus:placeholder-slate-400 transition"
                />
                <button
                  id="btn-newsletter-subscribe"
                  type="submit"
                  className="px-5 py-3 bg-white hover:bg-slate-50 text-indigo-700 text-xs font-black rounded-2xl transition shadow-lg shadow-indigo-950/20 whitespace-nowrap"
                >
                  {tLocal("newsletter_btn")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
