import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Check, Phone, X } from "lucide-react";

export const Route = createFileRoute("/app/notifications")({ component: Notifications });

type Req = {
  id: string;
  full_name: string;
  phone: string;
  problem: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: "new" | "called" | "booked" | "rejected";
  created_at: string;
};

const STATUS_LABEL: Record<Req["status"], string> = {
  new: "Yangi",
  called: "Bog‘lanildi",
  booked: "Qabulga yozildi",
  rejected: "Rad etildi",
};

const STATUS_TONE: Record<Req["status"], string> = {
  new: "bg-primary-soft text-primary",
  called: "bg-warning/15 text-warning-foreground",
  booked: "bg-success/15 text-success",
  rejected: "bg-muted text-muted-foreground",
};

function Notifications() {
  const [rows, setRows] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("ai_appointment_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as Req[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function setStatus(id: string, status: Req["status"]) {
    await supabase.from("ai_appointment_requests").update({ status }).eq("id", id);
    void load();
  }

  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Xabarnomalar"
        description={`AI yordamchi orqali kelgan so‘rovlar · ${newCount} ta yangi`}
      />

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Yuklanmoqda…</p>
      ) : rows.length === 0 ? (
        <div className="card mt-6 p-12 text-center text-sm text-muted-foreground">
          Hozircha so‘rovlar yo‘q
        </div>
      ) : (
        <div className="card mt-6 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Ism</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Muammo</th>
                <th className="px-4 py-3">Sana</th>
                <th className="px-4 py-3">Vaqt</th>
                <th className="px-4 py-3">Holat</th>
                <th className="px-4 py-3 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium">{r.full_name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.problem ?? "—"}</td>
                  <td className="px-4 py-3">{r.preferred_date ?? "—"}</td>
                  <td className="px-4 py-3">{r.preferred_time ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONE[r.status]}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Bog‘lanildi"
                        onClick={() => setStatus(r.id, "called")}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-muted"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Qabulga yozildi"
                        onClick={() => setStatus(r.id, "booked")}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-success/15 text-success hover:bg-success/25"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        title="Rad etish"
                        onClick={() => setStatus(r.id, "rejected")}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
