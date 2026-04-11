import { referenceClients } from "./references";

/** Number of logo files shipped under `public/references/logos/ref-XX.png` */
export const LOCAL_REFERENCE_LOGO_FILE_COUNT = 23;

export type LocalReferenceLogo = {
  id: string;
  name: string;
  src: string;
};

export function getLocalReferenceLogoEntries(): LocalReferenceLogo[] {
  return referenceClients
    .slice(0, LOCAL_REFERENCE_LOGO_FILE_COUNT)
    .map((name, i) => ({
      id: `local-${i}`,
      name,
      src: `/references/logos/ref-${String(i + 1).padStart(2, "0")}.png`,
    }));
}
