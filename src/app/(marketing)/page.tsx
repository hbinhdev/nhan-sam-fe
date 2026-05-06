import Link from "next/link";
import { ProductCard } from "@/components/shared/ProductCard";
import { Hero } from "@/components/sections/home/Hero";
import { Certifications } from "@/components/sections/home/Certifications";
import { CategoryGrid } from "@/components/sections/home/CategoryGrid";
import { BrandHeritage } from "@/components/sections/home/BrandHeritage";
import { Testimonials } from "@/components/sections/home/Testimonials";
import { ConsultationForm } from "@/components/sections/home/ConsultationForm";

export default function Home() {
  return (
    <>
      <Hero />
      <Certifications />
      <CategoryGrid />

      {/* BEST SELLERS - Kept here as it's simple or could be extracted too */}
      <section className="w-full py-24 bg-surface-container" id="best-sellers">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="flex flex-col gap-3">
              <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">Danh mục ưa chuộng</span>
              <h2 className="text-3xl md:text-4xl font-serif text-primary">Sản Phẩm Bán Chạy Nhất</h2>
            </div>
            <Link href="/products" className="text-secondary text-sm font-bold tracking-widest uppercase border-b-2 border-secondary pb-1 hover:opacity-70 transition-opacity">
              XEM TẤT CẢ
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProductCard 
              name="Cao Hồng Sâm 6 Năm Tuổi Gold" 
              price="2.450.000đ" 
              tag="6 Years Old" 
              image="/images/product-extract.png"
            />
            <ProductCard 
              name="Hồng Sâm Tẩm Mật Ong Lát" 
              price="1.250.000đ" 
              tag="Hồng Sâm Lát" 
              image="/images/product-slices.png"
            />
            <ProductCard 
              name="Trà Hồng Sâm Linh Chi Cao Cấp" 
              price="850.000đ" 
              tag="Premium Tea" 
              image="/images/product-tea.png"
            />
            <ProductCard 
              name="Viên Đạm Hồng Sâm Linh Chi" 
              price="1.850.000đ" 
              tag="Energy Boost" 
              image="/images/product-capsules.png"
            />
          </div>
        </div>
      </section>

      <BrandHeritage />
      <Testimonials />
      <ConsultationForm />
    </>
  );
}
