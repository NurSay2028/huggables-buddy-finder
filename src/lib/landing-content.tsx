import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import heroPatient from "@/assets/hero-patient.jpg";
import faqTreatment from "@/assets/faq-treatment.jpg";
import confidentSmile from "@/assets/confident-smile.jpg";
import doctorDjoni from "@/assets/doctor-djoni.jpg";

export type Service = { title: string; desc: string };
export type Review = { name: string; text: string };
export type Faq = { q: string; a: string };
export type Stat = { value: string; label: string };
export type DoctorEntry = {
  name: string;
  badge: string;
  bio: string;
  hours: string;
  location: string;
  image: string;
  cta: string;
};

export interface LandingContent {
  brand: { name: string; logo_text: string; logo: string };
  contact: {
    phone: string;
    phone_display: string;
    telegram_url: string;
    instagram_url: string;
    email: string;
    address: string;
  };
  hero: {
    badge: string;
    title_line1: string;
    title_highlight: string;
    title_line2: string;
    subtitle: string;
    cta_primary: string;
    cta_secondary: string;
    stat_value: string;
    stat_label: string;
    image1: string;
    image2: string;
    image3: string;
  };
  services: { title: string; subtitle: string; items: Service[] };
  about: {
    title: string;
    title_highlight: string;
    text: string;
    image: string;
    cta: string;
    stats: Stat[];
  };
  doctor: {
    section_title: string;
    section_subtitle: string;
    badge: string;
    name: string;
    bio: string;
    hours: string;
    location: string;
    image: string;
    cta: string;
    list: DoctorEntry[];
  };
  testimonials: {
    title: string;
    subtitle: string;
    rating: string;
    rating_label: string;
    items: Review[];
  };
  faq: { title: string; subtitle: string; image: string; items: Faq[] };
  emergency: { title: string; text: string; cta: string };
  footer: { about: string; copyright: string };
}

