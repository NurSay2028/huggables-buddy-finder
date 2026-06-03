import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  UserCog,
  Wallet,
  Boxes,
  BarChart3,
  Settings,
  Smile,
  LogOut,
  Shield,
  BellRing,
  Menu,
  Inbox,
  PanelsTopLeft,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type NavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const items: NavItem[] = [
  { label: "Boshqaruv paneli", to: "/app", icon: LayoutDashboard, end: true },
  { label: "Yozilganlar", to: "/app/leads", icon: Inbox },
  { label: "Bemorlar", to: "/app/patients", icon: Users },
  { label: "Qabullar", to: "/app/appointments", icon: CalendarDays },
  { label: "Tish kartasi", to: "/app/dental-chart", icon: Stethoscope },
  { label: "Shifokorlar", to: "/app/doctors", icon: UserCog },
  { label: "To‘lovlar", to: "/app/payments", icon: Wallet },
  { label: "Xarajatlar", to: "/app/expenses", icon: TrendingDown },
  { label: "Ombor", to: "/app/inventory", icon: Boxes },
  { label: "Hisobotlar", to: "/app/reports", icon: BarChart3 },
  { label: "Eslatmalar", to: "/app/reminders", icon: BellRing },
  { label: "Xabarnomalar", to: "/app/notifications", icon: BellRing },
  { label: "Xodimlar", to: "/app/staff", icon: Users },
  { label: "Landing sahifa", to: "/app/landing-editor", icon: PanelsTopLeft },
  { label: "Sozlamalar", to: "/app/settings", icon: Settings },
];

function SidebarInner({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { clinic, isSuperAdmin, signOut, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        {clinic?.logo_url ? (
          <img
            src={clinic.logo_url}
            alt={clinic.name}
            className="h-8 w-8 rounded-xl object-cover shadow-soft"
          />
        ) : (
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Smile className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-sidebar-foreground">
            {clinic?.name ?? "Patient"}
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {clinic?.subscription_plan ?? "—"}
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((it) => {
          const active = it.end ? path === it.to : path.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              }`}
            >
              <it.icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}

        {isSuperAdmin && (
          <Link
            to="/admin"
            onClick={onNavigate}
            className="mt-4 flex items-center gap-3 rounded-lg border border-primary/20 bg-primary-soft px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10"
          >
            <Shield className="h-4 w-4" />
            Super admin
          </Link>
        )}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 truncate px-2 text-xs text-muted-foreground">
          {user?.email}
        </div>
        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/login" });
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </button>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:block">
      <SidebarInner />
    </aside>
  );
}

export function MobileTopbar() {
  const [open, setOpen] = useState(false);
  const { clinic } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card"
          >
            <Menu className="h-4 w-4" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarInner onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2">
        {clinic?.logo_url ? (
          <img src={clinic.logo_url} alt={clinic.name} className="h-7 w-7 rounded-lg object-cover" />
        ) : (
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Smile className="h-3.5 w-3.5" />
          </div>
        )}
        <span className="truncate text-sm font-semibold">{clinic?.name ?? "Patient"}</span>
      </div>
    </header>
  );
}
