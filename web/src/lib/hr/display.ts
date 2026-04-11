import { embedOne } from "@/lib/supabase/embed";

type ProfileLike = { display_name?: string | null; email?: string | null };

export function hrEmployeeDisplayName(emp: {
  first_name?: string | null;
  last_name?: string | null;
  user_id?: string | null;
  profiles?: unknown;
}): string {
  const fn = (emp.first_name ?? "").trim();
  const ln = (emp.last_name ?? "").trim();
  const composed = [fn, ln].filter(Boolean).join(" ").trim();
  if (composed) return composed;
  const pr = embedOne<ProfileLike>(emp.profiles);
  if (pr?.display_name?.trim()) return pr.display_name.trim();
  if (pr?.email?.trim()) return pr.email.trim();
  if (emp.user_id) return emp.user_id.slice(0, 8) + "…";
  return "Employé";
}

export const PORTAL_STATUS_LABEL: Record<string, string> = {
  none: "Aucun accès",
  invite_pending: "Invitation en attente",
  active: "Actif",
  disabled: "Désactivé",
};
