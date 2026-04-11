import { defineField, defineType } from "sanity";

export const article = defineType({
  name: "article",
  title: "Actualité / article",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: { source: "title.fr", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Date de publication",
      type: "datetime",
    }),
    defineField({ name: "title", title: "Titre", type: "localeString", validation: (r) => r.required() }),
    defineField({ name: "excerpt", title: "Chapô", type: "localeText" }),
    defineField({ name: "body", title: "Corps", type: "localeText" }),
    defineField({
      name: "featuredImage",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: "title.fr", media: "featuredImage", date: "publishedAt" },
    prepare({ title, media, date }) {
      return {
        title: title || "Article",
        subtitle: date ? new Date(date).toLocaleDateString("fr") : "",
        media,
      };
    },
  },
});
