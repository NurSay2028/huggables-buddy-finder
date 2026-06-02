import { Star, Quote } from "lucide-react";
import { useLanding } from "@/lib/landing-content";

export function Testimonials() {
  const c = useLanding();
  return (
    <section id="testimonials" className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md text-center sm:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {c.testimonials.title}
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              {c.testimonials.subtitle}
            </p>
          </div>

          <div
            className="flex items-center gap-3 rounded-2xl px-6 py-4 text-primary-foreground shadow-elegant"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Star className="h-8 w-8 fill-current" />
            <div>
              <div className="text-2xl font-extrabold">{c.testimonials.rating}</div>
              <div className="text-xs opacity-90">{c.testimonials.rating_label}</div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.testimonials.items.map((r, idx) => (
            <div
              key={idx}
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
