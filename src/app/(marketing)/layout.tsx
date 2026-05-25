import { AuthHeaderActions } from "@/components/shared/auth/AuthHeaderActions";
import { AuthHeaderMenu } from "@/components/shared/auth/AuthHeaderMenu";
import { LoadingLink } from "@/components/shared/routing/RouteLoadingProvider";
import { ProductsNavLink } from "@/components/shared/ProductsNavLink";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface selection:bg-primary-fixed selection:text-primary">
      <header className="sticky top-0 z-50 border-b border-yellow-600/20 bg-white dark:border-yellow-900/30 dark:bg-stone-950">
        <div className="mx-auto flex h-[72px] w-full max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-12">
          <LoadingLink
            href="/"
            className="max-w-[180px] text-xl font-serif font-bold uppercase leading-tight tracking-[0.14em] text-primary dark:text-red-500 sm:max-w-none sm:text-2xl sm:tracking-widest"
          >
            Heritage Ginseng
          </LoadingLink>

          <nav className="hidden items-center space-x-8 md:flex">
            <NavLink href="/">Trang chủ</NavLink>
            <ProductsNavLink />
            <NavLink href="/blogs">Kiến thức</NavLink>
            <NavLink href="/contact">Liên hệ</NavLink>
          </nav>

          <div className="flex items-center gap-1 sm:gap-3 text-primary dark:text-red-500">
            <AuthHeaderActions />
            {/* <LoadingLink
              href="/cart"
              className="relative hidden items-center p-2 transition-all duration-300 hover:text-primary/70 focus:outline-none sm:flex"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shopping_cart
              </span>
            </LoadingLink> */}
            <AuthHeaderMenu />
          </div>
        </div>

        <div className="border-t border-yellow-600/10 px-4 py-2 sm:px-6 md:hidden">
          <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <MobileNavButton href="/">Trang chủ</MobileNavButton>
            <MobileNavButton href="/products">Sản phẩm</MobileNavButton>
            <MobileNavButton href="/blogs">Kiến thức</MobileNavButton>
            <MobileNavButton href="/contact">Liên hệ</MobileNavButton>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-yellow-600/10 bg-stone-100 dark:bg-stone-900">
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-between px-12 py-12 md:flex-row">
          <div className="mb-8 md:mb-0">
            <div className="mb-4 text-xl font-serif font-bold tracking-wider text-primary dark:text-red-500">
              Heritage Ginseng
            </div>
            <p className="font-serif text-xs tracking-tighter text-stone-500 dark:text-stone-400">
              © 2024 Heritage Ginseng. Gìn giữ tinh hoa, nâng tầm sức khỏe.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <FooterLink href="/policies/privacy">Chính sách bảo mật</FooterLink>
            <FooterLink href="/policies/return">Chính sách đổi trả</FooterLink>
            <FooterLink href="/policies/shipping">
              Chính sách vận chuyển
            </FooterLink>
            <FooterLink href="/policies/payment">
              Chính sách thanh toán
            </FooterLink>
            <FooterLink href="/policies/terms">
              Điều khoản và điều kiện
            </FooterLink>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MobileNavButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <LoadingLink
      href={href}
      className="inline-flex h-8 items-center rounded-full border border-outline-variant/40 px-3 text-xs font-semibold text-primary transition-colors hover:bg-surface-container-low"
    >
      {children}
    </LoadingLink>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <LoadingLink
      href={href}
      className="font-serif text-base font-semibold tracking-wide text-stone-600 transition-colors hover:text-primary dark:text-stone-400"
    >
      {children}
    </LoadingLink>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <LoadingLink
      href={href}
      className="font-serif text-xs tracking-tighter text-stone-500 underline transition-all hover:text-yellow-700 dark:text-stone-400"
    >
      {children}
    </LoadingLink>
  );
}
