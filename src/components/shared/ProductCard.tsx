"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps {
  id?: string;
  name?: string;
  price?: string;
  priceValue?: number;
  tag?: string;
  image?: string;
  subtitle?: string;
  aspectRatio?: "square" | "portrait";
  className?: string;
  href?: string;
  description?: string;
}

export function ProductCard({
  id,
  name,
  price,
  priceValue,
  tag,
  image,
  subtitle,
  aspectRatio = "square",
  className,
  href = "#",
  description,
}: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const safeName = name?.trim() || "Sản phẩm";
  const safePrice = price?.trim() || "1.234.567đ";
  const safeImage = image?.trim() || "/images/product-root.png";
  const safeId = id?.trim() || href || safeName;
  const inWishlist = isInWishlist(safeId);

  const fallbackDescription = "Sản phẩm nhân sâm thượng hạng bảo vệ sức khỏe toàn diện, bồi bổ cơ thể và nâng cao thể trạng vượt trội mỗi ngày.";
  const displayDescription = description?.trim() || fallbackDescription;

  const handleWishlistClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    toggleWishlist({
      id: safeId,
      name: safeName,
      price: Number.isFinite(priceValue) ? Number(priceValue) : 0,
      image: safeImage,
      href,
    });
  };

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col bg-white border border-stone-200/60 dark:border-stone-800/40 group rounded-2xl overflow-hidden hover:shadow-xl hover:border-yellow-600/30 transition-all duration-500 hover:-translate-y-1.5 flex-1",
        className,
      )}
    >
      <div
        className={cn(
          "overflow-hidden bg-stone-50/50 dark:bg-stone-900/10 p-6 flex items-center justify-center relative",
          aspectRatio === "square" ? "aspect-square" : "aspect-[4/5]",
        )}
      >
        <Image
          alt={`Sản phẩm ${safeName} của Heritage Ginseng`}
          src={safeImage}
          fill
          className="object-contain p-6 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {tag && (
          <div className="absolute top-4 left-4 bg-primary/95 text-on-primary text-xs font-semibold px-2.5 py-1 tracking-wider rounded-md shadow-sm backdrop-blur-sm z-10">
            {tag}
          </div>
        )}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={inWishlist ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          className={cn(
            "absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-sm backdrop-blur-sm transition-all duration-300",
            inWishlist
              ? "bg-primary text-on-primary"
              : "bg-white/95 dark:bg-stone-900/90 text-primary hover:bg-primary hover:text-on-primary hover:scale-110",
          )}
        >
          <span className="material-symbols-outlined text-[18px]">
            {inWishlist ? "favorite" : "favorite_border"}
          </span>
        </button>
      </div>
      <div className="p-5 flex flex-col bg-white dark:bg-stone-950/20 flex-1 justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          {subtitle && (
            <p className="text-[11px] font-bold text-secondary uppercase tracking-widest leading-none mb-0.5 opacity-80">
              {subtitle}
            </p>
          )}
          <h3 className="text-base font-serif font-semibold text-primary line-clamp-2 leading-snug group-hover:text-secondary transition-colors duration-300 min-h-[44px]">
            {safeName}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2 font-normal">
            {displayDescription}
          </p>
        </div>
        <div className="flex flex-row justify-between items-center pt-3.5 border-t border-stone-100 dark:border-stone-800/40">
          <span className="text-primary font-serif font-bold text-base md:text-lg">{safePrice}</span>
          <div className="bg-primary text-on-primary w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-all duration-300 shadow-sm group-hover:scale-105">
            <span className="material-symbols-outlined text-lg">shopping_bag</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
