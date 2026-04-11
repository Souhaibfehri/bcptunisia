import { getProfile, isStaffRole } from "@/lib/supabase/auth";
import { PortalHeader } from "./PortalHeader";

export async function PortalHeaderWithRole(props: { title?: string; showSignOut?: boolean }) {
  const profile = await getProfile();
  const showAdmin = profile ? isStaffRole(profile.role) : false;
  return <PortalHeader {...props} showAdminLink={showAdmin} />;
}
