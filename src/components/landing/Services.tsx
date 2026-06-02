import { Stethoscope, Sparkles, Crown, Smile, Shield, Activity } from "lucide-react";
import { useLanding } from "@/lib/landing-content";

const icons = [Stethoscope, Sparkles, Crown, Smile, Shield, Activity];

export function Services() {
  const c = useLanding();
  return (
    <section
      id="services"
      className="py-16 sm:py-20"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center text-primary-foreground">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {c.services.title}
          </h2>
          <p className="mt-3 text-base opacity-90">{c.services.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.services.items.map((s, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div
                key={i}
                className="group rounded-2xl bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-card-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
