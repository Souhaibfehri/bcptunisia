"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
  /** Shown while the parent &lt;form&gt; server action is in flight. */
  pendingLabel?: ReactNode;
};

/**
 * Submit button wired to the nearest parent form’s `action` pending state.
 * Disables immediately on submit to reduce double-posts while the server runs.
 */
export function PendingSubmitButton({ children, pendingLabel = "…", className, disabled, ...rest }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} {...rest}>
      {pending ? pendingLabel : children}
    </button>
  );
}
