import type { SubserviceMap } from "../types";
import { buildServicePage } from "./factory";

export const subserviceChunk2: Partial<SubserviceMap> = {
  "fire-hose-networks-ria-pia": buildServicePage(
    {
      metaTitle: "RIA / PIA — réseaux d’incendie | BCP Tunisia",
      metaDescription:
        "Étude, installation et maintenance des réseaux d’incendie armés (RIA) et des prises d’incendie adaptées aux besoins du site.",
      h1: "Réseaux d’incendie armés (RIA) & prises d’incendie (PIA)",
      heroLead:
        "Un réseau hydraulique dimensionné et entretenu garantit une manœuvre sûre en intervention.",
      intro:
        "Nous concevons et réalisons les réseaux RIA/PIA en tenant compte de la pression disponible, des parcours, des zones à protéger et des contraintes d’exploitation. La mise en service s’appuie sur des essais mesurés et une documentation exploitable par vos équipes.",
      needs: [
        "Disposer de débits et pressions adaptés aux scénarios d’intervention.",
        "Éviter les zones non couvertes ou difficiles d’accès en exploitation.",
        "Maintenir des essais et un suivi d’état pour limiter la dégradation dans le temps.",
      ],
      provides: [
        "Études hydrauliques, choix des composants et implantation des postes.",
        "Installation, essais d’étanchéité et de débit, marquage et signalétique.",
        "Remise de dossiers techniques et recommandations d’exploitation.",
        "Maintenance, contrôles et remises en conformité ciblées.",
      ],
      sectors: [
        "Industrie & entrepôts",
        "Tertiaire & ERP",
        "Hôtellerie & grands sites",
        "Infrastructures",
      ],
      faq: [
        {
          q: "Intervenez-vous sur extension de réseau ?",
          a: "Oui : reprise des calculs, raccordements et essais pour sécuriser l’ensemble.",
        },
        {
          q: "Proposez-vous des contrôles périodiques ?",
          a: "Oui, avec protocole adapté aux équipements et à la criticité du site.",
        },
      ],
    },
    {
      metaTitle: "Fire hose systems (RIA) & fire hydrants | BCP Tunisia",
      metaDescription:
        "Design, installation, and maintenance of fire hose reel systems and fire hydrant networks for industrial and tertiary sites.",
      h1: "Fire hose reel systems & fire hydrant outlets",
      heroLead:
        "A correctly sized and maintained hydraulic network supports safe firefighting operations.",
      intro:
        "We design and deliver RIA/hydrant networks based on available pressure, routing, protected areas, and operational constraints. Commissioning relies on measured tests and practical documentation for your teams.",
      needs: [
        "Achieve adequate flow and pressure for intervention scenarios.",
        "Avoid uncovered zones or impractical access during operations.",
        "Sustain testing and condition tracking to limit long-term degradation.",
      ],
      provides: [
        "Hydraulic studies, component selection, and outlet placement.",
        "Installation, leakage and flow tests, marking, and signage.",
        "Technical dossiers and operating recommendations.",
        "Maintenance, inspections, and targeted compliance corrections.",
      ],
      sectors: [
        "Industry & warehousing",
        "Commercial & business parks",
        "Hospitality & large venues",
        "Infrastructure",
      ],
      faq: [
        {
          q: "Do you extend existing networks?",
          a: "Yes: recalculation, tie-ins, and testing to validate the full system.",
        },
        {
          q: "Do you provide periodic inspections?",
          a: "Yes, aligned with equipment type and site criticality.",
        },
      ],
    },
    {
      metaTitle: "شبكات خراطيم الحريق وصنابير الإطفاء | BCP Tunisia",
      metaDescription:
        "دراسة وتركيب وصيانة شبكات خراطيم الحريق ونقاط الإطفاء للمنشآت الصناعية والخدمية.",
      h1: "شبكات خراطيم الحريق (RIA) وصنابير الإطفاء",
      heroLead:
        "شبكة هيدروليكية مُقَنّنة ومصانة تدعم التدخل بأمان.",
      intro:
        "نصمم وننفذ الشبكات وفق الضغط المتاح، المسارات، المناطق المحمية وقيود التشغيل. يعتمد التشغيل التجريبي على اختبارات موثقة وملفات واضحة لفرقكم.",
      needs: [
        "تأمين تدفق وضغط مناسبين لسيناريوهات التدخل.",
        "تفادي مناطق غير مغطاة أو صعبة الوصول أثناء التشغيل.",
        "الحفاظ على اختبارات وتتبع حالة الشبكة على المدى الطويل.",
      ],
      provides: [
        "دراسات هيدروليكية، اختيار المكوّنات، ومواضع الصنابير.",
        "التركيب، اختبارات التسرب والتدفق، والإشارات.",
        "ملفات تقنية وتوصيات تشغيل.",
        "صيانة، فحوصات، وتصحيحات امتثال موجهة.",
      ],
      sectors: [
        "الصناعة والمستودعات",
        "الخدمات والمجمعات",
        "الضيافة والمواقع الكبرى",
        "البنى التحتية",
      ],
      faq: [
        {
          q: "هل توسّعون شبكات قائمة؟",
          a: "نعم مع إعادة الحساب والوصلات والاختبارات للتحقق من المنظومة كاملة.",
        },
        {
          q: "هل لديكم فحوصات دورية؟",
          a: "نعم وفق نوع المعدات وحساسية الموقع.",
        },
      ],
    },
  ),
  "dry-wet-risers": buildServicePage(
    {
      metaTitle: "Colonnes sèches / humides | BCP Tunisia",
      metaDescription:
        "Colonnes montantes pour alimenter les interventions en hauteur : étude, installation, essais et maintenance.",
      h1: "Colonnes sèches et colonnes humides",
      heroLead:
        "Des colonnes correctement conçues simplifient l’alimentation des installations en élévation.",
      intro:
        "Nous adaptons le principe sec/humide à la hauteur du bâtiment, aux accès pompiers, à la pression disponible et à l’organisation du site. La réalisation inclut contrôles, essais et repères clairs pour l’exploitation.",
      needs: [
        "Sécuriser l’alimentation des niveaux supérieurs sans surprendre l’exploitation.",
        "Garantir des essais reproductibles et une maintenance accessible.",
        "Limiter les risques de corrosion ou de dégradation sur la durée.",
      ],
      provides: [
        "Étude de faisabilité, dimensionnement et choix des équipements associés.",
        "Installation, raccordements, signalétique et protection des parties sensibles.",
        "Mise en service, mesures et dossier de recette.",
        "Entretien et vérifications périodiques.",
      ],
      sectors: [
        "Tours & immeubles",
        "Hôtellerie",
        "Retail multi-niveaux",
        "Sites industriels en hauteur",
      ],
      faq: [
        {
          q: "Comment choisir entre colonne sèche et humide ?",
          a: "Le choix dépend des contraintes hydrauliques, réglementaires et d’exploitation : nous le cadrons en amont.",
        },
        {
          q: "Assurez-vous la coordination avec les autres lots ?",
          a: "Oui : interfaces gros œuvre, CVC et sécurité sont intégrées au planning chantier.",
        },
      ],
    },
    {
      metaTitle: "Dry & wet risers | BCP Tunisia",
      metaDescription:
        "Dry and wet riser systems for tall buildings: engineering, installation, testing, and maintenance.",
      h1: "Dry risers & wet risers",
      heroLead:
        "Well-designed risers simplify water supply to elevated firefighting points.",
      intro:
        "We align dry/wet principles with building height, fire service access, available pressure, and site organization. Delivery includes checks, testing, and clear operational marking.",
      needs: [
        "Secure upper-floor supply without disrupting day-to-day operations.",
        "Ensure repeatable testing and maintainable installations.",
        "Reduce long-term corrosion or degradation risks.",
      ],
      provides: [
        "Feasibility review, sizing, and selection of associated equipment.",
        "Installation, connections, signage, and protection of sensitive parts.",
        "Commissioning, measurements, and acceptance dossier.",
        "Servicing and periodic verification.",
      ],
      sectors: [
        "High-rise & office towers",
        "Hospitality",
        "Multi-level retail",
        "Elevated industrial sites",
      ],
      faq: [
        {
          q: "How do you choose dry vs wet?",
          a: "It depends on hydraulic, regulatory, and operational constraints—we define this early.",
        },
        {
          q: "Do you coordinate with other trades?",
          a: "Yes: structure, HVAC, and safety interfaces are integrated into the site plan.",
        },
      ],
    },
    {
      metaTitle: "أعمدة جافة / رطبة | BCP Tunisia",
      metaDescription:
        "أنظمة أعمدة جافة ورطبة للمباني العالية: دراسة، تركيب، اختبارات وصيانة.",
      h1: "الأعمدة الجافة والأعمدة الرطبة",
      heroLead:
        "تصميم سليم للأعمدة يبسّط تغذية نقاط التدخل في الارتفاع.",
      intro:
        "نلائم النمط الجاف/الرطب مع ارتفاع المبنى ووصول فرق الإطفاء والضغط المتاح وتنظيم الموقع. يشمل التسليم فحوصات واختبارات وإشارات واضحة للتشغيل.",
      needs: [
        "تأمين تغذية الطوابق العليا دون إرباك التشغيل اليومي.",
        "ضمان اختبارات قابلة للتكرار وصيانة يسيرة.",
        "تقليل مخاطر التآكل أو التدهور على المدى الطويل.",
      ],
      provides: [
        "دراسة جدوى، تحديد السعات، واختيار المعدات الملحقة.",
        "التركيب، التوصيلات، الإشارات، وحماية الأجزاء الحساسة.",
        "التشغيل التجريبي، القياسات، وملف القبول.",
        "الصيانة والتحقق الدوري.",
      ],
      sectors: [
        "الأبراج والمكاتب",
        "الضيافة",
        "تجارة متعددة الطوابق",
        "مواقع صناعية مرتفعة",
      ],
      faq: [
        {
          q: "كيف نختار بين جاف ورطب؟",
          a: "يعتمد ذلك على القيود الهيدروليكية والتنظيمية والتشغيلية ونحدده مبكراً.",
        },
        {
          q: "هل تنسقون مع الحرف الأخرى؟",
          a: "نعم، مع دمج واجهات الإنشاءات والتكييف والسلامة في خطة الموقع.",
        },
      ],
    },
  ),
  "automatic-water-extinguishing-sprinkler": buildServicePage(
    {
      metaTitle: "Sprinkler & extinction automatique à eau | BCP Tunisia",
      metaDescription:
        "Solutions sprinkler : étude, installation, mise en service et maintenance pour sites industriels et tertiaires.",
      h1: "Extinction automatique à eau (sprinkler)",
      heroLead:
        "Un réseau sprinkler bien dimensionné compartimente le risque et limite l’extension d’un feu.",
      intro:
        "Nous accompagnons le choix de la technologie (mouillé, sec, préaction, deluge selon contexte), le positionnement des têtes, la coordination avec la détection et la disponibilité hydraulique. La recette repose sur des essais structurés et une traçabilité claire.",
      needs: [
        "Protéger stocks, process et zones sensibles sans compromettre l’exploitation.",
        "Réduire les risques de dégâts d’eau par une conception adaptée.",
        "Maintenir disponibilité et conformité par contrôles réguliers.",
      ],
      provides: [
        "Études, calculs, choix des têtes et vannes, plans d’implantation.",
        "Installation, essais de pression et de débit, coordination multi-corps de métier.",
        "Mise en service, dossiers et procédures d’exploitation.",
        "Maintenance, inspections et assistance en exploitation.",
      ],
      sectors: [
        "Logistique & entrepôts",
        "Industrie",
        "Retail & centres commerciaux",
        "Tertiaire",
      ],
      faq: [
        {
          q: "Intervenez-vous sur sites avec produits sensibles à l’eau ?",
          a: "Oui : le principe d’extinction (préaction, inertage associé, etc.) est étudié selon le risque.",
        },
        {
          q: "Assurez-vous la coordination avec l’alimentation en eau ?",
          a: "Oui : pompage, réserves et organes de contrôle sont intégrés à la conception.",
        },
      ],
    },
    {
      metaTitle: "Automatic water extinguishing (sprinkler) | BCP Tunisia",
      metaDescription:
        "Sprinkler systems: engineering, installation, commissioning, and maintenance for industrial and tertiary facilities.",
      h1: "Automatic water extinguishing (sprinkler)",
      heroLead:
        "A well-engineered sprinkler network limits fire spread and protects assets.",
      intro:
        "We support technology selection (wet, dry, pre-action, deluge as applicable), sprinkler placement, coordination with detection, and hydraulic availability. Commissioning is built on structured testing and clear traceability.",
      needs: [
        "Protect inventory, processes, and sensitive areas without compromising operations.",
        "Reduce water damage risk through appropriate design choices.",
        "Sustain availability and compliance through regular inspections.",
      ],
      provides: [
        "Studies, calculations, sprinkler and valve selection, and layout drawings.",
        "Installation, pressure and flow tests, multi-trade coordination.",
        "Commissioning, dossiers, and operating procedures.",
        "Maintenance, inspections, and operational support.",
      ],
      sectors: [
        "Logistics & warehousing",
        "Manufacturing",
        "Retail & malls",
        "Commercial buildings",
      ],
      faq: [
        {
          q: "Do you work on water-sensitive areas?",
          a: "Yes: suppression principles (pre-action, combined approaches) are matched to the risk.",
        },
        {
          q: "Do you coordinate water supply?",
          a: "Yes: pumping, reserves, and control devices are integrated into the design.",
        },
      ],
    },
    {
      metaTitle: "الرشاشات والإطفاء التلقائي بالماء | BCP Tunisia",
      metaDescription:
        "أنظمة الرش التلقائي: دراسة، تركيب، تشغيل وصيانة للمنشآت الصناعية والخدمية.",
      h1: "الإطفاء التلقائي بالماء (الرشاشات)",
      heroLead:
        "شبكة رش مجهّزة جيداً تحدّ من انتشار الحريق وتحمي الأصول.",
      intro:
        "ندعم اختيار التقنية (رطب، جاف، ما قبل الفعل، فيضان حسب السياق)، مواضع الرؤوس، التنسيق مع الكشف، والتوفر المائي. يستند التشغيل التجريبي إلى اختبارات منظمة وتتبع واضح.",
      needs: [
        "حماية المخزون والعمليات دون الإخلال بالتشغيل.",
        "تقليل مخاطر أضرار المياه بتصميم ملائم.",
        "الحفاظ على التوفر والامتثال عبر فحوصات منتظمة.",
      ],
      provides: [
        "دراسات، حسابات، اختيار الرؤوس والصمامات، ومخططات.",
        "التركيب، اختبارات الضغط والتدفق، تنسيق متعدد الحرف.",
        "التشغيل التجريبي، الملفات، وإجراءات التشغيل.",
        "الصيانة، التفتيش، ودعم التشغيل.",
      ],
      sectors: [
        "اللوجستيك والمستودعات",
        "الصناعة",
        "التجارة والمراكز التجارية",
        "المباني الخدمية",
      ],
      faq: [
        {
          q: "هل تعملون في مناطق حساسة للماء؟",
          a: "نعم، ويُختار مبدأ الإطفاء وفق المخاطر (ما قبل الفعل، حلول مركبة…).",
        },
        {
          q: "هل تنسقون تغذية المياه؟",
          a: "نعم، مع دمج الضخ والاحتياطي وأجهزة التحكم في التصميم.",
        },
      ],
    },
  ),
};
