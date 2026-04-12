import { NextResponse } from "next/server";
import { getResolvedSiteSettings } from "@/lib/cms/siteResolved";
import { notifyNewPublicLead } from "@/lib/crm/notifyRecipients";
import { insertPublicLead, publicLeadFormSchema } from "@/lib/leads/publicSubmission";
import { verifyPublicLeadRecaptchaCheckboxToken } from "@/lib/recaptcha/contactLeadCheckboxVerify";

async function resolveRecipient(): Promise<string> {
  const env = process.env.CONTACT_FORM_RECIPIENT?.trim();
  if (env) return env;
  const settings = await getResolvedSiteSettings();
  return settings.contactFormRecipient.trim() || "contact@bcptunisia.com";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = publicLeadFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, issues: parsed.error.flatten() }, { status: 400 });
    }

    const { website: _h, recaptchaToken, ...rest } = parsed.data;
    void _h;

    const captcha = await verifyPublicLeadRecaptchaCheckboxToken(recaptchaToken, {
      referer: req.headers.get("referer"),
      userAgent: req.headers.get("user-agent"),
    });
    if (!captcha.ok) {
      if (captcha.reason === "misconfigured") {
        return NextResponse.json({ ok: false, error: "server_config" }, { status: 503 });
      }
      return NextResponse.json({ ok: false, error: "recaptcha" }, { status: 403 });
    }

    const referer = req.headers.get("referer");
    const result = await insertPublicLead(rest, { referer });

    if (!result.ok) {
      if (result.code === "rate_limited") {
        return NextResponse.json(
          { ok: false, error: "rate_limited", message: "Merci d'attendre avant un nouvel envoi." },
          { status: 429 },
        );
      }
      if (result.code === "config") {
        console.error("[api/contact] service role:", result.message);
        return NextResponse.json({ ok: false, error: "server_config" }, { status: 503 });
      }
      return NextResponse.json({ ok: false, error: "save_failed" }, { status: 500 });
    }

    const settings = await getResolvedSiteSettings();
    const recipient = await resolveRecipient();
    const prefix = settings.contactFormSubjectPrefix.trim() || "[BCP Tunisia]";
    const title = `${rest.name.trim()} — ${rest.company.trim()}`;

    console.info("[lead] persisted", {
      id: result.id,
      email: rest.email,
      notifyTo: recipient,
      subjectPrefix: prefix,
      receivedAt: new Date().toISOString(),
    });

    await notifyNewPublicLead(result.id, title).catch((e) =>
      console.error("[api/contact] notifyNewPublicLead", e),
    );

    return NextResponse.json({ ok: true, id: result.id });
  } catch (e) {
    console.error("[api/contact]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
