import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import faqTreatment from "@/assets/faq-treatment.jpg";

const faqs = [
  {
    q: "Tishlarni oqartirishning eng yaxshi usuli qanday?",
    a: "Eng samarali usul — klinikada professional oqartirish. Bu xavfsiz va bir seansda sezilarli natija beradi.",
  },
  {
    q: "Menga breket yoki Invisalign kerakmi?",
    a: "Bu tishlaringizning holatiga bog'liq. Bepul konsultatsiyada shifokor sizga eng mos variantni tavsiya qiladi.",
  },
  {
    q: "Tish kanalini davolash kerakligini qanday bilaman?",
    a: "Kuchli og'riq, sezgirlik yoki shish belgilari bo'lsa, ko'rikdan o'tish kerak. Shifokor rentgen orqali aniqlaydi.",
  },
  {
    q: "Tish og'riganda nima qilishim kerak?",
    a: "Iloji boricha tezroq biz bilan bog'laning. Biz 24/7 shoshilinch yordam ko'rsatamiz.",
  },
  {
    q: "Qabulga qanday yozilsam bo'ladi?",
    a: "91 380 86 67 raqamiga qo'ng'iroq qiling yoki Telegram orqali yozing — biz qulay vaqtni tanlashga yordam beramiz.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Tez-tez beriladigan savollar
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Stomatologiya bo'yicha eng ko'p so'raladigan savollarga javoblar
          </p>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl shadow-card">
            <img
              src={faqTreatment}
              alt="Stomatologiya davolash jarayoni"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
            />
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="mb-3 rounded-2xl border border-border bg-card px-5 shadow-sm"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-card-foreground hover:no-underline sm:text-base">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
