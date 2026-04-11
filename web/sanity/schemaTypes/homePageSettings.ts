import { defineField, defineType } from "sanity";

export const homePageSettings = defineType({
  name: "homePageSettings",
  title: "Page d’accueil",
  type: "document",
  fields: [
    defineField({ name: "heroKicker", title: "Sur-titre hero", type: "localeString" }),
    defineField({ name: "heroTitle", title: "Titre hero", type: "localeString" }),
    defineField({ name: "heroSubtitle", title: "Sous-titre hero", type: "localeText" }),
    defineField({ name: "heroCtaQuote", title: "CTA Devis", type: "localeString" }),
    defineField({ name: "heroCtaExpert", title: "CTA Expert", type: "localeString" }),
    defineField({ name: "heroCtaBrochure", title: "CTA Brochure", type: "localeString" }),
    defineField({ name: "heroFormTitle", title: "Titre encadré formulaire", type: "localeString" }),
    defineField({ name: "trustTitle", title: "Titre barre confiance", type: "localeString" }),
    defineField({
      name: "trustItems",
      title: "Barre confiance (5 puces)",
      type: "array",
      validation: (r) => r.max(6),
      of: [
        {
          type: "object",
          name: "trustItem",
          fields: [{ name: "text", title: "Texte", type: "localeString" }],
          preview: {
            select: { fr: "text.fr" },
            prepare({ fr }) {
              return { title: fr || "Item" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "heroImage",
      title: "Image hero (remplace le visuel par défaut)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "finalCtaTitle",
      title: "Bloc CTA final — titre",
      type: "localeString",
    }),
    defineField({
      name: "finalCtaBody",
      title: "Bloc CTA final — texte",
      type: "localeText",
    }),
    defineField({
      name: "finalCtaPrimary",
      title: "Bloc CTA final — bouton principal",
      type: "localeString",
    }),
    defineField({
      name: "finalCtaSecondary",
      title: "Bloc CTA final — bouton secondaire",
      type: "localeString",
    }),
  ],
});
