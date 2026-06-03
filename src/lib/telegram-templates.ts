// Shared (client + server safe) reminder template helpers.

export const TEMPLATE_VARIABLES = [
  { key: "{name}", label: "Bemor ismi" },
  { key: "{date}", label: "Sana" },
  { key: "{time}", label: "Vaqt" },
  { key: "{treatment}", label: "Davolash turi" },
] as const;

export const DEFAULT_TEMPLATE_BODY =
  "Assalomu alaykum {name}! Eslatma: {date} kuni soat {time} da {treatment} bo‘yicha qabulingiz bor. Iltimos o‘z vaqtida tashrif buyuring.";

export type TemplateVars = {
  name?: string | null;
  date?: string | null;
  time?: string | null;
  treatment?: string | null;
};

/** Replaces {name} {date} {time} {treatment} placeholders in a template body. */
export function renderTemplate(body: string, vars: TemplateVars): string {
  return (body || "")
    .replaceAll("{name}", (vars.name ?? "").toString().trim())
    .replaceAll("{date}", (vars.date ?? "").toString().trim())
    .replaceAll("{time}", (vars.time ?? "").toString().trim())
    .replaceAll("{treatment}", (vars.treatment ?? "").toString().trim());
}
