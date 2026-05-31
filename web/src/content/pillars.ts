import type { DivisionId } from "@/data/services";
import type { Locale, PillarMap, PillarPageBody } from "./types";

const T = {
  fr: {
    scopeTitle: "Périmètre d’intervention",
    approachTitle: "Notre approche",
    lifecycleTitle: "Une logique bout-en-bout",
    sectorsTitle: "Secteurs concernés",
    faqTitle: "Questions fréquentes",
  },
  en: {
    scopeTitle: "Scope of work",
    approachTitle: "Our approach",
    lifecycleTitle: "End-to-end logic",
    sectorsTitle: "Sectors",
    faqTitle: "FAQ",
  },
  ar: {
    scopeTitle: "نطاق التدخل",
    approachTitle: "نهجنا",
    lifecycleTitle: "منهجية شاملة",
    sectorsTitle: "القطاعات",
    faqTitle: "أسئلة شائعة",
  },
};

function p(
  fr: Omit<
    PillarPageBody,
    | "scopeTitle"
    | "approachTitle"
    | "lifecycleTitle"
    | "sectorsTitle"
    | "faqTitle"
  >,
  en: Omit<
    PillarPageBody,
    | "scopeTitle"
    | "approachTitle"
    | "lifecycleTitle"
    | "sectorsTitle"
    | "faqTitle"
  >,
  ar: Omit<
    PillarPageBody,
    | "scopeTitle"
    | "approachTitle"
    | "lifecycleTitle"
    | "sectorsTitle"
    | "faqTitle"
  >,
): Record<Locale, PillarPageBody> {
  return {
    fr: { ...T.fr, ...fr },
    en: { ...T.en, ...en },
    ar: { ...T.ar, ...ar },
  };
}

