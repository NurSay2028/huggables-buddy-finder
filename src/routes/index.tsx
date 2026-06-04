import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { About } from "@/components/landing/About";
import { Doctor } from "@/components/landing/Doctor";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { EmergencyCTA } from "@/components/landing/EmergencyCTA";
import { Footer } from "@/components/landing/Footer";
import { BookingDialog } from "@/components/landing/BookingDialog";
import { AiSupport } from "@/components/landing/AiSupport";
import { LandingContentProvider, mergeContent, type LandingContent } from "@/lib/landing-content";
import { getLandingContent } from "@/lib/landing.functions";

export const Route = createFileRoute("/")({
  loader: async () => {
    const { json } = await getLandingContent();
    return { contentJson: json };
  },
  head: () => ({
    meta: [
      { title: "Dr. Janibek's Clinic | Dental Clinic in Nukus" },
      {
        name: "description",
        content:
          "Dr. Janibek's Clinic - Nókistegi stomatologiyalıq klinika. Tislerdi emlew, breket sistemaları, protezlew hám awız boslıǵı salamatlıǵın tiklew boyınsha xızmetler.",
      },
      { property: "og:title", content: "Djoni Dentist — Nukusdagi stomatologiya" },
      {
        property: "og:description",
        content:
          "Ishonchli stomatologiya: davolash, breket, protezlash. Nukus, Aeroport hududi. 24/7 yordam.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://drjanibek.uz/" },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/11ec7fe9-d5e8-4236-91c6-ae75a52c0025/id-preview-d4a3644b--b76fdc16-6662-4231-aa76-ff14fdd8194e.lovable.app-1780359058676.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/11ec7fe9-d5e8-4236-91c6-ae75a52c0025/id-preview-d4a3644b--b76fdc16-6662-4231-aa76-ff14fdd8194e.lovable.app-1780359058676.png",
      },
    ],
    links: [
      { rel: "canonical", href: "https://drjanibek.uz/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dentist",
          name: "Djoni Dentist",
          description:
            "Nukus shahridagi zamonaviy stomatologiya markazi. Tish davolash, breket, protezlash va oqartirish xizmatlari.",
          url: "https://drjanibek.uz/",
          telephone: "+998913808667",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Aeroport hududi",
            addressLocality: "Nukus",
            addressCountry: "UZ",
          },
          openingHours: "Mo-Su 00:00-24:00",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Tishlarni oqartirishning eng yaxshi usuli qanday?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Eng samarali usul — klinikada professional oqartirish. Bu xavfsiz va bir seansda sezilarli natija beradi.",
              },
            },
            {
              "@type": "Question",
              name: "Menga breket yoki Invisalign kerakmi?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Bu tishlaringizning holatiga bog'liq. Bepul konsultatsiyada shifokor sizga eng mos variantni tavsiya qiladi.",
              },
            },
            {
              "@type": "Question",
              name: "Tish kanalini davolash kerakligini qanday bilaman?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Kuchli og'riq, sezgirlik yoki shish belgilari bo'lsa, ko'rikdan o'tish kerak. Shifokor rentgen orqali aniqlaydi.",
              },
            },
            {
              "@type": "Question",
              name: "Tish og'riganda nima qilishim kerak?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Iloji boricha tezroq biz bilan bog'laning. Biz 24/7 shoshilinch yordam ko'rsatamiz.",
              },
            },
            {
              "@type": "Question",
              name: "Qabulga qanday yozilsam bo'ladi?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "91 380 86 67 raqamiga qo'ng'iroq qiling yoki Telegram orqali yozing — biz qulay vaqtni tanlashga yordam beramiz.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { contentJson } = Route.useLoaderData();
  let initial: LandingContent | null = null;
  if (contentJson) {
    try {
      initial = mergeContent(JSON.parse(contentJson));
    } catch {
      initial = null;
    }
  }
  return (
    <LandingContentProvider initial={initial}>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <Hero />
          <Services />
          <About />
          <Doctor />
          <Testimonials />
          <FAQ />
          <EmergencyCTA />
        </main>
        <Footer />
        <BookingDialog />
        <AiSupport />
      </div>
    </LandingContentProvider>
  );
}
