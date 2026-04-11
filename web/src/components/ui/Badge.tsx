import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  size?: "sm" | "md";
};

export function Badge({ children, className, size = "sm", ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium",
        size === "sm" && "rounded-full px-2 py-0.5 text-[0.65rem] uppercase tracking-wide",
        size === "md" && "rounded-full px-2.5 py-0.5 text-xs",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
