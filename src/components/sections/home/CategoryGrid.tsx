import Link from "next/link";

function buildProductsFilterHref(usagePurpose: string) {
  const params = new URLSearchParams({ usagePurpose });
  return `/products?${params.toString()}`;
}

export function CategoryGrid() {
  return (
    <section className="w-full py-24 bg-white" id="categories">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center flex flex-col gap-3 mb-16">
          <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">
            Chọn sâm theo nhu cầu
          </span>
          <h2 className="text-3xl md:text-4xl font-serif text-primary">
            Giải Pháp Sức Khỏe Toàn Diện
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CategoryCard
            icon="elderly"
            title="Bồi bổ Tuổi Già"
            desc="Hỗ trợ tăng cường trí nhớ, cải thiện giấc ngủ và làm chậm quá trình lão hóa cho người cao tuổi."
            href={buildProductsFilterHref("tuổi già")}
          />
          <CategoryCard
            icon="bolt"
            title="Năng lượng Bền Bỉ"
            desc="Giải pháp phục hồi thể lực tức thì, tăng cường sự tập trung cho người làm việc cường độ cao."
            href={buildProductsFilterHref("năng lượng")}
          />
          <CategoryCard
            icon="health_and_safety"
            title="Hỗ trợ Phục Hồi"
            desc="Thúc đẩy quá trình tái tạo tế bào, nâng cao hệ miễn dịch sau ốm hoặc phẫu thuật."
            href={buildProductsFilterHref("phục hồi")}
          />
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  icon,
  title,
  desc,
  href,
}: {
  icon: string;
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <div className="flex flex-col gap-6 border border-outline-variant bg-surface p-10 hover:border-secondary transition-all hover:shadow-xl group rounded-2xl">
      <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center rounded-xl text-secondary">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-serif text-primary">{title}</h3>
        <p className="text-base text-on-surface-variant leading-relaxed">{desc}</p>
      </div>
      <Link
        className="text-[12px] font-bold tracking-[0.15em] uppercase text-secondary flex flex-row items-center gap-2 group-hover:translate-x-2 transition-transform"
        href={href}
      >
        Xem sản phẩm <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </Link>
    </div>
  );
}
