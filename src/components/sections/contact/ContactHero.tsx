import Image from "next/image";

export function ContactHero() {
  return (
    <section className="relative py-32 bg-surface-container-low overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6 relative z-10">
        <div className="max-w-2xl flex flex-col gap-6">
          <span className="font-bold text-[12px] tracking-[0.2em] uppercase text-secondary">Kết nối với chúng tôi</span>
          <h1 className="text-5xl md:text-6xl font-serif text-primary leading-tight text-balance">
            Đồng hành cùng sức khỏe <br /> của bạn
          </h1>
          <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
            Đội ngũ chuyên gia của Heritage Ginseng luôn sẵn sàng lắng nghe và tư vấn tận tình về các giải pháp chăm sóc sức khỏe từ nhân sâm nghìn năm.
          </p>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
        <Image 
          alt="Ginseng Roots background" 
          src="/images/contact-hero.png" 
          fill 
          className="object-cover"
        />
      </div>
    </section>
  );
}
