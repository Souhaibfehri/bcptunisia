import { defineField, defineType } from "sanity";

const placementKeys = [
  { title: "Expertises (index)", value: "services-index" },
  { title: "Secteurs", value: "industries" },
  { title: "Maintenance", value: "maintenance" },
  { title: "Pilier — Sécurité incendie", value: "division-fire-safety" },
  { title: "Pilier — Sécurité électronique", value: "division-electronic-security" },
  { title: "Pilier — Fluides", value: "division-industrial-fluids" },
  { title: "Pilier — Électricité", value: "division-industrial-electrical" },
  { title: "Pilier — Ingénierie", value: "division-engineering-services" },
];

export const marketingVisuals = defineType({
  name: "marketingVisuals",
  title: "Visuels marketing",
  type: "document",
  fields: [
    defineField({
      name: "placements",
      title: "Images par page / pilier",
      type: "array",
      of: [
        {
          type: "object",
          name: "placement",
          fields: [
            defineField({
              name: "key",
              title: "Emplacement",
              type: "string",
              options: { list: placementKeys, layout: "dropdown" },
            }),
            defineField({
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            }),
            defineField({
              name: "alt",
              title: "Texte alternatif",
              type: "localeString",
            }),
          ],
          preview: {
            select: { key: "key", media: "image" },
            prepare({ key, media }) {
              return {
                title: placementKeys.find((p) => p.value === key)?.title || key,
                media,
              };
            },
          },
        },
      ],
    }),
  ],
});
