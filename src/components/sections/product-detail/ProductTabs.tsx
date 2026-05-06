import { cn } from "@/lib/utils";

export function ProductTabs() {
  return (
    <section className="max-w-4xl mx-auto py-24 border-t border-outline-variant/30">
      {/* Tab Navigation */}
      <div className="flex border-b border-outline-variant/20 mb-12 overflow-x-auto scrollbar-hide">
        <TabButton active>Công dụng</TabButton>
        <TabButton>Thành phần</TabButton>
        <TabButton>Hướng dẫn sử dụng</TabButton>
        <TabButton>Câu hỏi thường gặp</TabButton>
      </div>

      {/* Tab Content */}
      <div className="flex flex-col gap-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
          <BenefitItem 
            icon="bolt" 
            title="Tăng cường sinh lực" 
            desc="Thúc đẩy năng lượng tự nhiên mà không gây cảm giác bồn chồn. Hỗ trợ sự minh mẫn và tập trung kéo dài suốt cả ngày."
          />
          <BenefitItem 
            icon="shield_with_heart" 
            title="Hệ miễn dịch" 
            desc="Giàu chất chống oxy hóa giúp tăng cường sức đề kháng tự nhiên và hỗ trợ chức năng miễn dịch khỏe mạnh."
          />
          <BenefitItem 
            icon="psychology" 
            title="Giảm căng thẳng" 
            desc="Đặc tính Adaptogenic giúp cơ thể quản lý căng thẳng thể chất và tinh thần, mang lại cảm giác cân bằng."
          />
          <BenefitItem 
            icon="bloodtype" 
            title="Tuần hoàn máu" 
            desc="Hỗ trợ lưu thông máu khỏe mạnh và sức khỏe tim mạch tổng thể theo kinh nghiệm y học cổ truyền."
          />
        </div>

        {/* Purity Pledge */}
        <div className="bg-surface-container-low p-10 border-l-4 border-primary rounded-r-2xl">
          <div className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase mb-4">Cam kết tinh khiết</div>
          <p className="font-serif italic text-xl text-primary/80 leading-relaxed">
            "Sử dụng 100% nhân sâm hồng Hàn Quốc 6 năm tuổi. Không chất phụ gia, không chất bảo quản, không đường nhân tạo. Chỉ có tinh túy thuần khiết từ núi rừng."
          </p>
        </div>
      </div>
    </section>
  );
}

function TabButton({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button className={cn(
      "px-8 py-5 text-[11px] font-bold tracking-widest uppercase transition-all shrink-0 border-b-2",
      active ? "border-primary text-primary" : "border-transparent text-on-surface-variant/60 hover:text-primary"
    )}>
      {children}
    </button>
  );
}

function BenefitItem({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <h3 className="text-xl font-serif text-primary">{title}</h3>
      <p className="text-on-surface-variant leading-relaxed">{desc}</p>
    </div>
  );
}
