import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type StatCardTone = "default" | "navy" | "gold" | "amber" | "emerald" | "rose";

const toneBar: Record<StatCardTone, string> = {
  default: "from-bcp-border to-transparent",
  navy: "from-bcp-navy/35 to-bcp-navy/5",
  gold: "from-bcp-gold/45 to-bcp-gold/8",
  amber: "from-amber-400/50 to-amber-100/25",
  emerald: "from-emerald-400/45 to-emerald-100/22",
  rose: "from-rose-400/40 to-rose-100/22",
};

const toneIconTint: Record<StatCardTone, string> = {
  default: "text-bcp-navy",
  navy: "text-bcp-navy",
  gold: "text-bcp-copper",
  amber: "text-amber-800/90",
  emerald: "text-emerald-800/90",
  rose: "text-rose-800/90",
};

export type StatCardEmphasis = "primary" | "secondary";

type Props = {
  label: string;
  value: ReactNode;
  hint?: string | null;
  icon?: LucideIcon;
  tone?: StatCardTone;
  /** Primary = hero operational metrics; secondary = supporting context */
  emphasis?: StatCardEmphasis;
  className?: string;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  emphasis = "primary",
  className,
}: Props) {
  const secondary = emphasis === "secondary";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-shadow duration-200",
        secondary
          ? "border-bcp-border/85 bg-gradient-to-br from-bcp-surface-raised/90 to-white p-3.5 shadow-sm hover:shadow-sm"
          : "border-bcp-border bg-gradient-to-br from-white to-bcp-cream/30 p-4 shadow-sm hover:shadow-md",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 bg-gradient-to-r opacity-95",
          secondary ? "h-px" : "h-0.5",
          toneBar[tone],
        )}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-semibold uppercase tracking-wide text-bcp-muted",
              secondary ? "text-[0.625rem] leading-tight" : "text-xs",
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "mt-1.5 font-semibold tabular-nums tracking-tight text-bcp-navy",
              secondary ? "text-xl" : "text-2xl sm:text-[1.65rem]",
            )}
          >
            {value}
          </p>
          {hint ? (
            <p
              className={cn(
                "mt-1 leading-snug text-bcp-muted",
                secondary ? "text-[0.65rem]" : "text-xs",
              )}
            >
              {hint}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <span className={cn("bcp-icon-wrap", toneIconTint[tone])} aria-hidden>
            <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.65} />
          </span>
        ) : null}
      </div>
    </div>
  );
}
