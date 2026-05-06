import Image from "next/image";

export function CertificationSection() {
  return (
    <section className="bg-surface-container-low -mx-6 md:-mx-12 px-6 md:px-24 py-24 my-24 overflow-hidden relative">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="flex flex-col gap-8 z-10">
          <div className="flex flex-col gap-3">
            <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">Chứng thực di sản</span>
            <h2 className="text-4xl font-serif text-primary">Chứng Nhận Nguyên Gốc</h2>
          </div>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Mỗi lọ Imperial Heritage Red Ginseng đều đi kèm với một chứng chỉ kỹ thuật số duy nhất, truy xuất toàn bộ hành trình từ vùng đất màu mỡ của Geumsan đến cơ sở sản xuất thủ công của chúng tôi.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <BadgeItem 
              image="/images/certification.png" 
              org="KOREAN GOV" 
              status="CERTIFIED" 
            />
            <BadgeItem 
              image="/images/certification.png" 
              org="GMP QUALITY" 
              status="ASSURED" 
            />
            <BadgeItem 
              image="/images/certification.png" 
              org="ISO 22000" 
              status="COMPLIANT" 
            />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute -top-12 -left-12 w-64 h-64 border border-secondary/20 rounded-full hidden lg:block group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="relative z-10 aspect-square rounded-2xl overflow-hidden shadow-2xl">
            <Image 
              alt="Artistic macro photo of ginseng fibers" 
              src="/images/heritage.png" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
            />
          </div>
          <div className="absolute -bottom-8 -right-8 bg-primary p-12 text-on-primary hidden lg:block rounded-xl shadow-2xl">
            <div className="text-6xl font-serif mb-2">6</div>
            <div className="text-[10px] font-bold tracking-widest uppercase leading-tight">Years Aged <br /> In Silence</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BadgeItem({ image, org, status }: { image: string; org: string; status: string }) {
  return (
    <div className="p-8 bg-white border border-outline-variant/30 text-center rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
      <div className="relative w-16 h-16 mx-auto">
        <Image alt={org} src={image} fill className="object-contain" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-bold text-secondary tracking-widest uppercase">{org}</div>
        <div className="text-sm font-bold text-primary">{status}</div>
      </div>
    </div>
  );
}
