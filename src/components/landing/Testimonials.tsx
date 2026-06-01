import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Aziza Karimova",
    text: "Tishlarimni oqartirdim, natija ajoyib! Shifokor juda diqqatli va g'amxo'r. Tavsiya qilaman!",
  },
  {
    name: "Bekzod Yusupov",
    text: "Bolam uchun keldik, juda sabrli va mehribon munosabat. Endi tish shifokoridan qo'rqmaydi.",
  },
  {
    name: "Madina Sultonova",
    text: "Breket o'rnatdim, butun jarayon og'riqsiz va sifatli bo'ldi. Rahmat Djoni Dentist!",
  },
  {
    name: "Sardor Rahimov",
    text: "Protezlash bo'yicha murojaat qildim. Natijadan juda mamnunman, tabiiy ko'rinadi.",
  },
  {
    name: "Nilufar Ergasheva",
    text: "Eng yaxshi klinika! Tozalik, zamonaviy uskunalar va professional jamoa.",
  },
  {
    name: "Jasur To'rayev",
    text: "Kechqurun og'riq paydo bo'ldi, 24/7 yordam berishdi. Katta rahmat!",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md text-center sm:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Bemorlar fikri
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Bemorlarimizdan kelgan eng so'nggi ijobiy sharhlar
            </p>
          </div>

          <div
            className="flex items-center gap-3 rounded-2xl px-6 py-4 text-primary-foreground shadow-elegant"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Star className="h-8 w-8 fill-current" />
            <div>
              <div className="text-2xl font-extrabold">4.9</div>
              <div className="text-xs opacity-90">O'rtacha baho</div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <div
              key={r.name}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <Quote className="h-6 w-6 text-primary/30" />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {r.text}
              </p>
              <div className="mt-4 font-semibold text-card-foreground">
                {r.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
