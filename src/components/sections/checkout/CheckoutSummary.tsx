"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatCurrencyVND } from "@/lib/product-api";
import {
  validateCoupon,
  type CouponValidationResponse,
} from "@/lib/coupon-api";

const CHECKOUT_COUPON_KEY = "checkout_coupon";

type AppliedCouponState = {
  couponId: string;
  code: string;
  discountAmount: number;
  finalTotal: number;
  cartTotal: number;
};

export function CheckoutSummary() {
  const { items, totalPrice, totalItems } = useCart();
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(
    () => {
      if (typeof window === "undefined") {
        return null;
      }

      try {
        const saved = window.localStorage.getItem(CHECKOUT_COUPON_KEY);
        if (!saved) return null;
        const parsed = JSON.parse(saved) as AppliedCouponState;
        if (!parsed?.code) return null;
        if (Number(parsed.cartTotal) !== Number(totalPrice)) {
          window.localStorage.removeItem(CHECKOUT_COUPON_KEY);
          return null;
        }
        return parsed;
      } catch {
        window.localStorage.removeItem(CHECKOUT_COUPON_KEY);
        return null;
      }
    },
  );
  const [couponCode, setCouponCode] = useState(() => appliedCoupon?.code || "");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const shipping = 0;
  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, totalPrice + shipping - discount);

  useEffect(() => {
    if (items.length === 0 && appliedCoupon) {
      localStorage.removeItem(CHECKOUT_COUPON_KEY);
    }
  }, [items.length, appliedCoupon]);

  const handleApplyCoupon = async () => {
    if (appliedCoupon) {
      return;
    }

    const code = couponCode.trim();
    if (!code) {
      setCouponError("Vui lòng nhập mã giảm giá.");
      return;
    }

    setApplying(true);
    setCouponError(null);

    try {
      const result: CouponValidationResponse = await validateCoupon(
        code,
        totalPrice,
      );
      const payload: AppliedCouponState = {
        couponId: result.coupon.id,
        code: result.coupon.code,
        discountAmount: result.discountAmount,
        finalTotal: result.finalTotal,
        cartTotal: totalPrice,
      };

      setAppliedCoupon(payload);
      setCouponCode(result.coupon.code);
      localStorage.setItem(CHECKOUT_COUPON_KEY, JSON.stringify(payload));
    } catch (error) {
      setCouponError(
        error instanceof Error ? error.message : "Mã giảm giá không hợp lệ.",
      );
    } finally {
      setApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponCode("");
    localStorage.removeItem(CHECKOUT_COUPON_KEY);
  };

  return (
    <div className="lg:col-span-5">
      <div className="sticky top-32 space-y-6 rounded-xl border border-yellow-600/10 bg-surface-container-low p-5 sm:space-y-8 sm:p-8">
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant pb-4">
          <h3 className="text-3xl font-serif leading-tight text-primary sm:text-headline-sm">
            Giỏ hàng của bạn
          </h3>
          <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-primary sm:text-label-caps">
            {totalItems} SẢN PHẨM
          </span>
        </div>

        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
          {items.map((item) => (
            <SummaryItem
              key={item.id}
              image={item.image}
              name={item.name}
              subtitle={item.sku ? `Mã SP: ${item.sku}` : item.brand || ""}
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

        <div className="space-y-2 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="min-w-0 flex-grow border-0 border-b border-outline bg-transparent px-0 py-2 text-xs text-label-caps placeholder:text-stone-300 focus:border-primary focus:ring-0 disabled:opacity-60"
              placeholder="Mã giảm giá"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={Boolean(appliedCoupon)}
            />
            {appliedCoupon ? (
              <button
                onClick={handleRemoveCoupon}
                className="w-full shrink-0 rounded-lg border border-red-300 px-4 py-2 text-[10px] text-label-caps uppercase text-red-600 transition-all hover:bg-red-50 sm:w-auto sm:px-6"
              >
                Bỏ mã
              </button>
            ) : (
              <button
                onClick={handleApplyCoupon}
                disabled={applying || items.length === 0}
                className="w-full shrink-0 rounded-lg border border-secondary px-4 py-2 text-[10px] text-label-caps uppercase text-secondary transition-all hover:bg-secondary hover:text-white disabled:opacity-50 sm:w-auto sm:px-6"
              >
                {applying ? "Đang áp dụng" : "Áp dụng"}
              </button>
            )}
          </div>

          {appliedCoupon ? (
            <p className="text-[11px] text-emerald-700 font-medium">
              Đã áp dụng mã: {appliedCoupon.code}
            </p>
          ) : null}

          {couponError ? (
            <p className="text-[11px] text-red-600 font-medium">
              {couponError}
            </p>
          ) : null}
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
          <div className="border-t border-primary/20 pt-4">
            <span className="block text-2xl font-serif leading-none text-primary sm:text-headline-sm">
              Tổng cộng
            </span>
            <span className="mt-2 block whitespace-nowrap text-right text-[clamp(24px,9vw,38px)] font-bold leading-none text-primary sm:text-headline-md">
              {formatCurrencyVND(total)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          form="checkout-form"
          disabled={items.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-[12px] font-bold uppercase tracking-wide text-white whitespace-nowrap transition-all hover:bg-primary-container active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:gap-3 sm:py-5 sm:text-sm sm:text-label-caps sm:tracking-widest"
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

type SummaryItemProps = {
  image: string;
  name: string;
  subtitle: string;
  quantity: number;
  price: string;
};

function SummaryItem({
  image,
  name,
  subtitle,
  quantity,
  price,
}: SummaryItemProps) {
  return (
    <div className="group flex gap-3 sm:gap-4">
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
      <div className="min-w-0 flex-grow flex flex-col justify-between py-1">
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wide leading-tight text-primary sm:text-label-caps">
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
