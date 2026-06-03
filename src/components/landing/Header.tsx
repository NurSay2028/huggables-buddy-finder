import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { useLanding } from "@/lib/landing-content";

const navLinks = [
  { label: "Biz haqqımızda", href: "#about" },
  { label: "Xızmetler", href: "#services" },
  { label: "Pikirler", href: "#testimonials" },
  { label: "Shıpaker", href: "#doctor" },
  { label: "Soraw-juwap", href: "#faq" },
];

export function Header() {
  const c = useLanding();
  const [open, setOpen] = useState(false);

  const Logo = () => (
    <a href="#home" className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-lg shadow-card">
        {c.brand.logo_text}
      </div>
      <span className="text-xl font-extrabold tracking-tight text-foreground">
        {c.brand.name}
      </span>
    </a>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={`tel:${c.contact.phone}`}
          className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-card transition-transform hover:scale-105 lg:inline-flex"
        >
          <Phone className="h-4 w-4" />
          Baylanıs
        </a>

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground lg:hidden"
          aria-label="Menyu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                {link.label}
              </a>
            ))}
            <a
              href={`tel:${c.contact.phone}`}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
              Bog'lanish
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
