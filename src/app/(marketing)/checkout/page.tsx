"use client";

import Link from "next/link";
import { CheckoutForm } from "@/components/sections/checkout/CheckoutForm";
import { CheckoutSummary } from "@/components/sections/checkout/CheckoutSummary";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { items, isLoading } = useCart();

  if (!isLoading && items.length === 0) {
    return (
      <main className="min-h-screen bg-surface-container-lowest py-24 px-6 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-pattern pointer-events-none" />
        <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-outline-variant/30 shadow-xl text-center space-y-6 z-10">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary">
            <span className="material-symbols-outlined text-5xl">remove_shopping_cart</span>
          </div>
          <div>
            <h2 className="text-headline-sm text-primary font-bold mb-2">Giỏ hàng của bạn đang trống</h2>
            <p className="text-sm text-on-surface-variant">
              Vui lòng thêm sản phẩm vào giỏ hàng trước khi tiến hành thanh toán.
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/cart"
              className="w-full py-4 bg-primary text-white rounded-xl flex items-center justify-center font-semibold hover:bg-primary/90 transition-all text-sm tracking-wider uppercase"
            >
              Quay lại giỏ hàng
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-screen-2xl mx-auto px-12 py-16 relative">
      <div className="absolute inset-0 bg-pattern pointer-events-none" />
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <CheckoutForm />
        <CheckoutSummary />
      </div>

      {/* Authenticity Badge */}
      <div className="fixed bottom-8 right-8 z-40 hidden lg:block">
        <div className="bg-white/80 backdrop-blur-md border border-secondary p-4 flex items-center gap-4 shadow-2xl rounded-xl">
          <div className="w-12 h-12 rounded-full border-2 border-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
          </div>
          <div>
            <p className="text-label-caps text-[9px] text-on-surface-variant leading-none">CERTIFICATE OF</p>
            <p className="text-headline-sm text-xs text-primary">Authenticity</p>
          </div>
        </div>
      </div>
    </main>
  );
}
