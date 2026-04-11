import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, isFullAdmin } from "@/lib/supabase/auth";
import { ProjectOnboardingWizard } from "@/components/admin/ProjectOnboardingWizard";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminNewProjectPage() {
  const profile = await getProfile();
  if (!profile || !isFullAdmin(profile.role)) notFound();

  const supabase = await createServerSupabaseClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name");

  const { data: internalUsers } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .in("role", ["admin", "super_admin", "collaborator"])
    .order("display_name");

  const { data: clientUsers } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("role", "client")
    .order("display_name");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/projects" className="text-xs font-medium text-bcp-gold">
          ← Tous les projets
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-bcp-anthracite">
          Nouveau projet — Intégration
        </h1>
        <p className="mt-1 text-sm text-bcp-muted">
          Configurez le projet étape par étape.
        </p>
      </div>

      <ProjectOnboardingWizard
        clients={clients ?? []}
        internalUsers={(internalUsers ?? []).map((u) => ({
          id: u.id,
          email: u.email ?? "",
          display_name: u.display_name,
          role: u.role,
        }))}
        clientUsers={(clientUsers ?? []).map((u) => ({
          id: u.id,
          email: u.email ?? "",
          display_name: u.display_name,
          role: u.role,
        }))}
      />
    </div>
  );
}
