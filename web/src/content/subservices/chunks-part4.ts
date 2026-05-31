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
  "medical-gas": buildServicePage(
    {
      metaTitle: "Gaz médical | BCP Tunisia",
      metaDescription:
        "Réseaux de gaz médical pour établissements de santé et laboratoires : étude, installation, mise en service et maintenance.",
      h1: "Gaz médical",
      heroLead:
        "Un réseau de gaz médical fiable est une exigence de sécurité, pas un équipement ordinaire.",
      intro:
        "BCP Tunisia intervient sur la conception et la réalisation de réseaux de distribution de gaz médicaux : oxygène, protoxyde d'azote, air médical, vide, CO₂. Nous traitons les aspects réglementaires, la sécurité et la continuité de fourniture pour les sites de santé.",
      needs: [
        "Assurer la continuité de fourniture sans rupture en zones critiques.",
        "Respecter les normes applicables aux installations de gaz médicaux.",
        "Permettre un accès maintenance clair et une traçabilité des contrôles.",
      ],
      provides: [
        "Études de réseaux, plans et choix d'équipements adaptés au contexte médical.",
        "Installation, raccordements, tests d'étanchéité et de pureté.",
        "Mise en service, dossier technique et formation des équipes.",
        "Maintenance et contrôles réglementaires.",
      ],
      sectors: [
        "Cliniques & hôpitaux",
        "Laboratoires & analyses",
        "Centres de soins",
        "Établissements spécialisés",
      ],
      faq: [
        {
          q: "Intervenez-vous sur des installations existantes ?",
          a: "Oui : diagnostic, extension ou mise en conformité selon vos objectifs.",
        },
        {
          q: "Quels gaz couvrez-vous ?",
          a: "Oxygène, air médical, protoxyde d'azote, vide et CO₂ selon les besoins du site.",
        },
      ],
    },
    {
      metaTitle: "Medical gas | BCP Tunisia",
      metaDescription:
        "Medical gas networks for healthcare facilities and laboratories: design, installation, commissioning, and maintenance.",
      h1: "Medical gas",
      heroLead:
        "A reliable medical gas network is a safety requirement, not an ordinary utility.",
      intro:
        "BCP Tunisia designs and installs medical gas distribution networks: oxygen, nitrous oxide, medical air, vacuum, CO₂. We handle regulatory requirements, safety, and supply continuity for healthcare facilities.",
      needs: [
        "Guarantee continuous supply without interruption in critical areas.",
        "Comply with standards applicable to medical gas installations.",
        "Enable clear maintenance access and full traceability of inspections.",
      ],
      provides: [
        "Network studies, plans, and equipment selection suited to medical contexts.",
        "Installation, connections, leak and purity tests.",
        "Commissioning, technical dossier, and team training.",
        "Maintenance and regulatory inspections.",
      ],
      sectors: [
        "Clinics & hospitals",
        "Laboratories & diagnostics",
        "Care centres",
        "Specialised facilities",
      ],
      faq: [
        {
          q: "Do you work on existing installations?",
          a: "Yes: assessment, extension, or compliance work depending on your objectives.",
        },
        {
          q: "Which gases do you cover?",
          a: "Oxygen, medical air, nitrous oxide, vacuum, and CO₂ according to site requirements.",
        },
      ],
    },
    {
      metaTitle: "الغاز الطبي | BCP Tunisia",
      metaDescription:
        "شبكات الغاز الطبي للمنشآت الصحية والمختبرات: دراسة، تركيب، تشغيل وصيانة.",
      h1: "الغاز الطبي",
      heroLead:
        "شبكة غاز طبي موثوقة متطلب سلامة، لا مجرد مرفق عادي.",
      intro:
        "تتدخل BCP Tunisia في تصميم وتنفيذ شبكات توزيع الغاز الطبي: الأكسجين، الهواء الطبي، أكسيد النيتروز، الفراغ، وثاني أكسيد الكربون. نعالج الجوانب التنظيمية والسلامة واستمرارية التوريد.",
      needs: [
        "ضمان استمرارية التوريد دون انقطاع في المناطق الحرجة.",
        "الامتثال للمعايير المطبقة على منشآت الغاز الطبي.",
        "تيسير صيانة واضحة وتتبع كامل للفحوصات.",
      ],
      provides: [
        "دراسات شبكات ومخططات واختيار معدات ملائمة للسياق الطبي.",
        "التركيب، التوصيلات، اختبارات التسرب والنقاء.",
        "التشغيل التجريبي، الملف الفني، وتكوين الفرق.",
        "الصيانة والفحوصات التنظيمية.",
      ],
      sectors: [
        "العيادات والمستشفيات",
        "المختبرات والتشخيص",
        "مراكز الرعاية",
        "المنشآت المتخصصة",
      ],
      faq: [
        {
          q: "هل تتدخلون في منشآت قائمة؟",
          a: "نعم: تشخيص، توسيع، أو امتثال حسب أهدافكم.",
        },
        {
          q: "ما الغازات التي تغطيها؟",
          a: "الأكسجين، الهواء الطبي، أكسيد النيتروز، الفراغ، وثاني أكسيد الكربون.",
        },
      ],
    },
  ),
  signalisation: buildServicePage(
    {
      metaTitle: "Signalisation de sécurité | BCP Tunisia",
      metaDescription:
        "Signalisation de sécurité et signalétique technique pour sites industriels et tertiaires : fourniture, pose et mise à jour.",
      h1: "Signalisation",
      heroLead:
        "Une signalétique cohérente réduit l'incertitude et oriente les personnes dans les situations normales comme critiques.",
      intro:
        "BCP Tunisia intervient sur la signalisation de sécurité incendie, d'évacuation et de risques, ainsi que sur la signalétique technique de repérage. Nous calons les plans de pose sur les flux réels du site et les obligations réglementaires.",
      needs: [
        "Rendre les consignes visibles et compréhensibles pour tous les occupants.",
        "Aligner la signalétique avec la détection, les plans d'évacuation et les procédures.",
        "Faciliter les mises à jour après travaux ou modifications d'aménagement.",
      ],
      provides: [
        "Analyse des flux, des risques et des obligations applicables.",
        "Plan de signalisation, fourniture et pose.",
        "Signalétique d'évacuation, incendie, risques et repérage technique.",
        "Mise à jour et maintenance de la cohérence documentaire.",
      ],
      sectors: [
        "Industrie & logistique",
        "Tertiaire & retail",
        "Santé",
        "Infrastructures",
      ],
      faq: [
        {
          q: "Intervenez-vous sur des sites existants ?",
          a: "Oui : audit de l'existant, mise à jour et compléments selon les obligations.",
        },
        {
          q: "Fournissez-vous la signalétique ou seulement la pose ?",
          a: "Les deux : fourniture et pose ou fourniture seule selon vos besoins.",
        },
      ],
    },
    {
      metaTitle: "Safety signage | BCP Tunisia",
      metaDescription:
        "Safety and technical signage for industrial and tertiary sites: supply, installation, and updates.",
      h1: "Signage",
      heroLead:
        "Consistent signage reduces uncertainty and guides people in both normal and critical situations.",
      intro:
        "BCP Tunisia covers fire safety signage, evacuation and hazard markings, and technical identification signage. We align installation plans with actual site flows and regulatory requirements.",
      needs: [
        "Make instructions visible and understandable for all occupants.",
        "Align signage with detection systems, evacuation plans, and procedures.",
        "Simplify updates after works or layout changes.",
      ],
      provides: [
        "Flow analysis, risk assessment, and applicable obligation review.",
        "Signage plan, supply, and installation.",
        "Evacuation, fire, hazard, and technical identification signage.",
        "Updates and documentary consistency maintenance.",
      ],
      sectors: [
        "Industry & logistics",
        "Commercial & retail",
        "Healthcare",
        "Infrastructure",
      ],
      faq: [
        {
          q: "Do you work on existing sites?",
          a: "Yes: audit of current state, updates, and additions to meet obligations.",
        },
        {
          q: "Do you supply signage or only install it?",
          a: "Both: supply and installation, or supply only depending on your needs.",
        },
      ],
    },
    {
      metaTitle: "لافتات السلامة | BCP Tunisia",
      metaDescription:
        "لافتات السلامة والتعريف التقني للمنشآت الصناعية والخدمية: توريد، تركيب وتحديث.",
      h1: "اللافتات",
      heroLead:
        "لافتات متسقة تقلل الغموض وتوجه الأشخاص في الأوضاع العادية والحرجة.",
      intro:
        "تتدخل BCP Tunisia في لافتات السلامة من الحريق، الإخلاء والمخاطر، وكذلك في اللافتات التقنية للتعريف. نضبط خطط التركيب على التدفقات الفعلية للموقع والمتطلبات التنظيمية.",
      needs: [
        "جعل التعليمات مرئية ومفهومة لجميع شاغلي الموقع.",
        "مواءمة اللافتات مع أنظمة الكشف ومخططات الإخلاء والإجراءات.",
        "تيسير التحديثات بعد الأشغال أو تعديلات التهيئة.",
      ],
      provides: [
        "تحليل التدفقات والمخاطر والالتزامات المطبقة.",
        "خطة لافتات، توريد وتركيب.",
        "لافتات إخلاء، حريق، مخاطر، وتعريف تقني.",
        "تحديث والحفاظ على اتساق الوثائق.",
      ],
      sectors: [
        "الصناعة واللوجستيك",
        "الخدمات والتجارة",
        "الصحة",
        "البنى التحتية",
      ],
      faq: [
        {
          q: "هل تتدخلون في مواقع قائمة؟",
          a: "نعم: تدقيق الوضع الراهن، تحديثات وإضافات وفق الالتزامات.",
        },
        {
          q: "هل توردون اللافتات أم تركّبونها فقط؟",
          a: "الاثنان: توريد وتركيب، أو توريد فقط حسب احتياجاتكم.",
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
