export function Testimonials() {
  return (
    <section className="w-full py-24 bg-surface-container-low" id="testimonials">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="text-center flex flex-col gap-3 mb-16">
          <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">Chia sẻ từ khách hàng</span>
          <h2 className="text-3xl md:text-4xl font-serif text-primary">Niềm Tin Qua Thế Hệ</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard 
            name="Bác Nguyễn Văn An" 
            loc="Hà Nội" 
            quote="Tôi đã sử dụng Cao Hồng Sâm Heritage trong 3 năm qua. Sức khỏe và tinh thần của tôi cải thiện rõ rệt, đặc biệt là giấc ngủ sâu hơn. Một món quà tuyệt vời cho tuổi già." 
          />
          <TestimonialCard 
            name="Chị Mai Phương" 
            loc="TP. Hồ Chí Minh" 
            quote="Lịch trình làm việc dày đặc khiến tôi luôn mệt mỏi. Kể từ khi biết đến các dòng sâm năng lượng của Heritage, tôi luôn giữ được sự tỉnh táo và bền bỉ suốt cả ngày." 
          />
          <TestimonialCard 
            name="Anh Quốc Bảo" 
            loc="Đà Nẵng" 
            quote="Dịch vụ tư vấn rất chuyên nghiệp và tận tâm. Sản phẩm đóng gói sang trọng, rất phù hợp để làm quà tặng đối tác trong những dịp quan trọng." 
          />
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ name, loc, quote }: { name: string; loc: string; quote: string }) {
  return (
    <div className="flex flex-col bg-white p-10 border border-outline-variant relative rounded-2xl shadow-sm">
      <div className="flex flex-row text-secondary mb-6 gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="material-symbols-outlined text-sm fill-1">star</span>
        ))}
      </div>
      <p className="text-base italic text-on-surface mb-8 leading-relaxed">"{quote}"</p>
      <div className="flex flex-col">
        <h3 className="font-bold text-primary text-base">{name}</h3>
        <p className="text-xs text-on-surface-variant uppercase tracking-widest">{loc}</p>
      </div>
      <span className="absolute top-8 right-8 material-symbols-outlined text-6xl text-secondary/5 select-none">format_quote</span>
    </div>
  );
}
