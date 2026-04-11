import { defineField, defineType } from "sanity";

/** Short strings — hero, labels, etc. */
export const localeString = defineType({
  name: "localeString",
  title: "FR / EN / AR",
  type: "object",
  fields: [
    defineField({ name: "fr", title: "Français", type: "string" }),
    defineField({ name: "en", title: "English", type: "string" }),
    defineField({ name: "ar", title: "العربية", type: "string" }),
  ],
});

/** Longer copy — leads, asides, answers */
export const localeText = defineType({
  name: "localeText",
  title: "Texte FR / EN / AR",
  type: "object",
  fields: [
    defineField({ name: "fr", title: "Français", type: "text", rows: 4 }),
    defineField({ name: "en", title: "English", type: "text", rows: 4 }),
    defineField({ name: "ar", title: "العربية", type: "text", rows: 4 }),
  ],
});
