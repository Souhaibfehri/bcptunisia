import { defineField, defineType } from "sanity";

export const contactPageSettings = defineType({
  name: "contactPageSettings",
  title: "Page Contact",
  type: "document",
  fields: [
    defineField({ name: "lead", title: "Chapô sous le H1", type: "localeText" }),
    defineField({
      name: "asideTitle",
      title: "Titre encadré coordonnées",
      type: "localeString",
    }),
    defineField({
      name: "asideIntro",
      title: "Texte encadré coordonnées",
      type: "localeText",
    }),
    defineField({
      name: "mapHint",
      title: "Texte sous la carte / plan",
      type: "localeString",
    }),
    defineField({
      name: "pageImage",
      title: "Image de page (optionnel)",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
