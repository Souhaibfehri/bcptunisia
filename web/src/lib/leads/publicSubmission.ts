import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const publicLeadFormSchema = z
  .object({
    locale: z.enum(["fr", "en", "ar"]),
    name: z.string().min(2).max(120),
    company: z.string().min(2).max(120),
    phone: z.string().min(6).max(40),
    email: z.string().email().max(120),
    sector: z.string().min(2).max(60),
    needType: z.string().min(2).max(60),
    serviceCategory: z.string().min(2).max(60),
    message: z.string().min(10).max(8000),
    website: z.string().max(0).optional(),
    sourcePage: z.string().max(500).optional(),
    sourceForm: z.string().max(120).optional(),
    sourceType: z.string().max(60).optional(),
    utmSource: z.string().max(120).optional(),
    utmMedium: z.string().max(120).optional(),
    utmCampaign: z.string().max(120).optional(),
  })
  .strict();

export type PublicLeadPayload = z.infer<typeof publicLeadFormSchema>;

export type PublicLeadRequestMeta = {
  referer?: string | null;
};

const RATE_WINDOW_MS = 120_000;

export type PublicLeadInsertResult =
  | { ok: true; id: string }
  | { ok: false; code: "rate_limited" | "db" | "config"; message?: string };

export async function insertPublicLead(
  payload: PublicLeadPayload,
  meta: PublicLeadRequestMeta,
): Promise<PublicLeadInsertResult> {
  let admin;
  try {
    admin = createServiceRoleClient();
  } catch (e) {
    return {
      ok: false,
      code: "config",
      message: e instanceof Error ? e.message : "Configuration serveur",
    };
  }

  const emailNorm = payload.email.trim().toLowerCase();
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { count, error: rateErr } = await admin
    .from("crm_leads")
    .select("id", { count: "exact", head: true })
    .ilike("contact_email", emailNorm)
    .gte("created_at", since);

  if (rateErr) {
    console.error("[insertPublicLead] rate check", rateErr.message);
  } else if ((count ?? 0) > 0) {
    return { ok: false, code: "rate_limited" };
  }

  const sourceType = payload.sourceType?.trim() || "website_contact";
  const title = `${payload.name.trim()} — ${payload.company.trim()}`;

  const row = {
    title,
    company_name: payload.company.trim(),
    contact_name: payload.name.trim(),
    contact_email: emailNorm,
    contact_phone: payload.phone.trim(),
    stage: "new" as const,
    assigned_to: null,
    created_by: null,
    source_type: sourceType,
    source_page: payload.sourcePage?.trim() || null,
    source_form: payload.sourceForm?.trim() || "LeadForm",
    locale: payload.locale,
    request_type: payload.needType.trim(),
    service_category: payload.serviceCategory.trim(),
    sector: payload.sector.trim(),
    message: payload.message.trim(),
    utm_source: payload.utmSource?.trim() || null,
    utm_medium: payload.utmMedium?.trim() || null,
    utm_campaign: payload.utmCampaign?.trim() || null,
    referrer: meta.referer?.slice(0, 2000) || null,
    status: "open" as const,
    priority: "normal" as const,
    metadata: {} as Record<string, unknown>,
  };

  const { data, error } = await admin.from("crm_leads").insert(row).select("id").single();

  if (error) {
    console.error("[insertPublicLead]", error.message, error.code);
    return { ok: false, code: "db", message: error.message };
  }
  if (!data?.id) return { ok: false, code: "db" };
  return { ok: true, id: data.id };
}
