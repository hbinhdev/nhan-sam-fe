import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative w-full h-[calc(100vh-80px)] min-h-[600px] flex items-center overflow-hidden bg-surface" id="hero-banner">
      {/* Background Container */}
      <div className="absolute inset-0 z-0">
        <Image
          alt="Vùng trồng sâm Heritage Ginseng tại thung lũng sương mù"
          className="w-full h-full object-cover"
          src="/images/hero.png"
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/40 to-transparent"></div>
      </div>
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-6">
        <div className="max-w-[640px] flex flex-col gap-6">
          <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">Di sản ngàn năm</span>
          <h1 className="text-5xl md:text-6xl font-serif text-primary leading-[1.1] tracking-tight text-balance">
            Tinh Hoa Sâm Việt <br /> Cho Sức Khỏe Vàng
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed max-w-[500px]">
            Khám phá bí quyết trường thọ từ những củ sâm quý hiếm nhất, được nuôi dưỡng bởi tinh hoa đất trời và kỹ nghệ chế biến truyền thống 50 năm.
          </p>
          <div className="flex flex-row gap-4 pt-4">
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-14 px-10 rounded-lg text-sm font-bold tracking-widest uppercase flex items-center bg-primary text-on-primary"
              )}
            >
              KHÁM PHÁ NGAY
            </Link>
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-secondary text-secondary h-14 px-10 rounded-lg text-sm font-bold tracking-widest uppercase flex items-center hover:bg-secondary/5"
              )}
            >
              TÌM HIỂU THÊM
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
