import { Phone, Mail, MapPin, Send } from "lucide-react";

const links = [
  { label: "Biz haqimizda", href: "#about" },
  { label: "Xizmatlar", href: "#services" },
  { label: "Shifokor", href: "#doctor" },
  { label: "Savol-javob", href: "#faq" },
];

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden pt-14 text-primary-foreground"
      style={{ background: "var(--gradient-primary)" }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-primary font-extrabold">
                DD
              </div>
              <span className="text-xl font-extrabold">Djoni Dentist</span>
            </div>
            <p className="mt-4 text-sm opacity-90">
              Nukus shahridagi zamonaviy stomatologiya markazi. Sog'lom va
              chiroyli tabassum uchun.
            </p>
          </div>

          <div>
            <h4 className="font-bold">Sahifalar</h4>
            <ul className="mt-4 space-y-2 text-sm opacity-90">
              {links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="transition-opacity hover:opacity-100 hover:underline">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold">Bog'lanish</h4>
            <ul className="mt-4 space-y-3 text-sm opacity-90">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+998913808667" className="hover:underline">
                  91 380 86 67
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Send className="h-4 w-4 shrink-0" />
                <a
                  href="https://teleg.one/janibek_saqtabaev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Telegram
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                example@gmail.com
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold">Manzil</h4>
            <p className="mt-4 flex items-start gap-2 text-sm opacity-90">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              Nukus shahri, Aeroport hududi. Ish vaqti: 24/7
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 py-6 text-center text-sm opacity-80">
          © 2026 Djoni Dentist. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
