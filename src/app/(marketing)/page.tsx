import Link from "next/link";
import { ProductCard } from "@/components/shared/ProductCard";
import { Hero } from "@/components/sections/home/Hero";
import { Certifications } from "@/components/sections/home/Certifications";
import { CategoryGrid } from "@/components/sections/home/CategoryGrid";
import { BrandHeritage } from "@/components/sections/home/BrandHeritage";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { ConsultationForm } from "@/components/sections/home/ConsultationForm";
import { formatCurrencyVND, getProducts } from "@/lib/product-api";

export default async function Home() {
  let bestSellerProducts: Awaited<ReturnType<typeof getProducts>>["data"] = [];

  try {
    const response = await getProducts({
      isBestSeller: true,
      limit: 4,
      page: 1,
    });
    bestSellerProducts = response.data.slice(0, 4);
  } catch {
    bestSellerProducts = [];
  }

  return (
    <>
      <Hero />
      <Certifications />
      <CategoryGrid />

      <section className="w-full py-24 bg-surface-container" id="best-sellers">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="flex flex-col gap-3">
              <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">
                Danh mục ưa chuộng
              </span>
              <h2 className="text-3xl md:text-4xl font-serif text-primary">
                Sản Phẩm Bán Chạy Nhất
              </h2>
            </div>
            <Link
              href="/products"
              className="text-secondary text-sm font-bold tracking-widest uppercase border-b-2 border-secondary pb-1 hover:opacity-70 transition-opacity"
            >
              XEM TẤT CẢ
            </Link>
          </div>

          {bestSellerProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestSellerProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.name}
                  price={formatCurrencyVND(product.price)}
                  tag={product.ginsengAge ?? product.category?.name ?? undefined}
                  image={
                    product.imageUrl ||
                    product.thumbnail ||
                    "/images/product-root.png"
                  }
                  href={`/products/${product.slug || product.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-on-surface-variant">
              Chưa có sản phẩm bán chạy.
            </div>
          )}
        </div>
      </section>

      <BrandHeritage />
      <Testimonials />
      <ConsultationForm />
    </>
  );
}
