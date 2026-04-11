import Image from "next/image";

type Item = { src: string; alt: string };

/**
 * Simple responsive grid for future project / reference galleries.
 */
export function GalleryGrid({ items }: { items: Item[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 md:grid-cols-3 lg:gap-4 lg:px-6">
      {items.map((it, i) => (
        <div
          key={`${it.src}-${i}`}
          className="relative aspect-[4/3] overflow-hidden rounded-xl border border-bcp-border bg-bcp-surface"
        >
          <Image
            src={it.src}
            alt={it.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
}
