import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";
import { embedOne } from "@/lib/supabase/embed";

export const dynamic = "force-dynamic";

export default async function WorkspaceAssetsPage() {
  const profile = await getProfile();
  const supabase = await createServerSupabaseClient();
  if (!profile) return null;

  const { data: empRow } = await supabase.from("hr_employees").select("id").eq("user_id", profile.id).maybeSingle();
  const { data: rows } = empRow
    ? await supabase
        .from("hr_asset_assignments")
        .select("id, assigned_at, returned_at, expected_return_on, condition_out, hr_assets ( name, serial_number, category )")
        .eq("employee_id", empRow.id)
        .order("assigned_at", { ascending: false })
    : { data: [] };

  return (
    <section className="rounded-2xl border border-bcp-border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-bcp-anthracite">Matériel attribué</h2>
      <ul className="mt-4 space-y-3">
        {(rows ?? []).map((a) => {
          const asset = embedOne<{ name: string; serial_number: string | null; category: string | null }>(a.hr_assets);
          return (
            <li key={a.id} className="rounded-lg border border-bcp-border px-4 py-3 text-sm">
              <p className="font-medium text-bcp-anthracite">{asset?.name ?? "—"}</p>
              <p className="text-xs text-bcp-muted">
                {asset?.category && `${asset.category} · `}
                Série : {asset?.serial_number || "—"}
              </p>
              <p className="mt-1 text-xs text-bcp-muted">
                Depuis {a.assigned_at?.slice(0, 10)}
                {a.returned_at ? ` · retourné le ${a.returned_at.slice(0, 10)}` : " · en cours"}
              </p>
            </li>
          );
        })}
      </ul>
      {(rows ?? []).length === 0 && <p className="mt-4 text-sm text-bcp-muted">Aucune attribution.</p>}
    </section>
  );
}
