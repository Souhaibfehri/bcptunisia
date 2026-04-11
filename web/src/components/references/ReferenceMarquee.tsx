"use client";

import Image from "next/image";
import type { ReferenceLogo } from "@/lib/getReferenceLogos";

type Props = {
  logos: ReferenceLogo[];
  ariaLabel: string;
  /** Slightly slower on narrow screens */
  className?: string;
};

export function ReferenceMarquee({ logos, ariaLabel, className = "" }: Props) {
  if (logos.length === 0) return null;

  const track = [...logos, ...logos];

  return (
    <div
      className={`ref-marquee-wrap relative overflow-hidden border-y border-white/10 bg-white/[0.04] py-8 ${className}`}
      aria-label={ariaLabel}
      role="region"
    >
      <div
        className="ref-marquee-track flex w-max items-center gap-12 md:gap-16"
        dir="ltr"
      >
        {track.map((logo, i) => (
          <figure
            key={`${logo.id}-${i}`}
            className="ref-marquee-item group/item relative flex h-14 w-36 shrink-0 items-center justify-center md:h-16 md:w-44"
          >
            <Image
              src={logo.src}
              alt=""
              width={176}
              height={64}
              className="max-h-12 w-auto max-w-[10rem] object-contain opacity-60 grayscale transition duration-300 group-hover/item:scale-[1.03] group-hover/item:opacity-100 group-hover/item:grayscale-0 md:max-h-14 md:max-w-[11rem]"
              sizes="(max-width: 768px) 140px, 176px"
            />
            <figcaption className="sr-only">{logo.name}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
