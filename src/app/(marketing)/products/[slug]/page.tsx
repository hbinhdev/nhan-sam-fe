import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/sections/product-detail/ProductGallery";
import { ProductInfo } from "@/components/sections/product-detail/ProductInfo";
import { CertificationSection } from "@/components/sections/product-detail/CertificationSection";
import { ProductTabs } from "@/components/sections/product-detail/ProductTabs";
import { ProductReviews } from "@/components/sections/product-detail/ProductReviews";
import { ProductCard } from "@/components/shared/ProductCard";
import {
  formatCurrencyVND,
  getProductById,
  getProducts,
  type ProductSummary,
} from "@/lib/product-api";

const RELATED_PRODUCTS_LIMIT = 4;

function mergeUniqueProducts(
  primary: ProductSummary[],
  secondary: ProductSummary[],
  currentProductId: string,
  limit: number,
) {
  const uniqueMap = new Map<string, ProductSummary>();

  [...primary, ...secondary].forEach((item) => {
    if (item.id !== currentProductId && !uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item);
    }
  });

  return Array.from(uniqueMap.values()).slice(0, limit);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product = null;
  try {
    product = await getProductById(slug);
  } catch {
    return (
      <main className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="py-24 text-center text-on-surface-variant">
          Không tìm thấy sản phẩm.
        </div>
      </main>
    );
  }

  if (!product) {
    notFound();
  }

  let relatedProducts: ProductSummary[] = [];
  try {
    const byCategoryResponse = await getProducts({
      page: 1,
      limit: RELATED_PRODUCTS_LIMIT + 2,
      categoryId: product.category?.id,
    });

    const byCategory = byCategoryResponse.data.filter(
      (item) => item.id !== product.id,
    );

    if (byCategory.length >= RELATED_PRODUCTS_LIMIT) {
      relatedProducts = byCategory.slice(0, RELATED_PRODUCTS_LIMIT);
    } else {
      const fallbackResponse = await getProducts({
        page: 1,
        limit: RELATED_PRODUCTS_LIMIT + 6,
      });

      relatedProducts = mergeUniqueProducts(
        byCategory,
        fallbackResponse.data,
        product.id,
        RELATED_PRODUCTS_LIMIT,
      );
    }
  } catch {
    relatedProducts = [];
  }

  return (
    <main className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col">
      {/* SECTION 1: PRODUCT HERO */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start mb-24">
        <ProductGallery
          name={product.name}
          imageUrl={product.imageUrl || product.thumbnail || undefined}
        />
        <ProductInfo
          name={product.name}
          description={product.description || undefined}
          price={formatCurrencyVND(product.price)}
          origin={product.origin || undefined}
          brand={product.brand || undefined}
        />
      </section>

      {/* SECTION 2: CERTIFICATIONS & HERITAGE */}
      <CertificationSection />

      {/* SECTION 3: DETAILED INFO TABS */}
      <ProductTabs product={product} />

      {/* SECTION 4: REVIEWS */}
      <ProductReviews />

      {/* SECTION 5: RELATED PRODUCTS */}
      <section className="py-24 border-t border-outline-variant/30">
        <div className="flex items-center gap-6 mb-16">
          <h2 className="text-3xl font-serif text-primary shrink-0">
            Khám Phá Thêm
          </h2>
          <div className="h-px w-full bg-outline-variant/30"></div>
        </div>

        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                name={item.name}
                price={formatCurrencyVND(item.price)}
                subtitle={
                  item.brand && item.origin
                    ? `${item.origin} • ${item.brand}`
                    : item.brand || item.origin || "Heritage Selection"
                }
                tag={item.category?.name || undefined}
                image={
                  item.imageUrl || item.thumbnail || "/images/product-root.png"
                }
                aspectRatio="portrait"
                href={`/products/${item.slug || item.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-on-surface-variant">
            Chưa có sản phẩm liên quan.
          </div>
        )}
      </section>
    </main>
  );
}
