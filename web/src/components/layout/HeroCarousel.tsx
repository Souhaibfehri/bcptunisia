"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * 5 slides — one per service division — cycling automatically.
 * Only opacity is animated (no transition-all).
 */
const SLIDES = [
  {
    src: "/images/services/service-sprinkler-manifold.jpeg",
    alt: "Sécurité incendie — réseaux sprinkler",
  },
  {
    src: "/images/services/service-control-room.jpeg",
    alt: "Sécurité électronique — salle de supervision",
  },
  {
    src: "/images/services/service-hvac-ductwork.jpeg",
    alt: "Fluides industriels — CVC",
  },
  {
    src: "/images/services/service-electrician-panel.jpeg",
    alt: "Électricité industrielle — installation",
  },
  {
    src: "/images/services/service-installation-worksite.jpeg",
    alt: "Ingénierie & services — installation terrain",
  },
];

const INTERVAL_MS = 4500;
const FADE_MS = 1100;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setCurrent((c) => (c + 1) % SLIDES.length),
      INTERVAL_MS,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : 0,
            transition: `opacity ${FADE_MS}ms ease-in-out`,
            willChange: "opacity",
          }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            style={{ opacity: 0.48 }}
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  );
}
