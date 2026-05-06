import { CartItems } from "@/components/sections/cart/CartItems";
import { CartSummary } from "@/components/sections/cart/CartSummary";

export default function CartPage() {
  return (
    <main className="max-w-[1280px] mx-auto px-6 py-16 min-h-screen">
      {/* Header Section */}
      <div className="mb-16 flex flex-col gap-4">
        <h1 className="text-5xl md:text-6xl font-serif text-primary leading-tight">Giỏ Hàng</h1>
        <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Tinh hoa thảo dược đang sẵn sàng đồng hành cùng sức khỏe của bạn.
        </p>
      </div>

      {/* Cart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <CartItems />
        <CartSummary />
      </div>
    </main>
  );
}
