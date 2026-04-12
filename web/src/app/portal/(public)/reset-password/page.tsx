import { Suspense } from "react";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { ResetPasswordForm } from "@/components/portal/ResetPasswordForm";

export const metadata = {
  title: "Nouveau mot de passe",
};

export default function ResetPasswordPage() {
  return (
    <>
      <PortalHeader showSignOut={false} showAdminLink={false} />
      <main className="px-4 py-12 lg:px-6">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl font-semibold text-bcp-anthracite">Choisir un nouveau mot de passe</h1>
        </div>
        <div className="mt-10">
          <Suspense
            fallback={<p className="text-center text-sm text-bcp-muted">Chargement…</p>}
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </>
  );
}
