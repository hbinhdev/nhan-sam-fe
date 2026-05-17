"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/category-api";
import { cn } from "@/lib/utils";

type CategoryGridProps = {
  title?: string | null;
  subtitle?: string | null;
  categories: Category[];
};

const CATEGORY_ICONS = ["elderly", "bolt", "health_and_safety", "spa", "nutrition", "stethoscope"];

function toCategoryHref(category: Category) {
  const params = new URLSearchParams({ categorySlug: category.slug });
  return `/products?${params.toString()}`;
}

function buildCategoryDescription(category: Category) {
  if (typeof category.description === "string" && category.description.trim()) {
    return category.description.trim();
  }
  return `Khám phá các sản phẩm thuộc danh mục ${category.name.toLowerCase()} với chất lượng tuyển chọn.`;
}

export function CategoryGrid({ title, subtitle, categories }: CategoryGridProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [animateIn, setAnimateIn] = useState(true);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
        return;
      }
      if (window.innerWidth < 1024) {
        setCardsPerView(2);
        return;
      }
      setCardsPerView(3);
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, "vi")),
    [categories],
  );

  const total = sortedCategories.length;
  const maxStart = Math.max(0, total - cardsPerView);
  const clampedIndex = Math.min(Math.max(0, currentIndex), maxStart);
  const visibleCategories = sortedCategories.slice(
    clampedIndex,
    clampedIndex + cardsPerView,
  );

  useEffect(() => {
    if (currentIndex !== clampedIndex) {
      setCurrentIndex(clampedIndex);
    }
  }, [clampedIndex, currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [cardsPerView, total]);

  useEffect(() => {
    setAnimateIn(false);
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, [clampedIndex, cardsPerView]);

  const canSlideLeft = clampedIndex > 0;
  const canSlideRight = clampedIndex < maxStart;

  const goLeft = () => {
    if (!canSlideLeft) return;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const goRight = () => {
    if (!canSlideRight) return;
    setCurrentIndex((prev) => Math.min(maxStart, prev + 1));
  };

  return (
    <section className="w-full py-24 bg-white" id="categories">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center flex flex-col gap-3 mb-10">
          {subtitle ? (
            <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">{subtitle}</span>
          ) : null}
          {title ? <h2 className="text-3xl md:text-4xl font-serif text-primary">{title}</h2> : null}
        </div>

        {total === 0 ? (
          <div className="rounded-2xl border border-outline-variant bg-surface p-10 text-center text-on-surface-variant">
            Chưa có danh mục sản phẩm.
          </div>
        ) : (
          <div className="relative px-10 sm:px-12 lg:px-14">
            <button
              type="button"
              aria-label="Previous categories"
              onClick={goLeft}
              disabled={!canSlideLeft}
              className={cn(
                "absolute left-0 top-1/2 z-10 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-outline-variant bg-white/95 backdrop-blur flex items-center justify-center transition-colors shadow-sm",
                canSlideLeft
                  ? "text-primary hover:border-primary hover:bg-surface-container-low"
                  : "text-on-surface-variant/40 cursor-not-allowed",
              )}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            <button
              type="button"
              aria-label="Next categories"
              onClick={goRight}
              disabled={!canSlideRight}
              className={cn(
                "absolute right-0 top-1/2 z-10 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-outline-variant bg-white/95 backdrop-blur flex items-center justify-center transition-colors shadow-sm",
                canSlideRight
                  ? "text-primary hover:border-primary hover:bg-surface-container-low"
                  : "text-on-surface-variant/40 cursor-not-allowed",
              )}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>

            <div
              className={cn(
                "grid gap-6 md:gap-8 transition-all duration-300 ease-out",
                cardsPerView === 1
                  ? "grid-cols-1"
                  : cardsPerView === 2
                    ? "grid-cols-2"
                    : "grid-cols-3",
                animateIn ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2",
              )}
            >
              {visibleCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  icon={CATEGORY_ICONS[(clampedIndex + index) % CATEGORY_ICONS.length]}
                  title={category.name}
                  desc={buildCategoryDescription(category)}
                  onClick={() => router.push(toCategoryHref(category))}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-full text-left flex flex-col gap-6 border border-outline-variant bg-surface p-10 hover:border-secondary transition-all hover:shadow-xl group rounded-2xl"
    >
      <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center rounded-xl text-secondary">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-serif text-primary">{title}</h3>
        <p className="text-base text-on-surface-variant leading-relaxed line-clamp-3">{desc}</p>
      </div>
      <span className="text-[12px] font-bold tracking-[0.15em] uppercase text-secondary flex flex-row items-center gap-2 group-hover:translate-x-2 transition-transform">
        Xem sản phẩm <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </span>
    </button>
  );
}
