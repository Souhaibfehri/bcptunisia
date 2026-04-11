import type { DivisionId, ServiceSlug } from "@/data/services";

export type Locale = "fr" | "en" | "ar";

export type ServicePageBody = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroLead: string;
  intro: string;
  needsTitle: string;
  needs: string[];
  providesTitle: string;
  provides: string[];
  lifecycleTitle: string;
  lifecycle: { title: string; body: string }[];
  sectorsTitle: string;
  sectors: string[];
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export type PillarPageBody = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroLead: string;
  intro: string;
  scopeTitle: string;
  scopeItems: string[];
  approachTitle: string;
  approach: string[];
  lifecycleTitle: string;
  lifecycle: { title: string; body: string }[];
  sectorsTitle: string;
  sectors: string[];
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export type SubserviceMap = Record<ServiceSlug, Record<Locale, ServicePageBody>>;
export type PillarMap = Record<DivisionId, Record<Locale, PillarPageBody>>;
