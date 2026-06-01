import { Stethoscope, Sparkles, Crown, Smile, Shield, Activity } from "lucide-react";

const services = [
  {
    icon: Stethoscope,
    title: "Tish ko'rigi",
    desc: "Og'iz bo'shlig'ini to'liq tekshirish — muammolarni erta aniqlash va oldini olish uchun.",
  },
  {
    icon: Sparkles,
    title: "Tishlarni oqartirish",
    desc: "Zamonaviy va xavfsiz oqartirish texnologiyalari bilan yorqin tabassum.",
  },
  {
    icon: Crown,
    title: "Protezlash",
    desc: "Yo'qolgan tishlarni tiklash — qulay va tabiiy ko'rinishdagi protezlar.",
  },
  {
    icon: Smile,
    title: "Breketlar",
    desc: "Tishlarni to'g'rilash uchun zamonaviy breket tizimlari va Invisalign.",
  },
  {
    icon: Shield,
    title: "Karies davolash",
    desc: "Og'riqsiz va sifatli davolash, tishlarni saqlab qolish kafolati bilan.",
  },
  {
    icon: Activity,
    title: "Shoshilinch yordam",
    desc: "24/7 tez tibbiy yordam — har qanday og'riq va favqulodda holatlarda.",
  },
];

export function Services() {
  return (
    <section
      id="services"
      className="py-16 sm:py-20"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center text-primary-foreground">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Bizning xizmatlarimiz
          </h2>
          <p className="mt-3 text-base opacity-90">
            Stomatologiyaning barcha yo'nalishlari bo'yicha to'liq xizmatlar
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-card-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
