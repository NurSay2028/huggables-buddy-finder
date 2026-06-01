import confidentSmile from "@/assets/confident-smile.jpg";

const stats = [
  { value: "30K+", label: "Obunachilar" },
  { value: "10+ yil", label: "Tajriba" },
  { value: "10 000+", label: "Davolangan bemor" },
];

export function About() {
  return (
    <section id="about" className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div className="order-2 overflow-hidden rounded-3xl bg-accent shadow-card lg:order-1">
          <img
            src={confidentSmile}
            alt="Tish modelini ko'rsatayotgan shifokor"
            loading="lazy"
            width={1024}
            height={1024}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Biz bilan ishonchli va{" "}
            <span className="text-primary">sog'lom tabassum</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Djoni Dentist — Nukus shahridagi zamonaviy stomatologiya markazi.
            Biz har bir bemorga individual yondashamiz va eng so'nggi
            uskunalar yordamida og'riqsiz, sifatli davolashni ta'minlaymiz.
            Sizning tabassumingiz — bizning ustuvor vazifamiz.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm"
              >
                <div className="text-xl font-extrabold text-primary sm:text-2xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <a
            href="tel:+998913808667"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-105"
          >
            Qabulga yozilish
          </a>
        </div>
      </div>
    </section>
  );
}
