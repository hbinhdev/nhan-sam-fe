import Image from "next/image";

export function CartItems() {
  return (
    <div className="lg:col-span-8 flex flex-col gap-12">
      <div className="flex flex-col">
        <CartItem 
          image="/images/product-ginseng-cart.png"
          tag="LIMITED EDITION"
          name="Nhân Sâm Nguyên Củ 6 Năm"
          subtitle="Hộp Gỗ Sang Trọng - 300g"
          price="2.450.000đ"
          quantity={1}
        />
        <CartItem 
          image="/images/product-extract-cart.png"
          tag="BEST SELLER"
          name="Cao Hồng Sâm Linh Chi"
          subtitle="Lọ Thủy Tinh Cao Cấp - 240g"
          price="1.850.000đ"
          quantity={2}
        />
      </div>

      {/* Heritage Experience Section */}
      <div className="p-10 bg-surface-container-low border border-outline-variant/30 rounded-2xl relative overflow-hidden group">
        <div className="relative z-10 flex flex-col gap-8">
          <h4 className="text-xl font-serif text-secondary">Cam Kết Chất Lượng</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CommitmentItem icon="verified" text="Chứng nhận nguồn gốc sâm 6 năm tuổi chính hiệu." />
            <CommitmentItem icon="eco" text="Quy trình chiết xuất thủ công bảo tồn dược tính." />
            <CommitmentItem icon="workspace_premium" text="Đóng gói sang trọng, phù hợp quà tặng di sản." />
          </div>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-1000">
          <span className="material-symbols-outlined text-[160px]">history_edu</span>
        </div>
      </div>
    </div>
  );
}

function CartItem({ image, tag, name, subtitle, price, quantity }: any) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 py-10 border-b border-outline-variant/30 group">
      <div className="w-32 h-32 bg-white rounded-xl border border-outline-variant/20 flex-shrink-0 flex items-center justify-center p-4 shadow-sm group-hover:shadow-md transition-shadow">
        <div className="relative w-full h-full">
          <Image alt={name} src={image} fill className="object-contain" />
        </div>
      </div>
      <div className="flex-grow flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold tracking-[0.2em] text-secondary uppercase">{tag}</span>
          <h3 className="text-xl font-serif text-primary group-hover:text-secondary transition-colors">{name}</h3>
          <p className="text-on-surface-variant text-sm">{subtitle}</p>
        </div>
        
        <div className="flex items-center gap-4 border border-outline-variant/50 rounded-lg p-1 bg-surface-container-lowest">
          <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
          <span className="w-8 text-center font-bold text-sm">{quantity}</span>
          <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className="font-serif text-xl font-bold text-primary">{price}</p>
          <button className="text-[10px] font-bold tracking-widest text-on-surface-variant/60 hover:text-error transition-colors flex items-center gap-1 uppercase">
            <span className="material-symbols-outlined text-xs">delete</span> Loại bỏ
          </button>
        </div>
      </div>
    </div>
  );
}

function CommitmentItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed">{text}</p>
    </div>
  );
}
