import { Phone } from "lucide-react";

export function EmergencyCTA() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="flex flex-col items-start justify-between gap-6 rounded-3xl px-6 py-10 text-primary-foreground shadow-elegant sm:px-10 md:flex-row md:items-center"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Shoshilinch tish yordami kerakmi?
            </h2>
            <p className="mt-2 max-w-lg text-sm opacity-90 sm:text-base">
              Biz har qanday favqulodda holatda yordam berishga tayyormiz —
              kuniga 24 soat, haftada 7 kun.
            </p>
          </div>
          <a
            href="tel:+998913808667"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-background px-7 py-3.5 text-sm font-semibold text-primary shadow-card transition-transform hover:scale-105"
          >
            <Phone className="h-4 w-4" />
            Bog'lanish
          </a>
        </div>
      </div>
    </section>
  );
}
