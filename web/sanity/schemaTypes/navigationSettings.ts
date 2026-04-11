import { defineField, defineType } from "sanity";

export const navigationSettings = defineType({
  name: "navigationSettings",
  title: "Navigation (léger)",
  type: "document",
  fields: [
    defineField({
      name: "ctaQuote",
      title: "Libellé CTA « Demander un devis »",
      type: "localeString",
    }),
    defineField({
      name: "showNewsInNav",
      title: "Afficher Actualités dans le menu Support",
      type: "boolean",
      initialValue: true,
    }),
  ],
});
