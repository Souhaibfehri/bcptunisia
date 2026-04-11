import type { SubserviceMap } from "../types";
import { buildServicePage } from "./factory";

export const subserviceChunk3: Partial<SubserviceMap> = {
  "automatic-gas-extinguishing": buildServicePage(
    {
      metaTitle: "Extinction automatique à gaz | BCP Tunisia",
      metaDescription:
        "Solutions d’extinction à gaz pour environnements sensibles : étude, installation, mise en service et maintenance.",
      h1: "Extinction automatique à gaz",
      heroLead:
        "L’extinction à gaz protège les équipements critiques lorsque l’eau n’est pas acceptable.",
      intro:
        "Nous dimensionnons les agents et les volumes protégés, intégrons la détection, la temporisation et la sécurisation des personnes, puis assurons une mise en service rigoureuse. La maintenance préserve l’étanchéité, les organes de commande et la disponibilité des bouteilles ou réserves.",
      needs: [
        "Éteindre rapidement sans détruire l’équipement par l’eau ou les résidus inadaptés.",
        "Gérer la sécurité des occupants avant déclenchement.",
        "Maintenir une disponibilité conforme des organes de déclenchement et de stockage.",
      ],
      provides: [
        "Études d’enveloppe, calculs, choix d’agent et architecture de détection/commande.",
        "Installation, essais d’étanchéité, déclenchements contrôlés et recette.",
        "Documentation, consignes et formation des exploitants.",
        "Maintenance réglementaire et assistance technique.",
      ],
      sectors: [
        "Salles électriques & data",
        "Industrie de précision",
        "Patrimoine technique",
        "Laboratoires",
      ],
      faq: [
        {
          q: "Peut-on combiner plusieurs zones protégées ?",
          a: "Oui, avec une logique de sélection et d’inhibition adaptée au risque et à l’exploitation.",
        },
        {
          q: "Gérez-vous le suivi des bouteilles ?",
          a: "Oui : contrôles, recharges planifiées et traçabilité selon les exigences du site.",
        },
      ],
    },
    {
      metaTitle: "Automatic gas extinguishing | BCP Tunisia",
      metaDescription:
        "Gas extinguishing systems for water-sensitive environments: design, installation, commissioning, and maintenance.",
      h1: "Automatic gas extinguishing",
      heroLead:
        "Gas suppression protects critical assets when water is not acceptable.",
      intro:
        "We size agents and protected volumes, integrate detection, delay logic, and occupant safety, then deliver rigorous commissioning. Maintenance preserves integrity, controls, and cylinder/reserve availability.",
      needs: [
        "Suppress fire quickly without water damage or unsuitable residues.",
        "Manage occupant safety prior to discharge.",
        "Sustain compliant availability of release and storage components.",
      ],
      provides: [
        "Enclosure studies, calculations, agent selection, and detection/release architecture.",
        "Installation, integrity testing, controlled discharges, and acceptance.",
        "Documentation, procedures, and operator training.",
        "Regulatory maintenance and technical assistance.",
      ],
      sectors: [
        "Electrical & data rooms",
        "Precision manufacturing",
        "Technical estates",
        "Laboratories",
      ],
      faq: [
        {
          q: "Can multiple protected areas be combined?",
          a: "Yes, with selection/inhibition logic aligned to risk and operations.",
        },
        {
          q: "Do you manage cylinder tracking?",
          a: "Yes: inspections, planned refills, and traceability per site requirements.",
        },
      ],
    },
    {
      metaTitle: "الإطفاء التلقائي بالغاز | BCP Tunisia",
      metaDescription:
        "أنظمة إطفاء بالغاز للبيئات الحساسة للماء: دراسة، تركيب، تشغيل وصيانة.",
      h1: "الإطفاء التلقائي بالغاز",
      heroLead:
        "الإطفاء بالغاز يحمي الأصول الحرجة عندما لا يكون الماء مقبولاً.",
      intro:
        "نحدد العوامل والحجوم المحمية، وندمج الكشف والتأخير وسلامة الأشخاص، ثم نشغّل المنظومة بدقة. تحافظ الصيانة على الضبط والتحكم وتوفر الأسطوانات أو الاحتياطي.",
      needs: [
        "إخماد سريع دون أضرار مائية أو بقايا غير ملائمة.",
        "إدارة سلامة الأشخاص قبل التصريف.",
        "الحفاظ على توفر مكوّنات التصريف والتخزين وفق الامتثال.",
      ],
      provides: [
        "دراسات الحجوم، حسابات، اختيار العامل، وبنية كشف/أمر.",
        "التركيب، اختبارات الضبط، تصاريف تحكمية، وقبول.",
        "الوثائق، الإجراءات، وتكوين المشغّلين.",
        "صيانة نظامية ودعم فني.",
      ],
      sectors: [
        "الغرف الكهربائية ومراكز البيانات",
        "صناعة دقيقة",
        "منشآت تقنية",
        "مختبرات",
      ],
      faq: [
        {
          q: "هل يمكن دمج عدة مناطق محمية؟",
          a: "نعم مع منطق اختيار/تعطيل ملائم للمخاطر والتشغيل.",
        },
        {
          q: "هل تديرون تتبع الأسطوانات؟",
          a: "نعم: فحوص، إعادة تعبئة مخططة، وتتبع حسب متطلبات الموقع.",
        },
      ],
    },
  ),
  "fire-extinguisher-maintenance": buildServicePage(
    {
      metaTitle: "Maintenance des extincteurs | BCP Tunisia",
      metaDescription:
        "Maintenance et conformité des extincteurs portatifs et chariots pour sites industriels et tertiaires.",
      h1: "Maintenance des extincteurs",
      heroLead:
        "Des extincteurs contrôlés et accessibles sont un premier niveau de réponse utile et auditable.",
      intro:
        "Nous organisons l’inventaire, la signalétique, la périodicité des contrôles et la traçabilité des interventions. L’objectif est un parc cohérent avec vos plans d’évacuation et vos équipes formées aux bons gestes.",
      needs: [
        "Garantir la disponibilité réelle des moyens de première intervention.",
        "Éviter les écarts entre théorie et terrain (accessibilité, repères, types adaptés).",
        "Disposer d’un historique clair pour audits et assurances.",
      ],
      provides: [
        "Diagnostic du parc, proposition de répartition et de types adaptés.",
        "Contrôles périodiques, recharges et remplacements lorsque nécessaire.",
        "Signalétique, plans de pose et coordination avec le document unique si applicable.",
        "Rapports d’intervention et recommandations d’amélioration.",
      ],
      sectors: [
        "Industrie",
        "Tertiaire",
        "Retail",
        "Transport & logistique",
      ],
      faq: [
        {
          q: "Pouvez-vous harmoniser un parc hétérogène ?",
          a: "Oui : plan de convergence, priorisation et phasage selon criticité.",
        },
        {
          q: "Intervenez-vous sur grandes surfaces ?",
          a: "Oui, avec organisation logistique adaptée aux horaires d’exploitation.",
        },
      ],
    },
    {
      metaTitle: "Fire extinguisher maintenance | BCP Tunisia",
      metaDescription:
        "Portable and wheeled extinguisher maintenance for industrial and tertiary sites.",
      h1: "Fire extinguisher maintenance",
      heroLead:
        "Controlled, accessible extinguishers provide a first response layer you can audit.",
      intro:
        "We organize inventory, signage, inspection cadence, and intervention traceability. The goal is a fleet aligned with evacuation plans and teams trained for correct use.",
      needs: [
        "Ensure real availability of first intervention means.",
        "Close gaps between theory and field (access, marking, suitable types).",
        "Keep a clear history for audits and insurers.",
      ],
      provides: [
        "Fleet assessment, distribution proposals, and suitable extinguisher types.",
        "Periodic inspections, refills, and replacements when required.",
        "Signage, placement plans, and coordination with safety documentation.",
        "Service reports and improvement recommendations.",
      ],
      sectors: [
        "Manufacturing",
        "Commercial",
        "Retail",
        "Transport & logistics",
      ],
      faq: [
        {
          q: "Can you standardize a mixed fleet?",
          a: "Yes: convergence plan with prioritization and phasing by criticality.",
        },
        {
          q: "Do you serve large retail sites?",
          a: "Yes, with logistics aligned to operating hours.",
        },
      ],
    },
    {
      metaTitle: "صيانة طفايات الحريق | BCP Tunisia",
      metaDescription:
        "صيانة طفايات الحريق المحمولة والعربات للمنشآت الصناعية والخدمية.",
      h1: "صيانة طفايات الحريق",
      heroLead:
        "طفايات مفحوصة وسهلة الوصول تمنح طبقة استجابة أولى قابلة للتدقيق.",
      intro:
        "ننظم الجرد والإشارات ودورية الفحص وتتبع التدخلات. الهدف أسطول متسق مع خطط الإخلاء وفرق مدربة على الاستعمال السليم.",
      needs: [
        "ضمان توفر فعلي لوسائل التدخل الأولى.",
        "تقليل الفجوة بين النظرية والميدان (وصول، إشارات، أنواع ملائمة).",
        "إبقاء أرشيف واضح للتدقيق والتأمين.",
      ],
      provides: [
        "تقييم الأسطول، اقتراح توزيع وأنواع مناسبة.",
        "فحوص دورية، إعادة تعبئة، واستبدال عند الحاجة.",
        "إشارات، مخططات وضع، وتنسيق مع وثائق السلامة.",
        "تقارير تدخل وتوصيات تحسين.",
      ],
      sectors: [
        "الصناعة",
        "الخدمات",
        "التجارة",
        "النقل واللوجستيك",
      ],
      faq: [
        {
          q: "هل يمكن مواءمة أسطول غير متجانس؟",
          a: "نعم عبر خطة تقارب وأولويات ومراحل حسب الحساسية.",
        },
        {
          q: "هل تغطون مساحات تجارية كبيرة؟",
          a: "نعم مع تنظيم لوجستي يتوافق مع أوقات التشغيل.",
        },
      ],
    },
  ),
  "emergency-lighting": buildServicePage(
    {
      metaTitle: "Éclairage de sécurité | BCP Tunisia",
      metaDescription:
        "BAES, balisages et éclairage de sécurité : étude, installation, mise en service et maintenance.",
      h1: "Éclairage de sécurité",
      heroLead:
        "Un balisage lisible stabilise l’évacuation lorsque l’éclairage normal chute.",
      intro:
        "Nous définissons les parcours, les niveaux d’éclairement, les autonomies et les interfaces avec l’alimentation électrique. La mise en œuvre privilégie la lisibilité des issues et la maintenabilité des équipements.",
      needs: [
        "Maintenir une visibilité suffisante sur les chemins d’évacuation.",
        "Réduire la confusion en situation de stress ou de fumée légère.",
        "Assurer des essais et une maintenance qui préservent l’autonomie réelle.",
      ],
      provides: [
        "Études de cheminements, implantation et choix des équipements.",
        "Installation, essais de fonctionnement et mesures si nécessaire.",
        "Documentation et plan de vérifications.",
        "Maintenance et remplacement des sources lorsque la fin de vie est atteinte.",
      ],
      sectors: [
        "Tertiaire",
        "Industrie",
        "Santé",
        "Retail",
      ],
      faq: [
        {
          q: "Couvrez-vous les sites avec forte mixité de locaux ?",
          a: "Oui : nous segmentons les zones et adaptons l’implantation aux usages.",
        },
        {
          q: "Proposez-vous un planning d’essais ?",
          a: "Oui, calibré sur la criticité du site et vos contraintes d’exploitation.",
        },
      ],
    },
    {
      metaTitle: "Emergency lighting | BCP Tunisia",
      metaDescription:
        "Emergency lighting and escape route marking: design, installation, commissioning, and maintenance.",
      h1: "Emergency lighting",
      heroLead:
        "Clear marking stabilizes evacuation when normal lighting fails.",
      intro:
        "We define routes, illuminance levels, autonomy, and interfaces with electrical supply. Execution prioritizes exit readability and equipment maintainability.",
      needs: [
        "Maintain adequate visibility along escape routes.",
        "Reduce confusion under stress or light smoke conditions.",
        "Ensure testing and maintenance preserve real autonomy.",
      ],
      provides: [
        "Route studies, placement, and equipment selection.",
        "Installation, functional testing, and measurements where needed.",
        "Documentation and verification plans.",
        "Maintenance and replacement when end-of-life is reached.",
      ],
      sectors: [
        "Commercial",
        "Manufacturing",
        "Healthcare",
        "Retail",
      ],
      faq: [
        {
          q: "Do you handle mixed-use buildings?",
          a: "Yes: we segment areas and adapt layouts to usage.",
        },
        {
          q: "Do you provide test scheduling?",
          a: "Yes, aligned to site criticality and operating constraints.",
        },
      ],
    },
    {
      metaTitle: "إضاءة الأمان والطوارئ | BCP Tunisia",
      metaDescription:
        "إضاءة الطوارئ وتأشير مسارات الإخلاء: دراسة، تركيب، تشغيل وصيانة.",
      h1: "إضاءة السلامة والطوارئ",
      heroLead:
        "تأشير واضح يثبّت الإخلاء عند انقطاع الإضاءة العادية.",
      intro:
        "نحدد المسارات ومستويات الإضاءة والاستقلالية والواجهات مع التغذية الكهربائية. يفضّل التنفيذ قابلية قراءة المخارج وصيانة المعدات.",
      needs: [
        "الحفاظ على رؤية كافية على مسارات الإخلاء.",
        "تقليل الارتباك في حالات الضغط أو الضباب الخفيف.",
        "ضمان اختبارات وصيانة تحافظ على الاستقلالية الفعلية.",
      ],
      provides: [
        "دراسات المسارات، التموضع، واختيار المعدات.",
        "التركيب، اختبارات التشغيل، والقياس عند الحاجة.",
        "الوثائق وخطط التحقق.",
        "الصيانة والاستبدال عند نهاية العمر.",
      ],
      sectors: [
        "الخدمات",
        "الصناعة",
        "الصحة",
        "التجارة",
      ],
      faq: [
        {
          q: "هل تغطون مبانٍ متعددة الاستعمال؟",
          a: "نعم مع تقسيم المناطق وتكييف التموضع حسب الاستعمال.",
        },
        {
          q: "هل تقدمون جدولة اختبارات؟",
          a: "نعم وفق حساسية الموقع وقيود التشغيل.",
        },
      ],
    },
  ),
  "fire-compartmentation": buildServicePage(
    {
      metaTitle: "Compartimentage au feu | BCP Tunisia",
      metaDescription:
        "Compartimentage, traitements d’étanchéité au feu et interfaces : étude d’ensemble, mise en œuvre et suivi.",
      h1: "Compartimentage au feu",
      heroLead:
        "Le compartimentage limite la propagation et protège les moyens d’évacuation.",
      intro:
        "Nous traitons les passages de réseaux, les joints, les portes et capots, et les interfaces entre lots pour éviter les ruptures de compartiment. L’approche est systémique : chaque traversée compte dans la performance globale.",
      needs: [
        "Rétablir ou conserver la performance après travaux ou modifications.",
        "Éviter les points faibles créés par le passage de câbles ou de fluides.",
        "Disposer d’une traçabilité des matériaux et des essais réalisés.",
      ],
      provides: [
        "Relevés, diagnostic et plan d’actions priorisé.",
        "Mise en œuvre de produits certifiés et contrôles de bonne exécution.",
        "Coordination avec gros œuvre, CVC et électricité.",
        "Dossiers photos, fiches produits et recommandations d’entretien.",
      ],
      sectors: [
        "Industrie",
        "Tertiaire",
        "Data centers",
        "Retail",
      ],
      faq: [
        {
          q: "Intervenez-vous après des modifications de réseaux ?",
          a: "Oui : reprise des traversées et validation de la continuité du compartimentage.",
        },
        {
          q: "Assurez-vous la cohérence multi-lots ?",
          a: "Oui : c’est un point clé pour éviter les ruptures invisibles en exploitation.",
        },
      ],
    },
    {
      metaTitle: "Fire compartmentation | BCP Tunisia",
      metaDescription:
        "Fire compartmentation, penetration seals, and multi-trade interfaces: assessment, execution, and documentation.",
      h1: "Fire compartmentation",
      heroLead:
        "Compartmentation limits fire spread and protects escape routes.",
      intro:
        "We address cable and pipe penetrations, joints, doors, and hatches, and coordinate trades to avoid compartment breaks. The approach is systemic: every penetration matters.",
      needs: [
        "Restore or maintain performance after changes or retrofits.",
        "Avoid weak points created by services routing.",
        "Keep traceability of materials and tests performed.",
      ],
      provides: [
        "Surveys, diagnostics, and prioritized action plans.",
        "Installation of certified solutions and quality checks.",
        "Coordination with structure, HVAC, and electrical trades.",
        "Photo dossiers, product sheets, and maintenance guidance.",
      ],
      sectors: [
        "Manufacturing",
        "Commercial",
        "Data centers",
        "Retail",
      ],
      faq: [
        {
          q: "Do you work after network modifications?",
          a: "Yes: reinstating penetrations and validating compartment continuity.",
        },
        {
          q: "Do you ensure multi-trade consistency?",
          a: "Yes: it is critical to avoid hidden breaks during operations.",
        },
      ],
    },
    {
      metaTitle: "العزل ضد الحريق | BCP Tunisia",
      metaDescription:
        "عزل الحريق وواجهات الاختراق والتنسيق متعدد الحرف: تقييم، تنفيذ، وتوثيق.",
      h1: "العزل والمقصورة ضد الحريق",
      heroLead:
        "العزل يحدّ من انتشار الحريق ويحمي مسارات الإخلاء.",
      intro:
        "نعالج اختراقات الكابلات والأنابيع والوصلات والأبواب والواجهات بين الحرف لتفادي كسر الحجرة. النهج منظومي: كل اختراق مهم.",
      needs: [
        "استعادة أو الحفاظ على الأداء بعد التعديلات.",
        "تفادي نقاط ضعف بسبب مسارات الخدمات.",
        "إبقاء تتبع للمواد والاختبارات المنفذة.",
      ],
      provides: [
        "مسح ميداني، تشخيص، وخطة إجراءات ذات أولوية.",
        "تنفيذ حلول معتمدة وفحوص جودة.",
        "تنسيق مع الإنشاءات والتكييف والكهرباء.",
        "ملفات صور، بطاقات منتجات، وإرشادات صيانة.",
      ],
      sectors: [
        "الصناعة",
        "الخدمات",
        "مراكز البيانات",
        "التجارة",
      ],
      faq: [
        {
          q: "هل تعملون بعد تعديل الشبكات؟",
          a: "نعم مع إعادة الاختراقات والتحقق من استمرارية العزل.",
        },
        {
          q: "هل تضمنون الانسجام بين الحرف؟",
          a: "نعم، وهو أمر جوهري لتفادي الكسور غير المرئية.",
        },
      ],
    },
  ),
};
