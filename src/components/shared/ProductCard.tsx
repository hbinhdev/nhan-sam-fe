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
}: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const safeName = name?.trim() || "Sản phẩm";
  const safePrice = price?.trim() || "1.234.567đ";
  const safeImage = image?.trim() || "/images/product-root.png";
  const safeId = id?.trim() || href || safeName;
  const inWishlist = isInWishlist(safeId);

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
        "flex flex-col bg-white border border-outline-variant group rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300",
        className,
      )}
    >
      <div
        className={cn(
          "overflow-hidden bg-white p-8 flex items-center justify-center relative",
          aspectRatio === "square" ? "aspect-square" : "aspect-[4/5]",
        )}
      >
        <Image
          alt={`Sản phẩm ${safeName} của Heritage Ginseng`}
          src={safeImage}
          fill
          className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
        />
        {tag && (
          <div className="absolute top-4 left-4 bg-primary text-on-primary text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-md shadow-lg z-10">
            {tag}
          </div>
        )}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={inWishlist ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          className={cn(
            "absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-colors",
            inWishlist
              ? "bg-primary text-on-primary"
              : "bg-white/90 text-primary hover:bg-primary hover:text-on-primary",
          )}
        >
          <span className="material-symbols-outlined text-[20px]">
            {inWishlist ? "favorite" : "favorite_border"}
          </span>
        </button>
      </div>
      <div className="p-6 flex flex-col gap-4 bg-surface/30 flex-1">
        <div className="flex flex-col gap-2 flex-1">
          {subtitle && (
            <p className="text-[11px] font-bold text-on-surface-variant/60 tracking-[0.2em] uppercase">
              {subtitle}
            </p>
          )}
          <h3 className="text-lg font-serif text-primary min-h-[54px] leading-tight group-hover:text-secondary transition-colors">
            {safeName}
          </h3>
        </div>
        <div className="flex flex-row justify-between items-center mt-2 border-t border-outline-variant/20 pt-4">
          <span className="text-primary font-bold text-lg">{safePrice}</span>
          <div className="bg-primary text-on-primary w-11 h-11 rounded-full flex items-center justify-center hover:bg-primary-container transition-colors shadow-md">
            <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
