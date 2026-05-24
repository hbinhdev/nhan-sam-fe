"use client";

import { useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { formatCurrencyVND } from "@/lib/product-api";
import { ProductCard } from "@/components/shared/ProductCard";

const ITEMS_PER_PAGE = 6;

export default function WishlistPage() {
  const { items } = useWishlist();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  // Ensure current page is within valid range
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedItems = items.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="max-w-screen-2xl mx-auto px-6 md:px-12 py-16 min-h-screen">
      <section className="text-center flex flex-col gap-4 mb-16">
        <span className="font-semibold text-sm tracking-wider text-secondary">
          Sản phẩm đã chọn
        </span>
        <h1 className="text-5xl md:text-6xl font-serif text-primary leading-[1.1] text-balance tracking-tight">
          Sản Phẩm Yêu Thích
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Lưu lại những sản phẩm sâm thượng hạng phù hợp với thể trạng của bạn để dễ dàng theo dõi, so sánh và thêm vào giỏ hàng bất cứ lúc nào.
        </p>
      </section>

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
        <div className="flex flex-col gap-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-[1024px] mx-auto w-full">
            {paginatedItems.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                name={item.name}
                price={formatCurrencyVND(item.price)}
                priceValue={item.price}
                image={item.image}
                href={item.href || `/products/${item.id}`}
                aspectRatio="square"
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <PaginationButton
                onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                disabled={safeCurrentPage === 1}
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </PaginationButton>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <PaginationButton
                  key={page}
                  active={page === safeCurrentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PaginationButton>
              ))}

              <PaginationButton
                onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                disabled={safeCurrentPage === totalPages}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </PaginationButton>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function PaginationButton({
  children,
  active = false,
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all text-sm font-bold ${
        active
          ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
          : "border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary bg-white"
      } ${disabled ? "pointer-events-none opacity-40" : ""}`}
    >
      {children}
    </button>
  );
}
