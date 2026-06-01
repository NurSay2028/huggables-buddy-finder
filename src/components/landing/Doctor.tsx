import doctorDjoni from "@/assets/doctor-djoni.jpg";
import { BadgeCheck, Clock, MapPin } from "lucide-react";

export function Doctor() {
  return (
    <section id="doctor" className="bg-accent py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Sizning shifokoringiz
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Tajribali mutaxassis sizga yordam berishga tayyor
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl items-center gap-8 rounded-3xl bg-card p-6 shadow-card sm:p-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl">
            <img
              src={doctorDjoni}
              alt="Stomatolog Janibek Saqtabaev"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-full max-h-96 w-full object-cover"
            />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <BadgeCheck className="h-4 w-4" />
              Stomatolog | Expert
            </span>
            <h3 className="mt-4 text-2xl font-extrabold text-card-foreground">
              Janibek Saqtabaev
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Davolash, breket va protezlash bo'yicha mutaxassis. 10 000+ dan
              ortiq bemorni muvaffaqiyatli davolagan. Har bir bemorga g'amxo'rlik
              va zamonaviy yondashuv.
            </p>

            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-center gap-3 text-card-foreground">
                <Clock className="h-5 w-5 text-primary" />
                Ish vaqti: 24/7
              </li>
              <li className="flex items-center gap-3 text-card-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                Nukus shahri, Aeroport hududi
              </li>
            </ul>

            <a
              href="tel:+998913808667"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-105"
            >
              91 380 86 67
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
