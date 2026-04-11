import type { Locale, ServicePageBody } from "./types";

export const serviceSectionTitles: Record<
  Locale,
  Pick<
    ServicePageBody,
    | "needsTitle"
    | "providesTitle"
    | "lifecycleTitle"
    | "sectorsTitle"
    | "faqTitle"
  >
> = {
  fr: {
    needsTitle: "Enjeux & risques",
    providesTitle: "Ce que BCP Tunisia met en œuvre",
    lifecycleTitle: "De l’audit au suivi",
    sectorsTitle: "Secteurs concernés",
    faqTitle: "Questions fréquentes",
  },
  en: {
    needsTitle: "Needs & risks",
    providesTitle: "What BCP Tunisia delivers",
    lifecycleTitle: "From assessment to follow-up",
    sectorsTitle: "Sectors",
    faqTitle: "FAQ",
  },
  ar: {
    needsTitle: "الاحتياجات والمخاطر",
    providesTitle: "ما تنفذه BCP Tunisia",
    lifecycleTitle: "من التقييم إلى المتابعة",
    sectorsTitle: "القطاعات",
    faqTitle: "أسئلة شائعة",
  },
};

export const standardLifecycle: Record<
  Locale,
  { title: string; body: string }[]
> = {
  fr: [
    {
      title: "Audit du besoin & conformité",
      body: "Cadrage réglementaire, analyse des risques, zones sensibles et interfaces avec vos autres équipements.",
    },
    {
      title: "Étude & conception",
      body: "Dimensionnement, choix des technologies, plans et dossier technique adapté à votre exploitation.",
    },
    {
      title: "Installation & raccordements",
      body: "Réalisation chantier, qualité de pose, coordination et intégration avec l’exploitation.",
    },
    {
      title: "Mise en service & recette",
      body: "Essais, vérifications, documentation et transfert de compétences aux équipes.",
    },
    {
      title: "Maintenance & suivi",
      body: "Entretien, contrôles périodiques et assistance pour une disponibilité durable.",
    },
  ],
  en: [
    {
      title: "Assessment & compliance framing",
      body: "Regulatory context, risk review, sensitive areas, and interfaces with your other systems.",
    },
    {
      title: "Design & engineering",
      body: "Sizing, technology selection, drawings, and technical documentation for your operations.",
    },
    {
      title: "Installation & terminations",
      body: "Site execution, workmanship, coordination, and integration with day-to-day operations.",
    },
    {
      title: "Commissioning & acceptance",
      body: "Testing, verification, documentation, and knowledge transfer to your teams.",
    },
    {
      title: "Maintenance & follow-up",
      body: "Servicing, periodic inspections, and support to sustain long-term availability.",
    },
  ],
  ar: [
    {
      title: "تقييم الاحتياج وإطار الامتثال",
      body: "السياق التنظيمي، تحليل المخاطر، المناطق الحساسة، والتكامل مع منظوماتكم الأخرى.",
    },
    {
      title: "الدراسة والتصميم",
      body: "تحديد السعات، اختيار التقنيات، المخططات، والوثائق الفنية المناسبة للتشغيل.",
    },
    {
      title: "التركيب والتوصيلات",
      body: "تنفيذ ميداني، جودة التركيب، تنسيق الموقع، والتكامل مع الاستغلال اليومي.",
    },
    {
      title: "التشغيل التجريبي والقبول",
      body: "اختبارات، تحقق، وثائق، ونقل المعرفة للفرق.",
    },
    {
      title: "الصيانة والمتابعة",
      body: "صيانة، فحوصات دورية، ودعم لضمان التوفر على المدى الطويل.",
    },
  ],
};
