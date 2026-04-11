import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  title: string;
  description?: string | null;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ title, description, action, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h2 className="bcp-section-title">{title}</h2>
        {description ? (
          <p className="bcp-page-subtitle mt-1.5 text-xs leading-relaxed sm:text-sm">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 sm:pt-0.5">{action}</div> : null}
    </div>
  );
}
