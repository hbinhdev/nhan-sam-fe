"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { formatCurrencyVND } from "@/lib/product-api";

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddToCart = (item: {
    id: string;
    name: string;
    price: number;
    image: string;
    sku?: string;
    brand?: string;
  }) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      sku: item.sku,
      brand: item.brand,
    });
  };

  return (
    <main className="max-w-screen-2xl mx-auto px-6 md:px-12 py-16 min-h-screen">
      <div className="mb-12">
        <h1 className="text-display-lg text-primary mb-4">Sản phẩm yêu thích</h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Lưu lại những sản phẩm phù hợp để xem lại và thêm vào giỏ hàng bất cứ lúc nào.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-20 px-6 text-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant">favorite</span>
          <h2 className="mt-4 text-headline-sm text-on-surface">Danh sách yêu thích đang trống</h2>
          <p className="mt-2 text-on-surface-variant">Hãy thêm sản phẩm bạn quan tâm từ trang danh sách hoặc trang chi tiết.</p>
          <Link
            href="/products"
            className="mt-8 inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-bold text-on-primary"
          >
            KHÁM PHÁ SẢN PHẨM
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-outline-variant/30 bg-white p-5 flex flex-col gap-4"
            >
              <Link href={item.href || `/products/${item.id}`} className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-lg bg-surface-container-low overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || "/images/product-root.png"}
                    alt={item.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-primary line-clamp-2">{item.name}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">{formatCurrencyVND(item.price)}</p>
                </div>
              </Link>

              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleAddToCart(item)}
                  className="flex-1 h-11 rounded-lg bg-primary text-on-primary text-sm font-bold"
                >
                  Thêm vào giỏ
                </button>
                <button
                  type="button"
                  onClick={() => removeFromWishlist(item.id)}
                  className="h-11 px-4 rounded-lg border border-outline-variant text-on-surface-variant hover:text-primary"
                >
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
