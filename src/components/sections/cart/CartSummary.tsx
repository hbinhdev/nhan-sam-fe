import { cn } from "@/lib/utils";
import Link from "next/link";

export function CartSummary() {
  return (
    <div className="lg:col-span-4">
      <div className="bg-white p-8 border border-outline-variant/30 rounded-xl sticky top-32">
        <h2 className="text-headline-sm text-on-surface mb-8">T?ng �on H�ng</h2>

        <div className="space-y-4 pb-8 border-b border-outline-variant/30">
          <SummaryRow label="T?m t�nh" value="6.150.000d" />
          <SummaryRow
            label="Ph� v?n chuy?n u?c t�nh"
            value="Mi?n ph�"
            valueClassName="text-secondary"
            hasInfo
          />
          <SummaryRow label="Thu? (VAT)" value="0d" />
        </div>

        <div className="py-8">
          <label className="text-label-caps text-on-surface-variant mb-4 block">M� GI?M GI�</label>
          <div className="flex gap-2">
            <input
              className="flex-grow bg-surface-container-low rounded-lg border-none px-4 py-3 focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-stone-400"
              placeholder="Nh?p m� uu d�i..."
              type="text"
            />
            <button className="bg-tertiary text-on-tertiary px-6 py-3 rounded-lg text-label-caps hover:bg-on-tertiary-fixed transition-colors">
              �P D?NG
            </button>
          </div>
        </div>

        <div className="pt-4 pb-8">
          <div className="flex justify-between items-end mb-8">
            <span className="text-headline-sm text-on-surface">T?ng c?ng</span>
            <div className="text-right">
              <span className="text-headline-md text-primary">6.150.000d</span>
              <p className="text-[10px] text-on-surface-variant uppercase mt-2 tracking-widest italic">
                Bao g?m c�c uu d�i hi?n h�nh
              </p>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full bg-primary text-on-primary py-5 rounded-xl text-label-caps tracking-widest hover:bg-primary-container transition-all flex items-center justify-center gap-3"
          >
            TI?N H�NH THANH TO�N <span className="material-symbols-outlined">arrow_forward</span>
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
        {label} {hasInfo && <span className="material-symbols-outlined text-xs">info</span>}
      </span>
      <span className={cn("font-bold", valueClassName)}>{value}</span>
    </div>
  );
}
