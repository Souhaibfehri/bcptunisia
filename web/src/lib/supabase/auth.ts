import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "./server";

export type CrmAccessScope = "none" | "assigned" | "org";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role:
    | "super_admin"
    | "admin"
    | "hr_admin"
    | "project_manager"
    | "people_manager"
    | "client"
    | "collaborator";
  client_id: string | null;
  crm_access_enabled?: boolean;
  crm_access_scope?: CrmAccessScope;
};

function devWarn(...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[supabase]", ...args);
  }
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (e) {
    devWarn("getSessionUser:", e);
    return null;
  }
}

/**
 * Ensures `public.profiles` has a row for the logged-in user (RPC from migration
 * `20250404120000_portal_ensure_profile_rpc.sql`). Safe to call on every authenticated request.
 */
export async function ensureProfileRow(): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.rpc("ensure_my_profile");
    if (error) {
      devWarn("ensure_my_profile RPC:", error.message, error.code);
    }
  } catch (e) {
    devWarn("ensureProfileRow:", e);
  }
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const user = await getSessionUser();
    if (!user) return null;
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (error) {
      devWarn("getProfile:", error.code, error.message);
      return null;
    }
    if (!data) return null;
    return data as Profile;
  } catch (e) {
    devWarn("getProfile:", e);
    return null;
  }
}

export function isStaffRole(role: string): boolean {
  return role === "super_admin" || role === "admin";
}

/** HR backoffice (matches DB is_hr_staff): super_admin | hr_admin */
export function isHrStaff(role: string): boolean {
  return role === "super_admin" || role === "hr_admin";
}

export function isSuperAdmin(role: string): boolean {
  return role === "super_admin";
}

/** Full admin = super_admin | admin (unrestricted access to all data and users) */
export function isFullAdmin(role: string): boolean {
  return role === "super_admin" || role === "admin";
}

/** Can access /admin at all — includes project_manager with scoped access and hr_admin */
export function canAccessAdmin(role: string): boolean {
  return (
    role === "super_admin" ||
    role === "admin" ||
    role === "hr_admin" ||
    role === "project_manager"
  );
}

/** Projects / delivery admin: dashboard, projets, clients, utilisateurs (scoped for PM) */
export function canAccessProjectsAdmin(role: string): boolean {
  return role === "super_admin" || role === "admin" || role === "project_manager";
}

/** HR backoffice: /admin/hr (super_admin + dedicated hr_admin) */
export function canAccessHrAdmin(role: string): boolean {
  return role === "super_admin" || role === "hr_admin";
}

/** User may open both platforms (only super_admin carries both roles in one account today) */
export function canAccessBothAdminPlatforms(role: string): boolean {
  return canAccessProjectsAdmin(role) && canAccessHrAdmin(role);
}

/**
 * Global platform operators use /admin only, not the employee workspace (even if an HR row exists).
 */
export function isBlockedFromEmployeePortal(role: string): boolean {
  return role === "super_admin" || role === "admin";
}

export function isClientOnlyRole(role: string): boolean {
  return role === "client";
}

/**
 * May use /employee when linked to hr_employees with active portal (layout checks the row).
 * Clients and global admins (super_admin, admin) are excluded.
 */
export function canAccessEmployeePortal(role: string): boolean {
  return role !== "client" && !isBlockedFromEmployeePortal(role);
}

export function isPeopleManagerRole(role: string): boolean {
  return role === "people_manager";
}

/** Full CRM in /admin/leads — super_admin | admin only (matches DB is_crm_staff) */
export function canAccessAdminCrm(role: string): boolean {
  return role === "super_admin" || role === "admin";
}

/**
 * Employee-path CRM (/employee/leads): active HR portal + flag; global admins use admin CRM only.
 */
export function canAccessEmployeeCrm(
  profile: Profile,
  opts: { employeePortalActive: boolean },
): boolean {
  if (profile.role === "client") return false;
  if (profile.role === "super_admin" || profile.role === "admin") return false;
  if (!opts.employeePortalActive) return false;
  if (!profile.crm_access_enabled) return false;
  const s = profile.crm_access_scope ?? "none";
  return s === "assigned" || s === "org";
}
