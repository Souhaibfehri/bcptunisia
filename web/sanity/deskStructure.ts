import type { StructureResolver } from "sanity/structure";

function singletonListItem(
  S: Parameters<StructureResolver>[0],
  schemaType: string,
  title: string,
  documentId = schemaType,
) {
  return S.listItem()
    .title(title)
    .id(documentId)
    .child(S.document().schemaType(schemaType).documentId(documentId));
}

export const deskStructure: StructureResolver = (S) =>
  S.list()
    .title("BCP Tunisia")
    .items([
      singletonListItem(S, "siteSettings", "Réglages site"),
      singletonListItem(S, "navigationSettings", "Navigation"),
      singletonListItem(S, "homePageSettings", "Page d’accueil"),
      singletonListItem(S, "contactPageSettings", "Page contact"),
      singletonListItem(S, "companyPageSettings", "Page entreprise"),
      singletonListItem(S, "marketingVisuals", "Visuels pages"),
      S.divider(),
      S.documentTypeListItem("faqItem").title("FAQ"),
      S.documentTypeListItem("article").title("Actualités"),
      S.documentTypeListItem("clientReference").title("Références (logos)"),
    ]);
