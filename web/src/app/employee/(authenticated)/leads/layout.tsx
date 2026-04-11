import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getProfile, canAccessEmployeePortal, canAccessEmployeeCrm } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export default async function EmployeeLeadsSectionLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/portal/login?next=/employee/leads");
  }
  if (!canAccessEmployeePortal(profile.role)) {
    redirect("/portal/dashboard");
  }

  const supabase = await createServerSupabaseClient();
  const { data: emp } = await supabase
    .from("hr_employees")
    .select("portal_status")
    .eq("user_id", profile.id)
    .maybeSingle();

  const portalOk = emp?.portal_status === "active";
  if (!portalOk) {
    redirect("/portal/dashboard");
  }

  if (!canAccessEmployeeCrm(profile, { employeePortalActive: true })) {
    redirect("/employee");
  }

  return <>{children}</>;
}
