"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  desktopNavBlocks,
  mainNavHrefs,
  type DesktopNavBlock,
  type MainNavKey,
} from "@/data/nav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MegaMenu } from "./MegaMenu";
import { NavDropdown } from "./NavDropdown";

type HeaderProps = {
  showNewsInNav?: boolean;
  ctaQuoteOverride?: string | null;
};

export function Header({
  showNewsInNav = true,
  ctaQuoteOverride = null,
}: HeaderProps) {
  const t = useTranslations("nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  const tItem = (key: MainNavKey) => t(`items.${key}`);

  const navBlocks: DesktopNavBlock[] = useMemo(
    () =>
      desktopNavBlocks.map((block) => {
        if (block.kind === "dropdown" && block.group === "support") {
          return {
            ...block,
            keys: showNewsInNav
              ? block.keys
              : block.keys.filter((k) => k !== "news"),
          };
        }
        return block;
      }),
    [showNewsInNav],
  );

  const supportMobileKeys = (
    showNewsInNav
      ? (["industries", "maintenance", "faq", "news"] as const)
      : (["industries", "maintenance", "faq"] as const)
  ) satisfies readonly MainNavKey[];

  const ctaLabel = ctaQuoteOverride?.trim() || t("ctaQuote");

  return (
    <header className="sticky top-0 z-40 border-b border-bcp-border/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:gap-6 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/brand/logo.png"
            alt="BCP Tunisia"
            width={200}
            height={60}
            className="h-11 w-auto md:h-12"
            priority
          />
        </Link>
        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label={t("ariaMain")}
        >
          {navBlocks.map((block, i) => {
            if (block.kind === "link") {
              return (
                <Link
                  key={`${block.key}-${i}`}
                  href={mainNavHrefs[block.key]}
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-bcp-muted hover:text-bcp-anthracite"
                >
                  {tItem(block.key)}
                </Link>
              );
            }
            if (block.kind === "mega") {
              return <MegaMenu key={`mega-${i}`} />;
            }
            return (
              <NavDropdown
                key={block.group}
                groupLabel={t(`groups.${block.group}`)}
                itemKeys={block.keys}
                tItem={tItem}
              />
            );
          })}
        </nav>
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/contact"
            className="hidden rounded-full bg-gradient-gold px-4 py-2 text-sm font-semibold text-bcp-anthracite shadow-sm hover:opacity-95 md:inline-flex"
          >
            {ctaLabel}
          </Link>
          <LanguageSwitcher />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-bcp-border lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex flex-col gap-1">
              <span className="block h-0.5 w-5 bg-bcp-anthracite" />
              <span className="block h-0.5 w-5 bg-bcp-anthracite" />
              <span className="block h-0.5 w-5 bg-bcp-anthracite" />
            </span>
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="border-t border-bcp-border bg-white px-4 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href={mainNavHrefs.home}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-bcp-anthracite hover:bg-bcp-surface"
                onClick={() => setMobileOpen(false)}
              >
                {tItem("home")}
              </Link>
            </li>
            <li>
              <Link
                href={mainNavHrefs.company}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-bcp-anthracite hover:bg-bcp-surface"
                onClick={() => setMobileOpen(false)}
              >
                {tItem("company")}
              </Link>
            </li>
            <li>
              <Link
                href={mainNavHrefs.services}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-bcp-anthracite hover:bg-bcp-surface"
                onClick={() => setMobileOpen(false)}
              >
                {tItem("services")}
              </Link>
            </li>
            <li className="pt-2">
              <p className="px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-bcp-muted">
                {t("groups.projectsRefs")}
              </p>
              <ul className="mt-1">
                {(["references", "projects"] as const).map((key) => (
                  <li key={key}>
                    <Link
                      href={mainNavHrefs[key]}
                      className="block rounded-lg px-3 py-2 text-sm text-bcp-anthracite hover:bg-bcp-surface"
                      onClick={() => setMobileOpen(false)}
                    >
                      {tItem(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="pt-2">
              <p className="px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-bcp-muted">
                {t("groups.support")}
              </p>
              <ul className="mt-1">
                {supportMobileKeys.map((key) => (
                  <li key={key}>
                    <Link
                      href={mainNavHrefs[key]}
                      className="block rounded-lg px-3 py-2 text-sm text-bcp-anthracite hover:bg-bcp-surface"
                      onClick={() => setMobileOpen(false)}
                    >
                      {tItem(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link
                href={mainNavHrefs.contact}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-bcp-anthracite hover:bg-bcp-surface"
                onClick={() => setMobileOpen(false)}
              >
                {tItem("contact")}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="mt-2 block rounded-full bg-gradient-gold px-4 py-3 text-center text-sm font-semibold text-bcp-anthracite"
                onClick={() => setMobileOpen(false)}
              >
                {ctaLabel}
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}
