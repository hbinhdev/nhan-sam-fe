import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function CartSummary() {
  return (
    <div className="lg:col-span-4 flex flex-col gap-8">
      <div className="bg-white p-10 border border-outline-variant/30 rounded-2xl shadow-xl shadow-surface-container/50 sticky top-32 flex flex-col gap-8">
        <h2 className="text-2xl font-serif text-primary">Tổng Đơn Hàng</h2>
        
        <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-8">
          <SummaryRow label="Tạm tính" value="6.150.000đ" />
          <SummaryRow 
            label="Phí vận chuyển" 
            value="Miễn phí" 
            valueClassName="text-secondary font-bold" 
          />
          <SummaryRow label="Thuế (VAT)" value="0đ" />
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-[11px] font-bold tracking-[0.2em] text-on-surface-variant uppercase">Mã giảm giá</label>
          <div className="flex gap-2">
            <input 
              className="flex-grow bg-surface-container-low rounded-lg border-none px-4 py-3 focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-stone-400 text-sm" 
              placeholder="Nhập mã ưu đãi..." 
              type="text"
            />
            <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold text-[10px] tracking-widest uppercase hover:bg-primary-container transition-colors">
              Áp dụng
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 pt-4">
          <div className="flex justify-between items-end">
            <span className="text-lg font-serif text-primary">Tổng cộng</span>
            <div className="flex flex-col items-end">
              <span className="text-3xl font-serif text-primary">6.150.000đ</span>
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest italic mt-1">Bao gồm các ưu đãi</p>
            </div>
          </div>

          <button className={cn(
            buttonVariants({ variant: "default" }),
            "w-full h-16 bg-primary text-on-primary font-bold text-sm tracking-[0.15em] uppercase rounded-xl hover:bg-primary-container transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98]"
          )}>
            Tiến hành thanh toán <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>

          <div className="flex justify-center items-center gap-6 text-on-surface-variant/40 border-t border-outline-variant/10 pt-8">
            <span className="material-symbols-outlined text-2xl">payments</span>
            <span className="material-symbols-outlined text-2xl">credit_card</span>
            <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className={cn("font-bold text-primary", valueClassName)}>{value}</span>
    </div>
  );
}
