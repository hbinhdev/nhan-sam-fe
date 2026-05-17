type ProductInfoProps = {
  name?: string;
  description?: string;
  price?: string;
  origin?: string;
  brand?: string;
  sku?: string | null;
  averageRating?: number;
  totalReviews?: number;
};

export function ProductInfo({
  name = "Imperial Heritage Red Ginseng",
  description = "A masterfully aged concentrate derived from the heart of the Geumsan mountains. Preserved through ancient steaming techniques to maximize ginsenoside potency.",
  price = "4.250.000đ",
  origin,
  brand,
  sku,
  averageRating = 0,
  totalReviews = 0,
}: ProductInfoProps) {
  const safeAverage = Number.isFinite(averageRating)
    ? Math.max(0, Math.min(5, averageRating))
    : 0;
  const displayAverage = totalReviews === 0 ? 5 : safeAverage;
  const filledStars = Math.round(displayAverage);
  const stars = [1, 2, 3, 4, 5].map((index) => index <= filledStars);

  return (
    <div className="md:col-span-7 flex flex-col gap-8 sticky top-32">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 text-secondary text-[11px] font-bold tracking-[0.2em] uppercase">
          <span>{origin || "6-Year Old"}</span>
          <span className="w-1 h-1 bg-secondary rounded-full"></span>
          <span>{brand || "Premium Extract"}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif text-primary leading-tight">{name}</h1>

        <div className="flex items-center gap-4">
          <div className="flex text-secondary">
            {stars.map((active, i) => (
              <span
                key={i}
                className={`material-symbols-outlined text-[20px] ${active ? "fill-1" : "fill-0 opacity-40"}`}
              >
                star
              </span>
            ))}
          </div>
          <span className="text-on-surface-variant text-sm font-medium">
            {displayAverage.toFixed(1)} / 5 ({totalReviews} đánh giá)
          </span>
        </div>

        <p className="text-lg text-on-surface-variant leading-relaxed">{description}</p>

        <div className="text-sm text-on-surface-variant">
          SKU: <span className="font-semibold text-primary">{sku?.trim() || "Đang cập nhật"}</span>
        </div>

        <div className="text-3xl md:text-4xl font-serif text-primary border-y border-outline-variant/30 py-8 my-2">{price}</div>

        <div className="flex flex-col gap-4">
          <span className="text-[11px] font-bold tracking-widest text-on-surface-variant uppercase">Số lượng</span>
          <div className="flex items-center border border-outline-variant/50 w-fit rounded-lg overflow-hidden h-14">
            <button className="px-6 hover:bg-surface-container transition-colors text-xl">-</button>
            <input className="w-16 text-center border-none focus:ring-0 bg-transparent font-bold text-lg" type="text" defaultValue="1" />
            <button className="px-6 hover:bg-surface-container transition-colors text-xl">+</button>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <button className="w-full h-16 bg-primary text-on-primary font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-primary-container transition-all shadow-lg active:scale-[0.98]">
            THÊM VÀO GIỎ HÀNG
          </button>
          <button className="w-full h-16 border-2 border-secondary text-secondary font-bold text-sm tracking-widest uppercase rounded-xl hover:bg-secondary/5 transition-all">
            MUA NGAY
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-outline-variant/30 mt-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">verified</span>
            <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Certified Organic</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">local_shipping</span>
            <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Free Express Shipping</span>
          </div>
        </div>
      </div>
    </div>
  );
}
