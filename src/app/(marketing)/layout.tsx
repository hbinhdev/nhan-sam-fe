import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-surface selection:bg-primary-fixed selection:text-primary">
      {/* TopAppBar */}
      <header className="bg-white dark:bg-stone-950 border-b border-yellow-600/20 dark:border-yellow-900/30 sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-12 h-20 max-w-screen-2xl mx-auto">
          <Link href="/" className="text-2xl font-serif font-bold text-primary dark:text-red-500 uppercase tracking-widest">
            Heritage Ginseng
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink href="/">Trang Chủ</NavLink>
            <NavLink href="/products">Sản Phẩm</NavLink>
            <NavLink href="#">Câu Chuyện Thương Hiệu</NavLink>
            <NavLink href="#">Kiến Thức</NavLink>
            <NavLink href="#">Chứng Nhận</NavLink>
            <NavLink href="/contact">Liên Hệ</NavLink>
          </nav>

          <div className="flex items-center space-x-6 text-primary dark:text-red-500">
            <Link 
              href="/cart" 
              className="hidden lg:flex bg-primary text-on-primary px-6 h-11 items-center rounded-xl text-label-caps text-xs tracking-widest hover:bg-primary-container transition-all"
            >
              MUA NGAY
            </Link>
            <Link href="/cart" className="flex items-center focus:outline-none hover:text-primary/70 transition-all duration-300 relative">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
            </Link>
            <button className="flex items-center focus:outline-none hover:text-primary/70 transition-all duration-300">
              <span className="material-symbols-outlined">person</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-stone-100 dark:bg-stone-900 border-t border-yellow-600/10">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-12 py-12 max-w-screen-2xl mx-auto">
          <div className="mb-8 md:mb-0">
            <div className="text-lg font-serif font-bold text-primary dark:text-red-500 uppercase tracking-widest mb-4">
              Heritage Ginseng
            </div>
            <p className="font-serif text-xs tracking-tighter text-stone-500 dark:text-stone-400">
              © 2024 Heritage Ginseng. Gìn giữ tinh hoa, nâng tầm sức khỏe.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <FooterLink href="#">Chính sách bảo mật</FooterLink>
            <FooterLink href="#">Điều khoản dịch vụ</FooterLink>
            <FooterLink href="#">Hệ thống cửa hàng</FooterLink>
            <FooterLink href="#">Chứng nhận chất lượng</FooterLink>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="font-serif text-sm tracking-wide uppercase text-stone-600 dark:text-stone-400 hover:text-primary transition-colors"
    >
      {children}
    </Link>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="font-serif text-xs tracking-tighter text-stone-500 dark:text-stone-400 hover:text-yellow-700 underline transition-all"
    >
      {children}
    </Link>
  );
}
