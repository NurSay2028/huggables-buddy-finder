import { createFileRoute, Outlet, redirect, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { AppSidebar, MobileTopbar } from "@/components/app-sidebar";
import { Loader2, Smile, Ban, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { loading, session, clinic, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    // client-side redirect (loaders here would be isomorphic and fail SSR)
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  // Super admin always goes to the admin panel
  if (isSuperAdmin) {
    if (typeof window !== "undefined") window.location.href = "/admin";
    return null;
  }


  if (!clinic) {
    return <NoClinicScreen />;
  }

  if (clinic.status === "blocked" || clinic.status === "suspended") {
    return <ClinicStatusScreen status={clinic.status} clinicName={clinic.name} />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NoClinicScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="card max-w-md p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Smile className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold">Klinika biriktirilmagan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Siz tizimga kirdingiz, lekin hech qanday klinikaga biriktirilmagansiz. Administrator bilan bog‘laning.
        </p>
        <Link to="/login" className="btn-primary mt-6">
          Qaytadan kirish
        </Link>
      </div>
    </div>
  );
}

function ClinicStatusScreen({
  status,
  clinicName,
}: {
  status: "blocked" | "suspended";
  clinicName: string;
}) {
  const config = {
    blocked: {
      icon: Ban,
      title: "Hisob bloklangan",
      message: "Klinikangiz bloklangan. Yechim uchun qo‘llab-quvvatlash xizmatiga murojaat qiling.",
      tone: "bg-destructive/15 text-destructive",
    },
    suspended: {
      icon: ShieldAlert,
      title: "Hisob to‘xtatilgan",
      message: "Obunangiz to‘xtatilgan. Kirish uchun uni qayta faollashtiring.",
      tone: "bg-destructive/15 text-destructive",
    },
  }[status];
  const Icon = config.icon;
  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="card max-w-md p-8 text-center">
        <div className={`mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl ${config.tone}`}>
          <Icon className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold">{config.title}</h1>
        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{clinicName}</p>
        <p className="mt-3 text-sm text-muted-foreground">{config.message}</p>
      </div>
    </div>
  );
}
