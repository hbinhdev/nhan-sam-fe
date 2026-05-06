import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConsultationForm() {
  return (
    <>
      {/* SECTION 8: CONSULTATION CTA - Rule 2.5 */}
      <section className="w-full py-24 bg-primary text-on-primary text-center" id="consultation-cta">
        <div className="max-w-[800px] mx-auto px-6 flex flex-col gap-8 items-center">
          <h2 className="text-3xl md:text-5xl font-serif leading-tight">Bạn cần hỗ trợ chọn sản phẩm phù hợp?</h2>
          <p className="text-lg opacity-80 leading-relaxed">Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng lắng nghe và tư vấn giải pháp sức khỏe tối ưu cho bạn.</p>
          <Link
            href="#consultation"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-white text-primary h-14 px-12 rounded-lg text-sm font-bold tracking-widest uppercase hover:bg-surface-variant flex items-center"
            )}
          >
            NHẬN TƯ VẤN NGAY
          </Link>
        </div>
      </section>

      {/* SECTION 8: CONSULTATION FORM */}
      <section className="w-full py-24 bg-surface" id="consultation">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col lg:flex-row gap-20 items-center">
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <h2 className="text-3xl md:text-4xl font-serif text-primary leading-tight">Nhận Tư Vấn Từ Chuyên Gia Sâm</h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">Để lại thông tin để chúng tôi có thể hỗ trợ bạn chọn lựa sản phẩm phù hợp nhất với thể trạng và nhu cầu sức khỏe của bạn.</p>
            <div className="flex flex-row items-center gap-4 mt-4">
              <div className="w-14 h-14 rounded-full border border-outline text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">support_agent</span>
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase opacity-60">Hotline hỗ trợ 24/7</p>
                <p className="text-2xl font-bold text-primary">1900 8888 99</p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 bg-white p-12 rounded-2xl shadow-xl border border-outline-variant/30">
            <form className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">Họ và tên</label>
                <input className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent" placeholder="Nhập tên của bạn..." type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">Số điện thoại</label>
                <input className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent" placeholder="090..." type="tel" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">Nhu cầu quan tâm</label>
                <select className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent">
                  <option>Bồi bổ sức khỏe người già</option>
                  <option>Tăng cường năng lượng làm việc</option>
                  <option>Quà tặng doanh nghiệp cao cấp</option>
                  <option>Phục hồi sau bệnh</option>
                </select>
              </div>
              <button className={cn(buttonVariants({ variant: "default" }), "w-full bg-primary text-on-primary h-14 rounded-lg text-sm font-bold tracking-widest uppercase flex items-center justify-center")}>ĐĂNG KÝ TƯ VẤN</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
