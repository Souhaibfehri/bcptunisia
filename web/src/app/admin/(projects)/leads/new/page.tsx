import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, canAccessAdminCrm } from "@/lib/supabase/auth";
import { createCrmLeadFromForm } from "@/lib/crm/server-actions";
import { CRM_STAGES } from "@/lib/crm/types";
import { crmStageLabel } from "@/lib/crm/stageLabels";
import { AdminFlashBanner } from "@/components/admin/AdminFlashBanner";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function AdminNewLeadPage({ searchParams }: PageProps) {
  const profile = await getProfile();
  if (!profile || !canAccessAdminCrm(profile.role)) {
    redirect("/admin");
  }

  const sp = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: assignees } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .neq("role", "client")
    .order("display_name");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/leads" className="text-xs font-medium text-bcp-gold">
          ← Leads
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-bcp-anthracite">Nouveau lead</h1>
      </div>

      <AdminFlashBanner error={sp.error} />

      <form action={createCrmLeadFromForm} className="max-w-xl space-y-4 rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
        <input type="hidden" name="crm_base" value="/admin/leads" />
        <div>
          <label className="text-xs font-medium text-bcp-muted">Titre *</label>
          <input name="title" required className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-bcp-muted">Société</label>
          <input name="company_name" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-bcp-muted">Contact</label>
            <input name="contact_name" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-bcp-muted">Téléphone</label>
            <input name="contact_phone" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-bcp-muted">E-mail</label>
          <input name="contact_email" type="email" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-bcp-muted">Étape</label>
          <select name="stage" defaultValue="new" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm">
            {CRM_STAGES.map((s) => (
              <option key={s} value={s}>
                {crmStageLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-bcp-muted">Assigné à</label>
          <select name="assigned_to" className="mt-1 w-full rounded-lg border border-bcp-border px-3 py-2 text-sm">
            <option value="">— Non assigné —</option>
            {(assignees ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.display_name?.trim() || u.email || u.id}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded-lg bg-bcp-navy px-4 py-2 text-sm font-semibold text-white">
          Créer
        </button>
      </form>
    </div>
  );
}
