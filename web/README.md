# BCP Tunisia — site web

## Démarrage

```bash
npm install
npm run dev
```

Site multilingue : `/fr/`, `/en/`, `/ar/` (arabe en RTL).

## Build production

```bash
npm run build
npm start
```

## Déploiement (Hostinger / Node)

1. Build sur la machine ou en CI : `npm run build`
2. Déployer le dossier du projet (avec `node_modules` ou `npm ci --omit=dev` sur le serveur)
3. Commande de démarrage : `npm start` (port selon hébergeur)
4. Définir `metadataBase` dans `src/app/[locale]/layout.tsx` avec votre domaine final.

## Leads / formulaire

`POST /api/contact` — validation Zod, champ anti-spam `website` (vide). Brancher e-mail, webhook ou CRM dans `src/app/api/contact/route.ts` (log console pour l’instant).

## Contenu technique des pages services

Textes longs FR/EN/AR : `src/content/subservices/chunks-part*.ts` et `src/content/pillars.ts`. Libellés menu méga-menu : `src/data/serviceNavLabels.ts`. UI : `src/messages/*.json`.

## Logo

Fichier attendu : `public/brand/logo.png`.

## Contenu modifiable (CMS + repli local)

- **Sanity Studio** : `/studio` (hors préfixe de langue). Copier `.env.example` vers `.env.local` et renseigner `NEXT_PUBLIC_SANITY_PROJECT_ID` (+ `NEXT_PUBLIC_SANITY_DATASET` si besoin). Structure du desk : `sanity/deskStructure.ts`, schémas : `sanity/schemaTypes/`. L’accès éditeur repose sur les comptes Sanity ; optionnel : auth HTTP devant `/studio` sur l’hébergeur.
- **Réglages site** (singleton `siteSettings`) : coordonnées réelles (siège, atelier, tél., e-mails, WhatsApp, carte, réseaux), mentions légales pied de page, messages succès/erreur du formulaire, e-mail destinataire du formulaire (surcharge possible par variable serveur `CONTACT_FORM_RECIPIENT`).
- **Navigation (léger)** (`navigationSettings`) : libellé CTA devis par langue, affichage d’« Actualités » dans le menu Support.
- **Page d’accueil** (`homePageSettings`) : hero, barre de confiance, CTA finaux, image hero.
- **Contact** (`contactPageSettings`) : chapô, encadré latéral, image de page.
- **Entreprise** (`companyPageSettings`) : textes + valeurs + bloc visuel.
- **Visuels** (`marketingVisuals`) : images par emplacement (index expertises, secteurs, maintenance, chaque pilier).
- **FAQ** : documents `faqItem` (remplacent les 4 questions JSON si au moins une entrée existe).
- **Actualités** : documents `article` (liste + `/fr/news/[slug]`, etc.).
- **Références logos** : type `reference` — repli local `public/references/logos/` + `src/data/references.ts` si vide.
- **Textes UI / SEO** : `src/messages/*.json` (repli si champs CMS vides).
- **Expertises longues** : `src/content/` et `src/data/services.ts`.
