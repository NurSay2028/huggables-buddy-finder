import { Phone, Mail, MapPin, Send, Instagram } from "lucide-react";
import { useLanding } from "@/lib/landing-content";

const links = [
  { label: "Biz haqimizda", href: "#about" },
  { label: "Xizmatlar", href: "#services" },
  { label: "Shifokor", href: "#doctor" },
  { label: "Savol-javob", href: "#faq" },
];

export function Footer() {
  const c = useLanding();
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
                {c.brand.logo_text}
              </div>
              <span className="text-xl font-extrabold">{c.brand.name}</span>
            </div>
            <p className="mt-4 text-sm opacity-90">{c.footer.about}</p>
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
                <a href={`tel:${c.contact.phone}`} className="hover:underline">
                  {c.contact.phone_display}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Send className="h-4 w-4 shrink-0" />
                <a
                  href={c.contact.telegram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Telegram
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4 shrink-0" />
                <a
                  href={c.contact.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Instagram
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                {c.contact.email}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold">Manzil</h4>
            <p className="mt-4 flex items-start gap-2 text-sm opacity-90">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {c.contact.address}
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 py-6 text-center text-sm opacity-80">
          <p>{c.footer.copyright}</p>
          <p className="mt-2 opacity-90">
            Bu sayt{" "}
            <a
              href="https://keta.uz"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 hover:opacity-100"
            >
              keta.uz
            </a>{" "}
            tomonidan ishlab chiqilgan
          </p>
        </div>
      </div>
    </footer>
  );
}
