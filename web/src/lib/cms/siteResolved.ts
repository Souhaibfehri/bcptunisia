import { COMPANY_DEFAULTS, SITE_COPY_DEFAULTS } from "@/lib/cms/defaults";
import { getSanitySingletons } from "@/lib/cms/fetchSanity";
import {
  mergeLocaleString,
  mergeLocaleText,
  mergeScalar,
} from "@/lib/cms/mergeLocale";
import type { LocaleStringPartial, LocaleTextPartial } from "@/lib/localePick";

type SanityLocale = { fr?: string; en?: string; ar?: string };

type SiteDoc = {
  companyName?: string;
  companyLegalLine?: string;
  tagline?: SanityLocale;
  headOfficeAddress?: string;
  workshopAddress?: string;
  emailPrimary?: string;
  emailSecondary?: string;
  phoneLandline?: string;
  phoneMobile?: string;
  whatsappUrl?: string;
  mapUrl?: string;
  openingHours?: string;
  footerLegalNote?: SanityLocale;
  socialLinkedin?: string;
  socialFacebook?: string;
  socialYoutube?: string;
  contactFormRecipient?: string;
  contactFormSubjectPrefix?: string;
  formSuccessMessage?: SanityLocale;
  formErrorMessage?: SanityLocale;
} | null;

export type ResolvedSiteSettings = {
  companyName: string;
  companyLegalLine: string;
  brandLine: string;
  headOfficeAddress: string;
  workshopAddress: string;
  emailPrimary: string;
  emailSecondary: string;
  phoneLandline: string;
  phoneMobile: string;
  whatsappUrl: string;
  mapUrl: string;
  openingHours: string;
  socialLinkedin: string;
  socialFacebook: string;
  socialYoutube: string;
  contactFormRecipient: string;
  contactFormSubjectPrefix: string;
  tagline: LocaleStringPartial;
  footerLegal: LocaleTextPartial;
  formSuccessMessage: LocaleStringPartial;
  formErrorMessage: LocaleStringPartial;
};

export async function getResolvedSiteSettings(): Promise<ResolvedSiteSettings> {
  const bundle = await getSanitySingletons();
  const s = (bundle?.site ?? null) as SiteDoc;

  const companyName = mergeScalar(COMPANY_DEFAULTS.companyName, s?.companyName);
  const companyLegalLine = mergeScalar(
    COMPANY_DEFAULTS.companyLegalLine,
    s?.companyLegalLine,
  );

  return {
    companyName,
    companyLegalLine,
    brandLine: `${companyName} — ${companyLegalLine}`,
    headOfficeAddress: mergeScalar(
      COMPANY_DEFAULTS.headOfficeAddress,
      s?.headOfficeAddress,
    ),
    workshopAddress: mergeScalar(
      COMPANY_DEFAULTS.workshopAddress,
      s?.workshopAddress,
    ),
    emailPrimary: mergeScalar(COMPANY_DEFAULTS.emailPrimary, s?.emailPrimary),
    emailSecondary: mergeScalar(
      COMPANY_DEFAULTS.emailSecondary,
      s?.emailSecondary,
    ),
    phoneLandline: mergeScalar(
      COMPANY_DEFAULTS.phoneLandline,
      s?.phoneLandline,
    ),
    phoneMobile: mergeScalar(COMPANY_DEFAULTS.phoneMobile, s?.phoneMobile),
    whatsappUrl: mergeScalar(COMPANY_DEFAULTS.whatsappUrl, s?.whatsappUrl),
    mapUrl: mergeScalar(COMPANY_DEFAULTS.mapUrl, s?.mapUrl),
    openingHours: mergeScalar(COMPANY_DEFAULTS.openingHours, s?.openingHours),
    socialLinkedin: mergeScalar("", s?.socialLinkedin),
    socialFacebook: mergeScalar("", s?.socialFacebook),
    socialYoutube: mergeScalar("", s?.socialYoutube),
    contactFormRecipient: mergeScalar(
      COMPANY_DEFAULTS.contactFormRecipient,
      s?.contactFormRecipient,
    ),
    contactFormSubjectPrefix: mergeScalar(
      COMPANY_DEFAULTS.contactFormSubjectPrefix,
      s?.contactFormSubjectPrefix,
    ),
    tagline: mergeLocaleString(SITE_COPY_DEFAULTS.tagline, s?.tagline),
    footerLegal: mergeLocaleText(
      SITE_COPY_DEFAULTS.footerLegal,
      s?.footerLegalNote,
    ),
    formSuccessMessage: mergeLocaleString(
      SITE_COPY_DEFAULTS.formSuccess,
      s?.formSuccessMessage,
    ),
    formErrorMessage: mergeLocaleString(
      SITE_COPY_DEFAULTS.formError,
      s?.formErrorMessage,
    ),
  };
}

export async function getNavigationSettingsResolved(): Promise<{
  showNewsInNav: boolean;
  ctaQuote: LocaleStringPartial | null;
}> {
  const bundle = await getSanitySingletons();
  const nav = bundle?.nav as { showNewsInNav?: boolean; ctaQuote?: SanityLocale } | null;
  const showNewsInNav = nav?.showNewsInNav !== false;
  const merged = mergeLocaleString({ fr: "", en: "", ar: "" }, nav?.ctaQuote);
  const hasAny = Boolean(merged.fr || merged.en || merged.ar);
  return {
    showNewsInNav,
    ctaQuote: hasAny ? merged : null,
  };
}
