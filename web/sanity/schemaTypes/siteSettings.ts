import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Réglages site",
  type: "document",
  fields: [
    defineField({
      name: "companyName",
      title: "Raison sociale",
      type: "string",
      initialValue: "BCP Tunisia",
    }),
    defineField({
      name: "companyLegalLine",
      title: "Mention légale / baseline",
      type: "string",
      initialValue: "BE CLOSE PROTECTION",
    }),
    defineField({
      name: "tagline",
      title: "Accroche (footer, SEO)",
      type: "localeString",
    }),
    defineField({
      name: "headOfficeAddress",
      title: "Siège social (adresse)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "workshopAddress",
      title: "Atelier (adresse)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "emailPrimary",
      title: "E-mail principal",
      type: "string",
    }),
    defineField({
      name: "emailSecondary",
      title: "E-mail secondaire (DG, etc.)",
      type: "string",
    }),
    defineField({ name: "phoneLandline", title: "Téléphone fixe", type: "string" }),
    defineField({ name: "phoneMobile", title: "Mobile", type: "string" }),
    defineField({ name: "whatsappUrl", title: "Lien WhatsApp", type: "url" }),
    defineField({ name: "mapUrl", title: "Lien Google Maps", type: "url" }),
    defineField({
      name: "openingHours",
      title: "Horaires (optionnel)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "footerLegalNote",
      title: "Mention pied de page",
      type: "localeText",
    }),
    defineField({
      name: "socialLinkedin",
      title: "LinkedIn",
      type: "url",
    }),
    defineField({
      name: "socialFacebook",
      title: "Facebook",
      type: "url",
    }),
    defineField({
      name: "socialYoutube",
      title: "YouTube",
      type: "url",
    }),
    defineField({
      name: "contactFormRecipient",
      title: "E-mail destinataire formulaire",
      description: "Surchargé par CONTACT_FORM_RECIPIENT sur le serveur si défini.",
      type: "string",
    }),
    defineField({
      name: "contactFormSubjectPrefix",
      title: "Préfixe sujet e-mail (optionnel)",
      type: "string",
    }),
    defineField({
      name: "formSuccessMessage",
      title: "Message succès formulaire",
      type: "localeString",
    }),
    defineField({
      name: "formErrorMessage",
      title: "Message erreur formulaire",
      type: "localeString",
    }),
  ],
});
