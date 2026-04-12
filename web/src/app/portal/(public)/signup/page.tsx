import { PortalHeader } from "@/components/portal/PortalHeader";
import { SignupForm } from "@/components/portal/SignupForm";
import { parseAppLocale } from "@/lib/appLocale";

export const metadata = {
  title: "Inscription — Espace client",
};

type PageProps = { searchParams: Promise<{ locale?: string }> };

export default async function PortalSignupPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const locale = parseAppLocale(sp.locale);

  return (
    <>
      <PortalHeader showSignOut={false} showAdminLink={false} />
      <main className="px-4 py-12 lg:px-6">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl font-semibold text-bcp-anthracite">Créer un compte</h1>
          <p className="mt-2 text-sm text-bcp-muted">
            L’accès aux projets est validé par l’équipe BCP après inscription.
          </p>
        </div>
        <div className="mt-10">
          <SignupForm locale={locale} />
        </div>
      </main>
    </>
  );
}
