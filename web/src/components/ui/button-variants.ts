import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-bcp-navy text-white shadow-sm hover:bg-bcp-slate hover:shadow-md active:bg-bcp-navy ring-offset-bcp-page focus-visible:ring-2 focus-visible:ring-bcp-gold/60 focus-visible:ring-offset-2",
  secondary:
    "border border-bcp-border/95 bg-white text-bcp-anthracite shadow-sm hover:border-bcp-navy/18 hover:bg-bcp-cream/45 hover:shadow active:bg-bcp-surface ring-offset-bcp-page focus-visible:ring-2 focus-visible:ring-bcp-gold/50 focus-visible:ring-offset-2",
  ghost:
    "text-bcp-navy hover:bg-bcp-navy/[0.07] active:bg-bcp-navy/12",
  danger:
    "bg-red-700 text-white shadow-sm hover:bg-red-800 active:bg-red-900 ring-offset-bcp-page focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2",
};

const sizes: Record<ButtonSize, string> = {
  sm: "rounded-full px-3 py-1.5 text-xs",
  md: "rounded-full px-4 py-2 text-sm",
  lg: "rounded-full px-5 py-2.5 text-sm",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string {
  return cn(base, variants[variant], sizes[size], className);
}
