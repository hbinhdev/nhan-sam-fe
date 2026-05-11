import Image from "next/image";

export function CartItems() {
  return (
    <div className="lg:col-span-8">
      <div className="flex flex-col gap-0">
        <CartItem 
          image="https://lh3.googleusercontent.com/aida-public/AB6AXuBwGzPdcsR5_eHFiV-m_V7XALIg8Qaic_6HGfsesRneedBCBd4YMU_BNOF8kOtAgzNjLyUGOhHErfFKjuRVooc1bstTR0vHwFDbKejGayJfA1nIlleeOj06zSj77HxuBCz9CEf-JZCmqPhCDShoxxsA-e_4FnDYqjnK64yAVvnpxIs__2Fqf6IiZZMyTnnJUSnVoQ5CJi-9-_d5dxak9ioioAhRmE5gLqrmgo9GHarbDUFZ5fkcK5xSadPeZZlmGwdUHkoNA8K_mDw7"
          tag="LIMITED EDITION"
          name="Nhân Sâm Nguyên Củ 6 Năm"
          subtitle="Hộp Gỗ Sang Trọng - 300g"
          price="2.450.000đ"
          quantity={1}
        />
        <CartItem 
          image="https://lh3.googleusercontent.com/aida-public/AB6AXuDR5jLpGo3Uhc0Es6VgGJrE7sMcrqXz2SKMpgC4Q54PBIuI5LHV85VHka0-KPFGpB8A8xOZgMJzUDa2akrzsf1P9a5maMAbGYTtZWjLNzM6ZTHN2OuQ5Pz3C5gvbhb8s8ww_rFy6nBEmCm01A5iuWZqo4UsuOcaqzkHMkocHjvlUeoIOSzl4M2HvdgSDILQwrbNFvJK-vcnUTpN3uQ68xC45kUzG65b5pSb0854q3gH-BFBOh-OBqYEfQ_ZiacR7Z8IG5f3x1ugufIC"
          tag="BEST SELLER"
          name="Cao Hồng Sâm Linh Chi"
          subtitle="Lọ Thủy Tinh Cao Cấp - 240g"
          price="1.850.000đ"
          quantity={2}
        />
      </div>

      {/* Heritage Experience Section */}
      <div className="mt-16 p-8 bg-surface-container-lowest border border-yellow-600/10 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-headline-sm text-secondary mb-6">Cam Kết Chất Lượng</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CommitmentItem icon="verified" text="Chứng nhận nguồn gốc sâm 6 năm tuổi chính hiệu." />
            <CommitmentItem icon="eco" text="Quy trình chiết xuất thủ công bảo tồn dược tính." />
            <CommitmentItem icon="workspace_premium" text="Đóng gói sang trọng, phù hợp làm quà tặng di sản." />
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <span className="material-symbols-outlined text-[200px]">history_edu</span>
        </div>
      </div>
    </div>
  );
}

function CartItem({ image, tag, name, subtitle, price, quantity }: any) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 py-8 border-b border-outline-variant/30 group">
      <div className="w-32 h-32 bg-surface-container-low rounded-xl flex-shrink-0 flex items-center justify-center p-4">
        <div className="relative w-full h-full mix-blend-multiply">
          <Image alt={name} src={image} fill className="object-contain" />
        </div>
      </div>
      <div className="flex-grow flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div className="flex flex-col gap-2">
          <span className="text-label-caps text-secondary uppercase">{tag}</span>
          <h3 className="text-headline-sm text-on-surface">{name}</h3>
          <p className="text-on-surface-variant text-sm">{subtitle}</p>
        </div>
        
        <div className="flex items-center space-x-4 border border-outline-variant rounded-lg px-3 py-2">
          <button className="p-1 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
          <span className="w-8 text-center font-bold">{quantity}</span>
          <button className="p-1 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold text-primary">{price}</p>
          <button className="text-label-caps text-on-surface-variant hover:text-error transition-colors mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">delete</span> LOẠI BỎ
          </button>
        </div>
      </div>
    </div>
  );
}

function CommitmentItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  );
}
