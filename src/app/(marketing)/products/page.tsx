import { ProductCard } from "@/components/shared/ProductCard";
import {
  FilterSidebar,
  type FilterOptions,
} from "@/components/sections/products/FilterSidebar";
import { CategoryTabs } from "@/components/sections/products/CategoryTabs";
import { getCategories, type Category } from "@/lib/category-api";
import {
  formatCurrencyVND,
  getProducts,
  type ProductSummary,
} from "@/lib/product-api";
import { cn } from "@/lib/utils";

type ProductsSearchParams = {
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  usagePurpose?: string;
  ginsengAge?: string;
  brand?: string;
  origin?: string;
};

type ProductsPageProps = {
  searchParams?: Promise<ProductsSearchParams>;
};

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

  return Array.from(new Set(normalized)).sort((a, b) => a.localeCompare(b, "vi"));
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
  const activeCategoryId = resolvedSearchParams?.categoryId;

  const activeFilters = {
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
    categoryError = "Khong tai duoc danh muc.";
  }

  try {
    const [filteredResponse, optionsResponse] = await Promise.all([
      getProducts({
        page: 1,
        limit: 12,
        categoryId: activeCategoryId,
        minPrice: parseNumber(activeFilters.minPrice),
        maxPrice: parseNumber(activeFilters.maxPrice),
        usagePurpose: activeFilters.usagePurpose,
        ginsengAge: activeFilters.ginsengAge,
        brand: activeFilters.brand,
        origin: activeFilters.origin,
      }),
      getProducts({
        page: 1,
        limit: 200,
      }),
    ]);

    products = filteredResponse.data;
    totalProducts = filteredResponse.total;

    filterOptions = buildFilterOptions(optionsResponse.data);
  } catch {
    productError = "Khong tai duoc san pham.";
  }

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-16 flex flex-col gap-12">
      {/* HEADER & TITLE */}
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

      {/* CATEGORY TABS */}
      <CategoryTabs
        categories={categories}
        activeCategoryId={activeCategoryId}
        currentQuery={resolvedSearchParams}
        errorMessage={categoryError}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        {/* SIDEBAR FILTERS */}
        <FilterSidebar filters={activeFilters} filterOptions={filterOptions} />

        {/* PRODUCT LISTING */}
        <div className="lg:col-span-9 flex flex-col gap-12">
          {/* Toolbar */}
          <div className="flex justify-between items-center pb-6 border-b border-outline-variant/30">
            <span className="text-sm text-on-surface-variant">
              Hiển thị {products.length}/{totalProducts} sản phẩm
            </span>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant/60 uppercase">
                Sắp xếp:
              </span>
              <select className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer p-0 pr-8">
                <option>Phổ biến nhất</option>
                <option>Giá cao đến thấp</option>
                <option>Giá thấp đến cao</option>
              </select>
            </div>
          </div>

          {productError ? (
            <div className="py-16 text-center text-on-surface-variant">
              {productError}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-on-surface-variant">
              Chua co san pham.
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

          {/* PAGINATION */}
          <div className="mt-12 flex justify-center gap-2">
            <PaginationButton active>1</PaginationButton>
            <PaginationButton>2</PaginationButton>
            <PaginationButton>3</PaginationButton>
            <PaginationButton>
              <span className="material-symbols-outlined text-sm">
                chevron_right
              </span>
            </PaginationButton>
          </div>
        </div>
      </div>
    </main>
  );
}

function PaginationButton({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "w-12 h-12 flex items-center justify-center rounded-xl transition-all text-sm font-bold",
        active
          ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
          : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}
