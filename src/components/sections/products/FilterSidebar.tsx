"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type FilterOptions = {
  usagePurposes: string[];
  ginsengAges: string[];
  brands: string[];
  origins: string[];
};

type FilterSidebarProps = {
  filters: {
    minPrice?: string;
    maxPrice?: string;
    usagePurpose?: string;
    ginsengAge?: string;
    brand?: string;
    origin?: string;
  };
  filterOptions: FilterOptions;
};

const PRICE_OPTIONS = [
  { label: "Dưới 1.000.000đ", minPrice: "0", maxPrice: "1000000" },
  {
    label: "1.000.000đ - 5.000.000đ",
    minPrice: "1000000",
    maxPrice: "5000000",
  },
  { label: "Trên 5.000.000đ", minPrice: "5000000", maxPrice: "" },
];

export function FilterSidebar({ filters, filterOptions }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handlePriceClick = (minPrice: string, maxPrice: string) => {
    const isActive =
      filters.minPrice === minPrice && (filters.maxPrice || "") === maxPrice;
    if (isActive) {
      updateParams({ minPrice: undefined, maxPrice: undefined });
      return;
    }

    updateParams({
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    });
  };

  const isPriceActive = (minPrice: string, maxPrice: string) => {
    return (
      filters.minPrice === minPrice && (filters.maxPrice || "") === maxPrice
    );
  };

  return (
    <aside className="lg:col-span-3 flex flex-col gap-10">
      <FilterSection title="Mức Giá">
        {PRICE_OPTIONS.map((item) => (
          <FilterItem
            key={item.label}
            label={item.label}
            active={isPriceActive(item.minPrice, item.maxPrice)}
            onClick={() => handlePriceClick(item.minPrice, item.maxPrice)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Công Dụng">
        {filterOptions.usagePurposes.length > 0 ? (
          filterOptions.usagePurposes.map((item) => (
            <FilterItem
              key={item}
              label={item}
              active={filters.usagePurpose === item}
              onClick={() =>
                updateParams({
                  usagePurpose:
                    filters.usagePurpose === item ? undefined : item,
                })
              }
            />
          ))
        ) : (
          <EmptyOption />
        )}
      </FilterSection>

      <FilterSection title="Độ Tuổi Của Sâm">
        {filterOptions.ginsengAges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filterOptions.ginsengAges.map((item) => {
              const active = filters.ginsengAge === item;
              return (
                <button
                  key={item}
                  onClick={() =>
                    updateParams({ ginsengAge: active ? undefined : item })
                  }
                  className={cn(
                    "px-3 py-1 font-bold text-[10px] rounded-md tracking-wider uppercase transition-colors",
                    active
                      ? "bg-secondary/10 text-secondary"
                      : "bg-surface-container-high text-on-surface-variant/60 hover:text-primary",
                  )}
                >
                  {item}
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyOption />
        )}
      </FilterSection>

      <FilterSection title="Thương Hiệu">
        {filterOptions.brands.length > 0 ? (
          filterOptions.brands.map((item) => (
            <FilterItem
              key={item}
              label={item}
              active={filters.brand === item}
              onClick={() =>
                updateParams({
                  brand: filters.brand === item ? undefined : item,
                })
              }
            />
          ))
        ) : (
          <EmptyOption />
        )}
      </FilterSection>

      <FilterSection title="Xuất Xứ">
        {filterOptions.origins.length > 0 ? (
          filterOptions.origins.map((item) => (
            <FilterItem
              key={item}
              label={item}
              active={filters.origin === item}
              onClick={() =>
                updateParams({
                  origin: filters.origin === item ? undefined : item,
                })
              }
            />
          ))
        ) : (
          <EmptyOption />
        )}
      </FilterSection>

      <button
        onClick={() =>
          updateParams({
            minPrice: undefined,
            maxPrice: undefined,
            usagePurpose: undefined,
            ginsengAge: undefined,
            brand: undefined,
            origin: undefined,
          })
        }
        className="h-11 rounded-lg border border-outline-variant text-sm font-bold tracking-widest uppercase text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
      >
        Xóa Bộ Lọc
      </button>

      <div className="p-8 bg-surface-container-low border border-outline-variant/30 rounded-2xl">
        <h4 className="text-xl font-serif text-primary mb-4">Chứng Nhận</h4>
        <p className="text-xs text-on-surface-variant mb-6 italic leading-relaxed">
          Mỗi sản phẩm của Heritage Ginseng đều đi kèm chứng thư kiểm định chất
          lượng và nguồn gốc xuất xứ chính hãng.
        </p>
        <div className="relative w-24 h-32 opacity-80">
          <Image
            alt="Heritage Ginseng Certification"
            src="/images/certification.png"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </aside>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-primary border-b border-outline-variant pb-2">
        {title}
      </h3>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function FilterItem({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer group text-left"
    >
      <div
        className={cn(
          "h-5 w-5 shrink-0 border transition-all flex items-center justify-center rounded-md",
          active
            ? "bg-primary border-primary"
            : "border-outline-variant group-hover:border-primary",
        )}
      >
        {active && (
          <span className="material-symbols-outlined text-white text-[14px] font-bold">
            check
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-sm transition-colors",
          active
            ? "text-primary font-bold"
            : "text-on-surface-variant group-hover:text-primary",
        )}
      >
        {label}
      </span>
    </button>
  );
}

function EmptyOption() {
  return (
    <span className="text-sm text-on-surface-variant/70">Dang cap nhat</span>
  );
}
