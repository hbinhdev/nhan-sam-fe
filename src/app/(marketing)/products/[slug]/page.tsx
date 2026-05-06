import { ProductGallery } from "@/components/sections/product-detail/ProductGallery";
import { ProductInfo } from "@/components/sections/product-detail/ProductInfo";
import { CertificationSection } from "@/components/sections/product-detail/CertificationSection";
import { ProductTabs } from "@/components/sections/product-detail/ProductTabs";
import { ProductReviews } from "@/components/sections/product-detail/ProductReviews";
import { ProductCard } from "@/components/shared/ProductCard";

export default function ProductDetailPage() {
  return (
    <main className="max-w-[1280px] mx-auto px-6 py-12 flex flex-col">
      {/* SECTION 1: PRODUCT HERO */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start mb-24">
        <ProductGallery />
        <ProductInfo />
      </section>

      {/* SECTION 2: CERTIFICATIONS & HERITAGE */}
      <CertificationSection />

      {/* SECTION 3: DETAILED INFO TABS */}
      <ProductTabs />

      {/* SECTION 4: REVIEWS */}
      <ProductReviews />

      {/* SECTION 5: RELATED PRODUCTS */}
      <section className="py-24 border-t border-outline-variant/30">
        <div className="flex items-center gap-6 mb-16">
          <h2 className="text-3xl font-serif text-primary shrink-0">Khám Phá Thêm</h2>
          <div className="h-px w-full bg-outline-variant/30"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ProductCard 
            name="Nhân Sâm Tẩm Mật Ong" 
            price="1.450.000đ" 
            subtitle="Heritage Selection" 
            image="/images/product-slices.png"
            aspectRatio="portrait"
          />
          <ProductCard 
            name="Nước Sâm Everyday Tonic" 
            price="2.100.000đ" 
            subtitle="Travel Companion" 
            image="/images/product-tea.png"
            aspectRatio="portrait"
          />
          <ProductCard 
            name="Nhân Sâm Khô Nguyên Củ" 
            price="5.800.000đ" 
            subtitle="Raw Essence" 
            image="/images/product-root.png"
            aspectRatio="portrait"
          />
          <ProductCard 
            name="Bột Cao Sâm Vàng" 
            price="3.250.000đ" 
            subtitle="Pure Concentrate" 
            image="/images/product-extract.png"
            aspectRatio="portrait"
          />
        </div>
      </section>
    </main>
  );
}
