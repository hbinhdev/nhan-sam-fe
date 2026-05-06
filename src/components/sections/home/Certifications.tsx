import Image from "next/image";

export function Certifications() {
  return (
    <section className="w-full py-24 bg-surface-container-low" id="certifications">
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row gap-16 items-center">
        {/* Left Text Content */}
        <div className="w-full md:w-1/2 flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">Chất lượng thượng hạng</span>
            <h2 className="text-3xl md:text-4xl font-serif text-primary leading-[1.2] text-balance tracking-tight">Cam Kết Minh Bạch & Chứng Nhận Quốc Tế</h2>
          </div>
          <p className="text-base text-on-surface-variant leading-relaxed">
            Mọi sản phẩm của Heritage Ginseng đều trải qua quy trình kiểm soát nghiêm ngặt từ vùng trồng tại Hàn Quốc đến nhà máy đạt chuẩn GMP. Chúng tôi tự hào mang đến sự an tâm tuyệt đối qua các chứng chỉ uy tín nhất thế giới.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
            <div className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined text-[32px]">verified</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-on-surface text-base">GMP Certified</h3>
                <p className="text-sm text-on-surface-variant">Tiêu chuẩn sản xuất tốt</p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined text-[32px]">workspace_premium</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-on-surface text-base">ISO 22000</h3>
                <p className="text-sm text-on-surface-variant">An toàn thực phẩm</p>
              </div>
            </div>
          </div>
        </div>
        {/* Right Imagery */}
        <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
          <div className="relative aspect-[3/4] border border-outline-variant p-2 bg-white shadow-sm overflow-hidden group">
            <Image 
              alt="Chứng nhận tiêu chuẩn GMP của Heritage Ginseng" 
              src="/images/certification.png" 
              fill 
              className="object-cover p-2 group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="relative aspect-[3/4] border border-outline-variant p-2 bg-white shadow-sm overflow-hidden group mt-8">
            <Image 
              alt="Chứng nhận ISO 22000 về an toàn thực phẩm" 
              src="/images/certification.png" 
              fill 
              className="object-cover p-2 group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
