"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrencyVND } from "@/lib/product-api";

export function CartSummary() {
  const { totalPrice, items } = useCart();

  if (items.length === 0) return null;

  const shipping = 0;
  const tax = 0;
  const total = totalPrice + shipping + tax;

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
          <SummaryRow label="Thuế (VAT)" value="0d" />
        </div>

        <div className="py-8">
          <label className="text-label-caps text-on-surface-variant mb-4 block">
            Mã Giảm Giá
          </label>
          <div className="flex gap-2">
            <input
              className="flex-grow bg-surface-container-low rounded-lg border-none px-4 py-3 focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-stone-400"
              placeholder="Nhập mã ưu đãi..."
              type="text"
            />
            <button className="bg-tertiary text-on-tertiary px-6 py-3 rounded-lg text-label-caps hover:bg-on-tertiary-fixed transition-colors">
              ÁP DỤNG
            </button>
          </div>
        </div>

        <div className="pt-4 pb-8">
          <div className="flex justify-between items-end mb-8">
            <span className="text-headline-sm text-on-surface">Tổng Cộng</span>
            <div className="text-right">
              <span className="text-headline-md text-primary">
                {formatCurrencyVND(total)}
              </span>
              <p className="text-[10px] text-on-surface-variant uppercase mt-2 tracking-widest italic">
                Bao gồm các ưu đãi hiện hành
              </p>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-primary text-on-primary py-5 rounded-xl text-label-caps tracking-widest hover:bg-primary-container transition-all flex items-center justify-center gap-3"
          >
            TIẾN HÀNH THANH TOÁN{" "}
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>

          <div className="mt-8 flex justify-center items-center gap-6 text-on-surface-variant">
            <span className="material-symbols-outlined text-2xl">payments</span>
            <span className="material-symbols-outlined text-2xl">
              credit_card
            </span>
            <span className="material-symbols-outlined text-2xl">
              account_balance_wallet
            </span>
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
        {hasInfo && (
          <span className="material-symbols-outlined text-xs">info</span>
        )}
      </span>
      <span className={cn("font-bold", valueClassName)}>{value}</span>
    </div>
  );
}
