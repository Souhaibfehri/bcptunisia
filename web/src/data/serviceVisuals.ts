import type { ServiceSlug } from "./services";

/**
 * Per-slug hero image for sub-service pages.
 * Slugs not listed here fall back to the division-level image in DEFAULT_VISUAL_IMAGES.
 *
 * Sources:
 *   bcpics   — images provided by client (C:\Users\HP\Desktop\bcpics)
 *   unsplash — royalty-free from Unsplash, downloaded to /public/images/services/
 *   pexels   — royalty-free from Pexels,   downloaded to /public/images/services/
 *
 * All 36 service pages are covered with a unique image.
 * Images are stored locally in /public/images/services/ — no external URL at runtime.
 */
export const serviceVisuals: Partial<Record<ServiceSlug, string>> = {

  // ════════════════════════════════════════════════════════════════════════
  // SÉCURITÉ INCENDIE — 13 pages
  // ════════════════════════════════════════════════════════════════════════

  // "FIRE" alarm sounder/strobe on white wall [unsplash]
  "fire-detection-ssi":
    "/images/services/service-fire-alarm-ssi.jpeg",

  // Yellow GAS NATURAL / GAS LP labeled pipe connections [unsplash]
  "gas-leak-detection":
    "/images/services/service-gas-detection.jpeg",

  // Red T-shaped fire hydrant (poteau incendie) [bcpics]
  "fire-hose-networks-ria-pia":
    "/images/services/service-ria-hydrant.jpeg",

  // Long red "colonne sèche" pipe running along building exterior [bcpics]
  "dry-wet-risers":
    "/images/services/service-colonne-seche-exterior.jpeg",

  // Red sprinkler manifold distribution rows with pressure gauges [bcpics]
  "automatic-water-extinguishing-sprinkler":
    "/images/services/service-sprinkler-manifold.jpeg",

  // Inert gas IG-541 cylinders room with IAEG system control panel [bcpics]
  "automatic-gas-extinguishing":
    "/images/services/service-extinction-gaz.jpeg",

  // LIFECO fire extinguishers: water / foam / powder / CO₂ [bcpics]
  "fire-extinguisher-maintenance":
    "/images/services/service-extincteurs.jpeg",

  // Green emergency EXIT sign illuminated above a door [unsplash]
  "emergency-lighting":
    "/images/services/service-emergency-lighting.jpeg",

  // Rooftop smoke-extraction skylights / exutoires (arched domes) [bcpics]
  "fire-compartmentation":
    "/images/services/service-desenfumage-exutoires.jpeg",

  // Overhead: engineer with technical drawings + Stanley toolbox [unsplash]
  "evacuation-intervention-plans":
    "/images/services/service-maintenance-technician.jpeg",

  // Single outdoor red fire hydrant — distinct from T-shape ria-hydrant [bcpics]
  "fire-hydrants":
    "/images/services/service-hydrant-outdoor.jpeg",

  // Rooftop mechanical exhaust fans / smoke-extraction units [bcpics]
  "smoke-extraction":
    "/images/services/service-desenfumage-roof.jpeg",

  // Industrial bottling conveyor line — production context where spark detection is required [pexels]
  "spark-detection":
    "/images/services/service-conveyor-factory.jpeg",


  // ════════════════════════════════════════════════════════════════════════
  // SÉCURITÉ ÉLECTRONIQUE — 6 pages
  // ════════════════════════════════════════════════════════════════════════

  // Two Bosch bullet cameras mounted on dark brick wall [bcpics]
  "video-surveillance":
    "/images/services/service-cctv-cameras.jpeg",

  // Smart access-control keypad with digital security icons overlay [bcpics]
  "access-control":
    "/images/services/service-controle-acces.jpeg",

  // Dome CCTV camera against city buildings — visually distinct from bullet cameras [bcpics]
  "intrusion-detection":
    "/images/services/service-dome-cctv.jpeg",

  // NASA Apollo-style control room — rows of monitors, blue-toned, authentic supervision [unsplash]
  "control-room-supervision":
    "/images/services/service-control-room.jpeg",

  // Airport check-in hall: blue rope barriers + self-service kiosks = queue flow [unsplash]
  "queue-management":
    "/images/services/service-queue-management.jpeg",

  // Nurse with medical touchscreen/alert interface [bcpics]
  "nurse-call-systems":
    "/images/services/service-appel-infirmier.jpeg",


  // ════════════════════════════════════════════════════════════════════════
  // FLUIDES INDUSTRIELS & TERTIAIRES — 7 pages
  // ════════════════════════════════════════════════════════════════════════

  // Blue insulated HVAC ductwork in industrial ceiling [bcpics]
  "hvac-cvc":
    "/images/services/service-hvac-ductwork.jpeg",

  // Industrial compressor/utility room — blue equipment and pressure vessels [bcpics]
  "industrial-utilities":
    "/images/services/service-air-comprime-room.jpeg",

  // Blue compressed-air piping network in clean-room environment [bcpics]
  "compressed-air":
    "/images/services/service-compressed-air-piping.jpeg",

  // Colorful plumbing pipe network (blue/green/red) with pressure gauges [bcpics]
  "plumbing-sanitary":
    "/images/services/service-plomberie.jpeg",

  // Oxygen / Air / Vacuum medical gas distribution panel with copper pipes [bcpics]
  "medical-gas":
    "/images/services/service-gaz-medical.jpeg",

  // Changi Airport "Jewel" Rain Vortex — architectural indoor water fountain [unsplash]
  "pools-fountains":
    "/images/services/service-fountain.jpeg",

  // Aerial drone view of large circular concrete water storage tank [unsplash]
  "water-tanks":
    "/images/services/service-water-tank.jpeg",


  // ════════════════════════════════════════════════════════════════════════
  // ÉLECTRICITÉ INDUSTRIELLE & TERTIAIRE — 3 pages
  // ════════════════════════════════════════════════════════════════════════

  // Electrician with gloves testing electrical panel with multimeter probes [bcpics]
  "electrical-installation":
    "/images/services/service-electrician-panel.jpeg",

  // Helmeted/masked technician inspecting large Mitsubishi circuit breakers — clean, no watermark [pexels]
  "thermographic-inspection":
    "/images/services/service-thermographie-new.jpeg",

  // Industrial switchboard interior: DIN rail components, breakers, wiring [bcpics]
  "electrical-cabinet-assembly":
    "/images/services/service-armoire-electrique.jpeg",


  // ════════════════════════════════════════════════════════════════════════
  // INGÉNIERIE & SERVICES — 7 pages
  // ════════════════════════════════════════════════════════════════════════

  // Engineer (KRA) drawing detailed technical plans on large paper roll [unsplash]
  "design-studies":
    "/images/services/service-conception-etudes.jpeg",

  // Technician closely examining relay component at open electrical cabinet [pexels]
  "technical-support":
    "/images/services/service-tech-support.jpeg",

  // Mechanic with wrench set examining machinery — repair/troubleshooting context [pexels]
  "troubleshooting-assistance":
    "/images/services/service-maintenance-work2.jpeg",

  // Construction/installation team on large technical worksite [unsplash]
  "installation":
    "/images/services/service-installation-worksite.jpeg",

  // Large industrial plant exterior: orange pipes, cooling fans, chimneys [pexels]
  "equipment-sales":
    "/images/services/service-industrial-equipment.jpeg",

  // Rooftop HVAC/mechanical units requiring regular scheduled maintenance [bcpics]
  "preventive-corrective-maintenance":
    "/images/services/service-hvac-roof.jpeg",

  // "COLONNE SECHE" labeled safety signage outlets — text-based safety signs [bcpics]
  "signalisation":
    "/images/services/service-colonnes-seches.jpeg",
};
