import { CartItems } from "@/components/sections/cart/CartItems";
import { CartSummary } from "@/components/sections/cart/CartSummary";

export default function CartPage() {
  return (
    <main className="max-w-screen-2xl mx-auto px-12 py-16 min-h-screen">
      <div className="mb-12">
        <h1 className="text-5xl md:text-5xl font-serif text-primary leading-[1.1] text-balance tracking-tight mb-3">
          Giỏ Hàng
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Tinh hoa thảo dược đang sẵn sàng đồng hành cùng sức khỏe của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <CartItems />
        <CartSummary />
      </div>
    </main>
  );
}
