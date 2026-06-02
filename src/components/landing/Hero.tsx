import { Users, Star, Phone } from "lucide-react";
import { openBooking } from "@/components/landing/BookingDialog";
import { useLanding } from "@/lib/landing-content";

export function Hero() {
  const c = useLanding();
  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{ background: "var(--gradient-soft)" }}
    >
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {c.hero.badge}
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            <span className="text-primary">{c.hero.title_line1}</span>{" "}
            {c.hero.title_highlight} <br className="hidden sm:block" />
            {c.hero.title_line2}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            {c.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={openBooking}
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-105 sm:w-auto"
            >
              {c.hero.cta_primary}
            </button>
            <a
              href={`tel:${c.contact.phone}`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary bg-background px-7 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-accent sm:w-auto"
            >
              <Phone className="h-4 w-4" />
              {c.hero.cta_secondary}
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="overflow-hidden rounded-2xl shadow-card">
            <img
              src={c.hero.image1}
              alt="Stomatologiya kresloasidagi tabassum qilayotgan bemor"
              className="h-44 w-full object-cover sm:h-52"
            />
          </div>
          <div className="overflow-hidden rounded-2xl shadow-card">
            <img
              src={c.hero.image2}
              alt="Tishlarni tekshirayotgan shifokor"
              loading="lazy"
              className="h-44 w-full object-cover sm:h-52"
            />
          </div>
          <div
            className="flex h-44 flex-col items-center justify-center rounded-2xl px-4 text-center text-primary-foreground shadow-elegant sm:h-52"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Users className="mb-2 h-8 w-8" />
            <div className="text-3xl font-extrabold">{c.hero.stat_value}</div>
            <div className="text-sm opacity-90">{c.hero.stat_label}</div>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-card">
            <img
              src={c.hero.image3}
              alt="Tish modelini ushlab turgan shifokor"
              loading="lazy"
              className="h-44 w-full object-cover sm:h-52"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
