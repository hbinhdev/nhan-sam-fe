import { ProductCard } from "@/components/shared/ProductCard";
import { FilterSidebar } from "@/components/sections/products/FilterSidebar";
import { CategoryTabs } from "@/components/sections/products/CategoryTabs";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  return (
    <main className="max-w-[1280px] mx-auto px-6 py-16 flex flex-col gap-12">
      {/* HEADER & TITLE */}
      <section className="text-center flex flex-col gap-6 mb-8">
        <span className="font-bold text-[12px] tracking-[0.2em] uppercase text-secondary">Danh mục tuyển chọn</span>
        <h1 className="text-5xl md:text-6xl font-serif text-primary leading-[1.1] text-balance tracking-tight">Tinh Hoa Thảo Dược</h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Khám phá bộ sưu tập nhân sâm di sản, được tuyển chọn kỹ lưỡng từ những vùng đất trù phú nhất, mang lại sức sống và sự trường thọ.
        </p>
      </section>

      {/* CATEGORY TABS */}
      <CategoryTabs />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
        {/* SIDEBAR FILTERS */}
        <FilterSidebar />

        {/* PRODUCT LISTING */}
        <div className="lg:col-span-9 flex flex-col gap-12">
          {/* Toolbar */}
          <div className="flex justify-between items-center pb-6 border-b border-outline-variant/30">
            <span className="text-sm text-on-surface-variant">Hiển thị 6/12 sản phẩm</span>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold tracking-widest text-on-surface-variant/60 uppercase">Sắp xếp:</span>
              <select className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer p-0 pr-8">
                <option>Phổ biến nhất</option>
                <option>Giá cao đến thấp</option>
                <option>Giá thấp đến cao</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
            <ProductCard 
              name="Nhân Sâm Khô 6 Năm" 
              price="5.200.000đ" 
              subtitle="Hàn Quốc • 300G" 
              tag="Di Sản" 
              image="/images/product-root.png"
              aspectRatio="portrait"
            />
            <ProductCard 
              name="Cao Hồng Sâm Hoàng Gia" 
              price="8.500.000đ" 
              subtitle="Di Sản • 240G" 
              tag="Bán Chạy" 
              image="/images/product-extract.png"
              aspectRatio="portrait"
            />
            <ProductCard 
              name="Nhân Sâm Tươi Thượng Hạng" 
              price="3.800.000đ" 
              subtitle="Vùng Geumsan • 1KG" 
              image="/images/product-slices.png"
              aspectRatio="portrait"
            />
            <ProductCard 
              name="Tinh Chất Nước Sâm Đậm Đặc" 
              price="2.450.000đ" 
              subtitle="Hộp 30 Gói" 
              image="/images/product-tea.png"
              aspectRatio="portrait"
            />
            <ProductCard 
              name="Bộ Quà Tặng Bách Niên" 
              price="15.000.000đ" 
              subtitle="Phiên Bản Giới Hạn" 
              tag="Limited" 
              image="/images/product-giftbox.png"
              aspectRatio="portrait"
            />
            <ProductCard 
              name="Viên Nang Hồng Sâm Nguyên Chất" 
              price="1.200.000đ" 
              subtitle="60 Viên • 500MG" 
              image="/images/product-capsules.png"
              aspectRatio="portrait"
            />
          </div>

          {/* PAGINATION */}
          <div className="mt-12 flex justify-center gap-2">
            <PaginationButton active>1</PaginationButton>
            <PaginationButton>2</PaginationButton>
            <PaginationButton>3</PaginationButton>
            <PaginationButton>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </PaginationButton>
          </div>
        </div>
      </div>
    </main>
  );
}

function PaginationButton({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button className={cn(
      "w-12 h-12 flex items-center justify-center rounded-xl transition-all text-sm font-bold",
      active 
        ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
        : "border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary"
    )}>
      {children}
    </button>
  );
}
