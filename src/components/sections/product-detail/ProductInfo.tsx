"use client";

type ProductInfoProps = {
  id?: string;
  name?: string;
  shortDescription?: string;
  description?: string;
  price?: string;
  priceValue?: number;
  image?: string;
  origin?: string;
  brand?: string;
  sku?: string | null;
  averageRating?: number;
  totalReviews?: number;
};

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export function ProductInfo({
  id,
  name = "Imperial Heritage Red Ginseng",
  shortDescription,
  description = "A masterfully aged concentrate derived from the heart of the Geumsan mountains. Preserved through ancient steaming techniques to maximize ginsenoside potency.",
  price = "4.250.000đ",
  priceValue = 4250000,
  image = "",
  origin,
  brand,
  sku,
  averageRating = 0,
  totalReviews = 0,
}: ProductInfoProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const safeAverage = Number.isFinite(averageRating)
    ? Math.max(0, Math.min(5, averageRating))
    : 0;
  const displayAverage = totalReviews === 0 ? 5 : safeAverage;
  const filledStars = Math.round(displayAverage);
  const stars = [1, 2, 3, 4, 5].map((index) => index <= filledStars);
  const safeShortDescription =
    shortDescription?.trim() ||
    description?.trim() ||
    "Đang cập nhật mô tả sản phẩm";

  const handleAddToCart = () => {
    if (!id) return;
    addItem({
      id,
      name,
      price: priceValue,
      image,
      quantity,
      sku: sku || undefined,
      brand: brand || undefined,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/cart");
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <div className="md:col-span-7 flex flex-col gap-8 sticky top-32">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 text-secondary text-[11px] font-bold tracking-[0.2em] uppercase">
          <span>{origin || "6-Year Old"}</span>
          <span className="w-1 h-1 bg-secondary rounded-full"></span>
          <span>{brand || "Premium Extract"}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif text-primary leading-tight">
          {name}
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex text-secondary">
            {stars.map((active, i) => (
              <span
                key={i}
                className={`material-symbols-outlined text-[20px] ${active ? "fill-1" : "fill-0 opacity-40"}`}
              >
                star
              </span>
            ))}
          </div>
          <span className="text-on-surface-variant text-sm font-medium">
            {displayAverage.toFixed(1)} / 5 ({totalReviews} đánh giá)
          </span>
        </div>

        <p className="text-lg text-on-surface-variant leading-relaxed">
          {safeShortDescription}
        </p>

        <div className="text-sm text-on-surface-variant">
          SKU:{" "}
          <span className="font-semibold text-primary">
            {sku?.trim() || "Đang cập nhật"}
          </span>
        </div>

        <div className="text-3xl md:text-4xl font-serif text-primary border-y border-outline-variant/30 py-8 my-2">
          {price}
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">
            Số lượng
          </span>
          <div className="flex items-center border border-outline-variant/50 w-fit rounded-lg overflow-hidden h-14">
            <button
              onClick={decrementQuantity}
              className="px-6 hover:bg-surface-container transition-colors text-xl"
            >
              -
            </button>
            <input
              className="w-16 text-center border-none focus:ring-0 bg-transparent font-bold text-lg"
              type="text"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val > 0) setQuantity(val);
              }}
            />
            <button
              onClick={incrementQuantity}
              className="px-6 hover:bg-surface-container transition-colors text-xl"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <button
            onClick={handleAddToCart}
            className="w-full h-16 border-2 border-secondary text-secondary font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-secondary/5 transition-all"
          >
            THÊM VÀO GIỎ HÀNG
          </button>
          <button
            onClick={handleBuyNow}
            className="w-full h-16 bg-primary text-on-primary font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-primary-container transition-all shadow-lg active:scale-[0.98]"
          >
            MUA NGAY
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-outline-variant/30 mt-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">
              verified
            </span>
            <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              Certified Organic
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">
              local_shipping
            </span>
            <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              Free Express Shipping
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
