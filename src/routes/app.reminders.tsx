import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, EmptyState, Modal } from "@/components/page-header";
import { fmtDate } from "@/lib/format";
import { BellRing, Copy, Send, Search, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  TREATMENT_LABEL, REMINDER_STATUS_LABEL, buildReminderMessage, isDueToday,
  type TreatmentType, type ReminderStatus,
} from "@/lib/reminders";

export const Route = createFileRoute("/app/reminders")({ component: RemindersPage });

type Row = {
  id: string;
  full_name: string;
  phone: string;
  treatment_type: TreatmentType | null;
  next_visit_date: string | null;
  last_visit_at: string | null;
  reminder_status: ReminderStatus;
  reminder_days_before: number;
  reminder_note: string | null;
};

function RemindersPage() {
  const { clinic } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"due" | "all">("due");
  const [target, setTarget] = useState<Row | null>(null);

  const load = async () => {
    if (!clinic) return;
    const { data, error } = await supabase
      .from("patients")
      .select("id,full_name,phone,treatment_type,next_visit_date,last_visit_at,reminder_status,reminder_days_before,reminder_note,reminder_enabled")
      .eq("clinic_id", clinic.id)
      .eq("reminder_enabled", true)
      .order("next_visit_date", { ascending: true, nullsFirst: false });
    if (error) return toast.error(error.message);
    setRows(data as Row[]);
  };

  useEffect(() => { void load(); }, [clinic?.id]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    let list = rows;
    if (filter === "due") list = list.filter((r) => isDueToday(r.next_visit_date, r.reminder_days_before));
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((r) => `${r.full_name} ${r.phone}`.toLowerCase().includes(s));
    }
    return list;
  }, [rows, q, filter]);

  const dueCount = useMemo(
    () => (rows ?? []).filter((r) => isDueToday(r.next_visit_date, r.reminder_days_before)).length,
    [rows],
  );

  const setStatus = async (id: string, status: ReminderStatus) => {
    const { error } = await supabase.from("patients").update({ reminder_status: status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Holat yangilandi");
    void load();
  };

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <PageHeader
        title="Eslatmalar"
        description="Qayta kelishi kerak bo‘lgan bemorlarni boshqaring."
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <BellRing className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-semibold">{dueCount}</div>
          <div className="text-sm text-muted-foreground">Bugun bog‘lanish kerak</div>
        </div>
        <div className="card p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-foreground">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-semibold">
            {(rows ?? []).filter((r) => r.reminder_status === "completed").length}
          </div>
          <div className="text-sm text-muted-foreground">Tugallangan</div>
        </div>
        <div className="card p-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-warning/15 text-warning-foreground">
            <Phone className="h-5 w-5" />
          </div>
          <div className="mt-4 text-2xl font-semibold">
            {(rows ?? []).filter((r) => r.reminder_status === "contacted").length}
          </div>
          <div className="text-sm text-muted-foreground">Bog‘lanilgan</div>
        </div>
      </section>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1 text-sm">
            <button
              onClick={() => setFilter("due")}
              className={`rounded-md px-3 py-1.5 transition ${filter === "due" ? "bg-background shadow-soft font-medium" : "text-muted-foreground"}`}
            >
              Bugungi ({dueCount})
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1.5 transition ${filter === "all" ? "bg-background shadow-soft font-medium" : "text-muted-foreground"}`}
            >
              Barchasi
            </button>
          </div>
          <div className="relative ml-auto max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="input pl-10"
              placeholder="Ism yoki telefon…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        {!rows ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Yuklanmoqda…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filter === "due" ? "Bugun bog‘lanish kerak bo‘lgan bemor yo‘q" : "Eslatma yoqilgan bemor yo‘q"}
            description="Bemor profilida “Qayta kelish nazorati”ni yoqing."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Bemor</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">Davolash</th>
                  <th className="px-4 py-3">Oxirgi tashrif</th>
                  <th className="px-4 py-3">Keyingi</th>
                  <th className="px-4 py-3">Holati</th>
                  <th className="px-4 py-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((r) => (
                  <tr key={r.id} className="transition hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{r.full_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 hover:text-primary">
                        <Phone className="h-3.5 w-3.5" /> {r.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.treatment_type ? TREATMENT_LABEL[r.treatment_type] : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(r.last_visit_at)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(r.next_visit_date)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.reminder_status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setTarget(r)} className="btn-primary">
                        <Send className="h-4 w-4" /> Xabar tayyorlash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {target && (
        <ReminderModal
          row={target}
          clinicName={clinic?.name ?? ""}
          onClose={() => setTarget(null)}
          onMark={(s) => { void setStatus(target.id, s); setTarget(null); }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ReminderStatus }) {
  const tone =
    status === "completed" ? "bg-success/15 text-success"
    : status === "contacted" ? "bg-primary-soft text-primary"
    : "bg-warning/15 text-warning-foreground";
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${tone}`}>
      {REMINDER_STATUS_LABEL[status]}
    </span>
  );
}

function ReminderModal({
  row, clinicName, onClose, onMark,
}: {
  row: Row;
  clinicName: string;
  onClose: () => void;
  onMark: (s: ReminderStatus) => void;
}) {
  const [text, setText] = useState(buildReminderMessage(row.full_name, clinicName));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Nusxa olindi");
    } catch {
      toast.error("Nusxa olib bo‘lmadi");
    }
  };

  const openTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(" ")}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <Modal open onClose={onClose} title={`Xabar — ${row.full_name}`} size="lg">
      <div className="space-y-4">
        <div className="rounded-lg bg-muted/40 p-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" /> {row.phone}
          </div>
          {row.reminder_note && (
            <div className="mt-2 text-xs text-muted-foreground">Eslatma: {row.reminder_note}</div>
          )}
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">SMS matni</span>
          <textarea className="input min-h-32" value={text} onChange={(e) => setText(e.target.value)} />
        </label>

        <div className="flex flex-wrap gap-2">
          <button onClick={copy} className="btn-ghost">
            <Copy className="h-4 w-4" /> Nusxa
          </button>
          <button onClick={openTelegram} className="btn-primary">
            <Send className="h-4 w-4" /> Telegramda yuborish
          </button>
          <a href={`tel:${row.phone}`} className="btn-ghost">
            <Phone className="h-4 w-4" /> Qo‘ng‘iroq
          </a>
        </div>

        <div className="border-t border-border pt-4">
          <div className="mb-2 text-xs font-medium text-muted-foreground">Holatni belgilang</div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onMark("contacted")} className="btn-ghost">Bog‘lanildi</button>
            <button onClick={() => onMark("completed")} className="btn-primary">Tugallandi</button>
            <button onClick={() => onMark("pending")} className="btn-ghost">Kutilmoqda</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
