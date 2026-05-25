"use client";

import React, { useState, useEffect } from "react";
import { getCategories, type Category } from "@/lib/category-api";
import { LoadingLink } from "@/components/shared/routing/RouteLoadingProvider";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductsNavLink() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getCategories();
        if (active) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories for nav dropdown:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchCategories();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="relative flex items-center h-full py-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Trigger Link */}
      <LoadingLink
        href="/products"
        className={cn(
          "font-serif text-base font-semibold tracking-wide text-stone-600 dark:text-stone-400 transition-colors hover:text-primary dark:hover:text-red-500 flex items-center gap-1 cursor-pointer select-none",
          isHovered && "text-primary dark:text-red-500"
        )}
      >
        <span>Sản phẩm</span>
        <motion.span
          animate={{ rotate: isHovered ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="inline-flex"
        >
          <ChevronDown size={16} className="opacity-70" />
        </motion.span>
      </LoadingLink>

      {/* Dropdown Container */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 z-50 pt-2"
          >
            <div className="w-[520px] max-h-[480px] overflow-y-auto rounded-2xl border border-amber-600/10 bg-white/95 dark:bg-stone-950/95 dark:border-amber-900/30 p-6 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col gap-4">

              {/* Dropdown Header */}
              <div className="flex items-center justify-between border-b border-amber-500/10 pb-2">
                <span className="text-[10px] font-bold tracking-widest text-amber-600 dark:text-amber-500">
                  Danh mục sản phẩm
                </span>
                <LoadingLink
                  href="/products"
                  className="text-[11px] font-medium text-stone-400 hover:text-primary dark:hover:text-red-500 transition-colors"
                >
                  Xem tất cả
                </LoadingLink>
              </div>

              {/* Loader */}
              {loading && categories.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-stone-400 gap-2">
                  <Loader2 size={18} className="animate-spin text-primary dark:text-red-500" />
                  <span className="text-xs">Đang tải danh mục...</span>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 font-medium">
                  Chưa có danh mục sản phẩm.
                </div>
              ) : (
                /* Grid of Categories */
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {categories.map((category) => (
                    <LoadingLink
                      key={category.id}
                      href={`/products?categoryId=${category.id}`}
                      className="group flex items-center gap-3.5 p-2 rounded-xl transition-all duration-300 hover:bg-amber-50/60 dark:hover:bg-stone-900/40 border border-transparent hover:border-amber-500/10"
                    >
                      {/* Category Image Box */}
                      <div className="relative h-14 w-14 rounded-xl border border-stone-200/60 dark:border-stone-800/80 bg-stone-50 dark:bg-stone-900 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-115"
                          />
                        ) : (
                          <div className="text-[10px] font-bold text-stone-400 dark:text-stone-600 uppercase tracking-widest">
                            {category.name.substring(0, 2)}
                          </div>
                        )}
                        {/* Glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/0 via-amber-500/0 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Category Metadata */}
                      <div className="flex flex-col min-w-0">
                        <span className="font-serif text-sm font-bold text-stone-800 dark:text-stone-200 transition-colors group-hover:text-primary dark:group-hover:text-red-500 truncate">
                          {category.name}
                        </span>
                        {category.description ? (
                          <span className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5 max-w-[160px]">
                            {category.description}
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400 dark:text-stone-500 italic mt-0.5">
                            Khám phá sản phẩm
                          </span>
                        )}
                      </div>
                    </LoadingLink>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
