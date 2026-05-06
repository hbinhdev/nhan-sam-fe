import Image from "next/image";
import { cn } from "@/lib/utils";

export function FilterSidebar() {
  return (
    <aside className="lg:col-span-3 flex flex-col gap-10">
      <FilterSection title="Mức Giá">
        <FilterItem label="Dưới 1.000.000đ" />
        <FilterItem label="1.000.000đ - 5.000.000đ" />
        <FilterItem label="Trên 5.000.000đ" active />
      </FilterSection>

      <FilterSection title="Công Dụng">
        <FilterItem label="Bồi bổ sức khỏe" />
        <FilterItem label="Tăng cường đề kháng" />
        <FilterItem label="Làm đẹp da" />
      </FilterSection>

      <FilterSection title="Độ Tuổi Sâm">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-secondary/10 text-secondary font-bold text-[10px] rounded-md tracking-wider uppercase">6 Năm Tuổi</span>
          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant/60 font-bold text-[10px] rounded-md tracking-wider uppercase">10 Năm Tuổi</span>
          <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant/60 font-bold text-[10px] rounded-md tracking-wider uppercase">Thiên Sâm</span>
        </div>
      </FilterSection>

      <div className="p-8 bg-surface-container-low border border-outline-variant/30 rounded-2xl">
        <h4 className="text-xl font-serif text-primary mb-4">Chứng Nhận</h4>
        <p className="text-xs text-on-surface-variant mb-6 italic leading-relaxed">
          Mọi sản phẩm của Heritage Ginseng đều đi kèm chứng thư kiểm định chất lượng và nguồn gốc xuất xứ chính hãng.
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

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-[12px] font-bold tracking-[0.2em] uppercase text-primary border-b border-outline-variant pb-2">{title}</h3>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

function FilterItem({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className={cn(
        "w-5 h-5 border transition-all flex items-center justify-center rounded-md",
        active ? "bg-primary border-primary" : "border-outline-variant group-hover:border-primary"
      )}>
        {active && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
      </div>
      <span className={cn(
        "text-sm transition-colors",
        active ? "text-primary font-bold" : "text-on-surface-variant group-hover:text-primary"
      )}>{label}</span>
    </label>
  );
}
