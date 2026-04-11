import type { SubserviceMap } from "../types";
import { buildServicePage } from "./factory";

export const subserviceChunk5: Partial<SubserviceMap> = {
  "access-control": buildServicePage(
    {
      metaTitle: "Contrôle d’accès | BCP Tunisia",
      metaDescription:
        "Contrôle d’accès pour sites industriels et tertiaires : conception, déploiement, supervision et maintenance.",
      h1: "Contrôle d’accès",
      heroLead:
        "Un contrôle d’accès clair réduit les passages non autorisés tout en restant compatible avec l’exploitation.",
      intro:
        "Nous définissons les périmètres, les profils, les horaires et les scénarios d’urgence. L’architecture intègre lecteurs, organes motorisés, supervision et sauvegardes pour limiter les indisponibilités.",
      needs: [
        "Séparer les zones sensibles sans bloquer les flux légitimes.",
        "Tracer les événements utiles à l’exploitation et à l’audit.",
        "Assurer la continuité en cas de coupure ou maintenance.",
      ],
      provides: [
        "Études, choix matériels et plans d’adressage.",
        "Installation, paramétrage, essais et transfert.",
        "Supervision, sauvegardes et procédures.",
        "Maintenance et évolutions.",
      ],
      sectors: ["Industrie", "Tertiaire", "Santé", "Retail"],
      faq: [
        {
          q: "Gérez-vous les accès visiteurs ?",
          a: "Oui : workflows simples peuvent être définis selon votre politique interne.",
        },
        {
          q: "Intervenez-vous sur sites multi-sites ?",
          a: "Oui, avec une vision cohérente des profils et des journaux.",
        },
      ],
    },
    {
      metaTitle: "Access control | BCP Tunisia",
      metaDescription:
        "Access control for industrial and tertiary sites: design, deployment, supervision, and maintenance.",
      h1: "Access control",
      heroLead:
        "Clear access rules reduce unauthorized movement while keeping operations flowing.",
      intro:
        "We define perimeters, profiles, schedules, and emergency scenarios. Architecture integrates readers, motorized devices, supervision, and backups to limit downtime.",
      needs: [
        "Separate sensitive areas without blocking legitimate flows.",
        "Log events useful for operations and audit.",
        "Maintain continuity during outages or maintenance.",
      ],
      provides: [
        "Studies, hardware selection, and addressing plans.",
        "Installation, configuration, testing, and handover.",
        "Supervision, backups, and procedures.",
        "Maintenance and upgrades.",
      ],
      sectors: ["Manufacturing", "Commercial", "Healthcare", "Retail"],
      faq: [
        {
          q: "Do you handle visitor access?",
          a: "Yes: simple workflows can be defined per your internal policy.",
        },
        {
          q: "Do you support multi-site estates?",
          a: "Yes, with consistent profiles and logs.",
        },
      ],
    },
    {
      metaTitle: "التحكم في الدخول | BCP Tunisia",
      metaDescription:
        "أنظمة التحكم في الدخول للمنشآت الصناعية والخدمية: تصميم، نشر، إشراف وصيانة.",
      h1: "التحكم في الدخول",
      heroLead:
        "قواعد وصول واضحة تقلل التحرك غير المصرح به مع بقاء التشغيل سلساً.",
      intro:
        "نحدد المحيطات والملفات والجداول وسيناريوهات الطوارئ. تدمج البنية القراءات والمحركات والإشراف والنسخ الاحتياطي لتقليل التوقف.",
      needs: [
        "عزل المناطق الحساسة دون تعطيل التدفقات المشروعة.",
        "تسجيل أحداث مفيدة للتشغيل والتدقيق.",
        "استمرارية عند الانقطاع أو الصيانة.",
      ],
      provides: [
        "دراسات، اختيار معدات، ومخططات عناوين.",
        "التركيب، الضبط، الاختبارات، والتسليم.",
        "الإشراف، النسخ الاحتياطي، والإجراءات.",
        "الصيانة والترقيات.",
      ],
      sectors: ["الصناعة", "الخدمات", "الصحة", "التجارة"],
      faq: [
        {
          q: "هل تديرون زواراً؟",
          a: "نعم يمكن تعريف مسارات بسيطة حسب سياستكم.",
        },
        {
          q: "هل تغطون عدة مواقع؟",
          a: "نعم بملفات وسجلات متسقة.",
        },
      ],
    },
  ),
  "intrusion-detection": buildServicePage(
    {
      metaTitle: "Détection intrusion | BCP Tunisia",
      metaDescription:
        "Détection intrusion : étude, installation, télésurveillance possible, maintenance et évolutions.",
      h1: "Détection d’intrusion",
      heroLead:
        "Une alarme fiable distingue l’événement réel du bruit de fond opérationnel.",
      intro:
        "Nous adaptons les technologies aux périmètres, aux horaires et aux contraintes environnementales. Le paramétrage vise à limiter les fausses alarmes tout en conservant une sensibilité utile.",
      needs: [
        "Protéger périmètres, locaux techniques et zones sensibles.",
        "Remonter des événements exploitables vers la supervision.",
        "Maintenir la solution dans le temps (batteries, firmware, capteurs).",
      ],
      provides: [
        "Études, choix capteurs et centrales.",
        "Installation, paramétrage et essais terrain.",
        "Documentation et procédures d’exploitation.",
        "Maintenance et optimisation continue.",
      ],
      sectors: ["Industrie", "Retail", "Bureaux", "Sites isolés"],
      faq: [
        {
          q: "Peut-on segmenter par zone ?",
          a: "Oui : partitionnement et scénarios par secteur sont possibles.",
        },
        {
          q: "Assurez-vous la maintenance préventive ?",
          a: "Oui, avec planning adapté aux équipements déployés.",
        },
      ],
    },
    {
      metaTitle: "Intrusion detection | BCP Tunisia",
      metaDescription:
        "Intrusion alarm systems: design, installation, optional monitoring integration, and maintenance.",
      h1: "Intrusion detection",
      heroLead:
        "Reliable alarms separate real events from operational noise.",
      intro:
        "We adapt technologies to perimeters, schedules, and environmental constraints. Tuning aims to limit nuisance alarms while keeping useful sensitivity.",
      needs: [
        "Protect perimeters, technical rooms, and sensitive areas.",
        "Deliver actionable events to supervision.",
        "Sustain the system over time (batteries, firmware, sensors).",
      ],
      provides: [
        "Studies, sensor and panel selection.",
        "Installation, configuration, and field testing.",
        "Documentation and operating procedures.",
        "Maintenance and continuous optimization.",
      ],
      sectors: ["Manufacturing", "Retail", "Offices", "Remote sites"],
      faq: [
        {
          q: "Can we partition by zone?",
          a: "Yes: zoning and sector scenarios are supported.",
        },
        {
          q: "Do you provide preventive maintenance?",
          a: "Yes, scheduled per deployed equipment.",
        },
      ],
    },
    {
      metaTitle: "كشف التسلل | BCP Tunisia",
      metaDescription:
        "أنظمة إنذار التسلل: دراسة، تركيب، تكامل مراقبة، صيانة.",
      h1: "كشف التسلل",
      heroLead:
        "إنذار موثوق يفرّق بين الحدث الحقيقي والضوضاء التشغيلية.",
      intro:
        "نلائم التقنيات مع المحيط والجداول والقيود البيئية. يهدف الضبط لتقليل الإنذارات الكاذبة مع إبقاء حساسية مفيدة.",
      needs: [
        "حماية المحيط والغرف التقنية والمناطق الحساسة.",
        "إرسال أحداث قابلة للاستخدام للإشراف.",
        "استدامة المنظومة (بطريات، برمجيات، حساسات).",
      ],
      provides: [
        "دراسات، اختيار حساسات ولوحات.",
        "التركيب، الضبط، واختبارات ميدانية.",
        "الوثائق وإجراءات التشغيل.",
        "الصيانة والتحسين المستمر.",
      ],
      sectors: ["الصناعة", "التجارة", "المكاتب", "مواقع نائية"],
      faq: [
        {
          q: "هل يمكن تقسيم المناطق؟",
          a: "نعم مع تقسيم وسيناريوهات لكل قطاع.",
        },
        {
          q: "هل لديكم صيانة وقائية؟",
          a: "نعم وفق جدول يناسب المعدات المنصوبة.",
        },
      ],
    },
  ),
  "control-room-supervision": buildServicePage(
    {
      metaTitle: "Salle de contrôle & supervision | BCP Tunisia",
      metaDescription:
        "Supervision technique et organisation de salle de contrôle pour sites industriels et tertiaires.",
      h1: "Salle de contrôle et supervision",
      heroLead:
        "Une supervision structurée clarifie l’état du site et accélère la décision.",
      intro:
        "Nous consolidons les informations utiles (vidéo, accès, alarmes, états techniques) selon vos priorités d’exploitation. L’objectif est une ergonomie adaptée aux équipes et une architecture maintenable.",
      needs: [
        "Réduire la dispersion des outils et des écrans.",
        "Sécuriser les accès et la traçabilité des actions.",
        "Prévoir l’évolutivité lors d’extensions de site.",
      ],
      provides: [
        "Ateliers de cadrage, architecture et choix matériels/logiciels.",
        "Installation, intégration, essais et recette.",
        "Documentation, comptes et procédures.",
        "Maintenance et évolutions.",
      ],
      sectors: ["Industrie", "Infrastructures", "Retail", "Tertiaire"],
      faq: [
        {
          q: "Peut-on intégrer des systèmes existants ?",
          a: "Oui, selon compatibilités et sécurité réseau.",
        },
        {
          q: "Assurez-vous la formation des opérateurs ?",
          a: "Oui, avec transfert structuré sur les scénarios courants.",
        },
      ],
    },
    {
      metaTitle: "Control room & supervision | BCP Tunisia",
      metaDescription:
        "Technical supervision and control room integration for industrial and tertiary environments.",
      h1: "Control room & supervision",
      heroLead:
        "Structured supervision clarifies site status and speeds decisions.",
      intro:
        "We consolidate relevant information (video, access, alarms, technical states) based on operational priorities. The focus is ergonomics for teams and maintainable architecture.",
      needs: [
        "Reduce tool and screen sprawl.",
        "Secure access and traceability of actions.",
        "Plan scalability for site extensions.",
      ],
      provides: [
        "Workshops, architecture, and hardware/software selection.",
        "Installation, integration, testing, and acceptance.",
        "Documentation, accounts, and procedures.",
        "Maintenance and upgrades.",
      ],
      sectors: ["Manufacturing", "Infrastructure", "Retail", "Commercial"],
      faq: [
        {
          q: "Can you integrate legacy systems?",
          a: "Yes, depending on compatibility and network security.",
        },
        {
          q: "Do you train operators?",
          a: "Yes, with structured handover on common scenarios.",
        },
      ],
    },
    {
      metaTitle: "غرفة التحكم والإشراف | BCP Tunisia",
      metaDescription:
        "إشراف تقني وتكامل غرف تحكم للمنشآت الصناعية والخدمية.",
      h1: "غرفة التحكم والإشراف",
      heroLead:
        "إشراف منظم يوضح حالة الموقع ويسرّع القرار.",
      intro:
        "نجمع المعلومات ذات الصلة (فيديو، دخول، إنذارات، حالات تقنية) حسب أولويات التشغيل. الهدف إرجونوميا مناسبة للفرق وبنية قابلة للصيانة.",
      needs: [
        "تقليل تشتت الأدوات والشاشات.",
        "تأمين الوصول وتتبع الإجراءات.",
        "التخطيط للتوسع مستقبلاً.",
      ],
      provides: [
        "ورش تعريف، بنية، واختيار مكونات.",
        "التركيب، التكامل، الاختبارات، والقبول.",
        "الوثائق، الحسابات، والإجراءات.",
        "الصيانة والترقيات.",
      ],
      sectors: ["الصناعة", "البنى التحتية", "التجارة", "الخدمات"],
      faq: [
        {
          q: "هل تدمجون أنظمة قائمة؟",
          a: "نعم حسب التوافق وأمن الشبكة.",
        },
        {
          q: "هل تكوّنون المشغّلين؟",
          a: "نعم مع تسليم منظم للسيناريوهات الشائعة.",
        },
      ],
    },
  ),
  "queue-management": buildServicePage(
    {
      metaTitle: "Gestion de files d’attente | BCP Tunisia",
      metaDescription:
        "Solutions de gestion de files d’attente pour espaces recevant du public : étude, déploiement et support.",
      h1: "Gestion de files d’attente",
      heroLead:
        "Une file maîtrisée améliore l’expérience utilisateur et réduit les tensions en zone d’accueil.",
      intro:
        "Nous adaptons l’affichage, la sonorisation et l’intégration avec vos processus internes. Le déploiement est pensé pour être simple à exploiter et facilement ajustable.",
      needs: [
        "Fluidifier l’accueil sans surcharger les équipes.",
        "Communiquer clairement les temps d’attente et les étapes.",
        "Assurer la disponibilité pendant les pics d’affluence.",
      ],
      provides: [
        "Études d’implantation et choix de composants.",
        "Installation, paramétrage et tests.",
        "Documentation et procédures.",
        "Maintenance et ajustements.",
      ],
      sectors: ["Banques", "Assurances", "Retail", "Services publics"],
      faq: [
        {
          q: "Peut-on intégrer plusieurs guichets ?",
          a: "Oui, selon l’organisation cible et les flux réels.",
        },
        {
          q: "Intervenez-vous en exploitation ?",
          a: "Oui, avec plages horaires adaptées.",
        },
      ],
    },
    {
      metaTitle: "Queue management | BCP Tunisia",
      metaDescription:
        "Queue management solutions for public-facing spaces: design, deployment, and support.",
      h1: "Queue management",
      heroLead:
        "Controlled queues improve customer experience and reduce front-desk friction.",
      intro:
        "We adapt displays, audio, and integration with internal processes. Deployment is designed for simple operations and easy adjustments.",
      needs: [
        "Smooth reception without overloading staff.",
        "Clearly communicate wait times and steps.",
        "Maintain availability during peak traffic.",
      ],
      provides: [
        "Placement studies and component selection.",
        "Installation, configuration, and testing.",
        "Documentation and procedures.",
        "Maintenance and tuning.",
      ],
      sectors: ["Banking", "Insurance", "Retail", "Public services"],
      faq: [
        {
          q: "Can multiple counters be integrated?",
          a: "Yes, based on target organization and real flows.",
        },
        {
          q: "Do you work during operations?",
          a: "Yes, with adapted time windows.",
        },
      ],
    },
    {
      metaTitle: "إدارة الطوابير | BCP Tunisia",
      metaDescription:
        "حلول إدارة الطوابير للفضاءات التي تستقبل الجمهور: دراسة، نشر ودعم.",
      h1: "إدارة الطوابير",
      heroLead:
        "طابور منظم يحسّن تجربة المستفيد ويخفف الضغط على الاستقبال.",
      intro:
        "نلائم العرض والصوت والتكامل مع عملياتكم. يُفكّر النشر ليكون تشغيله بسيطاً وقابلاً للتعديل.",
      needs: [
        "تسهيل الاستقبال دون إرهاق الفرق.",
        "إيضاح أوقات الانتظار والخطوات.",
        "ضمان التوفر أثناء الذروة.",
      ],
      provides: [
        "دراسات التموضع واختيار المكوّنات.",
        "التركيب، الضبط، والاختبارات.",
        "الوثائق والإجراءات.",
        "الصيانة والضبط الدوري.",
      ],
      sectors: ["البنوك", "التأمين", "التجارة", "خدمات عمومية"],
      faq: [
        {
          q: "هل يمكن ربط عدة شبابيك؟",
          a: "نعم حسب التنظيم المستهدف والتدفقات الفعلية.",
        },
        {
          q: "هل تعملون أثناء التشغيل؟",
          a: "نعم ضمن نوافذ زمنية مناسبة.",
        },
      ],
    },
  ),
  "nurse-call-systems": buildServicePage(
    {
      metaTitle: "Appel infirmier & assistance | BCP Tunisia",
      metaDescription:
        "Systèmes d’appel infirmier pour établissements de santé et structures assimilées : étude, installation et maintenance.",
      h1: "Appel infirmier",
      heroLead:
        "Un appel clair et tracé améliore la réactivité sans remplacer les protocoles médicaux.",
      intro:
        "Nous adaptons les terminaux, la signalisation et la supervision aux circulations et aux postes de soins. La solution est pensée pour la disponibilité et une maintenance prévisible.",
      needs: [
        "Réduire les délais de prise en charge des demandes d’assistance.",
        "Tracer les événements utiles à l’organisation interne.",
        "Limiter les indisponibilités sur des équipements critiques.",
      ],
      provides: [
        "Études d’implantation et choix de matériels.",
        "Installation, paramétrage et essais.",
        "Documentation et procédures.",
        "Maintenance et évolutions.",
      ],
      sectors: ["Santé", "EHPAD", "Cliniques", "Structures médicalisées"],
      faq: [
        {
          q: "Intervenez-vous sur extensions de service ?",
          a: "Oui, avec reprise d’adressage et tests sur l’existant.",
        },
        {
          q: "Proposez-vous un contrat de maintenance ?",
          a: "Oui, adapté aux horaires et à la criticité.",
        },
      ],
    },
    {
      metaTitle: "Nurse call systems | BCP Tunisia",
      metaDescription:
        "Nurse call systems for healthcare facilities: design, installation, and maintenance.",
      h1: "Nurse call systems",
      heroLead:
        "Clear, traceable calls improve responsiveness without replacing medical protocols.",
      intro:
        "We adapt terminals, signaling, and supervision to circulation and care stations. The solution emphasizes availability and predictable maintenance.",
      needs: [
        "Reduce delays in responding to assistance requests.",
        "Log events useful for internal organization.",
        "Limit downtime on critical devices.",
      ],
      provides: [
        "Placement studies and equipment selection.",
        "Installation, configuration, and testing.",
        "Documentation and procedures.",
        "Maintenance and upgrades.",
      ],
      sectors: ["Healthcare", "Care homes", "Clinics", "Medical facilities"],
      faq: [
        {
          q: "Do you extend existing departments?",
          a: "Yes, with addressing updates and testing on legacy systems.",
        },
        {
          q: "Do you offer maintenance contracts?",
          a: "Yes, aligned to hours and criticality.",
        },
      ],
    },
    {
      metaTitle: "أنظمة نداء التمريض | BCP Tunisia",
      metaDescription:
        "أنظمة نداء التمريض للمرافق الصحية: دراسة، تركيب وصيانة.",
      h1: "نداء التمريض",
      heroLead:
        "نداء واضح وقابل للتتبع يحسّن الاستجابة دون أن يحل محل البروتوكولات الطبية.",
      intro:
        "نلائم المحطات والإشارات والإشراف مع الممرات ونقاط الرعاية. تُفكّر الحلول للتوفر ولصيانة متوقعة.",
      needs: [
        "تقليل زمن الاستجابة لطلبات المساعدة.",
        "تسجيل أحداث مفيدة للتنظيم الداخلي.",
        "تقليل التوقف على معدات حرجة.",
      ],
      provides: [
        "دراسات التموضع واختيار المعدات.",
        "التركيب، الضبط، والاختبارات.",
        "الوثائق والإجراءات.",
        "الصيانة والترقيات.",
      ],
      sectors: ["الصحة", "دور رعاية", "عيادات", "منشآت طبية"],
      faq: [
        {
          q: "هل توسّعون أقساماً قائمة؟",
          a: "نعم مع تحديث العناوين واختبار الموجود.",
        },
        {
          q: "هل لديكم عقود صيانة؟",
          a: "نعم وفق الساعات والحساسية.",
        },
      ],
    },
  ),
  "hvac-cvc": buildServicePage(
    {
      metaTitle: "CVC / HVAC | BCP Tunisia",
      metaDescription:
        "CVC pour sites industriels et tertiaires : études, installation, mise en service et maintenance.",
      h1: "CVC / HVAC",
      heroLead:
        "Un CVC maîtrisé soutient le confort, la qualité de production et la performance énergétique globale du site.",
      intro:
        "Nous intervenons sur la distribution thermique, la ventilation, le traitement d’air et les interfaces avec le bâtiment. Les solutions sont dimensionnées pour l’exploitation réelle, pas seulement pour la recette.",
      needs: [
        "Stabiliser conditions intérieures malgré charges variables.",
        "Réduire arrêts et dysfonctionnements liés aux réseaux thermiques et aérauliques.",
        "Faciliter maintenance et accès aux organes critiques.",
      ],
      provides: [
        "Études, choix d’équipements et plans d’exécution.",
        "Installation, équilibrage, essais et recette.",
        "Documentation et recommandations d’exploitation.",
        "Maintenance préventive et corrective.",
      ],
      sectors: ["Industrie", "Tertiaire", "Santé", "Retail"],
      faq: [
        {
          q: "Intervenez-vous sur rénovation partielle ?",
          a: "Oui, avec analyse d’impact sur l’existant et phasage chantier.",
        },
        {
          q: "Assurez-vous le suivi après mise en service ?",
          a: "Oui : ajustements saisonniers et plans de maintenance possibles.",
        },
      ],
    },
    {
      metaTitle: "HVAC / CVC | BCP Tunisia",
      metaDescription:
        "HVAC for industrial and tertiary sites: engineering, installation, commissioning, and maintenance.",
      h1: "HVAC / CVC",
      heroLead:
        "Controlled HVAC supports comfort, process conditions, and overall site performance.",
      intro:
        "We work on thermal distribution, ventilation, air treatment, and building interfaces. Solutions are sized for real operations, not only acceptance tests.",
      needs: [
        "Stabilize indoor conditions despite variable loads.",
        "Reduce downtime linked to thermal and air networks.",
        "Ease maintenance access to critical components.",
      ],
      provides: [
        "Studies, equipment selection, and execution drawings.",
        "Installation, balancing, testing, and acceptance.",
        "Documentation and operating guidance.",
        "Preventive and corrective maintenance.",
      ],
      sectors: ["Manufacturing", "Commercial", "Healthcare", "Retail"],
      faq: [
        {
          q: "Do you handle partial retrofits?",
          a: "Yes, with impact analysis on existing systems and phasing.",
        },
        {
          q: "Do you support post-commissioning tuning?",
          a: "Yes: seasonal adjustments and maintenance plans as needed.",
        },
      ],
    },
    {
      metaTitle: "التكييف والتهوية CVC | BCP Tunisia",
      metaDescription:
        "أنظمة التكييف والتهوية للمنشآت الصناعية والخدمية: دراسة، تركيب، تشغيل وصيانة.",
      h1: "التكييف والتهوية (CVC / HVAC)",
      heroLead:
        "CVC منضبط يدعم الراحة وظروف الإنتاج وأداء الموقع.",
      intro:
        "نعمل على التوزيع الحراري والتهوية ومعالجة الهواء والواجهات مع المبنى. تُقاس الحلول للتشغيل الفعلي لا للقبول فقط.",
      needs: [
        "تثبيت الظروف رغم تغيّر الأحمال.",
        "تقليل التوقف المرتبط بالشبكات الحرارية والهوائية.",
        "تسهيل الوصول للصيانة على المكوّنات الحرجة.",
      ],
      provides: [
        "دراسات، اختيار معدات، ومخططات تنفيذ.",
        "التركيب، الموازنة، الاختبارات، والقبول.",
        "الوثائق وإرشادات التشغيل.",
        "صيانة وقائية وتصحيحية.",
      ],
      sectors: ["الصناعة", "الخدمات", "الصحة", "التجارة"],
      faq: [
        {
          q: "هل تعملون على تجديد جزئي؟",
          a: "نعم مع تحليل الأثر على الموجود وتنفيذ على مراحل.",
        },
        {
          q: "هل تتابعون بعد التشغيل؟",
          a: "نعم مع ضبط موسمي وخطط صيانة عند الحاجة.",
        },
      ],
    },
  ),
  "industrial-utilities": buildServicePage(
    {
      metaTitle: "Utilités industrielles | BCP Tunisia",
      metaDescription:
        "Réseaux utilitaires industriels : études, installation, mise en service et maintenance.",
      h1: "Utilités industrielles",
      heroLead:
        "Des utilités fiables réduisent les arrêts et clarifient les responsabilités entre production et technique bâtiment.",
      intro:
        "Nous structurons la distribution des fluides et services techniques nécessaires au process, en intégrant sécurité, accessibilité et maintenance. Chaque interface est traitée pour limiter les ambiguïtés en exploitation.",
      needs: [
        "Sécuriser disponibilité et qualité des utilités critiques.",
        "Réduire les risques de mélange ou de défaillance en cascade.",
        "Faciliter diagnostics et interventions rapides.",
      ],
      provides: [
        "Études, schémas et choix de composants.",
        "Installation, essais et recette.",
        "Balisage, documentation et consignes.",
        "Maintenance et assistance.",
      ],
      sectors: ["Industrie manufacturière", "Agroalimentaire", "Chimie", "Pharma"],
      faq: [
        {
          q: "Coordonnez-vous avec le génie des procédés ?",
          a: "Oui : points de livraison et responsabilités sont cadrés en amont.",
        },
        {
          q: "Intervenez-vous en site occupé ?",
          a: "Oui, avec plans de phasage et sécurité renforcée.",
        },
      ],
    },
    {
      metaTitle: "Industrial utilities | BCP Tunisia",
      metaDescription:
        "Industrial utility networks: engineering, installation, commissioning, and maintenance.",
      h1: "Industrial utilities",
      heroLead:
        "Reliable utilities reduce downtime and clarify responsibilities between production and building systems.",
      intro:
        "We structure distribution of fluids and technical services required by the process, integrating safety, access, and maintenance. Interfaces are handled to reduce operational ambiguity.",
      needs: [
        "Secure availability and quality of critical utilities.",
        "Reduce cascade failure risks.",
        "Enable fast diagnostics and interventions.",
      ],
      provides: [
        "Studies, schematics, and component selection.",
        "Installation, testing, and acceptance.",
        "Marking, documentation, and procedures.",
        "Maintenance and assistance.",
      ],
      sectors: ["Manufacturing", "Food", "Chemicals", "Pharma"],
      faq: [
        {
          q: "Do you coordinate with process engineering?",
          a: "Yes: delivery points and responsibilities are defined early.",
        },
        {
          q: "Do you work on occupied sites?",
          a: "Yes, with phasing and reinforced safety plans.",
        },
      ],
    },
    {
      metaTitle: "المرافق الصناعية | BCP Tunisia",
      metaDescription:
        "شبكات المرافق الصناعية: دراسة، تركيب، تشغيل وصيانة.",
      h1: "المرافق الصناعية",
      heroLead:
        "مرافق موثوقة تقلل التوقف وتوضح المسؤوليات بين الإنتاج والأنظمة الفنية.",
      intro:
        "ننظم توزيع السوائل والخدمات التقنية للعمليات مع دمج السلامة والوصول والصيانة. تُعالج كل واجهة لتقليل اللبس التشغيلي.",
      needs: [
        "تأمين توفر وجودة المرافق الحرجة.",
        "تقليل مخاطر الأعطال المتسلسلة.",
        "تسهيل التشخيص والتدخل السريع.",
      ],
      provides: [
        "دراسات، مخططات، واختيار مكوّنات.",
        "التركيب، الاختبارات، والقبول.",
        "الإشارات، الوثائق، والإجراءات.",
        "الصيانة والمساعدة.",
      ],
      sectors: ["تصنيع", "غذاء", "كيمياء", "دواء"],
      faq: [
        {
          q: "هل تنسقون مع هندسة العمليات؟",
          a: "نعم ويُعرّف تسليم النقاط والمسؤوليات مبكراً.",
        },
        {
          q: "هل تعملون في مواقع مشغولة؟",
          a: "نعم مع مراحل وخطط سلامة معززة.",
        },
      ],
    },
  ),
  "compressed-air": buildServicePage(
    {
      metaTitle: "Air comprimé | BCP Tunisia",
      metaDescription:
        "Réseaux d’air comprimé industriels : étude, installation, essais, qualité d’air et maintenance.",
      h1: "Réseaux d’air comprimé",
      heroLead:
        "Un réseau d’air comprimé propre et stable limite les pannes d’outils et protège les équipements en aval.",
      intro:
        "Nous dimensionnons production, stockage, distribution et traitement (filtration, sécheurs) selon la qualité requise par vos consommateurs. Les points de prélèvement et les purges sont traités pour limiter condensats et pertes de charge.",
      needs: [
        "Garantir pression et débit aux postes critiques.",
        "Limiter contamination et condensats sur équipements sensibles.",
        "Réduire consommation énergétique liée aux fuites et surcompression.",
      ],
      provides: [
        "Études, schémas et choix de composants.",
        "Installation, essais d’étanchéité et mise en service.",
        "Consignes d’exploitation et plan de maintenance.",
        "Maintenance préventive et dépannage.",
      ],
      sectors: ["Industrie", "Emballage", "Automobile", "Agro"],
      faq: [
        {
          q: "Traitez-vous la qualité d’air pour instrumentation ?",
          a: "Oui : le cahier des charges dépend des équipements alimentés en aval.",
        },
        {
          q: "Intervenez-vous sur fuites en exploitation ?",
          a: "Oui, avec diagnostic ciblé et plan de remise en conformité.",
        },
      ],
    },
    {
      metaTitle: "Compressed air | BCP Tunisia",
      metaDescription:
        "Industrial compressed air systems: engineering, installation, testing, air quality, and maintenance.",
      h1: "Compressed air networks",
      heroLead:
        "Clean, stable compressed air reduces tool failures and protects downstream equipment.",
      intro:
        "We size generation, storage, distribution, and treatment (filtration, dryers) to match consumer requirements. Take-off points and drains are handled to limit condensate and pressure loss.",
      needs: [
        "Ensure pressure and flow at critical consumers.",
        "Limit contamination and condensate on sensitive equipment.",
        "Reduce energy losses from leaks and over-compression.",
      ],
      provides: [
        "Studies, schematics, and component selection.",
        "Installation, leak testing, and commissioning.",
        "Operating notes and maintenance plans.",
        "Preventive maintenance and troubleshooting.",
      ],
      sectors: ["Manufacturing", "Packaging", "Automotive", "Food"],
      faq: [
        {
          q: "Do you handle air quality for instrumentation?",
          a: "Yes: requirements depend on downstream equipment being supplied.",
        },
        {
          q: "Do you fix leaks during operations?",
          a: "Yes, with targeted diagnostics and a compliance plan.",
        },
      ],
    },
    {
      metaTitle: "الهواء المضغوط | BCP Tunisia",
      metaDescription:
        "شبكات الهواء المضغوط الصناعية: دراسة، تركيب، اختبارات، جودة هواء وصيانة.",
      h1: "شبكات الهواء المضغوط",
      heroLead:
        "شبكة هواء نظيفة ومستقرة تقلل أعطال الأدوات وتحمي المعدات في الخط.",
      intro:
        "نحدد الإنتاج والتخزين والتوزيع والمعالجة (ترشيح، تجفيف) حسب جودة المستهلكين. تُعالج نقاط السحب والتصريف لتقليل التكثف وفقدان الضغط.",
      needs: [
        "ضمان الضغط والتدفق عند النقاط الحرجة.",
        "تقليل التلوث والتكثف على معدات حساسة.",
        "خفض فقدان الطاقة بسبب التسرب والضغط الزائد.",
      ],
      provides: [
        "دراسات، مخططات، واختيار مكوّنات.",
        "التركيب، اختبارات التسرب، والتشغيل.",
        "إرشادات تشغيل وخطة صيانة.",
        "صيانة وقائية وتشخيص أعطال.",
      ],
      sectors: ["صناعة", "تعبئة", "سيارات", "غذاء"],
      faq: [
        {
          q: "هل تعالجون جودة الهواء للأجهزة الدقيقة؟",
          a: "نعم، ويحدد ذلك المعدات المغذاة في الخط.",
        },
        {
          q: "هل تعالجون التسرب أثناء التشغيل؟",
          a: "نعم بتشخيص موجّه وخطة تصحيح.",
        },
      ],
    },
  ),
  "plumbing-sanitary": buildServicePage(
    {
      metaTitle: "Plomberie & sanitaire | BCP Tunisia",
      metaDescription:
        "Réseaux sanitaires et plomberie tertiaire/industrielle : études, installation et maintenance.",
      h1: "Plomberie et installations sanitaires",
      heroLead:
        "Des réseaux clairs et entretenus limitent les arrêts sanitaires et les dégradations secondaires.",
      intro:
        "Nous traitons distribution, évacuation, équipements sanitaires et interfaces avec CVC. Les choix matériaux et pentes sont alignés sur l’usage, l’accessibilité maintenance et la durabilité.",
      needs: [
        "Réduire risques de rejet et d’infiltration.",
        "Assurer confort sanitaire compatible avec l’affluence.",
        "Faciliter interventions sans fermeture prolongée inutile.",
      ],
      provides: [
        "Études, plans et choix de composants.",
        "Installation, essais d’étanchéité et remise en service.",
        "Documentation et recommandations d’exploitation.",
        "Maintenance et dépannage.",
      ],
      sectors: ["Tertiaire", "Industrie", "Retail", "Santé"],
      faq: [
        {
          q: "Intervenez-vous sur rénovation de locaux occupés ?",
          a: "Oui, avec phasage et mesures d’hygiène adaptées.",
        },
        {
          q: "Gérez-vous les réseaux préfabriqués ?",
          a: "Oui, selon contraintes architecturales et techniques.",
        },
      ],
    },
    {
      metaTitle: "Plumbing & sanitary | BCP Tunisia",
      metaDescription:
        "Sanitary and plumbing systems for tertiary/industrial sites: design, installation, and maintenance.",
      h1: "Plumbing & sanitary systems",
      heroLead:
        "Clear, maintained networks reduce sanitary outages and secondary damage.",
      intro:
        "We handle distribution, drainage, sanitary fixtures, and HVAC interfaces. Material choices and slopes align with usage, maintainability, and durability.",
      needs: [
        "Reduce backflow and leakage risks.",
        "Provide sanitary comfort aligned with occupancy.",
        "Enable interventions without unnecessary long shutdowns.",
      ],
      provides: [
        "Studies, drawings, and component selection.",
        "Installation, leak testing, and commissioning.",
        "Documentation and operating guidance.",
        "Maintenance and repairs.",
      ],
      sectors: ["Commercial", "Manufacturing", "Retail", "Healthcare"],
      faq: [
        {
          q: "Do you work in occupied renovations?",
          a: "Yes, with phasing and hygiene measures.",
        },
        {
          q: "Do you handle prefabricated networks?",
          a: "Yes, depending on architectural and technical constraints.",
        },
      ],
    },
    {
      metaTitle: "السباكة والصحية | BCP Tunisia",
      metaDescription:
        "شبكات الصرف والسباكة للمواقع الخدمية/الصناعية: دراسة، تركيب وصيانة.",
      h1: "السباكة والتجهيزات الصحية",
      heroLead:
        "شبكات واضحة ومصانة تقلل توقفات الصرف والأضرار الثانوية.",
      intro:
        "نعالج التوزيع والتصريف والتجهيزات الصحية والواجهات مع التكييف. تتوافق المواد والميول مع الاستعمال والصيانة والمتانة.",
      needs: [
        "تقليل مخاطر الارتداد والتسرب.",
        "تأمين راحة صحية متناسبة مع الازدحام.",
        "تسهيل التدخلات دون إغلاق طويل غير ضروري.",
      ],
      provides: [
        "دراسات، مخططات، واختيار مكوّنات.",
        "التركيب، اختبارات التسرب، والتشغيل.",
        "الوثائق وإرشادات التشغيل.",
        "الصيانة والإصلاح.",
      ],
      sectors: ["خدمات", "صناعة", "تجارة", "صحة"],
      faq: [
        {
          q: "هل تعملون على تجديد أثناء الاستغلال؟",
          a: "نعم مع مراحل وإجراءات نظافة مناسبة.",
        },
        {
          q: "هل تتعاملون مع شبكات مسبقة الصنع؟",
          a: "نعم حسب القيود المعمارية والفنية.",
        },
      ],
    },
  ),
  "pools-fountains": buildServicePage(
    {
      metaTitle: "Piscines & fontaines | BCP Tunisia",
      metaDescription:
        "Installations piscines et fontaines : études hydrauliques, traitement, automatismes et maintenance.",
      h1: "Piscines et fontaines",
      heroLead:
        "Une installation maîtrisée combine hydraulique, traitement et sécurité d’exploitation.",
      intro:
        "Nous structurons filtration, circulation, désinfection et automatismes selon l’usage public ou privé. La mise en service inclut équilibrage, essais et consignes claires pour l’exploitation quotidienne.",
      needs: [
        "Garantir qualité d’eau et sécurité des usagers.",
        "Limiter consommations et pertes (fuites, sur-pompage).",
        "Réduire arrêts liés à équipements non entretenus.",
      ],
      provides: [
        "Études, plans et choix d’équipements.",
        "Installation, raccordements et mise en service.",
        "Documentation et procédures.",
        "Maintenance saisonnière et dépannage.",
      ],
      sectors: ["Hôtellerie", "Résidences", "Retail", "Sites publics"],
      faq: [
        {
          q: "Assurez-vous la formation du personnel d’exploitation ?",
          a: "Oui, avec transfert sur les réglages courants et la sécurité.",
        },
        {
          q: "Intervenez-vous sur modernisation ?",
          a: "Oui : remplacement ciblé et reprise d’automatismes.",
        },
      ],
    },
    {
      metaTitle: "Pools & fountains | BCP Tunisia",
      metaDescription:
        "Pools and fountains: hydraulic design, treatment, controls, and maintenance.",
      h1: "Pools & fountains",
      heroLead:
        "A controlled installation balances hydraulics, water treatment, and safe operations.",
      intro:
        "We structure filtration, circulation, disinfection, and automation for public or private use. Commissioning includes balancing, testing, and clear daily operating notes.",
      needs: [
        "Ensure water quality and user safety.",
        "Limit consumption and losses (leaks, over-pumping).",
        "Reduce downtime from neglected equipment.",
      ],
      provides: [
        "Studies, drawings, and equipment selection.",
        "Installation, connections, and commissioning.",
        "Documentation and procedures.",
        "Seasonal maintenance and troubleshooting.",
      ],
      sectors: ["Hospitality", "Residential", "Retail", "Public venues"],
      faq: [
        {
          q: "Do you train operating staff?",
          a: "Yes, focusing on routine settings and safety.",
        },
        {
          q: "Do you modernize existing installations?",
          a: "Yes: targeted replacements and control upgrades.",
        },
      ],
    },
    {
      metaTitle: "المسابح والنوافير | BCP Tunisia",
      metaDescription:
        "منشآت المسابح والنوافير: هيدروليك، معالجة، أتمتة وصيانة.",
      h1: "المسابح والنوافير",
      heroLead:
        "منشأة منضبطة تجمع الهيدروليك والمعالجة وأمان التشغيل.",
      intro:
        "ننظم الترشيح والتدوير والتعقيم والأتمتة للاستعمال العام أو الخاص. يشمل التشغيل التجريبي الموازنة والاختبارات وإرشادات التشغيل اليومي.",
      needs: [
        "ضمان جودة المياه وسلامة المستخدمين.",
        "تقليل الاستهلاك والفقد (تسرب، ضخ زائد).",
        "تقليل التوقف بسبب عدم الصيانة.",
      ],
      provides: [
        "دراسات، مخططات، واختيار معدات.",
        "التركيب، التوصيلات، والتشغيل.",
        "الوثائق والإجراءات.",
        "صيانة موسمية وتشخيص أعطال.",
      ],
      sectors: ["ضيافة", "سكن", "تجارة", "أماكن عمومية"],
      faq: [
        {
          q: "هل تكوّنون العاملين؟",
          a: "نعم على الضبط اليومي والسلامة.",
        },
        {
          q: "هل تحدّثون منشآت قائمة؟",
          a: "نعم باستبدال موجّه وتحديث أتمتة.",
        },
      ],
    },
  ),
  "water-tanks": buildServicePage(
    {
      metaTitle: "Réservoirs & stockage d’eau | BCP Tunisia",
      metaDescription:
        "Réservoirs et stockage d’eau : études, installation, instrumentation et maintenance.",
      h1: "Réservoirs et stockage d’eau",
      heroLead:
        "Un stockage maîtrisé sécurise l’alimentation et clarifie les responsabilités de surveillance.",
      intro:
        "Nous traitons raccordements, ventilation, protection contre contamination, instrumentation et accès maintenance. Les solutions sont adaptées aux usages incendie, process ou sanitaire selon votre cahier des charges.",
      needs: [
        "Éviter stagnation et risques sanitaires.",
        "Garantir disponibilité en pointe ou secours.",
        "Faciliter inspections et nettoyages planifiés.",
      ],
      provides: [
        "Études, choix matériels et plans de raccordement.",
        "Installation, essais et mise en service.",
        "Documentation et procédures.",
        "Maintenance et assistance.",
      ],
      sectors: ["Industrie", "Tertiaire", "Hôtellerie", "Infrastructures"],
      faq: [
        {
          q: "Peut-on séparer usages incendie et sanitaire ?",
          a: "Oui, selon contraintes et architecture hydraulique du site.",
        },
        {
          q: "Assurez-vous le suivi des niveaux ?",
          a: "Oui, avec instrumentation adaptée et supervision si nécessaire.",
        },
      ],
    },
    {
      metaTitle: "Water tanks & storage | BCP Tunisia",
      metaDescription:
        "Water storage tanks: engineering, installation, instrumentation, and maintenance.",
      h1: "Water tanks & storage",
      heroLead:
        "Controlled storage secures supply and clarifies monitoring responsibilities.",
      intro:
        "We address connections, venting, contamination protection, instrumentation, and maintenance access. Solutions align to fire, process, or sanitary use per your requirements.",
      needs: [
        "Avoid stagnation and sanitary risks.",
        "Ensure availability for peaks or backup.",
        "Enable planned inspections and cleaning.",
      ],
      provides: [
        "Studies, equipment selection, and connection drawings.",
        "Installation, testing, and commissioning.",
        "Documentation and procedures.",
        "Maintenance and assistance.",
      ],
      sectors: ["Manufacturing", "Commercial", "Hospitality", "Infrastructure"],
      faq: [
        {
          q: "Can fire and sanitary uses be separated?",
          a: "Yes, depending on site hydraulic architecture and constraints.",
        },
        {
          q: "Do you monitor tank levels?",
          a: "Yes, with appropriate instrumentation and supervision if needed.",
        },
      ],
    },
    {
      metaTitle: "خزانات المياه | BCP Tunisia",
      metaDescription:
        "خزانات وتخزين المياه: دراسة، تركيب، قياس وصيانة.",
      h1: "خزانات وتخزين المياه",
      heroLead:
        "تخزين منضبط يؤمّن التغذية ويوضح مسؤوليات المراقبة.",
      intro:
        "نعالج الوصلات والتهوية والحماية من التلوث والقياس ومسارات الصيانة. تُلائم الحلول استعمالات الإطفاء أو العمليات أو الصحية حسب وثيقتكم.",
      needs: [
        "تفادي الركود والمخاطر الصحية.",
        "ضمان التوفر في الذروة أو الاحتياطي.",
        "تسهيل الفحوص والتنظيف المخطط.",
      ],
      provides: [
        "دراسات، اختيار معدات، ومخططات وصلات.",
        "التركيب، الاختبارات، والتشغيل.",
        "الوثائق والإجراءات.",
        "الصيانة والمساعدة.",
      ],
      sectors: ["صناعة", "خدمات", "ضيافة", "بنى تحتية"],
      faq: [
        {
          q: "هل يمكن فصل استعمالات الإطفاء والصحية؟",
          a: "نعم حسب البنية الهيدروليكية والقيود.",
        },
        {
          q: "هل تراقبون مستويات الخزان؟",
          a: "نعم بأجهزة قياس وإشراف عند الحاجة.",
        },
      ],
    },
  ),
  "electrical-installation": buildServicePage(
    {
      metaTitle: "Installations électriques | BCP Tunisia",
      metaDescription:
        "Installations électrites tertiaires et industrielles : études, réalisation, mise en conformité ciblée et maintenance.",
      h1: "Installations électriques",
      heroLead:
        "Une installation électrique structurée sécurise l’alimentation et facilite l’exploitation quotidienne.",
      intro:
        "Nous réalisons distribution, éclairage, prises de puissance et chemins de câbles en respectant les règles de l’art et vos contraintes d’exploitation. La remise en service s’appuie sur contrôles, essais et dossiers exploitables.",
      needs: [
        "Réduire risques électriques et indisponibilités.",
        "Préparer extensions sans remise en cause globale inutile.",
        "Faciliter maintenance et diagnostics.",
      ],
      provides: [
        "Études, plans et choix de matériels.",
        "Installation, raccordements et essais.",
        "Mise en service et documentation.",
        "Maintenance et dépannage.",
      ],
      sectors: ["Industrie", "Tertiaire", "Retail", "Infrastructures"],
      faq: [
        {
          q: "Intervenez-vous sur site occupé ?",
          a: "Oui, avec organisation des coupures et sécurisation des zones.",
        },
        {
          q: "Assurez-vous la coordination avec le courant faible ?",
          a: "Oui : goulottes, gaines et interfaces sont cadrées en amont.",
        },
      ],
    },
    {
      metaTitle: "Electrical installation | BCP Tunisia",
      metaDescription:
        "Tertiary and industrial electrical installations: engineering, execution, targeted compliance, and maintenance.",
      h1: "Electrical installation",
      heroLead:
        "Structured electrical work secures supply and simplifies daily operations.",
      intro:
        "We deliver distribution, lighting, power outlets, and cable routes aligned with best practices and operational constraints. Commissioning relies on checks, tests, and practical documentation.",
      needs: [
        "Reduce electrical risks and downtime.",
        "Prepare for extensions without unnecessary rework.",
        "Ease maintenance and diagnostics.",
      ],
      provides: [
        "Studies, drawings, and equipment selection.",
        "Installation, connections, and testing.",
        "Commissioning and documentation.",
        "Maintenance and troubleshooting.",
      ],
      sectors: ["Manufacturing", "Commercial", "Retail", "Infrastructure"],
      faq: [
        {
          q: "Do you work on occupied sites?",
          a: "Yes, with outage planning and zone safety.",
        },
        {
          q: "Do you coordinate with low-current systems?",
          a: "Yes: containment and interfaces are planned early.",
        },
      ],
    },
    {
      metaTitle: "المنشآت الكهربائية | BCP Tunisia",
      metaDescription:
        "منشآت كهربائية صناعية وخدمية: دراسة، تنفيذ، امتثال موجّه وصيانة.",
      h1: "المنشآت الكهربائية",
      heroLead:
        "تنظيم جيد للتمديدات يؤمّن التغذية ويسهّل التشغيل اليومي.",
      intro:
        "ننفذ التوزيع والإضاءة ومخارج القدرة ومسارات الكابلات وفق الممارسات الجيدة وقيود التشغيل. يستند التشغيل التجريبي إلى فحوص واختبارات وملفات عملية.",
      needs: [
        "تقليل المخاطر الكهربائية والتوقف.",
        "الاستعداد للتوسعات دون إعادة عمل غير ضرورية.",
        "تسهيل الصيانة والتشخيص.",
      ],
      provides: [
        "دراسات، مخططات، واختيار معدات.",
        "التركيب، التوصيلات، والاختبارات.",
        "التشغيل التجريبي والوثائق.",
        "الصيانة وتشخيص الأعطال.",
      ],
      sectors: ["صناعة", "خدمات", "تجارة", "بنى تحتية"],
      faq: [
        {
          q: "هل تعملون في مواقع مشغولة؟",
          a: "نعم مع تخطيط الانقطاعات وتأمين المناطق.",
        },
        {
          q: "هل تنسقون مع التيار الضعيف؟",
          a: "نعم ويُخطط للمسارات والواجهات مبكراً.",
        },
      ],
    },
  ),
  "thermographic-inspection": buildServicePage(
    {
      metaTitle: "Thermographie électrique | BCP Tunisia",
      metaDescription:
        "Inspections thermographiques pour identifier points chauds et anomalies sur installations électriques.",
      h1: "Thermographie & inspection électrique",
      heroLead:
        "La thermographie aide à prioriser des actions avant défaillance si elle est encadrée et interprétée avec méthode.",
      intro:
        "Nous réalisons des campagnes ciblées sur tableaux, liaisons et points de connexion, avec conditions de charge adaptées à l’analyse. Le livrable priorise les anomalies et propose des actions proportionnées.",
      needs: [
        "Identifier échauffements anormaux avant incident.",
        "Planifier interventions sans arrêt global systématique.",
        "Documenter l’état pour suivi dans le temps.",
      ],
      provides: [
        "Plan de campagne, prises de vues et rapports.",
        "Recommandations de correction et phasage.",
        "Accompagnement pour reprises ciblées si demandé.",
        "Suivi comparatif sur campagnes ultérieures.",
      ],
      sectors: ["Industrie", "Data centers", "Tertiaire", "Infrastructures"],
      faq: [
        {
          q: "La thermographie remplace-t-elle un contrôle électrique complet ?",
          a: "Non : c’est un outil complémentaire, utile pour cibler des risques thermiques.",
        },
        {
          q: "Pouvez-vous intervenir en horaires contraints ?",
          a: "Oui, selon disponibilité et conditions de charge nécessaires.",
        },
      ],
    },
    {
      metaTitle: "Thermographic inspection | BCP Tunisia",
      metaDescription:
        "Thermographic inspections to identify hot spots and anomalies in electrical systems.",
      h1: "Thermography & electrical inspection",
      heroLead:
        "Thermography helps prioritize actions before failure when conducted and interpreted methodically.",
      intro:
        "We run targeted campaigns on panels, connections, and feeders under load conditions suitable for analysis. Deliverables prioritize anomalies and propose proportionate actions.",
      needs: [
        "Detect abnormal heating before incidents.",
        "Plan interventions without systematic full shutdowns.",
        "Document condition for longitudinal tracking.",
      ],
      provides: [
        "Campaign plan, imaging, and reports.",
        "Correction recommendations and phasing.",
        "Support for targeted remediations if requested.",
        "Comparative follow-up on later campaigns.",
      ],
      sectors: ["Manufacturing", "Data centers", "Commercial", "Infrastructure"],
      faq: [
        {
          q: "Does thermography replace a full electrical inspection?",
          a: "No: it complements other checks and targets thermal risk.",
        },
        {
          q: "Can you work within constrained hours?",
          a: "Yes, depending on availability and required load conditions.",
        },
      ],
    },
    {
      metaTitle: "الفحص بالتصوير الحراري | BCP Tunisia",
      metaDescription:
        "حملات تصوير حراري لرصد النقاط الساخنة والشذوذ في المنشآت الكهربائية.",
      h1: "التصوير الحراري والفحص الكهربائي",
      heroLead:
        "التصوير الحراري يساعد على أولوية الإجراءات عندما يُنفَّذ ويُفسَّر بمنهجية.",
      intro:
        "ننفذ حملات موجهة على اللوحات والوصلات والتغذيات ضمن أحمال مناسبة للتحليل. يصنّف التقرير الشذوذ ويقترح إجراءات متناسبة.",
      needs: [
        "رصد ارتفاع حرارة غير طبيعي قبل الحوادث.",
        "تخطيط تدخلات دون إيقاف شامل منهجي.",
        "توثيق الحالة للمقارنة لاحقاً.",
      ],
      provides: [
        "خطة الحملة، الصور، والتقارير.",
        "توصيات تصحيح وجدولة.",
        "دعم للإصلاحات الموجهة عند الطلب.",
        "متابعة مقارنة في حملات لاحقة.",
      ],
      sectors: ["صناعة", "مراكز بيانات", "خدمات", "بنى تحتية"],
      faq: [
        {
          q: "هل يغني التصوير عن فحص كهربائي كامل؟",
          a: "لا، هو مكمّل يركز على المخاطر الحرارية.",
        },
        {
          q: "هل تعملون ضمن أوقات مقيدة؟",
          a: "نعم حسب التوفر وشروط الأحمال المطلوبة.",
        },
      ],
    },
  ),
  "electrical-cabinet-assembly": buildServicePage(
    {
      metaTitle: "Montage d’armoires électriques | BCP Tunisia",
      metaDescription:
        "Montage d’armoires et coffrets : câblage, essais, marquage et documentation pour exploitation fiable.",
      h1: "Montage d’armoires électriques",
      heroLead:
        "Un armoire clairement câblée et identifiée réduit les erreurs d’exploitation et accélère le diagnostic.",
      intro:
        "Nous réalisons câblage, raccordements, protections et essais selon schémas validés. Le marquage et la documentation sont traités comme partie intégrante de la qualité de livraison.",
      needs: [
        "Garantir lisibilité et sécurité pour exploitants et mainteneurs.",
        "Réduire temps de mise en service et reprises.",
        "Faciliter extensions ultérieures maîtrisées.",
      ],
      provides: [
        "Montage en atelier ou sur site selon contexte.",
        "Essais de continuité, isolation et vérifications fonctionnelles.",
        "Marquage, dossiers schémas et nomenclatures.",
        "Support à la mise en service.",
      ],
      sectors: ["Industrie", "Automatisme", "Tertiaire", "Infrastructures"],
      faq: [
        {
          q: "Travaillez-vous à partir de schémas client ?",
          a: "Oui, avec clarification des points d’ambiguïté avant fabrication.",
        },
        {
          q: "Assurez-vous la traçabilité des composants ?",
          a: "Oui : nomenclatures et fiches utiles à la maintenance.",
        },
      ],
    },
    {
      metaTitle: "Electrical cabinet assembly | BCP Tunisia",
      metaDescription:
        "Panel and enclosure assembly: wiring, testing, labeling, and documentation for reliable operations.",
      h1: "Electrical cabinet assembly",
      heroLead:
        "Clearly wired and labeled panels reduce operating errors and speed diagnostics.",
      intro:
        "We deliver wiring, connections, protection devices, and testing per approved drawings. Labeling and documentation are treated as core quality deliverables.",
      needs: [
        "Ensure readability and safety for operators and maintainers.",
        "Reduce commissioning time and rework.",
        "Enable controlled future extensions.",
      ],
      provides: [
        "Workshop or on-site assembly depending on context.",
        "Continuity, insulation, and functional checks.",
        "Labeling, schematic dossiers, and bills of materials.",
        "Commissioning support.",
      ],
      sectors: ["Manufacturing", "Automation", "Commercial", "Infrastructure"],
      faq: [
        {
          q: "Do you build from client drawings?",
          a: "Yes, with clarification of ambiguities before build.",
        },
        {
          q: "Do you provide component traceability?",
          a: "Yes: BOMs and sheets useful for maintenance.",
        },
      ],
    },
    {
      metaTitle: "تجميع لوحات كهربائية | BCP Tunisia",
      metaDescription:
        "تجميع الخزانات واللوحات: توصيل، اختبارات، ترميز ووثائق لتشغيل موثوق.",
      h1: "تجميع اللوحات الكهربائية",
      heroLead:
        "لوحة موصولة وموثقة جيداً تقلل أخطاء التشغيل وتسرّع التشخيص.",
      intro:
        "ننفذ التوصيلات والحماية والاختبارات وفق مخططات معتمدة. يُعامل الترميز والوثائق كجزء أساسي من الجودة.",
      needs: [
        "ضمان الوضوح والسلامة للمشغّلين والصيانة.",
        "تقليل زمن التشغيل التجريبي وإعادة العمل.",
        "تمكين توسعات لاحقة منضبطة.",
      ],
      provides: [
        "تجميع ورشة أو موقع حسب السياق.",
        "فحوص الاستمرارية والعزل والوظائف.",
        "الترميز، المخططات، وقوائم المكوّنات.",
        "دعم التشغيل التجريبي.",
      ],
      sectors: ["صناعة", "أتمتة", "خدمات", "بنى تحتية"],
      faq: [
        {
          q: "هل تعملون من مخططات العميل؟",
          a: "نعم مع توضيح النقاط الغامضة قبل التصنيع.",
        },
        {
          q: "هل توفرون تتبعاً للمكوّنات؟",
          a: "نعم عبر قوائم وفقائح مفيدة للصيانة.",
        },
      ],
    },
  ),
  "design-studies": buildServicePage(
    {
      metaTitle: "Conception & études techniques | BCP Tunisia",
      metaDescription:
        "Études et conception pour sécuriser vos choix avant investissement : faisabilité, plans, dossiers techniques.",
      h1: "Conception & études techniques",
      heroLead:
        "Une étude solide réduit les surprises de chantier et aligne les corps de métier sur un référentiel commun.",
      intro:
        "Nous structurons les hypothèses, les interfaces et les critères de recette dès la phase amont. Les livrables sont pensés pour être utilisés par l’exploitation, le chantier et la maintenance.",
      needs: [
        "Clarifier le périmètre et les risques avant engagement fort.",
        "Réduire itérations coûteuses en cours de réalisation.",
        "Préparer une mise en service mesurable et documentée.",
      ],
      provides: [
        "Relevés, ateliers et cahiers des charges techniques.",
        "Plans, schémas, notes de calcul et listes matériels.",
        "Accompagnement aux arbitrages et phasage.",
        "Support à la reprise de dossiers existants.",
      ],
      sectors: ["Industrie", "Tertiaire", "Santé", "Infrastructures"],
      faq: [
        {
          q: "Intervenez-vous sans suite installation ?",
          a: "Oui : nous pouvons livrer une étude exploitable par vos équipes ou d’autres exécutants.",
        },
        {
          q: "Comment sécurisez-vous les interfaces ?",
          a: "Par une matrice d’interfaces et des points de validation formalisés.",
        },
      ],
    },
    {
      metaTitle: "Design & technical studies | BCP Tunisia",
      metaDescription:
        "Technical studies and design to de-risk investment: feasibility, drawings, and technical dossiers.",
      h1: "Design & technical studies",
      heroLead:
        "Solid engineering reduces site surprises and aligns trades on a shared baseline.",
      intro:
        "We structure assumptions, interfaces, and acceptance criteria early. Deliverables are meant for operations, construction, and maintenance teams.",
      needs: [
        "Clarify scope and risks before major commitment.",
        "Reduce costly iterations during execution.",
        "Prepare measurable, documented commissioning.",
      ],
      provides: [
        "Surveys, workshops, and technical specifications.",
        "Drawings, schematics, calculations, and bill of materials.",
        "Support for trade-offs and phasing.",
        "Support for legacy dossier recovery.",
      ],
      sectors: ["Manufacturing", "Commercial", "Healthcare", "Infrastructure"],
      faq: [
        {
          q: "Can you deliver studies without execution?",
          a: "Yes: deliverables can be handed to your teams or other contractors.",
        },
        {
          q: "How do you secure interfaces?",
          a: "Through an interface matrix and formal validation points.",
        },
      ],
    },
    {
      metaTitle: "الدراسات والتصميم التقني | BCP Tunisia",
      metaDescription:
        "دراسات وتصميم تقني لتقليل المخاطر قبل الاستثمار: جدوى، مخططات، ملفات فنية.",
      h1: "الدراسات والتصميم التقني",
      heroLead:
        "دراسة متينة تقلل مفاجآت الموقع وتنسّج الحرف حول مرجع مشترك.",
      intro:
        "ننظم الفرضيات والواجهات ومعايير القبول مبكراً. تُفكّر المخرجات للتشغيل والتنفيذ والصيانة.",
      needs: [
        "توضيح النطاق والمخاطر قبل الالتزام الكبير.",
        "تقليل التكرارات المكلفة أثناء التنفيذ.",
        "تهيئة تشغيل تجريبي قابل للقياس والتوثيق.",
      ],
      provides: [
        "مسح ميداني، ورش، ومواصفات فنية.",
        "مخططات، حسابات، وقوائم معدات.",
        "دعم للمفاضلات والمراحل.",
        "دعم لاسترداد ملفات قديمة.",
      ],
      sectors: ["صناعة", "خدمات", "صحة", "بنى تحتية"],
      faq: [
        {
          q: "هل تسلّمون دراسات دون تنفيذ؟",
          a: "نعم، لتسليمها لفرقكم أو متعاقدين آخرين.",
        },
        {
          q: "كيف تؤمّنون الواجهات؟",
          a: "عبر مصفوفة واجهات ونقاط تحقق رسمية.",
        },
      ],
    },
  ),
  "technical-support": buildServicePage(
    {
      metaTitle: "Support technique | BCP Tunisia",
      metaDescription:
        "Support technique pour sécuriser l’exploitation : expertises ciblées, recommandations et accompagnement.",
      h1: "Support technique",
      heroLead:
        "Un support structuré accélère la décision lorsque l’exploitation manque de ressources spécialisées.",
      intro:
        "Nous intervenons sur demande pour analyser un symptôme, prioriser des actions ou préparer une intervention. Les livrables restent pragmatiques : constats, options, et niveau d’effort attendu.",
      needs: [
        "Obtenir un avis technique sans engager immédiatement un chantier complet.",
        "Réduire l’incertitude avant arbitrage interne.",
        "Préparer une intervention plus rapide et mieux cadrée.",
      ],
      provides: [
        "Analyse à distance ou sur site selon criticité.",
        "Recommandations et plan d’actions priorisé.",
        "Appui à la rédaction de périmètres pour devis/ marchés.",
        "Suivi court si nécessaire.",
      ],
      sectors: ["Industrie", "Tertiaire", "Retail", "Infrastructures"],
      faq: [
        {
          q: "Peut-on démarrer par un diagnostic court ?",
          a: "Oui : nous adaptons la profondeur à l’urgence et à la criticité.",
        },
        {
          q: "Travaillez-vous avec nos équipes internes ?",
          a: "Oui : le transfert de connaissance est explicité dans la restitution.",
        },
      ],
    },
    {
      metaTitle: "Technical support | BCP Tunisia",
      metaDescription:
        "Technical support for operations: targeted assessments, recommendations, and guidance.",
      h1: "Technical support",
      heroLead:
        "Structured support speeds decisions when specialized resources are limited.",
      intro:
        "We engage on demand to analyze symptoms, prioritize actions, or prepare interventions. Deliverables stay pragmatic: findings, options, and expected effort.",
      needs: [
        "Get technical guidance without immediately committing to full projects.",
        "Reduce uncertainty before internal decisions.",
        "Prepare faster, better-scoped interventions.",
      ],
      provides: [
        "Remote or on-site analysis based on criticality.",
        "Recommendations and prioritized action plans.",
        "Support scoping statements for quotations.",
        "Short follow-up when needed.",
      ],
      sectors: ["Manufacturing", "Commercial", "Retail", "Infrastructure"],
      faq: [
        {
          q: "Can we start with a short diagnostic?",
          a: "Yes: depth matches urgency and criticality.",
        },
        {
          q: "Do you work with internal teams?",
          a: "Yes: knowledge transfer is explicit in the report-back.",
        },
      ],
    },
    {
      metaTitle: "الدعم الفني | BCP Tunisia",
      metaDescription:
        "دعم فني للتشغيل: تقييمات موجّهة، توصيات، وإرشاد.",
      h1: "الدعم الفني",
      heroLead:
        "دعم منظم يسرّع القرار عندما تكون الموارد المتخصصة محدودة.",
      intro:
        "نشتغل عند الطلب لتحليل أعراض، ترتيب أولويات، أو تهيئة تدخل. تبقى المخرجات عملية: ملاحظات، خيارات، وجهد متوقع.",
      needs: [
        "الحصول على رأي فني دون الالتزام فوراً بمشروع كامل.",
        "تقليل عدم اليقين قبل القرار الداخلي.",
        "تهيئة تدخل أسرع وأكثر دقة النطاق.",
      ],
      provides: [
        "تحليل عن بُعد أو ميداني حسب الحساسية.",
        "توصيات وخطة إجراءات ذات أولوية.",
        "دعم صياغة نطاق لعروض الأسعار.",
        "متابعة قصيرة عند الحاجة.",
      ],
      sectors: ["صناعة", "خدمات", "تجارة", "بنى تحتية"],
      faq: [
        {
          q: "هل يمكن البدء بتشخيص قصير؟",
          a: "نعم، ويُحدد العمق حسب الإلحاح والحساسية.",
        },
        {
          q: "هل تعملون مع فرقنا الداخلية؟",
          a: "نعم، ويُبيّن نقل المعرفة في التقرير.",
        },
      ],
    },
  ),
  "troubleshooting-assistance": buildServicePage(
    {
      metaTitle: "Dépannage & assistance | BCP Tunisia",
      metaDescription:
        "Assistance dépannage sur installations techniques : diagnostic, actions correctives ciblées et retour d’expérience.",
      h1: "Dépannage & assistance",
      heroLead:
        "Un dépannage efficace combine diagnostic rapide et actions qui limitent l’impact sur la production.",
      intro:
        "Nous intervenons pour isoler la cause, sécuriser l’installation et proposer une correction durable plutôt qu’un contournement fragile. Chaque intervention vise un retour d’information utile à l’exploitation.",
      needs: [
        "Réduire durée d’indisponibilité.",
        "Éviter les reprises multiples par manque d’analyse.",
        "Sécuriser personnes et biens pendant la recherche de panne.",
      ],
      provides: [
        "Diagnostic structuré et mesures de sécurisation.",
        "Actions correctives et tests de validation.",
        "Compte rendu et recommandations de suivi.",
        "Préparation d’une remise en conformité si nécessaire.",
      ],
      sectors: ["Industrie", "Tertiaire", "Retail", "Infrastructures"],
      faq: [
        {
          q: "Intervenez-vous en urgence ?",
          a: "Selon disponibilité et criticité : nous clarifions le périmètre dès le premier contact.",
        },
        {
          q: "Fournissez-vous un compte rendu exploitable ?",
          a: "Oui : symptômes, cause probable, actions réalisées, et suites recommandées.",
        },
      ],
    },
    {
      metaTitle: "Troubleshooting & assistance | BCP Tunisia",
      metaDescription:
        "Troubleshooting support for technical installations: diagnostics, targeted corrections, and feedback.",
      h1: "Troubleshooting & assistance",
      heroLead:
        "Effective troubleshooting combines fast diagnosis with actions that limit production impact.",
      intro:
        "We isolate root causes, secure the installation, and propose durable corrections rather than fragile workarounds. Each intervention aims to provide actionable feedback to operations.",
      needs: [
        "Reduce downtime duration.",
        "Avoid repeat visits due to insufficient analysis.",
        "Protect people and assets during fault finding.",
      ],
      provides: [
        "Structured diagnostics and safety measures.",
        "Corrective actions and validation tests.",
        "Service reports and follow-up recommendations.",
        "Preparation for compliance remediation if needed.",
      ],
      sectors: ["Manufacturing", "Commercial", "Retail", "Infrastructure"],
      faq: [
        {
          q: "Do you provide emergency response?",
          a: "Depending on availability and criticality; scope is clarified on first contact.",
        },
        {
          q: "Do you provide actionable reports?",
          a: "Yes: symptoms, likely cause, actions taken, and recommended next steps.",
        },
      ],
    },
    {
      metaTitle: "استكشاف الأعطال والمساعدة | BCP Tunisia",
      metaDescription:
        "مساعدة في استكشاف أعطال المنشآت التقنية: تشخيص، تصحيح موجّه وتغذية راجعة.",
      h1: "استكشاف الأعطال والمساعدة",
      heroLead:
        "تدخل فعّال يجمع بين تشخيص سريع وإجراءات تقلل الأثر على الإنتاج.",
      intro:
        "نعزل السبب، نؤمّن المنشأة، ونقترح تصحيحاً دائماً بدل حلول هشة. يهدف كل تدخل إلى معلومات قابلة للاستخدام من التشغيل.",
      needs: [
        "تقليل مدة التوقف.",
        "تفادي زيارات متكررة لضعف التحليل.",
        "حماية الأشخاص والممتلكات أثناء البحث عن العطل.",
      ],
      provides: [
        "تشخيص منظم وإجراءات أمان.",
        "إجراءات تصحيح واختبارات تحقق.",
        "تقارير وتوصيات متابعة.",
        "تهيئة لإصلاح امتثال عند الحاجة.",
      ],
      sectors: ["صناعة", "خدمات", "تجارة", "بنى تحتية"],
      faq: [
        {
          q: "هل لديكم تدخل طارئ؟",
          a: "حسب التوفر والحساسية، ويُوضح النطاق عند أول اتصال.",
        },
        {
          q: "هل تقدمون تقارير عملية؟",
          a: "نعم: أعراض، سبب محتمل، إجراءات، وخطوات مقترحة.",
        },
      ],
    },
  ),
  "installation": buildServicePage(
    {
      metaTitle: "Installation technique | BCP Tunisia",
      metaDescription:
        "Installation de systèmes techniques : exécution chantier, coordination, qualité de pose et mise en service.",
      h1: "Installation",
      heroLead:
        "Une installation réussie est une exécution disciplinée, pas seulement une livraison matérielle.",
      intro:
        "Nous pilotons la pose, les raccordements, les essais intermédiaires et la coordination multi-corps de métier. La fin de travaux s’appuie sur une recette structurée et des dossiers exploitables.",
      needs: [
        "Respecter planning et interfaces sans sacrifier la qualité.",
        "Réduire reprises liées à une exécution bâclée.",
        "Sécuriser le passage en exploitation.",
      ],
      provides: [
        "Plan d’exécution, suivi chantier et contrôles qualité.",
        "Installation conforme aux études validées.",
        "Essais, recette et transfert vers maintenance/exploitation.",
        "Documentation et marquages.",
      ],
      sectors: ["Industrie", "Tertiaire", "Retail", "Infrastructures"],
      faq: [
        {
          q: "Travaillez-vous avec d’autres entreprises sur le même chantier ?",
          a: "Oui : la coordination est intégrée au planning et aux points de contrôle.",
        },
        {
          q: "Assurez-vous la formation des équipes ?",
          a: "Oui, lorsque nécessaire pour les opérations courantes et la sécurité.",
        },
      ],
    },
    {
      metaTitle: "Technical installation | BCP Tunisia",
      metaDescription:
        "Technical system installation: site execution, coordination, workmanship, and commissioning.",
      h1: "Installation",
      heroLead:
        "Successful installation is disciplined execution—not only material delivery.",
      intro:
        "We manage mounting, terminations, intermediate tests, and multi-trade coordination. Handover relies on structured acceptance and practical dossiers.",
      needs: [
        "Meet schedule and interfaces without sacrificing quality.",
        "Reduce rework from poor execution.",
        "Secure transition to operations.",
      ],
      provides: [
        "Execution plan, site follow-up, and quality checks.",
        "Installation aligned with approved engineering.",
        "Testing, acceptance, and handover to maintenance/operations.",
        "Documentation and labeling.",
      ],
      sectors: ["Manufacturing", "Commercial", "Retail", "Infrastructure"],
      faq: [
        {
          q: "Do you work alongside other contractors?",
          a: "Yes: coordination is built into the schedule and checkpoints.",
        },
        {
          q: "Do you train teams?",
          a: "Yes, when needed for routine operations and safety.",
        },
      ],
    },
    {
      metaTitle: "التركيب التقني | BCP Tunisia",
      metaDescription:
        "تركيب الأنظمة التقنية: تنفيذ ميداني، تنسيق، جودة تركيب وتشغيل تجريبي.",
      h1: "التركيب",
      heroLead:
        "تركيب ناجح هو تنفيذ منضبط وليس مجرد تسليم معدات.",
      intro:
        "ندير التركيب، التوصيلات، الاختبارات الوسيطة، والتنسيق متعدد الحرف. يعتمد التسليم على قبول منظم وملفات عملية.",
      needs: [
        "احترام الجدول والواجهات دون المساس بالجودة.",
        "تقليل إعادة العمل الناتجة عن ضعف التنفيذ.",
        "تأمين الانتقال للتشغيل.",
      ],
      provides: [
        "خطة تنفيذ، متابعة موقع، وفحوص جودة.",
        "تركيب متوافق مع الدراسات المعتمدة.",
        "اختبارات، قبول، وتسليم للصيانة/التشغيل.",
        "الوثائق والترميز.",
      ],
      sectors: ["صناعة", "خدمات", "تجارة", "بنى تحتية"],
      faq: [
        {
          q: "هل تعملون مع متعاقدين آخرين؟",
          a: "نعم، والتنسيق مدمج في الجدول ونقاط التحقق.",
        },
        {
          q: "هل تكوّنون الفرق؟",
          a: "نعم عند الحاجة للعمليات الاعتيادية والسلامة.",
        },
      ],
    },
  ),
  "equipment-sales": buildServicePage(
    {
      metaTitle: "Fourniture d’équipements | BCP Tunisia",
      metaDescription:
        "Fourniture d’équipements techniques sélectionnés pour votre contexte, avec conseil et intégration possible.",
      h1: "Fourniture d’équipements",
      heroLead:
        "Choisir un équipement adapté évite les surcoûts de reprise et les incompatibilités en intégration.",
      intro:
        "Nous sélectionnons des matériels cohérents avec vos contraintes d’environnement, de maintenance et d’évolution. La logistique et la réception sont traitées pour sécuriser la mise en œuvre.",
      needs: [
        "Éviter achats inadaptés au contexte réel du site.",
        "Garantir compatibilité avec l’existant lorsque nécessaire.",
        "Sécuriser garanties et traçabilité produit.",
      ],
      provides: [
        "Cadrage besoin, comparatif et recommandation.",
        "Approvisionnement, réception et contrôle livraison.",
        "Accompagnement installation si demandé.",
        "Support SAV selon périmètre produit.",
      ],
      sectors: ["Industrie", "Tertiaire", "Retail", "Infrastructures"],
      faq: [
        {
          q: "Vendez-vous sans installation ?",
          a: "Oui si le besoin est uniquement fourniture ; nous pouvons aussi intégrer la pose.",
        },
        {
          q: "Comment sécurisez-vous la compatibilité ?",
          a: "Par relevés et validation des interfaces avant commande.",
        },
      ],
    },
    {
      metaTitle: "Equipment supply | BCP Tunisia",
      metaDescription:
        "Technical equipment supply selected for your context, with advisory and optional integration.",
      h1: "Equipment supply",
      heroLead:
        "Right-sized equipment avoids costly rework and integration mismatches.",
      intro:
        "We select equipment aligned with environment, maintenance, and evolution constraints. Logistics and receipt are managed to secure implementation.",
      needs: [
        "Avoid purchases misaligned with real site conditions.",
        "Ensure compatibility with legacy systems when required.",
        "Secure warranties and product traceability.",
      ],
      provides: [
        "Requirements framing, comparison, and recommendation.",
        "Procurement, receipt, and delivery checks.",
        "Optional installation support.",
        "After-sales support per product scope.",
      ],
      sectors: ["Manufacturing", "Commercial", "Retail", "Infrastructure"],
      faq: [
        {
          q: "Do you sell without installation?",
          a: "Yes for supply-only needs; we can also include installation.",
        },
        {
          q: "How do you ensure compatibility?",
          a: "Through surveys and interface validation before ordering.",
        },
      ],
    },
    {
      metaTitle: "توريد المعدات | BCP Tunisia",
      metaDescription:
        "توريد معدات تقنية مختارة لسياقكم، مع استشارة وتكامل اختياري.",
      h1: "توريد المعدات",
      heroLead:
        "اختيار ملائم يجنب تكاليف إعادة العمل وتعارض التكامل.",
      intro:
        "نختار معدات متوافقة مع البيئة والصيانة والتطور. تُدار اللوجستيك والاستلام لتأمين التنفيذ.",
      needs: [
        "تفادي مشتريات غير ملائمة لظروف الموقع.",
        "ضمان التوافق مع الموجود عند الحاجة.",
        "تأمين الضمانات وتتبع المنتج.",
      ],
      provides: [
        "تأطير الحاجة، مقارنة، وتوصية.",
        "توريد، استلام، وفحص التسليم.",
        "دعم تركيب اختياري.",
        "دعم ما بعد البيع حسب نطاق المنتج.",
      ],
      sectors: ["صناعة", "خدمات", "تجارة", "بنى تحتية"],
      faq: [
        {
          q: "هل تبيعون دون تركيب؟",
          a: "نعم إن كان الطلب توريداً فقط؛ ويمكن إدراج التركيب.",
        },
        {
          q: "كيف تؤمّنون التوافق؟",
          a: "عبر مسح ميداني والتحقق من الواجهات قبل الطلب.",
        },
      ],
    },
  ),
  "preventive-corrective-maintenance": buildServicePage(
    {
      metaTitle: "Maintenance préventive & corrective | BCP Tunisia",
      metaDescription:
        "Maintenance pour installations techniques : plans préventifs, contrôles, interventions correctives et suivi documentaire.",
      h1: "Maintenance préventive & corrective",
      heroLead:
        "Une maintenance structurée réduit les arrêts imprévus et clarifie ce qui doit être contrôlé, quand, et pourquoi.",
      intro:
        "Nous définissons des plans adaptés à la criticité, aux constructeurs et à votre organisation interne. Les interventions sont tracées pour permettre un pilotage dans le temps et des arbitrages éclairés.",
      needs: [
        "Réduire pannes surprises sur équipements critiques.",
        "Disposer d’un historique utile pour audits et assurances.",
        "Aligner coût de maintenance et criticité réelle.",
      ],
      provides: [
        "Audits de parc et définition de périodicités.",
        "Contrôles, relevés, et remplacements planifiés.",
        "Interventions correctives et retours d’expérience.",
        "Rapports et indicateurs simples de suivi.",
      ],
      sectors: ["Industrie", "Tertiaire", "Retail", "Infrastructures"],
      faq: [
        {
          q: "Proposez-vous des contrats annuels ?",
          a: "Oui, avec périmètre et SLA adaptés au site.",
        },
        {
          q: "Comment priorisez-vous les équipements ?",
          a: "Selon criticité pour l’activité, obsolescence, et exigences réglementaires.",
        },
      ],
    },
    {
      metaTitle: "Preventive & corrective maintenance | BCP Tunisia",
      metaDescription:
        "Maintenance for technical installations: preventive plans, inspections, corrective work, and documented follow-up.",
      h1: "Preventive & corrective maintenance",
      heroLead:
        "Structured maintenance reduces unplanned downtime and clarifies what to check, when, and why.",
      intro:
        "We define plans aligned to criticality, OEM guidance, and your internal organization. Interventions are logged to support long-term governance and informed trade-offs.",
      needs: [
        "Reduce surprise failures on critical equipment.",
        "Maintain history useful for audits and insurers.",
        "Align maintenance spend with real criticality.",
      ],
      provides: [
        "Fleet reviews and cadence definition.",
        "Inspections, readings, and planned replacements.",
        "Corrective interventions and feedback loops.",
        "Reports and simple tracking indicators.",
      ],
      sectors: ["Manufacturing", "Commercial", "Retail", "Infrastructure"],
      faq: [
        {
          q: "Do you offer annual contracts?",
          a: "Yes, with scope and SLA adapted to the site.",
        },
        {
          q: "How do you prioritize equipment?",
          a: "Based on operational criticality, obsolescence, and regulatory requirements.",
        },
      ],
    },
    {
      metaTitle: "الصيانة الوقائية والتصحيحية | BCP Tunisia",
      metaDescription:
        "صيانة المنشآت التقنية: خطط وقائية، فحوص، تدخلات تصحيحية ومتابعة موثقة.",
      h1: "الصيانة الوقائية والتصحيحية",
      heroLead:
        "صيانة منظمة تقلل التوقف غير المخطط وتوضح ماذا نفحص ومتى ولماذا.",
      intro:
        "نحدد خططاً ملائمة للحساسية وإرشادات المصنع وتنظيمكم الداخلي. تُسجّل التدخلات لدعم الحوكمة على المدى الطويل.",
      needs: [
        "تقليل الأعطال المفاجئة على المعدات الحرجة.",
        "إبقاء أرشيف مفيد للتدقيق والتأمين.",
        "مواءمة كلفة الصيانة مع الحساسية الفعلية.",
      ],
      provides: [
        "تقييم الأسطول وتحديد الدوريات.",
        "فحوص، قراءات، واستبدالات مخططة.",
        "تدخلات تصحيحية وحلقات تغذية راجعة.",
        "تقارير ومؤشرات متابعة بسيطة.",
      ],
      sectors: ["صناعة", "خدمات", "تجارة", "بنى تحتية"],
      faq: [
        {
          q: "هل لديكم عقود سنوية؟",
          a: "نعم مع نطاق ومستوى خدمة ملائمين للموقع.",
        },
        {
          q: "كيف ترتبون أولويات المعدات؟",
          a: "حسب الحساسية التشغيلية، التقادم، والمتطلبات التنظيمية.",
        },
      ],
    },
  ),
};
