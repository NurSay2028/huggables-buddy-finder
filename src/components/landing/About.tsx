import { useLanding } from "@/lib/landing-content";

export function About() {
  const c = useLanding();
  return (
    <section id="about" className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <div className="order-2 overflow-hidden rounded-3xl bg-accent shadow-card lg:order-1">
          <img
            src={c.about.image}
            alt="Tish modelini ko'rsatayotgan shifokor"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="order-1 lg:order-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {c.about.title}{" "}
            <span className="text-primary">{c.about.title_highlight}</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {c.about.text}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {c.about.stats.map((s, i) => (
              <div
                key={i}
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
            href={`tel:${c.contact.phone}`}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-105"
          >
            {c.about.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
