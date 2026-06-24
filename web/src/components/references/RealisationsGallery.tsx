"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Realisation } from "@/data/realisations";

type Props = {
  items: Realisation[];
  /** Accessible label for each tile, e.g. "Réalisation BCP Tunisia" */
  itemLabel: string;
  closeLabel: string;
  prevLabel: string;
  nextLabel: string;
};

export function RealisationsGallery({
  items,
  itemLabel,
  closeLabel,
  prevLabel,
  nextLabel,
}: Props) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const show = useCallback(
    (next: (i: number) => number) =>
      setOpen((i) => (i === null ? i : (next(i) + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show((i) => i + 1);
      else if (e.key === "ArrowLeft") show((i) => i - 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, show]);

  if (items.length === 0) return null;

  const active = open === null ? null : items[open];

  return (
    <>
      <div className="gap-3 sm:columns-2 md:columns-3 lg:columns-4 lg:gap-4">
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`${itemLabel} ${i + 1}`}
            className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl border border-bcp-border bg-bcp-surface shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-bcp-gold lg:mb-4"
          >
            <Image
              src={item.src}
              alt=""
              width={item.w}
              height={item.h}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="h-auto w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={itemLabel}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label={closeLabel}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
          >
            ×
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              show((i) => i - 1);
            }}
            aria-label={prevLabel}
            className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20 md:left-6"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              show((i) => i + 1);
            }}
            aria-label={nextLabel}
            className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20 md:right-6"
          >
            ›
          </button>
          <figure
            className="relative max-h-[88vh] w-auto max-w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={active.src}
              alt=""
              width={active.w}
              height={active.h}
              sizes="92vw"
              className="max-h-[88vh] w-auto rounded-lg object-contain"
              priority
            />
            <figcaption className="mt-3 text-center text-xs text-white/60">
              {open !== null ? `${open + 1} / ${items.length}` : null}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
