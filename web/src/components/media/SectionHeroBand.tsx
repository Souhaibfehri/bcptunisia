import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  src: string;
  alt: string;
  children: ReactNode;
  /** Tailwind min-height classes */
  minHeight?: string;
  priority?: boolean;
};

/**
 * Full-bleed hero band with image, dark overlay, and foreground content.
 */
export function SectionHeroBand({
  src,
  alt,
  children,
  minHeight = "min-h-[220px] md:min-h-[300px]",
  priority = false,
}: Props) {
  return (
    <section className={`relative overflow-hidden ${minHeight}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
        priority={priority}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bcp-navy/82 via-bcp-navy/88 to-bcp-navy/93" />
      <div className="relative z-10 mx-auto flex min-h-[inherit] max-w-6xl flex-col justify-end px-4 py-12 text-white md:py-16 lg:px-6">
        {children}
      </div>
    </section>
  );
}
