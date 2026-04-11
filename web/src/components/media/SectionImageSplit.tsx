import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  /** Text column */
  children: ReactNode;
  /** Optimized image (local /public or remote with next.config patterns) */
  src: string;
  alt: string;
  /** Show image on the start side (left in LTR) */
  imageSide?: "start" | "end";
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Editorial block: heading + copy beside a restrained industrial-style visual.
 */
export function SectionImageSplit({
  children,
  src,
  alt,
  imageSide = "end",
  className = "",
  sizes = "(max-width: 1024px) 100vw, 42vw",
  priority = false,
}: Props) {
  const image = (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-bcp-border bg-bcp-surface shadow-sm">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
        priority={priority}
      />
    </div>
  );

  return (
    <div
      className={`mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-6 ${className}`}
    >
      {imageSide === "start" ? (
        <>
          <div className="order-2 lg:order-1">{image}</div>
          <div className="order-1 lg:order-2">{children}</div>
        </>
      ) : (
        <>
          <div>{children}</div>
          <div>{image}</div>
        </>
      )}
    </div>
  );
}
