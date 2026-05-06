import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/category-api";

type CategoryTabsProps = {
  categories: Category[];
  activeCategoryId?: string;
  currentQuery?: Record<string, string | undefined>;
  errorMessage?: string | null;
};

function buildProductsLink(query: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `/products?${queryString}` : "/products";
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  currentQuery = {},
  errorMessage = null,
}: CategoryTabsProps) {
  if (errorMessage) {
    return (
      <section className="flex justify-center">
        <span className="text-sm text-on-surface-variant">{errorMessage}</span>
      </section>
    );
  }

  if (!categories.length) {
    return (
      <section className="flex justify-center">
        <span className="text-sm text-on-surface-variant">
          Chưa có danh mục sản phẩm.
        </span>
      </section>
    );
  }

  const baseQueryWithoutCategory = { ...currentQuery, categoryId: undefined };

  return (
    <section className="flex flex-wrap justify-center gap-4">
      <TabLink href={buildProductsLink(baseQueryWithoutCategory)} active={!activeCategoryId}>
        Tất cả
      </TabLink>
      {categories.map((category) => (
        <TabLink
          key={category.id}
          href={buildProductsLink({ ...currentQuery, categoryId: category.id })}
          active={activeCategoryId === category.id}
        >
          {category.name}
        </TabLink>
      ))}
    </section>
  );
}

function TabLink({
  children,
  href,
  active = false,
}: {
  children: React.ReactNode;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-8 py-3 font-bold text-[12px] tracking-widest uppercase transition-all rounded-lg",
        active
          ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
          : "bg-transparent text-secondary border border-outline-variant hover:border-secondary",
      )}
    >
      {children}
    </Link>
  );
}
