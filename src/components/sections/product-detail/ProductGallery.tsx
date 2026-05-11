"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

type ProductGalleryProps = {
  name?: string;
  imageUrl?: string;
  thumbnail?: string;
  images?: string[];
  videoUrl?: string | null;
};

type GalleryMedia = {
  type: "image" | "video";
  src: string;
  alt: string;
};

function toYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

export function ProductGallery({
  name = "Imperial Heritage Red Ginseng",
  imageUrl,
  thumbnail,
  images,
  videoUrl,
}: ProductGalleryProps) {
  const media = useMemo<GalleryMedia[]>(() => {
    const normalizedImages =
      images?.filter((item) => typeof item === "string" && item.trim().length > 0) ?? [];

    const fallback = thumbnail || imageUrl || "/images/product-imperial-main.png";
    const imageItems = (normalizedImages.length > 0 ? normalizedImages : [fallback]).map((src, idx) => ({
      type: "image" as const,
      src,
      alt: idx === 0 ? name : `${name} view ${idx + 1}`,
    }));

    if (!videoUrl || !videoUrl.trim()) {
      return imageItems;
    }

    return [
      ...imageItems,
      {
        type: "video" as const,
        src: videoUrl,
        alt: `${name} video`,
      },
    ];
  }, [images, imageUrl, name, thumbnail, videoUrl]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = media[selectedIndex] ?? media[0];

  return (
    <div className="md:col-span-5 grid grid-cols-12 gap-4">
      <div className="col-span-12 relative aspect-[4/5] bg-surface-container-low rounded-2xl overflow-hidden shadow-lg border border-outline-variant/30 group">
        {selected?.type === "video" ? (
          (() => {
            const embedUrl = toYouTubeEmbedUrl(selected.src);
            if (embedUrl) {
              return (
                <iframe
                  src={embedUrl}
                  title={selected.alt}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              );
            }

            if (isDirectVideo(selected.src)) {
              return <video src={selected.src} className="h-full w-full object-cover" controls playsInline />;
            }

            return (
              <div className="h-full w-full flex items-center justify-center text-on-surface-variant text-sm px-4 text-center">
                Video unavailable
              </div>
            );
          })()
        ) : (
          <Image
            alt={selected?.alt || name}
            src={selected?.src || "/images/product-imperial-main.png"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-1000"
            priority
          />
        )}
      </div>

      {media.map((item, idx) => (
        <button
          key={`${item.type}-${item.src}-${idx}`}
          type="button"
          onClick={() => setSelectedIndex(idx)}
          className={`col-span-4 aspect-square bg-surface-container-low rounded-xl overflow-hidden border relative group cursor-pointer ${
            idx === selectedIndex ? "border-secondary" : "border-outline-variant/20"
          }`}
          aria-label={`Select ${item.alt}`}
        >
          {item.type === "image" ? (
            <Image
              alt={item.alt}
              src={item.src}
              fill
              className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
            />
          ) : (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
