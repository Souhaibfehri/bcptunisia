import { PortalHeader } from "@/components/portal/PortalHeader";
import { ForgotPasswordForm } from "@/components/portal/ForgotPasswordForm";

export const metadata = {
  title: "Mot de passe oublié",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <PortalHeader showSignOut={false} showAdminLink={false} />
      <main className="px-4 py-12 lg:px-6">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-2xl font-semibold text-bcp-anthracite">Réinitialiser le mot de passe</h1>
        </div>
        <div className="mt-10">
          <ForgotPasswordForm />
        </div>
      </main>
    </>
  );
}
