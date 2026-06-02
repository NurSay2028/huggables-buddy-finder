import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="px-8 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </header>
      <div className="card grid place-items-center px-8 py-20 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
          <Icon className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-lg font-semibold">Keyingi bosqichda tayyor bo‘ladi</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Bu modul yaqin orada chiqariladi. Hozircha asos, boshqaruv paneli va klinikani
          ro‘yxatga olish ishga tushirilgan.
        </p>
      </div>
    </div>
  );
}
