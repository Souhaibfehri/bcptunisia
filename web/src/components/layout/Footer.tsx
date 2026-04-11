import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import type { Locale } from "@/content/types";
import { footerExploreKeys, mainNavHrefs } from "@/data/nav";
import { getResolvedSiteSettings } from "@/lib/cms/siteResolved";
import { pickLocale } from "@/lib/localePick";
import { mailHref, telHref } from "@/lib/telMail";

export async function Footer() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const settings = await getResolvedSiteSettings();

  const tagline = pickLocale(settings.tagline, locale, t("tagline"));
  const legal = pickLocale(settings.footerLegal, locale, t("legal"));

  return (
    <footer className="border-t border-bcp-border bg-bcp-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 lg:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold tracking-wide text-white">
              {settings.brandLine}
            </p>
            <p className="mt-3 text-sm text-white/70">{tagline}</p>
            <div className="mt-5 space-y-3 text-sm text-white/80">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-bcp-gold/90">
                  {locale === "fr"
                    ? "Siège"
                    : locale === "ar"
                      ? "المقر"
                      : "Head office"}
                </p>
                <p className="mt-1 leading-relaxed">{settings.headOfficeAddress}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-bcp-gold/90">
                  {locale === "fr"
                    ? "Atelier"
                    : locale === "ar"
                      ? "الورشة"
                      : "Workshop"}
                </p>
                <p className="mt-1 leading-relaxed">{settings.workshopAddress}</p>
              </div>
              <p>
                <a
                  href={telHref(settings.phoneLandline)}
                  className="hover:text-bcp-gold-bright"
                >
                  {settings.phoneLandline}
                </a>
              </p>
              <p>
                <a
                  href={telHref(settings.phoneMobile)}
                  className="hover:text-bcp-gold-bright"
                >
                  {settings.phoneMobile}
                </a>
              </p>
              <p>
                <a
                  href={mailHref(settings.emailPrimary)}
                  className="hover:text-bcp-gold-bright"
                >
                  {settings.emailPrimary}
                </a>
              </p>
              <p>
                <a
                  href={mailHref(settings.emailSecondary)}
                  className="hover:text-bcp-gold-bright"
                >
                  {settings.emailSecondary}
                </a>
              </p>
              {settings.whatsappUrl ? (
                <p>
                  <a
                    href={settings.whatsappUrl}
                    className="hover:text-bcp-gold-bright"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    WhatsApp
                  </a>
                </p>
              ) : null}
              {settings.mapUrl ? (
                <p>
                  <a
                    href={settings.mapUrl}
                    className="hover:text-bcp-gold-bright"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {locale === "fr"
                      ? "Google Maps"
                      : locale === "ar"
                        ? "خريطة"
                        : "Google Maps"}
                  </a>
                </p>
              ) : null}
              {settings.openingHours ? (
                <p className="text-xs text-white/60">{settings.openingHours}</p>
              ) : null}
            </div>
            {(settings.socialLinkedin || settings.socialFacebook || settings.socialYoutube) && (
              <ul className="mt-4 flex flex-wrap gap-3 text-xs text-white/70">
                {settings.socialLinkedin ? (
                  <li>
                    <a href={settings.socialLinkedin} className="hover:text-bcp-gold-bright" rel="noopener noreferrer" target="_blank">
                      LinkedIn
                    </a>
                  </li>
                ) : null}
                {settings.socialFacebook ? (
                  <li>
                    <a href={settings.socialFacebook} className="hover:text-bcp-gold-bright" rel="noopener noreferrer" target="_blank">
                      Facebook
                    </a>
                  </li>
                ) : null}
                {settings.socialYoutube ? (
                  <li>
                    <a href={settings.socialYoutube} className="hover:text-bcp-gold-bright" rel="noopener noreferrer" target="_blank">
                      YouTube
                    </a>
                  </li>
                ) : null}
              </ul>
            )}
            <p className="mt-4 text-xs text-white/50">{t("verifyRefs")}</p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-bcp-gold">
              {t("colExplore")}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              {footerExploreKeys.map((key) => (
                <li key={key}>
                  <Link
                    href={mainNavHrefs[key]}
                    className="hover:text-bcp-gold-bright"
                  >
                    {nav(`items.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-bcp-gold">
              {t("colServices")}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>
                <Link
                  href="/services/fire-safety"
                  className="hover:text-bcp-gold-bright"
                >
                  {nav("divisions.pillars.fire-safety.title")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services/electronic-security"
                  className="hover:text-bcp-gold-bright"
                >
                  {nav("divisions.pillars.electronic-security.title")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services/industrial-fluids"
                  className="hover:text-bcp-gold-bright"
                >
                  {nav("divisions.pillars.industrial-fluids.title")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services/industrial-electrical"
                  className="hover:text-bcp-gold-bright"
                >
                  {nav("divisions.pillars.industrial-electrical.title")}
                </Link>
              </li>
              <li>
                <Link
                  href="/services/engineering-services"
                  className="hover:text-bcp-gold-bright"
                >
                  {nav("divisions.pillars.engineering-services.title")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-semibold text-bcp-gold-bright">
              {t("ctaTitle")}
            </p>
            <p className="mt-2 text-sm text-white/75">{t("ctaBody")}</p>
            <Link
              href="/contact"
              className="mt-4 inline-flex rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-bcp-anthracite"
            >
              {t("ctaButton")}
            </Link>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-8 text-xs text-white/45 md:flex-row md:justify-between">
          <span>{legal}</span>
          <span>
            © {new Date().getFullYear()} {settings.companyName} — {t("rights")}
          </span>
        </div>
      </div>
    </footer>
  );
}
