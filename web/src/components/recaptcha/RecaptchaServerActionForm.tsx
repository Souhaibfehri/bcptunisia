"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import type { RecaptchaAction } from "@/lib/recaptcha/actions";
import {
  EnterpriseRecaptchaCheckbox,
  readEnterpriseCheckboxToken,
} from "@/components/recaptcha/EnterpriseRecaptchaCheckbox";

type ServerAction = (formData: FormData) => Promise<void>;

export function RecaptchaServerActionForm({
  action,
  recaptchaAction: _recaptchaAction,
  formClassName,
  children,
}: {
  action: ServerAction;
  /** Passed by admin forms for clarity; server actions still assert the matching action. */
  recaptchaAction: RecaptchaAction;
  /** Tailwind layout for the form (e.g. `mt-4 flex flex-wrap items-end gap-3`). */
  formClassName: string;
  children: ReactNode;
}) {
  void _recaptchaAction; // prop documents intent; token is verified server-side with the action from each action handler
  const widgetIdRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() ?? "";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    startTransition(async () => {
      const fd = new FormData(form);
      if (siteKey) {
        const token = readEnterpriseCheckboxToken(widgetIdRef.current);
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
      {siteKey ? (
        <div className="w-full basis-full">
          <EnterpriseRecaptchaCheckbox siteKey={siteKey} widgetIdRef={widgetIdRef} className="mb-2" />
        </div>
      ) : null}
      {children}
    </form>
  );
}
