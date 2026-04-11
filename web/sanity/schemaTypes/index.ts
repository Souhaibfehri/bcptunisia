import { article } from "./article";
import { companyPageSettings } from "./companyPageSettings";
import { contactPageSettings } from "./contactPageSettings";
import { faqItem } from "./faqItem";
import { homePageSettings } from "./homePageSettings";
import { localeString, localeText } from "./localeBlocks";
import { marketingVisuals } from "./marketingVisuals";
import { navigationSettings } from "./navigationSettings";
import { clientReference } from "./clientReference";
import { siteSettings } from "./siteSettings";

export const schemaTypes = [
  localeString,
  localeText,
  siteSettings,
  navigationSettings,
  homePageSettings,
  contactPageSettings,
  companyPageSettings,
  marketingVisuals,
  faqItem,
  article,
  clientReference,
];
