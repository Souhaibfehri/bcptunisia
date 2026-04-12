"use client";

import { useState, useTransition, type ReactNode } from "react";
import type { RecaptchaAction } from "@/lib/recaptcha/actions";
import { executeRecaptchaEnterprise } from "@/components/recaptcha/executeEnterprise";

type ServerAction = (formData: FormData) => Promise<void>;

export function RecaptchaServerActionForm({
  action,
  recaptchaAction,
  formClassName,
  children,
}: {
  action: ServerAction;
  recaptchaAction: RecaptchaAction;
  /** Tailwind layout for the form (e.g. `mt-4 flex flex-wrap items-end gap-3`). */
  formClassName: string;
  children: ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    startTransition(async () => {
      const fd = new FormData(form);
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";
      if (siteKey) {
        const token = await executeRecaptchaEnterprise(recaptchaAction);
        if (!token) {
          setError("Vérification de sécurité échouée. Réessayez.");
          return;
        }
        fd.set("recaptcha_token", token);
      }
      await action(fd);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`${formClassName} ${pending ? "pointer-events-none opacity-60" : ""}`}
    >
      {error ? (
        <p className="mb-2 w-full basis-full text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {children}
    </form>
  );
}
