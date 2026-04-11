"use client";

import { useState } from "react";

type Item = { id: string; q: string; a: string };

export function FaqAccordion({
  title,
  items,
}: {
  title: string;
  items: Item[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-bcp-border bg-bcp-cream/40 py-14">
      <div className="mx-auto max-w-3xl px-4 lg:px-6">
        <h2 className="text-xl font-semibold text-bcp-anthracite">{title}</h2>
        <ul className="mt-6 space-y-2">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li
                key={item.id}
                className="overflow-hidden rounded-xl border border-bcp-border bg-white"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-start text-sm font-medium text-bcp-anthracite"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  {item.q}
                  <span className="text-bcp-gold" aria-hidden>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-bcp-border px-4 py-3 text-sm leading-relaxed text-bcp-muted">
                    {item.a}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
