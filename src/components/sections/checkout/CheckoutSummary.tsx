"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatCurrencyVND } from "@/lib/product-api";

export function CheckoutSummary() {
  const { items, totalPrice, totalItems } = useCart();
  const shipping = 0; // Free shipping
  const discount = 0; // No discount for now
  const total = totalPrice + shipping - discount;

  return (
    <div className="lg:col-span-5">
      <div className="sticky top-32 space-y-8 bg-surface-container-low p-8 border border-yellow-600/10 rounded-xl">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <h3 className="text-headline-sm text-primary">Giỏ hàng của bạn</h3>
          <span className="text-label-caps text-primary">
            {totalItems} SẢN PHẨM
          </span>
        </div>

        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
          {items.map((item) => (
            <SummaryItem
              key={item.id}
              image={item.image}
              name={item.name}
              subtitle={item.sku ? `SKU: ${item.sku}` : item.brand || ""}
              quantity={item.quantity}
              price={formatCurrencyVND(item.price)}
            />
          ))}
          {items.length === 0 && (
            <p className="text-center py-8 text-on-surface-variant italic">
              Giỏ hàng đang trống
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <input
            className="flex-grow bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 text-xs text-label-caps placeholder:text-stone-300"
            placeholder="Mã giảm giá"
            type="text"
          />
          <button className="px-6 py-2 border border-secondary text-secondary text-label-caps text-[10px] hover:bg-secondary hover:text-white transition-all uppercase rounded-lg">
            Áp dụng
          </button>
        </div>

        <div className="space-y-3 pt-6 border-t border-outline-variant">
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">Tạm tính</span>
            <span className="font-bold">{formatCurrencyVND(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">Phí vận chuyển</span>
            <span className="text-secondary font-bold">Miễn phí</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Giảm giá</span>
              <span className="text-error font-bold">
                -{formatCurrencyVND(discount)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4 border-t border-primary/20">
            <span className="text-headline-sm text-primary">Tổng cộng</span>
            <span className="text-headline-md text-primary font-bold">
              {formatCurrencyVND(total)}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          type="submit"
          form="checkout-form"
          disabled={items.length === 0}
          className="w-full py-5 bg-primary text-white text-label-caps text-sm tracking-widest hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg active:scale-[0.98]"
        >
          XÁC NHẬN ĐẶT HÀNG
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </button>

        <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-base">
              verified_user
            </span>
            <span className="text-[10px] text-label-caps text-on-surface-variant">
              CAM KẾT CHÍNH HÃNG 100%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-base">
              security
            </span>
            <span className="text-[10px] text-label-caps text-on-surface-variant">
              BẢO MẬT THANH TOÁN SSL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ image, name, subtitle, quantity, price }: any) {
  return (
    <div className="flex gap-4 group">
      <div className="w-20 h-24 bg-surface-container-highest shrink-0 overflow-hidden rounded-lg relative">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <span className="material-symbols-outlined text-outline-variant">
              image
            </span>
          </div>
        )}
      </div>
      <div className="flex-grow flex flex-col justify-between py-1">
        <div>
          <h4 className="text-label-caps text-[11px] leading-tight text-primary">
            {name}
          </h4>
          <p className="text-[10px] text-on-surface-variant mt-1 italic">
            {subtitle}
          </p>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-xs text-on-surface-variant">x{quantity}</span>
          <span className="text-label-caps text-xs font-bold text-primary">
            {price}
          </span>
        </div>
      </div>
    </div>
  );
}
