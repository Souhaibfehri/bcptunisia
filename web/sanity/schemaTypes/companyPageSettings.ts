import { defineField, defineType } from "sanity";

export const companyPageSettings = defineType({
  name: "companyPageSettings",
  title: "Page Entreprise",
  type: "document",
  fields: [
    defineField({ name: "lead", title: "Chapô", type: "localeText" }),
    defineField({ name: "body1", title: "Paragraphe 1", type: "localeText" }),
    defineField({ name: "body2", title: "Paragraphe 2", type: "localeText" }),
    defineField({ name: "valuesTitle", title: "Titre valeurs", type: "localeString" }),
    defineField({
      name: "values",
      title: "Valeurs (liste)",
      type: "array",
      of: [
        {
          type: "object",
          name: "valueItem",
          fields: [{ name: "text", title: "Texte", type: "localeText" }],
        },
      ],
    }),
    defineField({
      name: "mediaHeading",
      title: "Bloc visuel — titre",
      type: "localeString",
    }),
    defineField({
      name: "mediaBody",
      title: "Bloc visuel — texte",
      type: "localeText",
    }),
    defineField({
      name: "mediaImage",
      title: "Bloc visuel — image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "mediaAlt",
      title: "Bloc visuel — alt (accessibilité)",
      type: "localeString",
    }),
  ],
});
