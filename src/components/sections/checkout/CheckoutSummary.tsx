import Image from "next/image";

export function CheckoutSummary() {
  return (
    <div className="lg:col-span-5">
      <div className="sticky top-32 space-y-8 bg-surface-container-low p-8 border border-yellow-600/10 rounded-xl">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <h3 className="text-headline-sm text-primary">Giỏ hàng của bạn</h3>
          <span className="text-label-caps text-primary">2 SẢN PHẨM</span>
        </div>

        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
          <SummaryItem 
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuBzxuY6LmvsmF_IV2_0hso_lQMYSc904HMVErE_gslQiVlyYqyV-UVQSU-YG3gEu2Vbvu1JTXrAAceefpaOaRjvr8wUn7IIeem-29l-tkHYcB3VBKaKucl0witVAQWU43RiBu9l71Gtv_EshkbSieFyns5G3NcpwBw2D_KFmlr9T46DxBsiWS0t_qb0nRzFbgbbGOb1Rm33Vo65e7aYX0miz0I8HhUDV2tieoO2nx0n8FMrK8QUna9Jjt7MMoWn0nsLRFG4Uqusdlz0"
            name="SÂM TRẮNG NGUYÊN CỦ 6 NĂM TUỔI"
            subtitle="Hộp Premium 500g"
            quantity={1}
            price="4.250.000đ"
          />
          <SummaryItem 
            image="https://lh3.googleusercontent.com/aida-public/AB6AXuDG_XzAb7eZ4dlSHpKxqpdAL17hc0Ya04U0e--iWWVa1qkVrpF7se7Ir7iCaXhxqwGf9Z5uqijPWu2gMEm6eBIHON3W5y5ntoueQaIZtMviHrMnGasazQa5_pcGkMTSrECJ4pC_rrepS4wx6K9JpzuEe4XqGkvLODvksgKHd7EQWOCcqwzExtyqzTa3-HJxw8BjAhII7iiw7PVWNM9wlEg4OTbDRuK3XX33W1HhEwj3bRrCVulZ8aVAbXlKGdW4hGN-oefXjxTYbdks"
            name="TINH CHẤT SÂM NÚI CÔ ĐẶC"
            subtitle="Chai 30ml"
            quantity={2}
            price="2.400.000đ"
          />
        </div>

        {/* Voucher */}
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

        {/* Totals */}
        <div className="space-y-3 pt-6 border-t border-outline-variant">
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">Tạm tính</span>
            <span className="font-bold">6.650.000đ</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">Phí vận chuyển</span>
            <span className="text-secondary font-bold">Miễn phí</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-on-surface-variant">Giảm giá</span>
            <span className="text-error font-bold">-250.000đ</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-primary/20">
            <span className="text-headline-sm text-primary">Tổng cộng</span>
            <span className="text-headline-md text-primary font-bold">6.400.000đ</span>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full py-5 bg-primary text-white text-label-caps text-sm tracking-widest hover:bg-primary-container transition-all flex items-center justify-center gap-3 rounded-xl shadow-lg active:scale-[0.98]">
          XÁC NHẬN ĐẶT HÀNG
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>

        {/* Trust Signals */}
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-base">verified_user</span>
            <span className="text-[10px] text-label-caps text-on-surface-variant">CAM KẾT CHÍNH HÃNG 100%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-base">security</span>
            <span className="text-[10px] text-label-caps text-on-surface-variant">BẢO MẬT THANH TOÁN SSL</span>
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
        <Image src={image} alt={name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex-grow flex flex-col justify-between py-1">
        <div>
          <h4 className="text-label-caps text-[11px] leading-tight text-primary">{name}</h4>
          <p className="text-[10px] text-on-surface-variant mt-1 italic">{subtitle}</p>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-xs text-on-surface-variant">x{quantity}</span>
          <span className="text-label-caps text-xs font-bold text-primary">{price}</span>
        </div>
      </div>
    </div>
  );
}
