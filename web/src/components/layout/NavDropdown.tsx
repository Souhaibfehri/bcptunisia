"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import type { MainNavKey } from "@/data/nav";
import { mainNavHrefs } from "@/data/nav";

type Props = {
  groupLabel: string;
  itemKeys: MainNavKey[];
  tItem: (key: MainNavKey) => string;
};

export function NavDropdown({ groupLabel, itemKeys, tItem }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-bcp-anthracite hover:text-bcp-copper"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {groupLabel}
        <span className="text-bcp-muted" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="absolute start-0 top-full z-50 pt-2">
          <ul
            className="min-w-[14rem] rounded-xl border border-bcp-border bg-white py-2 shadow-xl"
            role="menu"
          >
            {itemKeys.map((key) => (
              <li key={key} role="none">
                <Link
                  href={mainNavHrefs[key]}
                  role="menuitem"
                  className="block px-4 py-2.5 text-sm text-bcp-muted hover:bg-bcp-surface hover:text-bcp-anthracite"
                  onClick={() => setOpen(false)}
                >
                  {tItem(key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
