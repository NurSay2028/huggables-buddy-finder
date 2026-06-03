import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, EmptyState, Modal } from "@/components/page-header";
import { fmtDate } from "@/lib/format";
import {
  BellRing, Copy, Send, Search, Phone, CheckCircle2, MessageSquare,
  Plus, Pencil, Trash2, Star, Link2, AlertCircle, X,
} from "lucide-react";
import { toast } from "sonner";
import {
  TREATMENT_LABEL, REMINDER_STATUS_LABEL, buildReminderMessage, isDueToday,
  type TreatmentType, type ReminderStatus,
} from "@/lib/reminders";
import { sendPatientReminder, getBotUsername } from "@/lib/telegram.functions";
import {
  renderTemplate, TEMPLATE_VARIABLES, DEFAULT_TEMPLATE_BODY,
} from "@/lib/telegram-templates";

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
  telegram_code: string | null;
  telegram_chat_id: number | null;
};

type Template = { id: string; name: string; body: string; is_default: boolean };

function RemindersPage() {
  const { clinic } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"due" | "all">("due");
  const [target, setTarget] = useState<Row | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const getBot = useServerFn(getBotUsername);

  const load = async () => {
    if (!clinic) return;
    const { data, error } = await supabase
      .from("patients")
      .select("id,full_name,phone,treatment_type,next_visit_date,last_visit_at,reminder_status,reminder_days_before,reminder_note,reminder_enabled,telegram_code,telegram_chat_id")
      .eq("clinic_id", clinic.id)
      .eq("reminder_enabled", true)
      .order("next_visit_date", { ascending: true, nullsFirst: false });
    if (error) return toast.error(error.message);
    setRows(data as Row[]);
  };

  const loadTemplates = async () => {
    if (!clinic) return;
    const { data } = await supabase
      .from("reminder_templates")
      .select("id,name,body,is_default")
      .eq("clinic_id", clinic.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });
    setTemplates((data ?? []) as Template[]);
  };

  useEffect(() => { void load(); void loadTemplates(); }, [clinic?.id]);
  useEffect(() => { void getBot().then((r) => setBotUsername(r.username)).catch(() => {}); }, []);

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
  const connectedCount = useMemo(
    () => (rows ?? []).filter((r) => r.telegram_chat_id).length,
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
        description="Telegram orqali qabul eslatmalarini yuboring."
        actions={
          <button onClick={() => setShowTemplates(true)} className="btn-ghost">
            <MessageSquare className="h-4 w-4" /> Shablonlar
          </button>
        }
      />

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard icon={<BellRing className="h-5 w-5" />} tone="bg-primary-soft text-primary" value={dueCount} label="Bugun yuborish kerak" />
        <StatCard icon={<Send className="h-5 w-5" />} tone="bg-success/15 text-success" value={connectedCount} label="Telegram ulangan" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} tone="bg-muted text-foreground" value={(rows ?? []).filter((r) => r.reminder_status === "completed").length} label="Tugallangan" />
        <StatCard icon={<Phone className="h-5 w-5" />} tone="bg-warning/15 text-warning-foreground" value={(rows ?? []).filter((r) => r.reminder_status === "contacted").length} label="Bog‘lanilgan" />
      </section>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1 text-sm">
            <button onClick={() => setFilter("due")} className={`rounded-md px-3 py-1.5 transition ${filter === "due" ? "bg-background shadow-soft font-medium" : "text-muted-foreground"}`}>
              Bugungi ({dueCount})
            </button>
            <button onClick={() => setFilter("all")} className={`rounded-md px-3 py-1.5 transition ${filter === "all" ? "bg-background shadow-soft font-medium" : "text-muted-foreground"}`}>
              Barchasi
            </button>
          </div>
          <div className="relative ml-auto max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="input pl-10" placeholder="Ism yoki telefon…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {!rows ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Yuklanmoqda…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filter === "due" ? "Bugun yuborish kerak bo‘lgan bemor yo‘q" : "Eslatma yoqilgan bemor yo‘q"}
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
                  <th className="px-4 py-3">Keyingi</th>
                  <th className="px-4 py-3">Telegram</th>
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
                    <td className="px-4 py-3 text-muted-foreground">{r.treatment_type ? TREATMENT_LABEL[r.treatment_type] : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmtDate(r.next_visit_date)}</td>
                    <td className="px-4 py-3">
                      {r.telegram_chat_id ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Ulangan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          <Link2 className="h-3.5 w-3.5" /> Ulanmagan
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.reminder_status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setTarget(r)} className="btn-primary">
                        <Send className="h-4 w-4" /> Eslatma
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
          clinicId={clinic?.id ?? ""}
          clinicName={clinic?.name ?? ""}
          templates={templates}
          botUsername={botUsername}
          onClose={() => setTarget(null)}
          onMark={(s) => { void setStatus(target.id, s); setTarget(null); }}
        />
      )}

      {showTemplates && clinic && (
        <TemplatesModal
          clinicId={clinic.id}
          templates={templates}
          onClose={() => setShowTemplates(false)}
          onChanged={() => void loadTemplates()}
        />
      )}
    </div>
  );
}

