import { BadgeCheck, Clock, MapPin } from "lucide-react";
import { useLanding } from "@/lib/landing-content";

export function Doctor() {
  const c = useLanding();
  return (
    <section id="doctor" className="bg-accent py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {c.doctor.section_title}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            {c.doctor.section_subtitle}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl items-center gap-8 rounded-3xl bg-card p-6 shadow-card sm:p-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={c.doctor.image}
              alt={c.doctor.name}
              loading="lazy"
              className="h-80 w-full object-cover object-top sm:h-96"
            />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BadgeCheck className="h-4 w-4" />
              {c.doctor.badge}
            </span>
            <h3 className="mt-4 text-2xl font-extrabold text-card-foreground">
              {c.doctor.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {c.doctor.bio}
            </p>

            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-3 text-card-foreground">
                <Clock className="h-5 w-5 text-primary" />
                {c.doctor.hours}
              </li>
              <li className="flex items-center gap-3 text-card-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                {c.doctor.location}
              </li>
            </ul>

            <a
              href={`tel:${c.contact.phone}`}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-105"
            >
              {c.doctor.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
