import { defineField, defineType } from "sanity";

export const clientReference = defineType({
  name: "clientReference",
  title: "Référence client",
  type: "document",
  fields: [
    defineField({
      name: "sortOrder",
      title: "Ordre d’affichage",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "nameFr",
      title: "Nom (FR)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "nameEn", title: "Name (EN)", type: "string" }),
    defineField({ name: "nameAr", title: "الاسم (AR)", type: "string" }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Catégorie (optionnel)",
      type: "string",
      description: "Pour filtres futurs sur la page Références",
    }),
  ],
  preview: {
    select: { title: "nameFr", media: "logo" },
  },
});