function StatCard({ icon, tone, value, label }: { icon: React.ReactNode; tone: string; value: number; label: string }) {
  return (
    <div className="card p-5">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</div>
      <div className="mt-4 text-2xl font-semibold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReminderStatus }) {
  const tone =
    status === "completed" ? "bg-success/15 text-success"
    : status === "contacted" ? "bg-primary-soft text-primary"
    : "bg-warning/15 text-warning-foreground";
  return <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${tone}`}>{REMINDER_STATUS_LABEL[status]}</span>;
}

function ReminderModal({
  row, clinicId, clinicName, templates, botUsername, onClose, onMark,
}: {
  row: Row;
  clinicId: string;
  clinicName: string;
  templates: Template[];
  botUsername: string | null;
  onClose: () => void;
  onMark: (s: ReminderStatus) => void;
}) {
  const send = useServerFn(sendPatientReminder);
  const [sending, setSending] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [scheduling, setScheduling] = useState(false);

  const vars = useMemo(() => ({
    name: row.full_name,
    date: row.next_visit_date ? fmtDate(row.next_visit_date) : "",
    time: "",
    treatment: row.treatment_type ? TREATMENT_LABEL[row.treatment_type] : "",
  }), [row]);

  const defaultTpl = templates.find((t) => t.is_default) ?? templates[0];
  const [templateId, setTemplateId] = useState<string>(defaultTpl?.id ?? "");
  const initialBody = defaultTpl ? renderTemplate(defaultTpl.body, vars) : buildReminderMessage(row.full_name, clinicName);
  const [text, setText] = useState(initialBody);

  const onPickTemplate = (id: string) => {
    setTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) setText(renderTemplate(tpl.body, vars));
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); toast.success("Nusxa olindi"); }
    catch { toast.error("Nusxa olib bo‘lmadi"); }
  };

  const sendBot = async () => {
    setSending(true);
    try {
      const res = await send({ data: { patientId: row.id, message: text } });
      if (res.ok) { toast.success("Telegram orqali yuborildi ✅"); onMark("contacted"); }
      else toast.error("Bemor Telegram hisobini ulamagan.");
    } catch (e: any) {
      toast.error(e?.message ?? "Yuborib bo‘lmadi");
    } finally { setSending(false); }
  };

  const botLink = botUsername ? `https://t.me/${botUsername}` : null;

  return (
    <Modal open onClose={onClose} title={`Eslatma — ${row.full_name}`} size="lg">
      <div className="space-y-4">
        <div className="rounded-lg bg-muted/40 p-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5" /> {row.phone}
          </div>
          {row.reminder_note && <div className="mt-2 text-xs text-muted-foreground">Eslatma: {row.reminder_note}</div>}
        </div>

        {!row.telegram_chat_id && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
            <div className="flex items-center gap-2 font-medium text-warning-foreground">
              <AlertCircle className="h-4 w-4" /> Telegram ulanmagan
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Bemor botga quyidagi kodni va telefon raqamini yuborishi kerak:
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="rounded-md bg-background px-2 py-1 font-mono text-base font-bold tracking-widest">
                {row.telegram_code ?? "—"}
              </code>
              {row.telegram_code && (
                <button
                  onClick={async () => { await navigator.clipboard.writeText(`${row.phone} ${row.telegram_code}`); toast.success("Nusxa olindi"); }}
                  className="btn-ghost h-8 px-2 text-xs"
                >
                  <Copy className="h-3.5 w-3.5" /> Telefon + kod
                </button>
              )}
              {botLink && (
                <a href={botLink} target="_blank" rel="noreferrer" className="btn-ghost h-8 px-2 text-xs">
                  <Send className="h-3.5 w-3.5" /> Botni ochish
                </a>
              )}
            </div>
          </div>
        )}

        {templates.length > 0 && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted-foreground">Shablon</span>
            <select className="input" value={templateId} onChange={(e) => onPickTemplate(e.target.value)}>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}{t.is_default ? " (standart)" : ""}</option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Xabar matni</span>
          <textarea className="input min-h-32" value={text} onChange={(e) => setText(e.target.value)} />
        </label>

        <div className="flex flex-wrap gap-2">
          <button onClick={sendBot} disabled={sending || !row.telegram_chat_id} className="btn-primary disabled:opacity-50">
            <Send className="h-4 w-4" /> {sending ? "Yuborilmoqda…" : "Telegram bot orqali yuborish"}
          </button>
          <button onClick={copy} className="btn-ghost"><Copy className="h-4 w-4" /> Nusxa</button>
          <a href={`tel:${row.phone}`} className="btn-ghost"><Phone className="h-4 w-4" /> Qo‘ng‘iroq</a>
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

function TemplatesModal({
  clinicId, templates, onClose, onChanged,
}: {
  clinicId: string;
  templates: Template[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Template | null>(null);
  const [creating, setCreating] = useState(false);

  const remove = async (id: string) => {
    if (!confirm("Shablonni o‘chirasizmi?")) return;
    const { error } = await supabase.from("reminder_templates").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("O‘chirildi");
    onChanged();
  };

  const makeDefault = async (id: string) => {
    await supabase.from("reminder_templates").update({ is_default: false }).eq("clinic_id", clinicId);
    const { error } = await supabase.from("reminder_templates").update({ is_default: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Standart shablon tanlandi");
    onChanged();
  };

  return (
    <Modal open onClose={onClose} title="Xabar shablonlari" size="lg">
      {editing || creating ? (
        <TemplateForm
          clinicId={clinicId}
          template={editing}
          isFirst={templates.length === 0}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); onChanged(); }}
        />
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
            O‘zgaruvchilar: {TEMPLATE_VARIABLES.map((v) => v.key).join("  ")}
          </div>
          {templates.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Hozircha shablon yo‘q.</p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div key={t.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.name}</span>
                    {t.is_default && <span className="inline-flex items-center gap-1 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-medium text-primary"><Star className="h-3 w-3" /> Standart</span>}
                    <div className="ml-auto flex gap-1">
                      {!t.is_default && <button onClick={() => makeDefault(t.id)} title="Standart qilish" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><Star className="h-4 w-4" /></button>}
                      <button onClick={() => setEditing(t)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(t.id)} className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{t.body}</p>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setCreating(true)} className="btn-primary w-full"><Plus className="h-4 w-4" /> Yangi shablon</button>
        </div>
      )}
    </Modal>
  );
}

function TemplateForm({
  clinicId, template, isFirst, onClose, onSaved,
}: {
  clinicId: string;
  template: Template | null;
  isFirst: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(template?.name ?? "");
  const [body, setBody] = useState(template?.body ?? DEFAULT_TEMPLATE_BODY);
  const [saving, setSaving] = useState(false);

  const insertVar = (v: string) => setBody((b) => `${b}${v}`);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nom kiriting");
    if (!body.trim()) return toast.error("Matn kiriting");
    setSaving(true);
    const payload = { name: name.trim(), body: body.trim() };
    const { error } = template
      ? await supabase.from("reminder_templates").update(payload).eq("id", template.id)
      : await supabase.from("reminder_templates").insert({ ...payload, clinic_id: clinicId, is_default: isFirst });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(template ? "Yangilandi" : "Qo‘shildi");
    onSaved();
  };

  return (
    <form onSubmit={save} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Nom</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Qabul eslatmasi" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Matn</span>
        <textarea className="input min-h-32" value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {TEMPLATE_VARIABLES.map((v) => (
          <button key={v.key} type="button" onClick={() => insertVar(v.key)} className="rounded-md border border-border bg-muted/40 px-2 py-1 text-xs hover:bg-muted">
            {v.key} <span className="text-muted-foreground">· {v.label}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-ghost"><X className="h-4 w-4" /> Bekor</button>
        <button type="submit" disabled={saving} className="btn-primary">{saving ? "…" : "Saqlash"}</button>
      </div>
    </form>
  );
}
