import { ProductCard } from "@/components/shared/ProductCard";
import Link from "next/link";
import {
  FilterSidebar,
  type FilterOptions,
} from "@/components/sections/products/FilterSidebar";
import { CategoryTabs } from "@/components/sections/products/CategoryTabs";
import { ProductSortSelect } from "@/components/sections/products/ProductSortSelect";
import { getCategories, type Category } from "@/lib/category-api";
import {
  formatCurrencyVND,
  getProducts,
  type ProductSummary,
} from "@/lib/product-api";
import { cn } from "@/lib/utils";

type ProductsSearchParams = {
  search?: string;
  page?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: string;
  maxPrice?: string;
  usagePurpose?: string;
  ginsengAge?: string;
  brand?: string;
  origin?: string;
  sortBy?: "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";
};

type ProductsPageProps = {
  searchParams?: Promise<ProductsSearchParams>;
};

const PRODUCTS_PER_PAGE = 9;

function parseNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toUniqueSorted(values: Array<string | null | undefined>) {
  const normalized = values
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));

  return Array.from(new Set(normalized)).sort((a, b) =>
    a.localeCompare(b, "vi"),
  );
}

function buildFilterOptions(products: ProductSummary[]): FilterOptions {
  return {
    usagePurposes: toUniqueSorted(products.map((item) => item.usagePurpose)),
    ginsengAges: toUniqueSorted(products.map((item) => item.ginsengAge)),
    brands: toUniqueSorted(products.map((item) => item.brand)),
    origins: toUniqueSorted(products.map((item) => item.origin)),
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawPage = Number(resolvedSearchParams?.page ?? "1");
  const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const activeCategoryId = resolvedSearchParams?.categoryId;
  const activeCategorySlug = resolvedSearchParams?.categorySlug;
  const activeSearch = resolvedSearchParams?.search?.trim() || undefined;
  const activeSortBy = resolvedSearchParams?.sortBy ?? "createdAt";
  const activeSortOrder = resolvedSearchParams?.sortOrder ?? "desc";

  const activeFilters = {
    search: activeSearch,
    minPrice: resolvedSearchParams?.minPrice,
    maxPrice: resolvedSearchParams?.maxPrice,
    usagePurpose: resolvedSearchParams?.usagePurpose,
    ginsengAge: resolvedSearchParams?.ginsengAge,
    brand: resolvedSearchParams?.brand,
    origin: resolvedSearchParams?.origin,
  };

  let categories: Category[] = [];
  let categoryError: string | null = null;

  let products: ProductSummary[] = [];
  let totalProducts = 0;
  let apiPage = currentPage;
  let apiLimit = PRODUCTS_PER_PAGE;
  let productError: string | null = null;

  let filterOptions: FilterOptions = {
    usagePurposes: [],
    ginsengAges: [],
    brands: [],
    origins: [],
  };

  try {
    categories = await getCategories();
  } catch {
    categoryError = "Không tải được danh mục.";
  }

  try {
    const [filteredResponse, optionsResponse] = await Promise.all([
      getProducts({
        search: activeSearch,
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        categoryId: activeCategoryId,
        categorySlug: activeCategorySlug,
        minPrice: parseNumber(activeFilters.minPrice),
        maxPrice: parseNumber(activeFilters.maxPrice),
        usagePurpose: activeFilters.usagePurpose,
        ginsengAge: activeFilters.ginsengAge,
        brand: activeFilters.brand,
        origin: activeFilters.origin,
        sortBy: activeSortBy,
        sortOrder: activeSortOrder,
      }),
      getProducts({
        search: activeSearch,
        page: 1,
        limit: 200,
      }),
    ]);

    products = filteredResponse.data;
    totalProducts = filteredResponse.total;
    apiPage = filteredResponse.page;
    apiLimit = filteredResponse.limit;

    filterOptions = buildFilterOptions(optionsResponse.data);
  } catch {
    productError = "Không tải được sản phẩm.";
  }

  const totalPages = Math.ceil(totalProducts / apiLimit);
  const canGoPrevious = apiPage > 1;
  const canGoNext = apiPage < totalPages;

  const paginationBaseQuery: Record<string, string | undefined> = {
    search: activeSearch,
    categoryId: activeCategoryId,
    categorySlug: activeCategorySlug,
    minPrice: activeFilters.minPrice,
    maxPrice: activeFilters.maxPrice,
    usagePurpose: activeFilters.usagePurpose,
    ginsengAge: activeFilters.ginsengAge,
    brand: activeFilters.brand,
    origin: activeFilters.origin,
    sortBy: activeSortBy,
    sortOrder: activeSortOrder,
  };

  const buildProductsLink = (page: number) => {
    const params = new URLSearchParams();

    Object.entries(paginationBaseQuery).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    if (page > 1) {
      params.set("page", String(page));
    }

    const queryString = params.toString();
    return queryString ? `/products?${queryString}` : "/products";
  };

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-16 flex flex-col gap-12">
      <section className="text-center flex flex-col gap-6 mb-8">
        <span className="font-bold text-[12px] tracking-[0.2em] uppercase text-secondary">
          Danh mục tuyển chọn
        </span>
        <h1 className="text-5xl md:text-6xl font-serif text-primary leading-[1.1] text-balance tracking-tight">
          Tinh Hoa Thảo Dược
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Khám phá bộ sưu tập nhân sâm di sản, được tuyển chọn kỹ lưỡng từ những
          vùng đất trù phú nhất, mang lại sức sống và sự trường thọ.
        </p>
      </section>

      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        currentQuery={{
          search: activeSearch,
          categoryId: activeCategoryId,
          categorySlug: activeCategorySlug,
          minPrice: activeFilters.minPrice,
          maxPrice: activeFilters.maxPrice,
          usagePurpose: activeFilters.usagePurpose,
          ginsengAge: activeFilters.ginsengAge,
          brand: activeFilters.brand,
          origin: activeFilters.origin,
          sortBy: activeSortBy,
          sortOrder: activeSortOrder,
        }}
        errorMessage={categoryError}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        <FilterSidebar filters={activeFilters} filterOptions={filterOptions} />

        <div className="lg:col-span-9 flex flex-col gap-12">
          <div className="flex justify-between items-center pb-6 border-b border-outline-variant/30">
            <span className="text-sm text-on-surface-variant">
              Hiển thị {products.length}/{totalProducts} sản phẩm
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant/60 uppercase">
                Sắp xếp:
              </span>
              <ProductSortSelect sortBy={activeSortBy} sortOrder={activeSortOrder} />
            </div>
          </div>

          {productError ? (
            <div className="py-16 text-center text-on-surface-variant">
              {productError}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant">
              Chưa có sản phẩm nào.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  price={formatCurrencyVND(product.price)}
                  subtitle={
                    product.origin && product.brand
                      ? `${product.origin} • ${product.brand}`
                      : (product.origin ?? product.brand ?? undefined)
                  }
                  tag={product.category?.name}
                  image={product.imageUrl || "/images/product-root.png"}
                  aspectRatio="portrait"
                  href={`/products/${product.slug || product.id}`}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <PaginationButton
                href={buildProductsLink(Math.max(1, apiPage - 1))}
                disabled={!canGoPrevious}
              >
                <span className="material-symbols-outlined text-sm">
                  chevron_left
                </span>
              </PaginationButton>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <PaginationButton
                    key={page}
                    href={buildProductsLink(page)}
                    active={page === apiPage}
                  >
                    {page}
                  </PaginationButton>
                ),
              )}

              <PaginationButton
                href={buildProductsLink(Math.min(totalPages, apiPage + 1))}
                disabled={!canGoNext}
              >
                <span className="material-symbols-outlined text-sm">
                  chevron_right
                </span>
              </PaginationButton>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function PaginationButton({
  children,
  active = false,
  disabled = false,
  href,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  href: string;
}) {
  const className = cn(
    "w-12 h-12 flex items-center justify-center rounded-xl transition-all text-sm font-bold",
    active
      ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
      : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary",
    disabled && "pointer-events-none opacity-40",
  );

  if (disabled) {
    return (
      <span className={className} aria-disabled="true">
        {children}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