export const pillarPages: PillarMap = {
  "fire-safety": p({
      metaTitle: "Sécurité incendie | BCP Tunisia",
      metaDescription:
        "Détection, SSI, extinction, désenfumage et maintenance : un accompagnement technique pour sites industriels et tertiaires.",
      h1: "Sécurité incendie",
      heroLead:
        "Réduire le risque incendie, c’est combiner bons choix techniques et tenue dans le temps.",
      intro:
        "BCP Tunisia intervient sur les systèmes qui contribuent à la détection, à l’alarme, à la limitation de propagation et à la mise en sécurité des personnes. Notre logique relie étude, installation, mise en service et maintenance pour garder des installations exploitables et vérifiables au quotidien.",
      scopeItems: [
        "Détection incendie & SSI",
        "Détection de gaz",
        "RIA / PIA, colonnes, hydrants",
        "Extinction automatique eau / gaz",
        "Extincteurs & éclairage de sécurité",
        "Compartimentage & désenfumage",
        "Plans & détection d’étincelles",
      ],
      approach: [
        "Cadrage du contexte réglementaire et des risques spécifiques au site.",
        "Conception adaptée à l’exploitation et aux interfaces multi-corps de métier.",
        "Réalisation contrôlée, recette documentée, transfert vers l’exploitation.",
        "Suivi par maintenance et contrôles périodiques.",
      ],
      lifecycle: [
        {
          title: "Audit / besoin",
          body: "Compréhension du site, des zones critiques et des obligations applicables.",
        },
        {
          title: "Étude & conception",
          body: "Dimensionnement, choix technologies, plans et dossier technique.",
        },
        {
          title: "Installation",
          body: "Exécution, raccordements, interfaces et coordination chantier.",
        },
        {
          title: "Mise en service",
          body: "Essais, recette, documentation et accompagnement utilisateurs.",
        },
        {
          title: "Maintenance / suivi",
          body: "Entretien, vérifications et assistance pour préserver la performance.",
        },
      ],
      sectors: [
        "Industrie & logistique",
        "Tertiaire & retail",
        "Santé & hôtellerie",
        "Infrastructures & sites sensibles",
      ],
      faq: [
        {
          q: "Intervenez-vous sur site occupé ?",
          a: "Oui, avec phasage et mesures pour limiter l’impact sur l’activité.",
        },
        {
          q: "Pouvez-vous reprendre des installations existantes ?",
          a: "Oui : diagnostic, extension ou mise en cohérence selon vos objectifs.",
        },
      ],
    },
    {
      metaTitle: "Fire safety | BCP Tunisia",
      metaDescription:
        "Detection, fire alarm, suppression, smoke control, and maintenance for industrial and tertiary environments.",
      h1: "Fire safety",
      heroLead:
        "Reducing fire risk combines sound engineering with sustained operational discipline.",
      intro:
        "BCP Tunisia works on systems that support detection, alarm, fire spread limitation, and occupant safety. We connect design, installation, commissioning, and maintenance so installations remain testable and operable day to day.",
      scopeItems: [
        "Fire detection & fire alarm",
        "Gas detection",
        "Hose reels / hydrants / risers",
        "Automatic water / gas suppression",
        "Extinguishers & emergency lighting",
        "Compartmentation & smoke control",
        "Plans & spark detection",
      ],
      approach: [
        "Frame regulatory context and site-specific risks.",
        "Engineer for operations and multi-trade interfaces.",
        "Controlled execution, documented acceptance, operations handover.",
        "Sustain performance through maintenance and inspections.",
      ],
      lifecycle: [
        {
          title: "Assessment / needs",
          body: "Understand the site, critical zones, and applicable obligations.",
        },
        {
          title: "Design & engineering",
          body: "Sizing, technology selection, drawings, and technical dossier.",
        },
        {
          title: "Installation",
          body: "Execution, terminations, interfaces, and site coordination.",
        },
        {
          title: "Commissioning",
          body: "Testing, acceptance, documentation, and user support.",
        },
        {
          title: "Maintenance / follow-up",
          body: "Servicing, inspections, and assistance to preserve performance.",
        },
      ],
      sectors: [
        "Industry & logistics",
        "Commercial & retail",
        "Healthcare & hospitality",
        "Infrastructure & sensitive sites",
      ],
      faq: [
        {
          q: "Do you work on occupied sites?",
          a: "Yes, with phasing to limit operational impact.",
        },
        {
          q: "Can you take over existing systems?",
          a: "Yes: assessment, extension, or alignment work as needed.",
        },
      ],
    },
    {
      metaTitle: "السلامة من الحريق | BCP Tunisia",
      metaDescription:
        "الكشف، الإنذار، الإطفاء، التحكم بالدخان والصيانة للمنشآت الصناعية والخدمية.",
      h1: "السلامة من الحريق",
      heroLead:
        "تقليل مخاطر الحريق يجمع بين هندسة سليمة وانضباط تشغيلي مستمر.",
      intro:
        "تعمل BCP Tunisia على الأنظمة التي تدعم الكشف والإنذار وحد انتشار الحريق وسلامة الأشخاص. نربط الدراسة والتركيب والتشغيل التجريبي والصيانة لتبقى المنشآت قابلة للاختبار والتشغيل يومياً.",
      scopeItems: [
        "الكشف وأنظمة الإنذار",
        "كشف الغاز",
        "خراطيم / صنابير / أعمدة",
        "إطفاء تلقائي بالماء أو الغاز",
        "طفايات وإضاءة طوارئ",
        "عزل واستخراج دخان",
        "مخططات وكشف شرر",
      ],
      approach: [
        "إطار تنظيمي ومخاطر خاصة بالموقع.",
        "تصميم للتشغيل وواجهات متعددة الحرف.",
        "تنفيذ منضبط، قبول موثق، تسليم للتشغيل.",
        "أداء مستدام عبر الصيانة والفحوصات.",
      ],
      lifecycle: [
        {
          title: "تقييم / احتياج",
          body: "فهم الموقع والمناطق الحرجة والالتزامات.",
        },
        {
          title: "دراسة وتصميم",
          body: "تحديد السعات، التقنيات، المخططات، والملف الفني.",
        },
        {
          title: "التركيب",
          body: "التنفيذ، التوصيلات، الواجهات، وتنسيق الموقع.",
        },
        {
          title: "التشغيل التجريبي",
          body: "اختبارات، قبول، وثائق، ودعم المستخدمين.",
        },
        {
          title: "الصيانة / المتابعة",
          body: "صيانة، فحوصات، ومساعدة للحفاظ على الأداء.",
        },
      ],
      sectors: [
        "صناعة ولوجستيك",
        "خدمات وتجارة",
        "صحة وضيافة",
        "بنى تحتية ومواقع حساسة",
      ],
      faq: [
        {
          q: "هل تعملون في مواقع مشغولة؟",
          a: "نعم مع مراحل لتقليل الأثر على النشاط.",
        },
        {
          q: "هل تستلمون منشآت قائمة؟",
          a: "نعم عبر تشخيص أو توسيع أو مواءمة حسب الأهداف.",
        },
      ],
    },
  ),
  "electronic-security": p(
    {
      metaTitle: "Sécurité électronique | BCP Tunisia",
      metaDescription:
        "Vidéosurveillance, contrôle d’accès, intrusion, supervision et systèmes spécialisés pour environnements professionnels.",
      h1: "Sécurité électronique",
      heroLead:
        "La sécurité électronique doit servir l’exploitation, pas l’encombrer.",
      intro:
        "Nous concevons des architectures réalistes pour sites industriels et tertiaires : disponibilité, droits d’accès, supervision et maintenance. Chaque brique est intégrée pour limiter les silos techniques et faciliter le suivi.",
      scopeItems: [
        "Vidéosurveillance",
        "Contrôle d’accès",
        "Détection intrusion",
        "Salle de contrôle & supervision",
        "Gestion de files d’attente",
        "Appel infirmier",
      ],
      approach: [
        "Cadrage des besoins et des contraintes réseau/sécurité.",
        "Choix d’équipements et d’architectures maintenables.",
        "Déploiement, paramétrage, essais et transfert.",
        "Maintenance et évolutions maîtrisées.",
      ],
      lifecycle: [
        {
          title: "Audit / besoin",
          body: "Périmètres, flux, horaires, et exigences de traçabilité.",
        },
        {
          title: "Étude & conception",
          body: "Plans d’adressage, supervision, sauvegardes et procédures.",
        },
        {
          title: "Installation",
          body: "Pose, câblage, intégration et configuration.",
        },
        {
          title: "Mise en service",
          body: "Recette, documentation et formation opérateurs.",
        },
        {
          title: "Maintenance / suivi",
          body: "Mises à jour, contrôles et assistance.",
        },
      ],
      sectors: [
        "Industrie",
        "Tertiaire",
        "Retail",
        "Santé",
      ],
      faq: [
        {
          q: "Proposez-vous une supervision centralisée ?",
          a: "Oui, selon criticité et maturité réseau du site.",
        },
        {
          q: "Comment sécurisez-vous l’accès aux enregistrements ?",
          a: "Par droits, segmentation et bonnes pratiques d’exploitation.",
        },
      ],
    },
    {
      metaTitle: "Electronic security | BCP Tunisia",
      metaDescription:
        "CCTV, access control, intrusion alarms, supervision, and specialized systems for professional environments.",
      h1: "Electronic security",
      heroLead:
        "Electronic security should support operations—not add friction.",
      intro:
        "We design pragmatic architectures for industrial and tertiary sites: availability, access rights, supervision, and maintenance. Components are integrated to reduce technical silos and simplify ongoing management.",
      scopeItems: [
        "Video surveillance",
        "Access control",
        "Intrusion detection",
        "Control room & supervision",
        "Queue management",
        "Nurse call",
      ],
      approach: [
        "Frame needs and network/security constraints.",
        "Select maintainable equipment and architectures.",
        "Deploy, configure, test, and hand over.",
        "Controlled maintenance and upgrades.",
      ],
      lifecycle: [
        {
          title: "Assessment / needs",
          body: "Perimeters, flows, hours, and traceability requirements.",
        },
        {
          title: "Design & engineering",
          body: "Addressing plans, supervision, backups, and procedures.",
        },
        {
          title: "Installation",
          body: "Mounting, cabling, integration, and configuration.",
        },
        {
          title: "Commissioning",
          body: "Acceptance, documentation, and operator training.",
        },
        {
          title: "Maintenance / follow-up",
          body: "Updates, checks, and assistance.",
        },
      ],
      sectors: [
        "Manufacturing",
        "Commercial",
        "Retail",
        "Healthcare",
      ],
      faq: [
        {
          q: "Do you provide centralized supervision?",
          a: "Yes, depending on criticality and network maturity.",
        },
        {
          q: "How do you protect recordings?",
          a: "Through rights, segmentation, and operational best practices.",
        },
      ],
    },
    {
      metaTitle: "الأمن الإلكتروني | BCP Tunisia",
      metaDescription:
        "المراقبة بالفيديو، التحكم في الدخول، التسلل، الإشراف، وأنظمة متخصصة للبيئات المهنية.",
      h1: "الأمن الإلكتروني",
      heroLead:
        "الأمن الإلكتروني يجب أن يخدم التشغيل لا أن يعقّده.",
      intro:
        "نصمم بنى عملية للمواقع الصناعية والخدمية: توفر، صلاحيات، إشراف وصيانة. تُدمج المكوّنات لتقليل الجزر التقنية وتسهيل الإدارة.",
      scopeItems: [
        "المراقبة بالفيديو",
        "التحكم في الدخول",
        "كشف التسلل",
        "غرفة التحكم والإشراف",
        "إدارة الطوابير",
        "نداء التمريض",
      ],
      approach: [
        "تأطير الحاجات وقيود الشبكة والأمن.",
        "اختيار معدات وبنى قابلة للصيانة.",
        "النشر، الضبط، الاختبار، والتسليم.",
        "صيانة وترقيات منضبطة.",
      ],
      lifecycle: [
        {
          title: "تقييم / احتياج",
          body: "محيطات، تدفقات، أوقات، ومتطلبات التتبع.",
        },
        {
          title: "دراسة وتصميم",
          body: "مخططات عناوين، إشراف، نسخ احتياطي، وإجراءات.",
        },
        {
          title: "التركيب",
          body: "التركيب، الكابلات، التكامل، والضبط.",
        },
        {
          title: "التشغيل التجريبي",
          body: "القبول، الوثائق، وتكوين المشغّلين.",
        },
        {
          title: "الصيانة / المتابعة",
          body: "تحديثات، فحوصات، ومساعدة.",
        },
      ],
      sectors: [
        "صناعة",
        "خدمات",
        "تجارة",
        "صحة",
      ],
      faq: [
        {
          q: "هل تقدمون إشرافاً مركزياً؟",
          a: "نعم حسب الحساسية ونضج الشبكة.",
        },
        {
          q: "كيف تحمون التسجيلات؟",
          a: "عبر الصلاحيات، التجزئة، وممارسات تشغيل جيدة.",
        },
      ],
    },
  ),
  "industrial-fluids": p(
    {
      metaTitle: "Fluides industriels & tertiaires | BCP Tunisia",
      metaDescription:
        "CVC, utilités, air comprimé, plomberie, piscines et stockage d’eau : études, installation et maintenance.",
      h1: "Fluides industriels & tertiaires",
      heroLead:
        "Les fluides portent à la fois confort, process et sécurité sanitaire : ils méritent une conception intégrée.",
      intro:
        "BCP Tunisia intervient sur les réseaux qui conditionnent la qualité d’air, l’eau, les utilités et les énergies fluides du bâtiment. Nous relions études, mise en œuvre et suivi pour garder des installations compréhensibles par l’exploitation.",
      scopeItems: [
        "CVC / HVAC",
        "Utilités industrielles",
        "Air comprimé",
        "Plomberie & sanitaire",
        "Gaz médical",
        "Piscines & fontaines",
        "Réservoirs & stockage d’eau",
      ],
      approach: [
        "Comprendre charges, criticité et interfaces avec le process.",
        "Dimensionner et choisir des solutions maintenables.",
        "Réaliser avec contrôles et recette mesurable.",
        "Assurer maintenance et optimisation progressive.",
      ],
      lifecycle: [
        {
          title: "Audit / besoin",
          body: "Relevés, usages, contraintes d’exploitation et objectifs.",
        },
        {
          title: "Étude & conception",
          body: "Schémas, calculs, plans et choix matériels.",
        },
        {
          title: "Installation",
          body: "Travaux, raccordements, équilibrage et coordination.",
        },
        {
          title: "Mise en service",
          body: "Essais, mesures, documentation et consignes.",
        },
        {
          title: "Maintenance / suivi",
          body: "Entretien, contrôles et assistance.",
        },
      ],
      sectors: [
        "Industrie",
        "Tertiaire",
        "Santé",
        "Hôtellerie & loisirs",
      ],
      faq: [
        {
          q: "Intervenez-vous sur rénovation partielle ?",
          a: "Oui, avec analyse d’impact sur l’existant.",
        },
        {
          q: "Assurez-vous le suivi énergétique basique ?",
          a: "Nous pouvons structurer des points de mesure utiles à l’exploitation, sans promesse chiffrée non validée.",
        },
      ],
    },
    {
      metaTitle: "Industrial & tertiary fluids | BCP Tunisia",
      metaDescription:
        "HVAC, utilities, compressed air, plumbing, pools, and water storage: engineering, installation, and maintenance.",
      h1: "Industrial & tertiary fluids",
      heroLead:
        "Fluids deliver comfort, process conditions, and sanitary safety—they need integrated engineering.",
      intro:
        "BCP Tunisia works on networks that shape air quality, water, utilities, and fluid energy in buildings. We connect studies, execution, and follow-up so systems remain understandable for operators.",
      scopeItems: [
        "HVAC / CVC",
        "Industrial utilities",
        "Compressed air",
        "Plumbing & sanitary",
        "Medical gas",
        "Pools & fountains",
        "Water tanks & storage",
      ],
      approach: [
        "Understand loads, criticality, and process interfaces.",
        "Size and select maintainable solutions.",
        "Execute with checks and measurable acceptance.",
        "Deliver maintenance and progressive optimization.",
      ],
      lifecycle: [
        {
          title: "Assessment / needs",
          body: "Surveys, usage patterns, constraints, and objectives.",
        },
        {
          title: "Design & engineering",
          body: "Schematics, calculations, drawings, and equipment selection.",
        },
        {
          title: "Installation",
          body: "Works, connections, balancing, and coordination.",
        },
        {
          title: "Commissioning",
          body: "Tests, measurements, documentation, and guidance.",
        },
        {
          title: "Maintenance / follow-up",
          body: "Servicing, inspections, and assistance.",
        },
      ],
      sectors: [
        "Manufacturing",
        "Commercial",
        "Healthcare",
        "Hospitality & leisure",
      ],
      faq: [
        {
          q: "Do you handle partial retrofits?",
          a: "Yes, with impact analysis on existing systems.",
        },
        {
          q: "Do you support basic energy tracking?",
          a: "We can structure measurement points useful for operations, without unvalidated performance claims.",
        },
      ],
    },
    {
      metaTitle: "السوائل الصناعية والخدمية | BCP Tunisia",
      metaDescription:
        "التكييف، المرافق، الهواء المضغوط، السباكة، المسابح وتخزين المياه: دراسة، تركيب وصيانة.",
      h1: "السوائل الصناعية والخدمية",
      heroLead:
        "السوائل توفر الراحة والعمليات والسلامة الصحية؛ تحتاج هندسة متكاملة.",
      intro:
        "تعمل BCP Tunisia على الشبكات التي تشكل جودة الهواء والمياه والمرافق والطاقة السائلة في المباني. نربط الدراسة والتنفيذ والمتابعة لتبقى المنشآت مفهومة للمشغّلين.",
      scopeItems: [
        "التكييف CVC",
        "المرافق الصناعية",
        "الهواء المضغوط",
        "السباكة والصحية",
        "الغاز الطبي",
        "المسابح والنوافير",
        "خزانات المياه",
      ],
      approach: [
        "فهم الأحمال والحساسية وواجهات العمليات.",
        "تحديد السعات واختيار حلول قابلة للصيانة.",
        "تنفيذ بفحوص وقبول قابل للقياس.",
        "صيانة وتحسين تدريجي.",
      ],
      lifecycle: [
        {
          title: "تقييم / احتياج",
          body: "مسح، استعمال، قيود، وأهداف.",
        },
        {
          title: "دراسة وتصميم",
          body: "مخططات، حسابات، واختيار معدات.",
        },
        {
          title: "التركيب",
          body: "أشغال، وصلات، موازنة، وتنسيق.",
        },
        {
          title: "التشغيل التجريبي",
          body: "اختبارات، قياسات، وثائق، وإرشاد.",
        },
        {
          title: "الصيانة / المتابعة",
          body: "صيانة، فحوصات، ومساعدة.",
        },
      ],
      sectors: [
        "صناعة",
        "خدمات",
        "صحة",
        "ضيافة وترفيه",
      ],
      faq: [
        {
          q: "هل تعملون على تجديد جزئي؟",
          a: "نعم مع تحليل الأثر على الموجود.",
        },
        {
          q: "هل تدعمون تتبع طاقة أساسي؟",
          a: "يمكننا هيكلة نقاط قياس مفيدة دون ادعاءات أداء غير مثبتة.",
        },
      ],
    },
  ),
  "industrial-electrical": p(
    {
      metaTitle: "Électricité industrielle & tertiaire | BCP Tunisia",
      metaDescription:
        "Installations électriques, thermographie et montage d’armoires : qualité, sécurité et maintenabilité.",
      h1: "Électricité industrielle & tertiaire",
      heroLead:
        "L’électricité est structurante : la qualité de pose et de documentation conditionne la sécurité du site.",
      intro:
        "Nous réalisons des installations adaptées aux usages industriels et tertiaires, avec une attention particulière à la lisibilité pour la maintenance. La thermographie et le montage d’armoires complètent une offre cohérente pour sécuriser l’exploitation.",
      scopeItems: [
        "Installations électriques",
        "Thermographie",
        "Montage d’armoires électriques",
      ],
      approach: [
        "Cadrage des normes applicables et des contraintes d’exploitation.",
        "Exécution disciplinée et contrôlée.",
        "Essais, marquage et dossiers exploitables.",
        "Suivi par maintenance et expertises ciblées.",
      ],
      lifecycle: [
        {
          title: "Audit / besoin",
          body: "Relevés, charge, environnement et planning.",
        },
        {
          title: "Étude & conception",
          body: "Schémas, protections, chemins de câbles et nomenclatures.",
        },
        {
          title: "Installation",
          body: "Travaux, raccordements, contrôles intermédiaires.",
        },
        {
          title: "Mise en service",
          body: "Essais, recette, documentation.",
        },
        {
          title: "Maintenance / suivi",
          body: "Inspections, thermographie, dépannage.",
        },
      ],
      sectors: [
        "Industrie",
        "Tertiaire",
        "Infrastructures",
        "Retail",
      ],
      faq: [
        {
          q: "Réalisez-vous des armoires sur plan client ?",
          a: "Oui, après validation des schémas et points d’interface.",
        },
        {
          q: "La thermographie est-elle une garantie zéro panne ?",
          a: "Non : c’est un outil de priorisation et de prévention, pas une assurance absolue.",
        },
      ],
    },
    {
      metaTitle: "Industrial & tertiary electrical | BCP Tunisia",
      metaDescription:
        "Electrical installations, thermography, and panel assembly focused on safety and maintainability.",
      h1: "Industrial & tertiary electrical",
      heroLead:
        "Electrical infrastructure is foundational—workmanship and documentation drive site safety.",
      intro:
        "We deliver installations suited to industrial and tertiary use, with emphasis on maintainability. Thermography and panel assembly complete a coherent offer to support reliable operations.",
      scopeItems: [
        "Electrical installation",
        "Thermographic inspection",
        "Electrical cabinet assembly",
      ],
      approach: [
        "Frame applicable standards and operational constraints.",
        "Disciplined, controlled execution.",
        "Testing, labeling, and practical dossiers.",
        "Follow-up through maintenance and targeted assessments.",
      ],
      lifecycle: [
        {
          title: "Assessment / needs",
          body: "Surveys, loads, environment, and schedule.",
        },
        {
          title: "Design & engineering",
          body: "Schematics, protection, cable routes, and BOMs.",
        },
        {
          title: "Installation",
          body: "Works, connections, intermediate checks.",
        },
        {
          title: "Commissioning",
          body: "Testing, acceptance, documentation.",
        },
        {
          title: "Maintenance / follow-up",
          body: "Inspections, thermography, troubleshooting.",
        },
      ],
      sectors: [
        "Manufacturing",
        "Commercial",
        "Infrastructure",
        "Retail",
      ],
      faq: [
        {
          q: "Do you build panels from client drawings?",
          a: "Yes, after validating schematics and interfaces.",
        },
        {
          q: "Does thermography guarantee zero failures?",
          a: "No: it is a prioritization and prevention tool, not an absolute guarantee.",
        },
      ],
    },
    {
      metaTitle: "الكهرباء الصناعية والخدمية | BCP Tunisia",
      metaDescription:
        "منشآت كهربائية، تصوير حراري، وتجميع لوحات مع التركيز على السلامة وقابلية الصيانة.",
      h1: "الكهرباء الصناعية والخدمية",
      heroLead:
        "البنية الكهربائية أساسية؛ جودة التنفيذ والوثائق تؤثر مباشرة على سلامة الموقع.",
      intro:
        "ننفذ منشآت ملائمة للاستعمال الصناعي والخدمي مع إبراز قابلية الصيانة. يكمّل التصوير الحراري وتجميع اللوحات العرض لدعم تشغيل موثوق.",
      scopeItems: [
        "المنشآت الكهربائية",
        "الفحص بالتصوير الحراري",
        "تجميع اللوحات الكهربائية",
      ],
      approach: [
        "إطار المعايير وقيود التشغيل.",
        "تنفيذ منضبط ومراقب.",
        "اختبارات، ترميز، وملفات عملية.",
        "متابعة عبر الصيانة وتقييمات موجهة.",
      ],
      lifecycle: [
        {
          title: "تقييم / احتياج",
          body: "مسح، أحمال، بيئة، وجدول.",
        },
        {
          title: "دراسة وتصميم",
          body: "مخططات، حماية، مسارات كابلات، وقوائم.",
        },
        {
          title: "التركيب",
          body: "أشغال، وصلات، فحوص وسيطة.",
        },
        {
          title: "التشغيل التجريبي",
          body: "اختبارات، قبول، وثائق.",
        },
        {
          title: "الصيانة / المتابعة",
          body: "تفتيش، تصوير حراري، تشخيص أعطال.",
        },
      ],
      sectors: [
        "صناعة",
        "خدمات",
        "بنى تحتية",
        "تجارة",
      ],
      faq: [
        {
          q: "هل تبنون لوحات من مخططات العميل؟",
          a: "نعم بعد التحقق من المخططات والواجهات.",
        },
        {
          q: "هل يضمن التصوير الحراري عدم الأعطال؟",
          a: "لا، هو أداة أولويات ووقاية وليس ضماناً مطلقاً.",
        },
      ],
    },
  ),
  "engineering-services": p(
    {
      metaTitle: "Ingénierie & services | BCP Tunisia",
      metaDescription:
        "Études, installation, maintenance, fourniture et assistance : un accompagnement technique de bout en bout.",
      h1: "Ingénierie & services",
      heroLead:
        "Au-delà des équipements, la valeur est dans la cohérence entre étude, exécution et suivi.",
      intro:
        "Cette division regroupe les compétences qui sécurisent vos décisions techniques : conception, mise en œuvre, dépannage, maintenance et fourniture ciblée. L’objectif est un partenariat durable, orienté exploitation et disponibilité.",
      scopeItems: [
        "Conception & études",
        "Support technique",
        "Dépannage & assistance",
        "Installation",
        "Fourniture d’équipements",
        "Maintenance préventive & corrective",
        "Signalisation",
      ],
      approach: [
        "Écoute du besoin réel et cadrage du périmètre.",
        "Solutions proportionnées, documentées et négociables en transparence.",
        "Exécution maîtrisée et recette claire.",
        "Suivi et amélioration continue avec vos équipes.",
      ],
      lifecycle: [
        {
          title: "Audit / besoin",
          body: "Compréhension, criticité, contraintes temps/coût.",
        },
        {
          title: "Étude & conception",
          body: "Options, arbitrages, plans et dossiers.",
        },
        {
          title: "Installation",
          body: "Réalisation, coordination, qualité.",
        },
        {
          title: "Mise en service",
          body: "Essais, transfert, documentation.",
        },
        {
          title: "Maintenance / suivi",
          body: "Plans, interventions, analyse de parc.",
        },
      ],
      sectors: [
        "Industrie",
        "Tertiaire",
        "Infrastructures",
        "Retail",
      ],
      faq: [
        {
          q: "Pouvez-vous intervenir ponctuellement ?",
          a: "Oui : diagnostic, expertise ou intervention ciblée.",
        },
        {
          q: "Proposez-vous des contrats pluriannuels ?",
          a: "Oui, lorsque le périmètre et la criticité le justifient.",
        },
      ],
    },
    {
      metaTitle: "Engineering & services | BCP Tunisia",
      metaDescription:
        "Studies, installation, maintenance, supply, and assistance: end-to-end technical support.",
      h1: "Engineering & services",
      heroLead:
        "Beyond equipment, value comes from consistency across design, execution, and follow-up.",
      intro:
        "This division bundles competencies that de-risk technical decisions: design, implementation, troubleshooting, maintenance, and targeted supply. The focus is a durable partnership oriented to operations and availability.",
      scopeItems: [
        "Design & studies",
        "Technical support",
        "Troubleshooting & assistance",
        "Installation",
        "Equipment supply",
        "Preventive & corrective maintenance",
        "Signage",
      ],
      approach: [
        "Listen to the real need and frame scope.",
        "Proportionate, documented solutions with transparent trade-offs.",
        "Controlled execution and clear acceptance.",
        "Continuous improvement alongside your teams.",
      ],
      lifecycle: [
        {
          title: "Assessment / needs",
          body: "Understanding, criticality, time/cost constraints.",
        },
        {
          title: "Design & engineering",
          body: "Options, decisions, plans, and dossiers.",
        },
        {
          title: "Installation",
          body: "Delivery, coordination, quality.",
        },
        {
          title: "Commissioning",
          body: "Testing, handover, documentation.",
        },
        {
          title: "Maintenance / follow-up",
          body: "Plans, interventions, fleet analysis.",
        },
      ],
      sectors: [
        "Manufacturing",
        "Commercial",
        "Infrastructure",
        "Retail",
      ],
      faq: [
        {
          q: "Can you engage on an ad-hoc basis?",
          a: "Yes: diagnostics, expert input, or targeted interventions.",
        },
        {
          q: "Do you offer multi-year contracts?",
          a: "Yes when scope and criticality justify it.",
        },
      ],
    },
    {
      metaTitle: "الهندسة والخدمات | BCP Tunisia",
      metaDescription:
        "دراسات، تركيب، صيانة، توريد ومساعدة: دعم تقني متكامل.",
      h1: "الهندسة والخدمات",
      heroLead:
        "فوق المعدات، القيمة في الاتساق بين التصميم والتنفيذ والمتابعة.",
      intro:
        "تجمع هذه الوحدة الكفاءات التي تقلل مخاطر القرار التقني: تصميم، تنفيذ، استكشاف أعطال، صيانة وتوريد موجّه. الهدف شراكة دائمة نحو التشغيل والتوفر.",
      scopeItems: [
        "التصميم والدراسات",
        "الدعم الفني",
        "استكشاف الأعطال والمساعدة",
        "التركيب",
        "توريد المعدات",
        "الصيانة الوقائية والتصحيحية",
        "اللافتات",
      ],
      approach: [
        "الاستماع للحاجة الفعلية وتحديد النطاق.",
        "حلول متناسبة وموثقة وشفافة في المفاضلات.",
        "تنفيذ منضبط وقبول واضح.",
        "تحسين مستمر مع فرقكم.",
      ],
      lifecycle: [
        {
          title: "تقييم / احتياج",
          body: "فهم، حساسية، قيود زمن/كلفة.",
        },
        {
          title: "دراسة وتصميم",
          body: "خيارات، قرارات، مخططات، وملفات.",
        },
        {
          title: "التركيب",
          body: "تنفيذ، تنسيق، جودة.",
        },
        {
          title: "التشغيل التجريبي",
          body: "اختبارات، تسليم، وثائق.",
        },
        {
          title: "الصيانة / المتابعة",
          body: "خطط، تدخلات، تحليل أسطول.",
        },
      ],
      sectors: [
        "صناعة",
        "خدمات",
        "بنى تحتية",
        "تجارة",
      ],
      faq: [
        {
          q: "هل يمكن التدخل المؤقت؟",
          a: "نعم: تشخيص، خبرة، أو تدخل موجّه.",
        },
        {
          q: "هل لديكم عقود متعددة السنوات؟",
          a: "نعم عندما يبرر النطاق والحساسية ذلك.",
        },
      ],
    },
  ),
};

export function getPillarPage(
  locale: Locale,
  division: DivisionId,
): PillarPageBody {
  return pillarPages[division][locale];
}
