export type TreatmentType = "braces" | "implant" | "cleaning" | "filling" | "consultation" | "other";
export type ReminderStatus = "pending" | "contacted" | "completed";

export const TREATMENT_LABEL: Record<TreatmentType, string> = {
  braces: "Breket",
  implant: "Implant",
  cleaning: "Tozalash",
  filling: "Plomba",
  consultation: "Konsultatsiya",
  other: "Boshqa",
};

export const REMINDER_STATUS_LABEL: Record<ReminderStatus, string> = {
  pending: "Kutilmoqda",
  contacted: "Bog‘lanildi",
  completed: "Tugallandi",
};

export const REMINDER_DAYS_OPTIONS = [0, 1, 3, 7] as const;

export function buildReminderMessage(patientName: string, clinicName: string) {
  return `Assalomu alaykum ${patientName}, sizning stomatologik ko‘rik vaqtingiz yaqinlashdi. Iltimos klinika bilan bog‘laning. ${clinicName}`;
}

/** Returns true if the patient should be contacted today (visit within reminder_days_before). */
export function isDueToday(nextVisitDate: string | null, daysBefore: number): boolean {
  if (!nextVisitDate) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const next = new Date(nextVisitDate); next.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((next.getTime() - today.getTime()) / 86_400_000);
  return diffDays >= 0 && diffDays <= daysBefore;
}
