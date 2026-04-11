import { defineField, defineType } from "sanity";

export const faqItem = defineType({
  name: "faqItem",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({
      name: "category",
      title: "Catégorie (code court)",
      type: "string",
      description: "Ex. general, devis, maintenance",
    }),
    defineField({ name: "sortOrder", title: "Ordre", type: "number", initialValue: 0 }),
    defineField({ name: "question", title: "Question", type: "localeString" }),
    defineField({ name: "answer", title: "Réponse", type: "localeText" }),
  ],
  preview: {
    select: { q: "question.fr", cat: "category" },
    prepare({ q, cat }) {
      return { title: q || "Question", subtitle: cat };
    },
  },
});
