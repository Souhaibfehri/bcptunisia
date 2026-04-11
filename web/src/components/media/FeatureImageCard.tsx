import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/i18n/routing";

type Props = {
  href: string;
  src: string;
  alt: string;
  title: string;
  subtitle?: string;
  footer: ReactNode;
};

export function FeatureImageCard({
  href,
  src,
  alt,
  title,
  subtitle,
  footer,
}: Props) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-bcp-border bg-white shadow-sm transition hover:border-bcp-gold/45 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-lg font-semibold text-bcp-anthracite">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-sm text-bcp-muted">{subtitle}</p>
        ) : null}
        <span className="mt-4 text-sm font-medium text-bcp-copper">{footer}</span>
      </div>
    </Link>
  );
}
