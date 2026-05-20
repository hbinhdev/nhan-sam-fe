"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { formatCurrencyVND } from "@/lib/product-api";
import { validateCoupon, type CouponValidationResponse } from "@/lib/coupon-api";

const CHECKOUT_COUPON_KEY = "checkout_coupon";

type AppliedCouponState = {
  couponId: string;
  code: string;
  discountAmount: number;
  finalTotal: number;
  cartTotal: number;
};

export function CartSummary() {
  const { totalPrice, items } = useCart();
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(() => {
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
  });
  const [couponCode, setCouponCode] = useState(() => appliedCoupon?.code || "");
  const [applying, setApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const shipping = 0;
  const tax = 0;
  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, totalPrice + shipping + tax - discount);

  useEffect(() => {
    if (!appliedCoupon) return;
    if (Number(appliedCoupon.cartTotal) === Number(totalPrice)) return;

    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
    localStorage.removeItem(CHECKOUT_COUPON_KEY);
  }, [appliedCoupon, totalPrice]);

  if (items.length === 0) return null;

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
      const result: CouponValidationResponse = await validateCoupon(code, totalPrice);
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
      setCouponError(error instanceof Error ? error.message : "Mã giảm giá không hợp lệ.");
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
    <div className="lg:col-span-4">
      <div className="bg-white p-8 border border-outline-variant/30 rounded-xl sticky top-32">
        <h2 className="text-headline-sm text-on-surface mb-8">Tổng Đơn Hàng</h2>

        <div className="space-y-4 pb-8 border-b border-outline-variant/30">
          <SummaryRow label="Tạm tính" value={formatCurrencyVND(totalPrice)} />
          <SummaryRow
            label="Phí vận chuyển ước tính"
            value="Miễn phí"
            valueClassName="text-secondary"
            hasInfo
          />
          <SummaryRow label="Thuế (VAT)" value="0đ" />
        </div>

        <div className="py-8">
          <label className="text-label-caps text-on-surface-variant mb-4 block">Mã Giảm Giá</label>
          <div className="flex gap-2">
            <input
              className="flex-grow bg-surface-container-low rounded-lg border-none px-4 py-3 focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-stone-400"
              placeholder="Nhập mã ưu đãi..."
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={Boolean(appliedCoupon)}
            />
            {appliedCoupon ? (
              <button
                onClick={handleRemoveCoupon}
                className="bg-red-100 text-red-700 px-6 py-3 rounded-lg text-label-caps hover:bg-red-200 transition-colors"
              >
                BỎ MÃ
              </button>
            ) : (
              <button
                onClick={handleApplyCoupon}
                disabled={applying || items.length === 0}
                className="bg-tertiary text-on-tertiary px-6 py-3 rounded-lg text-label-caps hover:bg-on-tertiary-fixed transition-colors disabled:opacity-50"
              >
                {applying ? "ĐANG ÁP DỤNG" : "ÁP DỤNG"}
              </button>
            )}
          </div>

          {appliedCoupon ? (
            <p className="text-[11px] text-emerald-700 font-medium mt-3">Đã áp dụng mã: {appliedCoupon.code}</p>
          ) : null}

          {couponError ? (
            <p className="text-[11px] text-red-600 font-medium mt-3">{couponError}</p>
          ) : null}
        </div>

        <div className="pt-4 pb-8">
          {discount > 0 ? (
            <div className="flex justify-between items-end mb-3">
              <span className="text-on-surface-variant">Giảm giá</span>
              <span className="text-error font-bold">-{formatCurrencyVND(discount)}</span>
            </div>
          ) : null}

          <div className="flex justify-between items-end mb-8">
            <span className="text-headline-sm text-on-surface">Tổng Cộng</span>
            <div className="text-right">
              <span className="text-headline-md text-primary">{formatCurrencyVND(total)}</span>
              <p className="text-[10px] text-on-surface-variant uppercase mt-2 tracking-widest italic">
                Bao gồm các ưu đãi hiện hành
              </p>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-primary text-on-primary py-5 rounded-xl text-label-caps tracking-widest hover:bg-primary-container transition-all flex items-center justify-center gap-3"
          >
            TIẾN HÀNH THANH TOÁN <span className="material-symbols-outlined">arrow_forward</span>
          </Link>

          <div className="mt-8 flex justify-center items-center gap-6 text-on-surface-variant">
            <span className="material-symbols-outlined text-2xl">payments</span>
            <span className="material-symbols-outlined text-2xl">credit_card</span>
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
  hasInfo,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  hasInfo?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-on-surface-variant flex items-center gap-1">
        {label}{" "}
        {hasInfo && <span className="material-symbols-outlined text-xs">info</span>}
      </span>
      <span className={cn("font-bold", valueClassName)}>{value}</span>
    </div>
  );
}
