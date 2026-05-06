import Image from "next/image";

export function MapSection() {
  return (
    <section className="w-full h-[500px] relative overflow-hidden group">
      <div className="absolute inset-0 bg-surface-dim">
        <Image 
          alt="Store Location Map" 
          src="/images/contact-map.png" 
          fill 
          className="object-cover grayscale opacity-40 group-hover:opacity-60 transition-opacity duration-1000"
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md p-8 border border-secondary/20 shadow-2xl rounded-2xl pointer-events-auto max-w-sm flex flex-col gap-4">
          <h4 className="text-2xl font-serif text-primary">Showroom Heritage</h4>
          <div className="flex flex-col gap-1 text-sm text-on-surface-variant">
            <p>123 Đường Tinh Hoa, Quận 1, HCM</p>
            <p className="font-bold">Mở cửa: 08:00 - 21:00 hàng ngày</p>
          </div>
          <a 
            className="text-secondary font-bold text-[11px] tracking-widest uppercase hover:underline mt-2 flex items-center gap-2" 
            href="https://maps.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Xem trên Google Maps <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function PurityBanner() {
  return (
    <section className="bg-primary py-24 text-center">
      <div className="max-w-[800px] mx-auto px-6 border-y border-on-primary/20 py-12 flex flex-col items-center gap-6">
        <span className="material-symbols-outlined text-6xl text-on-primary fill-1">verified</span>
        <h3 className="text-3xl font-serif text-on-primary">Cam Kết Chính Hãng</h3>
        <p className="text-on-primary/80 font-serif italic text-xl leading-relaxed">
          "Mọi sản phẩm từ Heritage Ginseng đều được đi kèm chứng nhận xuất xứ từ vùng Geumsan, đảm bảo hàm lượng saponin cao nhất cho người tiêu dùng."
        </p>
      </div>
    </section>
  );
}
