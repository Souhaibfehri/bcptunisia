import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  label: string;
  htmlFor?: string;
  error?: string | null;
  hint?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function FormField({ label, htmlFor, error, hint, required, children, className }: Props) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-bcp-anthracite">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-bcp-muted">{hint}</p> : null}
      {error ? <p className="text-xs font-medium text-red-700">{error}</p> : null}
    </div>
  );
}
