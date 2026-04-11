import type { LocaleStringPartial } from "@/lib/localePick";

/** Fallback copy when Sanity fields are empty — mirrors current messages where relevant */
export const SITE_COPY_DEFAULTS = {
  tagline: {
    fr: "De l’étude à la maintenance, nous sécurisons, équipons et accompagnons vos environnements industriels et tertiaires.",
    en: "From design to maintenance, we secure, equip, and support your industrial and tertiary environments.",
    ar: "من الدراسة إلى الصيانة، نؤمّن ونوفر وندعم بيئاتكم الصناعية والخدمية.",
  } satisfies LocaleStringPartial,
  footerLegal: {
    fr: "BCP Tunisia — BE CLOSE PROTECTION. Données légales et coordonnées éditables dans l’administration de contenu.",
    en: "BCP Tunisia — BE CLOSE PROTECTION. Legal lines and contact details are editable in the CMS.",
    ar: "BCP Tunisia — BE CLOSE PROTECTION. البيانات القانونية والإحداثيات قابلة للتعديل في نظام إدارة المحتوى.",
  } satisfies LocaleStringPartial,
  formSuccess: {
    fr: "Merci. Votre demande a été transmise.",
    en: "Thank you. Your request has been sent.",
    ar: "شكراً. تم إرسال طلبكم.",
  } satisfies LocaleStringPartial,
  formError: {
    fr: "Envoi impossible pour le moment. Réessayez ou contactez-nous par téléphone.",
    en: "We could not send your message right now. Please try again or call us.",
    ar: "تعذّر الإرسال حالياً. أعد المحاولة أو اتصل بنا.",
  } satisfies LocaleStringPartial,
} as const;

export const COMPANY_DEFAULTS = {
  companyName: "BCP Tunisia",
  companyLegalLine: "BE CLOSE PROTECTION",
  headOfficeAddress:
    "Immeuble 9 Rue Mohamed Ali Annabi, 4ème étage, appart 1, Monplaisir, Tunis 1073",
  workshopAddress: "16 Rue Beja, Z.I El M’Ghira, Fouchena",
  emailPrimary: "contact@bcptunisia.com",
  emailSecondary: "dg@bcptunisia.com",
  phoneLandline: "+216 71 902 025",
  phoneMobile: "+216 98 429 945",
  whatsappUrl: "",
  mapUrl: "",
  openingHours: "",
  contactFormRecipient: "contact@bcptunisia.com",
  contactFormSubjectPrefix: "[BCP Tunisia]",
} as const;
