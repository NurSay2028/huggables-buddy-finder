import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Loader2, Phone, Inbox } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/leads")({
  component: LeadsPage,
});

type Status = "new" | "called" | "booked" | "rejected";
type Lead = {
  id: string;
  full_name: string;
  phone: string;
  problem: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  status: Status;
  created_at: string;
};

const statusLabel: Record<Status, string> = {
  new: "Yangi",
  called: "Qo‘ng‘iroq qilindi",
  booked: "Yozildi",
  rejected: "Rad etildi",
};
const statusTone: Record<Status, string> = {
  new: "bg-primary-soft text-primary",
  called: "bg-warning/15 text-warning",
  booked: "bg-success/15 text-success",
  rejected: "bg-destructive/15 text-destructive",
};

function LeadsPage() {
  const [rows, setRows] = useState<Lead[] | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("ai_appointment_requests")
      .select("id, full_name, phone, problem, preferred_date, preferred_time, status, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Lead[]) ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const setStatus = async (id: string, status: Status) => {
    const { error } = await supabase
      .from("ai_appointment_requests")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, status } : r)) : prev));
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <PageHeader
        title="Yozilganlar"
        description="Landing sahifa orqali yuborilgan qabul arizalari"
      />

      {!rows ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Hozircha arizalar yo‘q.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{r.full_name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusTone[r.status]}`}>
                      {statusLabel[r.status]}
                    </span>
                  </div>
                  <a
                    href={`tel:${r.phone}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {r.phone}
                  </a>
                  {r.problem && (
                    <p className="mt-2 text-sm text-muted-foreground">{r.problem}</p>
                  )}
                  {(r.preferred_date || r.preferred_time) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Istalgan vaqt: {r.preferred_date ?? "—"} {r.preferred_time ?? ""}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("uz-UZ")}
                  </p>
                </div>
                <select
                  value={r.status}
                  onChange={(e) => setStatus(r.id, e.target.value as Status)}
                  className="input w-auto"
                >
                  {(Object.keys(statusLabel) as Status[]).map((s) => (
                    <option key={s} value={s}>
                      {statusLabel[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
