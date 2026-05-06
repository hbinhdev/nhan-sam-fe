import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-surface overflow-x-hidden">
      {/* HEADER - Rule 2.2: Logo left, Menu, CTA, Sticky */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-50" id="header">
        <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo - Left */}
          <Link href="/" className="text-xl font-serif tracking-[0.2em] text-primary uppercase whitespace-nowrap">
            HERITAGE GINSENG
          </Link>

          {/* Menu - Center (Max 6 items) */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link className="text-[13px] font-medium uppercase text-on-surface-variant hover:text-primary transition-colors" href="/">Thương hiệu</Link>
            <Link className="text-[13px] font-medium uppercase text-on-surface-variant hover:text-primary transition-colors" href="/products">Sản phẩm</Link>
            <Link className="text-[13px] font-medium uppercase text-on-surface-variant hover:text-primary transition-colors" href="#">Quà tặng</Link>
            <Link className="text-[13px] font-medium uppercase text-on-surface-variant hover:text-primary transition-colors" href="#">Hành trình</Link>
            <Link className="text-[13px] font-medium uppercase text-on-surface-variant hover:text-primary transition-colors" href="#">Tri thức</Link>
            <Link className="text-[13px] font-medium uppercase text-on-surface-variant hover:text-primary transition-colors" href="/contact">Liên hệ</Link>
          </nav>

          {/* CTA + Utilities - Right */}
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-primary p-2">search</button>
            <Link href="/cart" className="material-symbols-outlined text-on-surface-variant hover:text-primary p-2 relative">
              shopping_bag
            </Link>
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: "default" }),
                "hidden md:flex bg-primary text-on-primary px-6 rounded-lg h-11 font-medium items-center"
              )}
            >
              MUA NGAY
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER - Rule 2.6 */}
      <footer className="w-full bg-surface-container-high border-t border-outline-variant/30" id="footer">
        <div className="max-w-[1280px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="md:col-span-1 flex flex-col gap-6">
            <span className="text-lg font-serif text-primary uppercase tracking-[0.2em]">HERITAGE GINSENG</span>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Tinh hoa sâm Việt - Gìn giữ giá trị truyền thống, nâng tầm sức khỏe cộng đồng qua từng sản phẩm thượng hạng.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant text-on-surface hover:bg-primary hover:text-on-primary transition-all">
                <span className="material-symbols-outlined text-xl">groups</span>
              </Link>
              <Link href="#" className="w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant text-on-surface hover:bg-primary hover:text-on-primary transition-all">
                <span className="material-symbols-outlined text-xl">language</span>
              </Link>
            </div>
          </div>

          {/* Sitemap Links */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-primary uppercase text-xs tracking-widest">Sản phẩm</h4>
            <nav className="flex flex-col gap-3">
              <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Cao hồng sâm</Link>
              <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Sâm lát tẩm mật</Link>
              <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Trà sâm túi lọc</Link>
            </nav>
          </div>

          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-primary uppercase text-xs tracking-widest">Chính sách</h4>
            <nav className="flex flex-col gap-3">
              <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Chính sách bảo mật</Link>
              <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Điều khoản dịch vụ</Link>
              <Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Chính sách vận chuyển</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-primary uppercase text-xs tracking-widest">Liên hệ</h4>
            <div className="flex flex-col gap-3 text-sm text-on-surface-variant">
              <p>Hotline: 1900 8888 99</p>
              <p>Email: contact@heritageginseng.com</p>
              <p>Địa chỉ: Hà Nội, Việt Nam</p>
            </div>
          </div>
        </div>
        <div className="border-t border-outline-variant/10 py-8 text-center text-[10px] tracking-wider uppercase text-on-surface-variant/60">
          © 2024 HERITAGE GINSENG. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}
