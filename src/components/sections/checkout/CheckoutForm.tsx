import { cn } from "@/lib/utils";

export function CheckoutForm() {
  return (
    <div className="lg:col-span-7 space-y-12">
      <div>
        <h1 className="text-display-lg text-primary mb-2">Thanh Toán</h1>
        <p className="text-body-lg text-on-surface-variant">
          Hoàn tất đơn hàng của bạn để tận hưởng tinh hoa từ thiên nhiên.
        </p>
      </div>

      {/* Buyer Info */}
      <section className="space-y-6">
        <SectionHeader icon="person" title="THÔNG TIN KHÁCH HÀNG" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="HỌ VÀ TÊN" placeholder="Nguyễn Văn A" type="text" />
          <InputGroup label="SỐ ĐIỆN THOẠI" placeholder="0901 234 567" type="tel" />
          <div className="md:col-span-2">
            <InputGroup label="EMAIL" placeholder="khachhang@heritage.com" type="email" />
          </div>
        </div>
      </section>

      {/* Shipping Address */}
      <section className="space-y-6">
        <SectionHeader icon="local_shipping" title="ĐỊA CHỈ GIAO HÀNG" />
        <div className="space-y-6">
          <InputGroup label="ĐỊA CHỈ CHI TIẾT" placeholder="Số nhà, tên đường, phường/xã" type="text" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select placeholder="Chọn Tỉnh/Thành phố" />
            <Select placeholder="Chọn Quận/Huyện" />
            <Select placeholder="Chọn Phường/Xã" />
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="space-y-6">
        <SectionHeader icon="payments" title="PHƯƠNG THỨC THANH TOÁN" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PaymentOption 
            id="vnpay" 
            name="payment" 
            title="VNPAY" 
            description="Ví điện tử / QR Code" 
            defaultChecked 
          />
          <PaymentOption 
            id="momo" 
            name="payment" 
            title="MOMO" 
            description="Nhanh chóng & Tiện lợi" 
          />
          <PaymentOption 
            id="bank" 
            name="payment" 
            title="BANK TRANSFER" 
            description="Chuyển khoản ngân hàng" 
          />
          <PaymentOption 
            id="cod" 
            name="payment" 
            title="COD" 
            description="Thanh toán khi nhận hàng" 
          />
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-outline-variant pb-2">
      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <h2 className="text-label-caps text-primary">{title}</h2>
    </div>
  );
}

function InputGroup({ label, placeholder, type }: { label: string; placeholder: string; type: string }) {
  return (
    <div className="space-y-2">
      <label className="text-label-caps text-[10px] text-on-surface-variant uppercase">{label}</label>
      <input 
        className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 text-body-md transition-all placeholder:text-stone-300" 
        placeholder={placeholder} 
        type={type} 
      />
    </div>
  );
}

function Select({ placeholder }: { placeholder: string }) {
  return (
    <select className="bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 text-body-md appearance-none w-full cursor-pointer">
      <option value="">{placeholder}</option>
    </select>
  );
}

function PaymentOption({ id, name, title, description, defaultChecked }: any) {
  return (
    <label className="flex items-center gap-4 p-4 border border-outline-variant rounded-xl hover:border-primary cursor-pointer transition-all group has-[:checked]:border-primary has-[:checked]:bg-primary/5">
      <input 
        id={id}
        name={name} 
        type="radio" 
        defaultChecked={defaultChecked}
        className="text-primary focus:ring-primary h-4 w-4" 
      />
      <div className="flex flex-col">
        <span className="text-label-caps text-xs">{title}</span>
        <span className="text-[10px] text-on-surface-variant">{description}</span>
      </div>
    </label>
  );
}
