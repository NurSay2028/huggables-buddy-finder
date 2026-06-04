import { BadgeCheck, Clock, MapPin } from "lucide-react";
import { useLanding, type DoctorEntry } from "@/lib/landing-content";
import doctorDjoni from "@/assets/doctor-djoni.jpg";

export function Doctor() {
  const c = useLanding();
  // Backwards compatible: fall back to the single-doctor fields if list is empty
  const doctors: DoctorEntry[] =
    c.doctor.list && c.doctor.list.length > 0
      ? c.doctor.list
      : [
          {
            name: c.doctor.name,
            badge: c.doctor.badge,
            bio: c.doctor.bio,
            hours: c.doctor.hours,
            location: c.doctor.location,
            image: c.doctor.image,
            cta: c.doctor.cta,
          },
        ];

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

        <div className="mx-auto mt-12 grid max-w-4xl gap-8">
          {doctors.map((d, i) => (
            <div
              key={i}
              className="grid items-center gap-8 rounded-3xl bg-card p-6 shadow-card sm:p-8 lg:grid-cols-2"
            >
              <div className="overflow-hidden rounded-2xl bg-muted">
                <img
                  src={d.image || doctorDjoni}
                  alt={d.name}
                  loading="lazy"
                  className="h-auto w-full object-contain"
                />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <BadgeCheck className="h-4 w-4" />
                  {d.badge}
                </span>
                <h3 className="mt-4 text-2xl font-extrabold text-card-foreground">
                  {d.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {d.bio}
                </p>

                <ul className="mt-5 space-y-3 text-sm">
                  <li className="flex items-center gap-3 text-card-foreground">
                    <Clock className="h-5 w-5 text-primary" />
                    {d.hours}
                  </li>
                  <li className="flex items-center gap-3 text-card-foreground">
                    <MapPin className="h-5 w-5 text-primary" />
                    {d.location}
                  </li>
                </ul>

                {d.cta && (
                  <a
                    href={`tel:${c.contact.phone}`}
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-105"
                  >
                    {d.cta}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
