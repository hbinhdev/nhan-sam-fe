export function ProductReviews() {
  return (
    <section className="w-full py-24 border-t border-outline-variant/30">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div className="flex flex-col gap-3">
          <span className="font-bold text-[12px] tracking-[0.15em] uppercase text-secondary">Đánh giá thực tế</span>
          <h2 className="text-4xl font-serif text-primary">Tiếng Nói Từ Khách Hàng</h2>
          <p className="text-on-surface-variant">Được tin dùng qua nhiều thế hệ.</p>
        </div>
        <button className="h-14 px-10 border-2 border-primary text-primary font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-primary hover:text-on-primary transition-all">
          VIẾT ĐÁNH GIÁ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ReviewCard 
          name="Trần Minh Anh" 
          tag="KHÁCH HÀNG THÂN THIẾT" 
          quote="Sự khác biệt về chất lượng là rất rõ rệt. Tôi đã thử nhiều loại, nhưng loại nhân sâm này mang lại cảm giác sâu sắc và cân bằng hơn. Khả năng tập trung của tôi chưa bao giờ tốt hơn thế." 
        />
        <ReviewCard 
          name="Nguyễn Hoàng" 
          tag="QUÀ TẶNG CAO CẤP" 
          quote="Một món quà tinh tế. Chỉ riêng bao bì thôi đã cho thấy đẳng cấp của sản phẩm. Ông tôi nói rằng nó có vị chính xác như loại nhân sâm ông từng dùng ở Hàn Quốc." 
        />
        <ReviewCard 
          name="Elena Rodriguez" 
          tag="NGƯỜI DÙNG HÀNG NGÀY" 
          quote="Kết cấu mịn màng và vị đắng tinh tế. Tôi dùng một thìa mỗi sáng và nó đã thay thế hoàn toàn tách cà phê thứ hai của tôi." 
        />
      </div>
    </section>
  );
}

function ReviewCard({ name, tag, quote }: { name: string; tag: string; quote: string }) {
  return (
    <div className="p-10 bg-white border border-outline-variant/30 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6">
      <div className="flex text-secondary scale-90 origin-left">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="material-symbols-outlined text-sm fill-1">star</span>
        ))}
      </div>
      <p className="text-on-surface leading-relaxed italic">"{quote}"</p>
      <div className="flex flex-col gap-1">
        <div className="font-bold text-primary">{name}</div>
        <div className="text-[10px] font-bold text-secondary tracking-widest uppercase">{tag}</div>
      </div>
    </div>
  );
}
