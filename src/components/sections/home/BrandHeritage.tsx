import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BrandHeritage() {
  return (
    <section className="w-full py-24 bg-white overflow-hidden" id="heritage">
      <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
        <div className="relative order-2 md:order-1">
          <div className="absolute -top-8 -left-8 w-48 h-48 bg-surface-container-low -z-10 rounded-2xl"></div>
          <div className="relative aspect-square md:aspect-auto md:h-[600px] overflow-hidden rounded-2xl grayscale hover:grayscale-0 transition-all duration-1000">
            <Image 
              alt="Nghệ nhân Heritage Ginseng kiểm tra rễ sâm 6 năm tuổi" 
              src="/images/heritage.png" 
              fill 
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -right-8 bg-primary-container text-on-primary p-10 hidden lg:block shadow-2xl rounded-lg">
            <p className="font-serif italic text-2xl leading-tight">"Hành trình 50 năm <br /> gìn giữ tinh hoa."</p>
          </div>
        </div>
        <div className="flex flex-col gap-8 order-1 md:order-2">
          <div className="flex flex-col gap-3">
            <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">Câu chuyện của chúng tôi</span>
            <h2 className="text-3xl md:text-4xl font-serif text-primary leading-[1.2]">Di Sản Từ Lòng Đất, <br /> Sức Sống Từ Tâm</h2>
          </div>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Bắt đầu từ những ngày đầu tiên tìm kiếm nguồn sâm quý tại các thung lũng sương mù Hàn Quốc, Heritage Ginseng đã dành trọn nửa thế kỷ để hoàn thiện quy trình chiết xuất tinh khiết nhất. Chúng tôi không chỉ bán sâm, chúng tôi trao gửi một lời hứa về sự trường tồn.
          </p>
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-primary text-primary h-12 px-8 rounded-lg text-xs font-bold tracking-widest uppercase flex items-center self-start"
            )}
          >
            KHÁM PHÁ HÀNH TRÌNH
          </Link>
        </div>
      </div>
    </section>
  );
}
