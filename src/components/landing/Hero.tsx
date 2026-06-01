import { Users, Star, Phone } from "lucide-react";
import heroPatient from "@/assets/hero-patient.jpg";
import faqTreatment from "@/assets/faq-treatment.jpg";
import confidentSmile from "@/assets/confident-smile.jpg";

export function Hero() {
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
            10 000+ baxtli bemor
          </div>

          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            <span className="text-primary">Ishonchli</span> stomatologiya{" "}
            <br className="hidden sm:block" />
            sog'lom tabassum uchun
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Nukus shahridagi zamonaviy stomatologiya. Davolash, breket va
            protezlash bo'yicha malakali yordam — kuniga 24/7.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#services"
              className="inline-flex w-full items-center justify-center rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:scale-105 sm:w-auto"
            >
              Xizmatlarni ko'rish
            </a>
            <a
              href="tel:+998913808667"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary bg-background px-7 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-accent sm:w-auto"
            >
              <Phone className="h-4 w-4" />
              Qo'ng'iroq qilish
            </a>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="overflow-hidden rounded-2xl shadow-card">
            <img
              src={heroPatient}
              alt="Stomatologiya kresloasidagi tabassum qilayotgan bemor"
              width={1024}
              height={1024}
              className="h-44 w-full object-cover sm:h-52"
            />
          </div>
          <div className="overflow-hidden rounded-2xl shadow-card">
            <img
              src={faqTreatment}
              alt="Tishlarni tekshirayotgan shifokor"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-44 w-full object-cover sm:h-52"
            />
          </div>
          <div
            className="flex h-44 flex-col items-center justify-center rounded-2xl px-4 text-center text-primary-foreground shadow-elegant sm:h-52"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Users className="mb-2 h-8 w-8" />
            <div className="text-3xl font-extrabold">86+</div>
            <div className="text-sm opacity-90">Tajribali davolash usuli</div>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-card">
            <img
              src={confidentSmile}
              alt="Tish modelini ushlab turgan shifokor"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-44 w-full object-cover sm:h-52"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
