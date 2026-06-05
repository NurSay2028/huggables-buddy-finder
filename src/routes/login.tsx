import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Smile, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Kirish — Djoni Dentist" },
      { name: "description", content: "Djoni Dentist boshqaruv paneliga kirish sahifasi." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://drjanibek.uz/login" }],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, loading, isSuperAdmin, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: isSuperAdmin ? "/admin" : "/app" });
  }, [loading, session, isSuperAdmin, navigate]);

  const goAfterLogin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const hasSuperAdmin = (data ?? []).some((row) => row.role === "super_admin");
    navigate({ to: hasSuperAdmin ? "/admin" : "/app" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setSubmitting(false);
      toast.error("Email yoki parol noto‘g‘ri");
      return;
    }
    await refresh();
    setSubmitting(false);
    toast.success("Xush kelibsiz");
    if (data.user) await goAfterLogin(data.user.id);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Smile className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Djoni Dentist</span>
        </Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <Lock className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Maxfiy panel</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Tizimga kirish</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Boshqaruv paneliga kirish uchun ma'lumotlaringizni kiriting.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="email@example.com"
                autoComplete="username"
              />
            </Field>
            <Field label="Parol">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </Field>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Kirish
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