export const DEFAULT_CONTENT: LandingContent = {
  brand: { name: "Djoni Dentist", logo_text: "DD" },
  contact: {
    phone: "+998913808667",
    phone_display: "91 380 86 67",
    telegram_url: "https://teleg.one/janibek_saqtabaev",
    instagram_url: "https://instagram.com/",
    email: "example@gmail.com",
    address: "Nukus shahri, Aeroport hududi. Ish vaqti: 24/7",
  },
  hero: {
    badge: "10 000+ baxtli bemor",
    title_line1: "Ishonchli",
    title_highlight: "stomatologiya",
    title_line2: "sog'lom tabassum uchun",
    subtitle:
      "Nukus shahridagi zamonaviy stomatologiya. Davolash, breket va protezlash bo'yicha malakali yordam — kuniga 24/7.",
    cta_primary: "Qabulga yozilish",
    cta_secondary: "Qo'ng'iroq qilish",
    stat_value: "86+",
    stat_label: "Tajribali davolash usuli",
    image1: heroPatient,
    image2: faqTreatment,
    image3: confidentSmile,
  },
  services: {
    title: "Bizning xizmatlarimiz",
    subtitle: "Stomatologiyaning barcha yo'nalishlari bo'yicha to'liq xizmatlar",
    items: [
      { title: "Tish ko'rigi", desc: "Og'iz bo'shlig'ini to'liq tekshirish — muammolarni erta aniqlash va oldini olish uchun." },
      { title: "Tishlarni oqartirish", desc: "Zamonaviy va xavfsiz oqartirish texnologiyalari bilan yorqin tabassum." },
      { title: "Protezlash", desc: "Yo'qolgan tishlarni tiklash — qulay va tabiiy ko'rinishdagi protezlar." },
      { title: "Breketlar", desc: "Tishlarni to'g'rilash uchun zamonaviy breket tizimlari va Invisalign." },
      { title: "Karies davolash", desc: "Og'riqsiz va sifatli davolash, tishlarni saqlab qolish kafolati bilan." },
      { title: "Shoshilinch yordam", desc: "24/7 tez tibbiy yordam — har qanday og'riq va favqulodda holatlarda." },
    ],
  },
  about: {
    title: "Biz bilan ishonchli va",
    title_highlight: "sog'lom tabassum",
    text: "Djoni Dentist — Nukus shahridagi zamonaviy stomatologiya markazi. Biz har bir bemorga individual yondashamiz va eng so'nggi uskunalar yordamida og'riqsiz, sifatli davolashni ta'minlaymiz. Sizning tabassumingiz — bizning ustuvor vazifamiz.",
    image: confidentSmile,
    cta: "Qabulga yozilish",
    stats: [
      { value: "30K+", label: "Obunachilar" },
      { value: "10+ yil", label: "Tajriba" },
      { value: "10 000+", label: "Davolangan bemor" },
    ],
  },
  doctor: {
    section_title: "Sizning shifokoringiz",
    section_subtitle: "Tajribali mutaxassis sizga yordam berishga tayyor",
    badge: "Stomatolog | Expert",
    name: "Janibek Saqtabaev",
    bio: "Davolash, breket va protezlash bo'yicha mutaxassis. 10 000+ dan ortiq bemorni muvaffaqiyatli davolagan. Har bir bemorga g'amxo'rlik va zamonaviy yondashuv.",
    hours: "Ish vaqti: 24/7",
    location: "Nukus shahri, Aeroport hududi",
    image: doctorDjoni,
    cta: "91 380 86 67",
    list: [
      {
        name: "Janibek Saqtabaev",
        badge: "Stomatolog | Expert",
        bio: "Davolash, breket va protezlash bo'yicha mutaxassis. 10 000+ dan ortiq bemorni muvaffaqiyatli davolagan. Har bir bemorga g'amxo'rlik va zamonaviy yondashuv.",
        hours: "Ish vaqti: 24/7",
        location: "Nukus shahri, Aeroport hududi",
        image: doctorDjoni,
        cta: "91 380 86 67",
      },
    ],
  },
  testimonials: {
    title: "Bemorlar fikri",
    subtitle: "Bemorlarimizdan kelgan eng so'nggi ijobiy sharhlar",
    rating: "4.9",
    rating_label: "O'rtacha baho",
    items: [
      { name: "Aziza Karimova", text: "Tishlarimni oqartirdim, natija ajoyib! Shifokor juda diqqatli va g'amxo'r. Tavsiya qilaman!" },
      { name: "Bekzod Yusupov", text: "Bolam uchun keldik, juda sabrli va mehribon munosabat. Endi tish shifokoridan qo'rqmaydi." },
      { name: "Madina Sultonova", text: "Breket o'rnatdim, butun jarayon og'riqsiz va sifatli bo'ldi. Rahmat Djoni Dentist!" },
      { name: "Sardor Rahimov", text: "Protezlash bo'yicha murojaat qildim. Natijadan juda mamnunman, tabiiy ko'rinadi." },
      { name: "Nilufar Ergasheva", text: "Eng yaxshi klinika! Tozalik, zamonaviy uskunalar va professional jamoa." },
      { name: "Jasur To'rayev", text: "Kechqurun og'riq paydo bo'ldi, 24/7 yordam berishdi. Katta rahmat!" },
    ],
  },
  faq: {
    title: "Tez-tez beriladigan savollar",
    subtitle: "Stomatologiya bo'yicha eng ko'p so'raladigan savollarga javoblar",
    image: faqTreatment,
    items: [
      { q: "Tishlarni oqartirishning eng yaxshi usuli qanday?", a: "Eng samarali usul — klinikada professional oqartirish. Bu xavfsiz va bir seansda sezilarli natija beradi." },
      { q: "Menga breket yoki Invisalign kerakmi?", a: "Bu tishlaringizning holatiga bog'liq. Bepul konsultatsiyada shifokor sizga eng mos variantni tavsiya qiladi." },
      { q: "Tish kanalini davolash kerakligini qanday bilaman?", a: "Kuchli og'riq, sezgirlik yoki shish belgilari bo'lsa, ko'rikdan o'tish kerak. Shifokor rentgen orqali aniqlaydi." },
      { q: "Tish og'riganda nima qilishim kerak?", a: "Iloji boricha tezroq biz bilan bog'laning. Biz 24/7 shoshilinch yordam ko'rsatamiz." },
      { q: "Qabulga qanday yozilsam bo'ladi?", a: "91 380 86 67 raqamiga qo'ng'iroq qiling yoki Telegram orqali yozing — biz qulay vaqtni tanlashga yordam beramiz." },
    ],
  },
  emergency: {
    title: "Shoshilinch tish yordami kerakmi?",
    text: "Biz har qanday favqulodda holatda yordam berishga tayyormiz — kuniga 24 soat, haftada 7 kun.",
    cta: "Bog'lanish",
  },
  footer: {
    about:
      "Nukus shahridagi zamonaviy stomatologiya markazi. Sog'lom va chiroyli tabassum uchun.",
    copyright: "© 2026 Djoni Dentist. Barcha huquqlar himoyalangan.",
  },
};

/** Deep-merge a stored partial onto the defaults (section by section).
 * Empty/blank values are ignored so the defaults always win. */
export function mergeContent(stored: unknown): LandingContent {
  const s = (stored ?? {}) as Record<string, Record<string, unknown>>;
  const out = {} as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_CONTENT) as (keyof LandingContent)[]) {
    const section = { ...(DEFAULT_CONTENT[key] as Record<string, unknown>) };
    const storedSection = s[key] ?? {};
    for (const field of Object.keys(storedSection)) {
      const v = storedSection[field];
      if (v === undefined || v === null) continue;
      if (typeof v === "string" && v.trim() === "") continue;
      if (Array.isArray(v) && v.length === 0) continue;
      section[field] = v;
    }
    out[key] = section;
  }
  return out as unknown as LandingContent;
}

const LandingContentContext = createContext<LandingContent>(DEFAULT_CONTENT);

export function LandingContentProvider({
  children,
  initial,
}: {
  children: ReactNode;
  /** Server-loaded content (avoids the default-content flash on first paint). */
  initial?: LandingContent | null;
}) {
  const [content, setContent] = useState<LandingContent>(initial ?? DEFAULT_CONTENT);

  useEffect(() => {
    // Always refresh in the background so edits appear without a rebuild.
    // We start from the server-provided `initial`, so this rarely changes
    // anything visible (no flicker) but keeps the page up to date.
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("landing_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      if (active && data?.content) setContent(mergeContent(data.content));
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <LandingContentContext.Provider value={content}>
      {children}
    </LandingContentContext.Provider>
  );
}

export function useLanding() {
  return useContext(LandingContentContext);
}
