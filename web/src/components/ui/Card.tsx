import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  elevated?: boolean;
  accent?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  children,
  className,
  elevated = false,
  accent = false,
  padding = "md",
  ...rest
}: Props) {
  return (
    <div
      className={cn(
        "bcp-card rounded-2xl border border-bcp-border/95 bg-white ring-1 ring-bcp-navy/[0.025]",
        elevated && "bcp-card--elevated",
        accent && "bcp-card--accent",
        paddingMap[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
