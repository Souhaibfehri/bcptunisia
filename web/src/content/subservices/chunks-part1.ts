import type { SubserviceMap } from "../types";
import { buildServicePage } from "./factory";

export const subserviceChunk1: Partial<SubserviceMap> = {
  "fire-detection-ssi": buildServicePage(
    {
      metaTitle: "Détection incendie & SSI | BCP Tunisia",
      metaDescription:
        "Étude, installation, mise en service et maintenance de détection incendie et SSI pour sites industriels et tertiaires.",
      h1: "Détection incendie & Système de Sécurité Incendie (SSI)",
      heroLead:
        "Une détection fiable et un SSI cohérent réduisent le temps de réaction et clarifient la conduite à tenir.",
      intro:
        "Nous structurons la détection et le SSI autour de vos contraintes d’exploitation : zones ATEX, continuité de production, accès maintenance et évolutivité. L’objectif est une architecture testable, documentée et tenable sur la durée.",
      needs: [
        "Réduire les retards de détection sans multiplier les alarmes parasites.",
        "Assurer la cohérence entre détection, désenfumage, extinction et organisation interne.",
        "Disposer d’une traçabilité d’essais et d’interventions pour le suivi conformité.",
      ],
      provides: [
        "Études, plans d’implantation et choix de matériels adaptés au risque et au contexte.",
        "Installation, raccordements, paramétrage et interfaces avec le bâtiment et le process.",
        "Recette, dossier technique, consignes d’exploitation et accompagnement des équipes.",
        "Maintenance et assistance pour sécuriser la disponibilité du système.",
      ],
      sectors: [
        "Industrie & logistique",
        "Tertiaire & retail",
        "Santé & hôtellerie",
        "Infrastructures sensibles",
      ],
      faq: [
        {
          q: "Intervenez-vous sur des sites en exploitation ?",
          a: "Oui, avec phasage, permis et coordination pour limiter l’impact sur l’activité.",
        },
        {
          q: "Pouvez-vous intégrer une installation existante ?",
          a: "Oui : diagnostic, reprise ou extension, et mise en cohérence des essais et de la documentation.",
        },
      ],
    },
    {
      metaTitle: "Fire detection & fire alarm (SSI) | BCP Tunisia",
      metaDescription:
        "Design, installation, commissioning, and maintenance of fire detection and fire alarm systems for industrial and tertiary facilities.",
      h1: "Fire detection & fire alarm system (SSI)",
      heroLead:
        "Reliable detection and a coherent fire alarm architecture shorten response time and clarify emergency response.",
      intro:
        "We structure detection and fire alarm systems around your operational constraints: hazardous areas, production continuity, maintainability, and future changes. The goal is a testable, documented, and sustainable solution.",
      needs: [
        "Detect early without unacceptable nuisance alarms for operations.",
        "Align detection with smoke control, suppression, and internal procedures.",
        "Maintain traceability of tests and interventions for ongoing compliance.",
      ],
      provides: [
        "Engineering, layouts, and equipment selection aligned with risk and context.",
        "Installation, terminations, configuration, and interfaces with building and process systems.",
        "Commissioning, technical dossier, operating notes, and team support.",
        "Maintenance and assistance to sustain system availability.",
      ],
      sectors: [
        "Industry & logistics",
        "Commercial & offices",
        "Healthcare & hospitality",
        "Sensitive infrastructure",
      ],
      faq: [
        {
          q: "Do you work on live sites?",
          a: "Yes, with phasing, permits, and coordination to limit operational impact.",
        },
        {
          q: "Can you integrate existing systems?",
          a: "Yes: assessment, retrofit or extension, and alignment of testing and documentation.",
        },
      ],
    },
    {
      metaTitle: "كشف الحريق وأنظمة الإنذار | BCP Tunisia",
      metaDescription:
        "دراسة وتركيب وتشغيل وصيانة أنظمة كشف الحريق والإنذار للمنشآت الصناعية والخدمية.",
      h1: "كشف الحريق وأنظمة السلامة من الحريق (SSI)",
      heroLead:
        "كشف موثوق ونظام إنذار متسق يقلّل زمن الاستجابة ويوضح إجراءات التدخل.",
      intro:
        "نبني منظومة الكشف والإنذار وفق قيود التشغيل: مناطق خطرة، استمرارية الإنتاج، قابلية الصيانة والتطور المستقبلي. الهدف حل قابل للاختبار والتوثيق والاستدامة.",
      needs: [
        "تقليل زمن الكشف دون إنذارات مزعجة مفرطة.",
        "ضمان الانسجام بين الكشف والتهوية والإطفاء والإجراءات الداخلية.",
        "إبقاء تتبع للاختبارات والتدخلات لصالح الامتثال المستمر.",
      ],
      provides: [
        "دراسات، تموضع، واختيار معدات ملائمة للمخاطر والسياق.",
        "تركيب، توصيلات، ضبط وواجهات مع مبنى العمليات.",
        "تشغيل تجريبي، ملف تقني، مذكرات تشغيل ومواكبة الفرق.",
        "صيانة ومساعدة لضمان توفر المنظومة.",
      ],
      sectors: [
        "الصناعة واللوجستيك",
        "الخدمات والتجارة",
        "الصحة والضيافة",
        "بنى تحتية حساسة",
      ],
      faq: [
        {
          q: "هل تعملون في منشآت قيد التشغيل؟",
          a: "نعم، مع مراحل وتصاريح وتنسيق لتقليل الأثر على النشاط.",
        },
        {
          q: "هل يمكن دمج منظومة قائمة؟",
          a: "نعم عبر التشخيص والتوسيع أو التحديث ومواءمة الاختبارات والوثائق.",
        },
      ],
    },
  ),
  "gas-leak-detection": buildServicePage(
    {
      metaTitle: "Détection de fuite de gaz | BCP Tunisia",
      metaDescription:
        "Solutions de détection de gaz pour sécuriser les zones techniques et les environnements sensibles, de l’étude à la maintenance.",
      h1: "Détection de fuite de gaz",
      heroLead:
        "Identifier tôt une présence anormale de gaz limite l’exposition et protège les personnes et les actifs.",
      intro:
        "Nous dimensionnons la détection de gaz selon les fluides présents, la ventilation, les zones d’accès et les besoins d’exploitation. Le dispositif est pensé pour être compris par les opérateurs et maintenu sans ambiguïté.",
      needs: [
        "Couvrir les points critiques sans créer de zones aveugles.",
        "Réduire les fausses alarmes liées à l’environnement ou aux opérations.",
        "Assurer la remontée d’alarme claire vers la supervision et les procédures internes.",
      ],
      provides: [
        "Analyse du risque, choix des capteurs et implantation cohérente.",
        "Installation, calibration initiale et intégration supervision.",
        "Essais, validation et documentation d’exploitation.",
        "Maintenance, vérifications et assistance technique.",
      ],
      sectors: [
        "Industrie chimique & agro",
        "Énergie & utilités",
        "Laboratoires & santé",
        "Stockage & distribution",
      ],
      faq: [
        {
          q: "Gérez-vous plusieurs types de gaz ?",
          a: "Oui : la sélection des technologies dépend du gaz, des seuils et du contexte de déploiement.",
        },
        {
          q: "Proposez-vous un contrat de maintenance ?",
          a: "Oui, avec périodicité adaptée aux exigences du site et aux recommandations constructeurs.",
        },
      ],
    },
    {
      metaTitle: "Gas leak detection | BCP Tunisia",
      metaDescription:
        "Gas detection solutions from design to maintenance for technical areas and sensitive industrial environments.",
      h1: "Gas leak detection",
      heroLead:
        "Early detection of abnormal gas presence reduces exposure and protects people and assets.",
      intro:
        "We size gas detection based on fluids, ventilation, access constraints, and operational needs. The system is designed to be operator-friendly and clearly maintainable.",
      needs: [
        "Cover critical points without blind zones.",
        "Reduce false alarms driven by environment or operations.",
        "Provide clear alarm reporting to supervision and internal procedures.",
      ],
      provides: [
        "Risk analysis, sensor selection, and coherent placement.",
        "Installation, initial calibration, and supervision integration.",
        "Testing, validation, and operating documentation.",
        "Maintenance, checks, and technical assistance.",
      ],
      sectors: [
        "Chemical & agri-food",
        "Energy & utilities",
        "Labs & healthcare",
        "Storage & distribution",
      ],
      faq: [
        {
          q: "Do you handle multiple gas types?",
          a: "Yes: technology selection depends on the gas, alarm thresholds, and deployment context.",
        },
        {
          q: "Do you offer maintenance contracts?",
          a: "Yes, with schedules aligned to site requirements and manufacturer guidance.",
        },
      ],
    },
    {
      metaTitle: "كشف تسرب الغاز | BCP Tunisia",
      metaDescription:
        "حلول كشف الغاز من الدراسة إلى الصيانة للمناطق التقنية والبيئات الصناعية الحساسة.",
      h1: "كشف تسرب الغاز",
      heroLead:
        "الكشف المبكر عن غاز غير طبيعي يحدّ من التعرض ويحمي الأشخاص والمنشآت.",
      intro:
        "نحدد منظومة الكشف حسب السوائل والتهوية وقيود الوصول واحتياجات التشغيل، مع وضوح للمشغّلين وقابلية صيانة دون لبس.",
      needs: [
        "تغطية النقاط الحرجة دون مناطق عمياء.",
        "تقليل الإنذارات الكاذبة المرتبطة بالبيئة أو العمليات.",
        "إنذار واضح للإشراف والإجراءات الداخلية.",
      ],
      provides: [
        "تحليل المخاطر، اختيار المستشعرات، ومواضع متسقة.",
        "التركيب والمعايرة الأولى والتكامل مع الإشراف.",
        "الاختبارات والتحقق ووثائق التشغيل.",
        "الصيانة والفحوصات والدعم الفني.",
      ],
      sectors: [
        "الصناعات الكيميائية والغذائية",
        "الطاقة والمرافق",
        "المختبرات والصحة",
        "التخزين والتوزيع",
      ],
      faq: [
        {
          q: "هل تغطون عدة أنواع من الغاز؟",
          a: "نعم، ويحدد اختيار التقنية نوع الغاز وعتبات الإنذار وسياق النشر.",
        },
        {
          q: "هل لديكم عقود صيانة؟",
          a: "نعم، مع دورية تناسب متطلبات الموقع وإرشادات المصنع.",
        },
      ],
    },
  ),
};
