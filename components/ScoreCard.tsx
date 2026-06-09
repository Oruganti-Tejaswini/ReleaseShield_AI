import { Info, type LucideIcon } from "lucide-react";

export function ScoreCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "reef"
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent?: "reef" | "signal" | "violet" | "red";
}) {
  const accents = {
    reef: "bg-reef/10 text-reef ring-reef/10",
    signal: "bg-signal/20 text-yellow-800 ring-signal/20",
    violet: "bg-violet/10 text-violet ring-violet/10",
    red: "bg-red-100 text-red-700 ring-red-100"
  };

  return (
    <div className="relative min-h-[158px] overflow-hidden rounded-md border border-ink/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-soft">
      <div className="pointer-events-none absolute -right-7 -top-7 h-24 w-24 rounded-full bg-ink/[0.035]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-ink/10 to-transparent" />
      <span className={`absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-md ring-1 ${accents[accent]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="pr-14">
          <div className="flex items-center gap-2">
            <p className="max-w-[12rem] text-sm font-bold leading-5 text-ink/55">{label}</p>
            {hint ? (
              <span className="group inline-flex">
                <Info className="h-4 w-4 text-ink/35 transition group-hover:text-reef" />
                <span className="pointer-events-none absolute left-5 right-5 top-[70px] z-30 hidden rounded-md border border-ink/10 bg-white/95 p-2 text-xs font-medium leading-5 text-ink/70 shadow-soft backdrop-blur group-hover:block">
                  {hint}
                </span>
              </span>
            ) : null}
          </div>
        </div>
        <p className="mt-6 text-3xl font-bold tracking-normal text-ink">{value}</p>
      </div>
    </div>
  );
}
