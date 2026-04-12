import { PortalHeader } from "@/components/portal/PortalHeader";
import { ForgotPasswordForm } from "@/components/portal/ForgotPasswordForm";
import { parseAppLocale } from "@/lib/appLocale";

export const metadata = {
  title: "Mot de passe oublié",
};

type PageProps = { searchParams: Promise<{ locale?: string }> };

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const locale = parseAppLocale(sp.locale);

  return (
    <>
      <PortalHeader showSignOut={false} showAdminLink={false} />
      <main className="px-4 py-12 lg:px-6">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl font-semibold text-bcp-anthracite">Réinitialiser le mot de passe</h1>
        </div>
        <div className="mt-10">
          <ForgotPasswordForm locale={locale} />
        </div>
      </main>
    </>
  );
}
