import type { Locale } from "@/content/types";
import type { ServiceSlug } from "./services";

export const serviceNavLabels: Record<
  ServiceSlug,
  Record<Locale, string>
> = {
  "fire-detection-ssi": {
    fr: "Détection incendie & SSI",
    en: "Fire detection & fire alarm",
    ar: "كشف الحريق & الإنذار",
  },
  "gas-leak-detection": {
    fr: "Détection de gaz",
    en: "Gas detection",
    ar: "كشف الغاز",
  },
  "fire-hose-networks-ria-pia": {
    fr: "RIA / PIA",
    en: "Fire hose reels (RIA / PIA)",
    ar: "RIA / PIA",
  },
  "dry-wet-risers": {
    fr: "Colonnes sèches / humides",
    en: "Dry & wet risers",
    ar: "أعمدة جافة / رطبة",
  },
  "automatic-water-extinguishing-sprinkler": {
    fr: "Extinction automatique à eau – Sprinkler",
    en: "Automatic water extinguishing – Sprinkler",
    ar: "إطفاء تلقائي بالماء – سبرينكلر",
  },
  "automatic-gas-extinguishing": {
    fr: "Extinction à gaz",
    en: "Gas extinguishing",
    ar: "إطفاء بالغاز",
  },
  "fire-extinguisher-maintenance": {
    fr: "Extincteurs",
    en: "Fire extinguishers",
    ar: "طفايات الحريق",
  },
  "emergency-lighting": {
    fr: "Éclairage de sécurité",
    en: "Emergency lighting",
    ar: "إضاءة الطوارئ",
  },
  "fire-compartmentation": {
    fr: "Compartimentage",
    en: "Compartmentation",
    ar: "عزل الحريق",
  },
  "evacuation-intervention-plans": {
    fr: "Plan d’évacuation",
    en: "Evacuation plans",
    ar: "مخطط الإخلاء",
  },
  "fire-hydrants": {
    fr: "Poteaux & bouches incendie",
    en: "Fire hydrants",
    ar: "صنابير الحريق",
  },
  "smoke-extraction": {
    fr: "Désenfumage",
    en: "Smoke extraction",
    ar: "استخراج الدخان",
  },
  "spark-detection": {
    fr: "Détection d’étincelles",
    en: "Spark detection",
    ar: "كشف الشرر",
  },
  "video-surveillance": {
    fr: "Vidéosurveillance",
    en: "Video surveillance",
    ar: "مراقبة بالفيديو",
  },
  "access-control": {
    fr: "Contrôle d’accès",
    en: "Access control",
    ar: "التحكم في الدخول",
  },
  "intrusion-detection": {
    fr: "Détection intrusion",
    en: "Intrusion detection",
    ar: "كشف التسلل",
  },
  "control-room-supervision": {
    fr: "Salle de contrôle",
    en: "Control room",
    ar: "غرفة التحكم",
  },
  "queue-management": {
    fr: "Gestion de files",
    en: "Queue management",
    ar: "إدارة الطوابير",
  },
  "nurse-call-systems": {
    fr: "Appel infirmier",
    en: "Nurse call",
    ar: "نداء التمريض",
  },
  "hvac-cvc": {
    fr: "CVC / HVAC",
    en: "HVAC / CVC",
    ar: "تكييف CVC",
  },
  "industrial-utilities": {
    fr: "Utilités industrielles",
    en: "Industrial utilities",
    ar: "مرافق صناعية",
  },
  "compressed-air": {
    fr: "Air comprimé",
    en: "Compressed air",
    ar: "هواء مضغوط",
  },
  "plumbing-sanitary": {
    fr: "Plomberie & sanitaire",
    en: "Plumbing & sanitary",
    ar: "سباكة وصحية",
  },
  "pools-fountains": {
    fr: "Piscines & fontaines",
    en: "Pools & fountains",
    ar: "مسابح ونوافير",
  },
  "water-tanks": {
    fr: "Réservoirs d’eau",
    en: "Water tanks",
    ar: "خزانات مياه",
  },
  "electrical-installation": {
    fr: "Installations électriques",
    en: "Electrical installation",
    ar: "منشآت كهربائية",
  },
  "thermographic-inspection": {
    fr: "Thermographie",
    en: "Thermography",
    ar: "تصوير حراري",
  },
  "electrical-cabinet-assembly": {
    fr: "Armoires électriques",
    en: "Electrical panels",
    ar: "لوحات كهربائية",
  },
  "design-studies": {
    fr: "Conception & études",
    en: "Design & studies",
    ar: "تصميم ودراسات",
  },
  "technical-support": {
    fr: "Support technique",
    en: "Technical support",
    ar: "دعم فني",
  },
  "troubleshooting-assistance": {
    fr: "Dépannage & assistance",
    en: "Troubleshooting",
    ar: "صيانة أعطال",
  },
  installation: {
    fr: "Installation",
    en: "Installation",
    ar: "التركيب",
  },
  "equipment-sales": {
    fr: "Fourniture d’équipements",
    en: "Equipment supply",
    ar: "توريد معدات",
  },
  "preventive-corrective-maintenance": {
    fr: "Maintenance préventive & corrective",
    en: "Preventive & corrective maintenance",
    ar: "صيانة وقائية وتصحيحية",
  },
  "medical-gas": {
    fr: "Gaz médical",
    en: "Medical gas",
    ar: "الغاز الطبي",
  },
  signalisation: {
    fr: "Signalisation",
    en: "Safety signage",
    ar: "اللافتات",
  },
};
