import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/portal/LoginForm";
import { PortalHeader } from "@/components/portal/PortalHeader";

export const metadata = {
  title: "Connexion — Espace client",
};

export default function PortalLoginPage() {
  return (
    <>
      <PortalHeader showSignOut={false} showAdminLink={false} />
      <main className="px-4 py-12 lg:px-6">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl font-semibold text-bcp-anthracite">Espace client</h1>
          <p className="mt-2 text-sm text-bcp-muted">
            Suivez l’avancement de vos projets BCP Tunisia, documents et factures.
          </p>
        </div>
        <div className="mt-10">
          <Suspense
            fallback={<p className="text-center text-sm text-bcp-muted">Chargement…</p>}
          >
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-8 text-center text-xs text-bcp-muted">
          <Link href="/fr" className="underline hover:text-bcp-anthracite">
            Retour au site public
          </Link>
        </p>
      </main>
    </>
  );
}
