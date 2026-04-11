import type { SubserviceMap } from "../types";
import { buildServicePage } from "./factory";

export const subserviceChunk4: Partial<SubserviceMap> = {
  "evacuation-intervention-plans": buildServicePage(
    {
      metaTitle: "Plans d’évacuation & d’intervention | BCP Tunisia",
      metaDescription:
        "Accompagnement pour plans d’évacuation et d’intervention adaptés à la configuration du site et à l’organisation interne.",
      h1: "Plans d’évacuation et d’intervention",
      heroLead:
        "Des plans clairs soutiennent la décision et la formation, sans se substituer à votre organisation interne.",
      intro:
        "Nous structurons l’information utile sur supports lisibles : issues, regroupements, moyens d’extinction, arrêts critiques et points de contact. L’objectif est l’alignement entre signalétique, procédures et réalité du terrain.",
      needs: [
        "Réduire l’incertitude en situation d’alarme ou d’incident.",
        "Harmoniser la représentation des locaux avec les consignes réellement appliquées.",
        "Faciliter l’intégration des nouveaux arrivants et des sous-traitants.",
      ],
      provides: [
        "Relevés, ateliers de cadrage avec vos référents HSE/exploitation.",
        "Production de plans et supports de communication adaptés.",
        "Mise à jour après travaux ou changements d’aménagement.",
        "Conseils pour la cohérence avec la signalétique et les essais d’évacuation.",
      ],
      sectors: [
        "Industrie",
        "Tertiaire",
        "Retail",
        "Enseignement & grands sites",
      ],
      faq: [
        {
          q: "Validez-vous les procédures internes ?",
          a: "Nous structurons l’information visuelle ; la validation finale relève de votre organisation et de vos obligations.",
        },
        {
          q: "Mettez-vous à jour après extension ?",
          a: "Oui : intégration des nouveaux plans et reprise des points de rassemblement.",
        },
      ],
    },
    {
      metaTitle: "Evacuation & intervention plans | BCP Tunisia",
      metaDescription:
        "Support for evacuation and intervention plans aligned to site layout and internal organization.",
      h1: "Evacuation and intervention plans",
      heroLead:
        "Clear plans support training and decisions without replacing your internal organization.",
      intro:
        "We structure practical information on readable media: exits, assembly points, extinguishing means, critical stops, and contacts. The goal is alignment among signage, procedures, and field reality.",
      needs: [
        "Reduce uncertainty during alarms or incidents.",
        "Match building representation with procedures actually used.",
        "Ease onboarding for newcomers and contractors.",
      ],
      provides: [
        "Surveys and workshops with your HSE/operations leads.",
        "Plan production and communication materials.",
        "Updates after works or layout changes.",
        "Guidance for consistency with signage and evacuation drills.",
      ],
      sectors: [
        "Manufacturing",
        "Commercial",
        "Retail",
        "Education & large venues",
      ],
      faq: [
        {
          q: "Do you validate internal procedures?",
          a: "We structure visual information; final validation remains with your organization and obligations.",
        },
        {
          q: "Do you update after extensions?",
          a: "Yes: integrate new layouts and assembly points.",
        },
      ],
    },
    {
      metaTitle: "مخططات الإخلاء والتدخل | BCP Tunisia",
      metaDescription:
        "دعم لإعداد مخططات الإخلاء والتدخل بما يتوافق مع الموقع والتنظيم الداخلي.",
      h1: "مخططات الإخلاء والتدخل",
      heroLead:
        "مخططات واضحة تدعم التكوين والقرار دون أن تحل محل تنظيمكم الداخلي.",
      intro:
        "ننظم المعلومات العملية على وسائط مقروءة: المخارج، نقاط التجمع، وسائل الإطفاء، التوقفات الحرجة، ونقاط الاتصال. الهدف الانسجام بين الإشارات والإجراءات وواقع الميدان.",
      needs: [
        "تقليل عدم اليقين أثناء الإنذار أو الحوادث.",
        "مواءمة تمثيل المبنى مع الإجراءات المطبّقة فعلياً.",
        "تسهيل اندماج القادمين الجدد والمتعاقدين.",
      ],
      provides: [
        "مسح وورش تنسيق مع مسؤولي السلامة/التشغيل.",
        "إنتاج مخططات ووسائل اتصال مناسبة.",
        "تحديث بعد الأشغال أو تغيير التخطيط.",
        "إرشاد لانسجام الإشارات وتجارب الإخلاء.",
      ],
      sectors: [
        "الصناعة",
        "الخدمات",
        "التجارة",
        "التعليم والمواقع الكبرى",
      ],
      faq: [
        {
          q: "هل تتحققون من الإجراءات الداخلية؟",
          a: "ننظم المعلومات البصرية؛ التحقق النهائي يبقى لدى مؤسستكم والالتزامات.",
        },
        {
          q: "هل تحدّثون بعد التوسعات؟",
          a: "نعم مع دمج المخططات الجديدة ونقاط التجمع.",
        },
      ],
    },
  ),
  "fire-hydrants": buildServicePage(
    {
      metaTitle: "Poteaux & bouches incendie | BCP Tunisia",
      metaDescription:
        "Réseaux extérieurs et prises incendie : étude, installation, essais et maintenance pour accès pompiers et exploitation.",
      h1: "Poteaux incendie & bouches incendie",
      heroLead:
        "Des prises accessibles et identifiables accélèrent le raccordement des secours.",
      intro:
        "Nous concevons les tracés, les protections mécaniques, la signalétique et les essais de disponibilité. L’approche intègre la circulation sur site, l’entretien des voiries et la coordination avec les autres réseaux.",
      needs: [
        "Garantir l’identification rapide et l’accessibilité réelle des prises.",
        "Limiter l’obsolescence prématurée par l’environnement ou les chocs.",
        "Disposer d’essais documentés pour le suivi d’exploitation.",
      ],
      provides: [
        "Études de cheminements, dimensionnement et choix des équipements.",
        "Installation, essais de pression/débit et marquage.",
        "Plans de récolement et recommandations d’entretien.",
        "Maintenance et contrôles périodiques.",
      ],
      sectors: [
        "Sites industriels",
        "Plateformes logistiques",
        "Retail & parkings",
        "Infrastructures",
      ],
      faq: [
        {
          q: "Intervenez-vous sur voirie existante ?",
          a: "Oui, avec analyse d’impact et coordination travaux pour limiter les coupures.",
        },
        {
          q: "Assurez-vous la traçabilité des essais ?",
          a: "Oui : rapports et historique pour le suivi d’exploitation.",
        },
      ],
    },
    {
      metaTitle: "Fire hydrants & outdoor fire water | BCP Tunisia",
      metaDescription:
        "Outdoor fire water networks and hydrants: design, installation, testing, and maintenance.",
      h1: "Fire hydrants & outdoor outlets",
      heroLead:
        "Accessible, clearly marked outlets speed emergency connections.",
      intro:
        "We design routing, mechanical protection, signage, and availability testing. The approach integrates site traffic, road maintenance, and coordination with other utilities.",
      needs: [
        "Ensure quick identification and real accessibility of outlets.",
        "Reduce premature degradation from environment or impacts.",
        "Keep documented tests for operational follow-up.",
      ],
      provides: [
        "Routing studies, sizing, and equipment selection.",
        "Installation, pressure/flow tests, and marking.",
        "As-built documentation and maintenance guidance.",
        "Maintenance and periodic inspections.",
      ],
      sectors: [
        "Industrial sites",
        "Logistics platforms",
        "Retail & parking",
        "Infrastructure",
      ],
      faq: [
        {
          q: "Do you work on existing roads?",
          a: "Yes, with impact analysis and work coordination to limit outages.",
        },
        {
          q: "Do you document tests?",
          a: "Yes: reports and history for operational tracking.",
        },
      ],
    },
    {
      metaTitle: "صنابير الحريق الخارجية | BCP Tunisia",
      metaDescription:
        "شبكات المياه الخارجية لإطفاء الحريق: دراسة، تركيب، اختبارات وصيانة.",
      h1: "صنابير الحريق والوصلات الخارجية",
      heroLead:
        "وصلات سهلة الوصول ومعرّفة تسرّع ربط فرق الإطفاء.",
      intro:
        "نصمم المسارات، الحماية الميكانيكية، الإشارات، واختبارات التوفر. يدمج النهج حركة الموقع، صيانة الطرق، وتنسيق الشبكات الأخرى.",
      needs: [
        "ضمان تعريف سريع وإتاحة فعلية للوصلات.",
        "تقليل التلف المبكر بفعل البيئة أو الصدمات.",
        "إبقاء اختبارات موثقة للمتابعة التشغيلية.",
      ],
      provides: [
        "دراسات المسارات، تحديد السعات، واختيار المعدات.",
        "التركيب، اختبارات الضغط/التدفق، والإشارات.",
        "مخططات التسليم وإرشادات الصيانة.",
        "الصيانة والفحوصات الدورية.",
      ],
      sectors: [
        "المواقع الصناعية",
        "منصات اللوجستيك",
        "التجارة والمواقف",
        "البنى التحتية",
      ],
      faq: [
        {
          q: "هل تعملون على طرق قائمة؟",
          a: "نعم مع تحليل الأثر وتنسيق الأشغال لتقليل الانقطاعات.",
        },
        {
          q: "هل توثقون الاختبارات؟",
          a: "نعم عبر تقارير وأرشيف للمتابعة.",
        },
      ],
    },
  ),
  "smoke-extraction": buildServicePage(
    {
      metaTitle: "Désenfumage naturel & mécanique | BCP Tunisia",
      metaDescription:
        "Études et mise en œuvre de désenfumage pour sécuriser les évacuations et faciliter l’intervention.",
      h1: "Désenfumage naturel et mécanique",
      heroLead:
        "Maîtriser la circulation des fumées améliore la visibilité et le temps disponible pour évacuer.",
      intro:
        "Nous traitons les scénarios d’ouvertures, les débits, les interfaces avec la structure et les autres CTA, ainsi que la logique de commande. La recette valide le comportement attendu en situation contrôlée.",
      needs: [
        "Limiter l’inhalation et la perte de repères dans les circulations.",
        "Coordonner désenfumage, détection et autres automatismes du bâtiment.",
        "Assurer une maintenance compatible avec les organes motorisés et les capteurs.",
      ],
      provides: [
        "Études, dimensionnement et choix des organes (naturel / mécanique).",
        "Installation, câblage commande, essais et réglages.",
        "Mise en service, documentation et formation.",
        "Maintenance et vérifications périodiques.",
      ],
      sectors: [
        "Tertiaire",
        "Retail & centres commerciaux",
        "Industrie",
        "Parking & infrastructures",
      ],
      faq: [
        {
          q: "Peut-on combiner plusieurs modes ?",
          a: "Oui selon l’architecture du bâtiment : la cohérence des scénarios est définie en amont.",
        },
        {
          q: "Assurez-vous la coordination CVC ?",
          a: "Oui : interfaces et inhibitions sont traitées pour éviter les comportements contradictoires.",
        },
      ],
    },
    {
      metaTitle: "Natural & mechanical smoke extraction | BCP Tunisia",
      metaDescription:
        "Smoke control engineering and implementation to support safe evacuation and intervention.",
      h1: "Natural and mechanical smoke extraction",
      heroLead:
        "Managing smoke movement improves visibility and available time to evacuate.",
      intro:
        "We address opening scenarios, flow rates, interfaces with structure and other trades, and control logic. Commissioning validates expected behavior under controlled conditions.",
      needs: [
        "Reduce inhalation risk and loss of orientation in circulation routes.",
        "Coordinate smoke control with detection and other building automations.",
        "Ensure maintainability for motorized devices and sensors.",
      ],
      provides: [
        "Studies, sizing, and selection of natural/mechanical devices.",
        "Installation, control wiring, testing, and tuning.",
        "Commissioning, documentation, and training.",
        "Maintenance and periodic verification.",
      ],
      sectors: [
        "Commercial",
        "Retail & malls",
        "Manufacturing",
        "Parking & infrastructure",
      ],
      faq: [
        {
          q: "Can multiple modes be combined?",
          a: "Yes, depending on building architecture; scenario consistency is defined early.",
        },
        {
          q: "Do you coordinate with HVAC?",
          a: "Yes: interfaces and inhibitions are handled to avoid conflicting behavior.",
        },
      ],
    },
    {
      metaTitle: "عزل واستخراج الدخان | BCP Tunisia",
      metaDescription:
        "دراسات وتنفيذ أنظمة التحكم بالدخان لدعم الإخلاء الآمن والتدخل.",
      h1: "استخراج الدخان الطبيعي والميكانيكي",
      heroLead:
        "التحكم في حركة الدخان يحسّن الرؤية والزمن المتاح للإخلاء.",
      intro:
        "نعالج سيناريوهات الفتح، التدفقات، الواجهات مع الإنشاءات والحرف الأخرى، ومنطق التحكم. يتحقق التشغيل التجريبي من السلوك المتوقع في ظروف مراقبة.",
      needs: [
        "تقليل استنشاق الدخان وفقدان التوجه في الممرات.",
        "تنسيق التحكم بالدخان مع الكشف وأتمتة المبنى.",
        "قابلية صيانة للمحركات والحساسات.",
      ],
      provides: [
        "دراسات، تحديد السعات، واختيار الأنظمة الطبيعية/الميكانيكية.",
        "التركيب، توصيلات التحكم، الاختبارات والضبط.",
        "التشغيل التجريبي، الوثائق، والتكوين.",
        "الصيانة والتحقق الدوري.",
      ],
      sectors: [
        "الخدمات",
        "التجارة والمراكز التجارية",
        "الصناعة",
        "المواقف والبنى التحتية",
      ],
      faq: [
        {
          q: "هل يمكن دمج عدة أنماط؟",
          a: "نعم حسب هندسة المبنى؛ يُعرّف اتساق السيناريوهات مبكراً.",
        },
        {
          q: "هل تنسقون مع التكييف؟",
          a: "نعم عبر الواجهات والتعطيلات لتفادي تعارض السلوك.",
        },
      ],
    },
  ),
  "spark-detection": buildServicePage(
    {
      metaTitle: "Détection d’étincelles | BCP Tunisia",
      metaDescription:
        "Détection d’étincelles et solutions associées pour convoyeurs et environnements à risques particuliers.",
      h1: "Détection d’étincelles",
      heroLead:
        "Détecter une étincelle tôt permet d’enclencher une action avant propagation.",
      intro:
        "Nous positionnons la détection en fonction des vitesses, matériaux, points chauds et interfaces process. L’intégration avec arrêts, inertage ou extinction dépend du scénario validé avec votre exploitation.",
      needs: [
        "Réduire le risque d’incendie sur transports, filtres ou équipements sensibles.",
        "Éviter les arrêts intempestifs par réglages et maintien adaptés.",
        "Clarifier les responsabilités entre sécurité et automation process.",
      ],
      provides: [
        "Analyse de risque ciblée, implantation et paramétrage.",
        "Installation, essais en conditions représentatives et recette.",
        "Documentation et procédures d’exploitation.",
        "Maintenance et assistance.",
      ],
      sectors: [
        "Bois & biomasse",
        "Agroalimentaire",
        "Recyclage",
        "Industrie avec convoyage",
      ],
      faq: [
        {
          q: "Peut-on interfacer avec l’automate du site ?",
          a: "Oui, selon architecture disponible et règles de sécurité applicables.",
        },
        {
          q: "Proposez-vous des essais avant mise en production ?",
          a: "Oui : nous structurons une recette progressive pour limiter les risques.",
        },
      ],
    },
    {
      metaTitle: "Spark detection | BCP Tunisia",
      metaDescription:
        "Spark detection for conveyors and sensitive processes: engineering, installation, testing, and support.",
      h1: "Spark detection",
      heroLead:
        "Early spark detection enables action before fire spreads.",
      intro:
        "We place detection based on speeds, materials, hot spots, and process interfaces. Integration with stops, inerting, or suppression follows scenarios validated with operations.",
      needs: [
        "Reduce fire risk on conveyors, filters, or sensitive equipment.",
        "Avoid nuisance trips through tuning and maintenance.",
        "Clarify responsibilities between safety and process automation.",
      ],
      provides: [
        "Targeted risk analysis, placement, and tuning.",
        "Installation, representative testing, and acceptance.",
        "Documentation and operating procedures.",
        "Maintenance and assistance.",
      ],
      sectors: [
        "Wood & biomass",
        "Food industry",
        "Recycling",
        "Conveying-intensive manufacturing",
      ],
      faq: [
        {
          q: "Can you interface with site PLCs?",
          a: "Yes, depending on available architecture and applicable safety rules.",
        },
        {
          q: "Do you run pre-production tests?",
          a: "Yes: progressive acceptance to limit operational risk.",
        },
      ],
    },
    {
      metaTitle: "كشف الشرر | BCP Tunisia",
      metaDescription:
        "كشف الشرر للناقلات والعمليات الحساسة: دراسة، تركيب، اختبارات ودعم.",
      h1: "كشف الشرر",
      heroLead:
        "الكشف المبكر للشرر يتيح تدخلاً قبل الانتشار.",
      intro:
        "نضع الكشف حسب السرعات والمواد والنقاط الساخنة وواجهات العمليات. يعتمد التكامل مع التوقف أو الخمول أو الإطفاء على السيناريو المعتمد مع التشغيل.",
      needs: [
        "تقليل خطر الحريق على الناقلات أو المرشحات أو المعدات الحساسة.",
        "تفادي توقفات غير مبررة عبر الضبط والصيانة.",
        "توضيح المسؤوليات بين السلامة وأتمتة العمليات.",
      ],
      provides: [
        "تحليل مخاطر موجّه، تموضع، وضبط.",
        "التركيب، اختبارات تمثيلية، وقبول.",
        "الوثائق وإجراءات التشغيل.",
        "الصيانة والمساعدة.",
      ],
      sectors: [
        "الخشب والكتلة الحيوية",
        "الصناعات الغذائية",
        "إعادة التدوير",
        "صناعة تكثيف فيها الناقلات",
      ],
      faq: [
        {
          q: "هل يمكن الربط مع المتحكمات؟",
          a: "نعم حسب البنية المتاحة وقواعد السلامة.",
        },
        {
          q: "هل تجريون اختبارات قبل الإنتاج؟",
          a: "نعم عبر قبول تدريجي لتقليل المخاطر.",
        },
      ],
    },
  ),
  "video-surveillance": buildServicePage(
    {
      metaTitle: "Vidéosurveillance | BCP Tunisia",
      metaDescription:
        "Vidéosurveillance pour sites industriels et tertiaires : conception, installation, supervision et maintenance.",
      h1: "Vidéosurveillance",
      heroLead:
        "Une vidéo structurée améliore la compréhension d’événement sans remplacer la gouvernance interne.",
      intro:
        "Nous définissons les besoins d’image (résolution, lumière, conservation), l’architecture réseau et les droits d’accès. La solution est dimensionnée pour être exploitable par vos équipes et maintenable dans le temps.",
      needs: [
        "Obtenir une preuve exploitable sans surdimensionner inutilement.",
        "Sécuriser l’accès aux flux et aux enregistrements.",
        "Assurer la continuité de service et les mises à jour.",
      ],
      provides: [
        "Études d’implantation, choix caméras et stockage.",
        "Installation, paramétrage, supervision et tests.",
        "Documentation, comptes et procédures d’exploitation.",
        "Maintenance et évolutions ciblées.",
      ],
      sectors: [
        "Industrie",
        "Retail",
        "Tertiaire",
        "Logistique",
      ],
      faq: [
        {
          q: "Proposez-vous l’intégration avec la contrôle commande ?",
          a: "Oui, selon architecture réseau et politique de sécurité du site.",
        },
        {
          q: "Gérez-vous la rétention des enregistrements ?",
          a: "Oui : nous calons la rétention sur vos obligations et contraintes de stockage.",
        },
      ],
    },
    {
      metaTitle: "Video surveillance | BCP Tunisia",
      metaDescription:
        "Video surveillance for industrial and tertiary sites: design, installation, supervision, and maintenance.",
      h1: "Video surveillance",
      heroLead:
        "Structured video improves situational awareness without replacing internal governance.",
      intro:
        "We define image requirements (resolution, lighting, retention), network architecture, and access rights. The solution is sized to be operable by your teams and maintainable long term.",
      needs: [
        "Obtain usable evidence without unnecessary oversizing.",
        "Secure access to streams and recordings.",
        "Sustain service continuity and updates.",
      ],
      provides: [
        "Placement studies, camera and storage selection.",
        "Installation, configuration, supervision, and testing.",
        "Documentation, accounts, and operating procedures.",
        "Maintenance and targeted upgrades.",
      ],
      sectors: [
        "Manufacturing",
        "Retail",
        "Commercial",
        "Logistics",
      ],
      faq: [
        {
          q: "Do you integrate with control systems?",
          a: "Yes, depending on network architecture and site security policy.",
        },
        {
          q: "Do you manage retention?",
          a: "Yes: retention is aligned to obligations and storage constraints.",
        },
      ],
    },
    {
      metaTitle: "المراقبة بالفيديو | BCP Tunisia",
      metaDescription:
        "أنظمة المراقبة بالفيديو للمنشآت الصناعية والخدمية: تصميم، تركيب، إشراف وصيانة.",
      h1: "المراقبة بالفيديو",
      heroLead:
        "فيديو منظم يحسّن فهم الأحداث دون أن يحل محل الحوكمة الداخلية.",
      intro:
        "نحدد متطلبات الصورة (الدقة، الإضاءة، الاحتفاظ)، بنية الشبكة، وصلاحيات الوصول. تُقاس الحلول لتكون قابلة للتشغيل من فرقكم وقابلة للصيانة.",
      needs: [
        "إثباتات قابلة للاستخدام دون مبالغة في التحجيم.",
        "تأمين الوصول للبث والتسجيلات.",
        "استمرارية الخدمة والتحديثات.",
      ],
      provides: [
        "دراسات التموضع، اختيار الكاميرات والتخزين.",
        "التركيب، الضبط، الإشراف، والاختبارات.",
        "الوثائق، الحسابات، وإجراءات التشغيل.",
        "الصيانة والترقيات الموجهة.",
      ],
      sectors: [
        "الصناعة",
        "التجارة",
        "الخدمات",
        "اللوجستيك",
      ],
      faq: [
        {
          q: "هل تدمجون مع أنظمة التحكم؟",
          a: "نعم حسب بنية الشبكة وسياسة أمن الموقع.",
        },
        {
          q: "هل تديرون مدة الاحتفاظ؟",
          a: "نعم وفق الالتزامات وقيود التخزين.",
        },
      ],
    },
  ),
};
