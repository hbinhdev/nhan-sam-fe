import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function ContactBento() {
  return (
    <section className="py-32 max-w-[1280px] mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Methods Column */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Hotline Card */}
          <div className="bg-white p-10 border border-outline-variant/30 rounded-2xl group hover:border-secondary transition-all duration-500 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-3xl">call</span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-serif text-primary">Đường Dây Nóng</h3>
                <p className="text-secondary font-bold text-3xl tracking-wider">1900 8888 99</p>
                <p className="text-on-surface-variant text-sm">Hỗ trợ 24/7 cho mọi thắc mắc của bạn</p>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-2 gap-6">
            <SocialLink icon="chat" label="Messenger" />
            <SocialLink icon="forum" label="Zalo OA" />
          </div>

          {/* Store Info */}
          <div className="bg-surface-container-low p-10 rounded-2xl border border-outline-variant/20">
            <h4 className="text-[11px] font-bold tracking-[0.2em] text-secondary uppercase mb-8">Trụ sở chính</h4>
            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <p className="text-on-surface leading-relaxed">123 Đường Tinh Hoa, Phường Di Sản, Quận 1, TP. Hồ Chí Minh</p>
              </div>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary">mail</span>
                <p className="text-on-surface">contact@heritageginseng.vn</p>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Form */}
        <div className="lg:col-span-7 bg-white p-12 border border-outline-variant/30 shadow-xl rounded-2xl">
          <h2 className="text-3xl font-serif text-primary mb-3">Đăng Ký Tư Vấn Chuyên Sâu</h2>
          <p className="text-on-surface-variant mb-10 leading-relaxed">Để lại thông tin, chuyên gia dinh dưỡng của chúng tôi sẽ liên hệ trong vòng 24 giờ làm việc.</p>
          
          <form className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput label="Họ và tên" placeholder="Nguyễn Văn A" type="text" />
              <FormInput label="Số điện thoại" placeholder="090 123 4567" type="tel" />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface-variant">Dịch vụ quan tâm</label>
              <select className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 transition-colors cursor-pointer outline-none">
                <option>Tư vấn bồi bổ sức khỏe</option>
                <option>Chương trình quà tặng doanh nghiệp</option>
                <option>Kiểm tra mã xác thực sản phẩm</option>
                <option>Khác</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface-variant">Lời nhắn</label>
              <textarea 
                className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 transition-colors placeholder-outline/50 min-h-[120px] outline-none" 
                placeholder="Tôi muốn tìm hiểu về nhân sâm 6 năm tuổi..." 
              />
            </div>

            <button 
              type="submit"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full md:w-auto h-14 px-12 bg-primary text-on-primary font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-primary-container transition-all active:scale-95"
              )}
            >
              Gửi yêu cầu tư vấn
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function SocialLink({ icon, label }: { icon: string; label: string }) {
  return (
    <Link 
      href="#" 
      className="flex flex-col items-center justify-center p-10 bg-white border border-outline-variant/30 rounded-2xl hover:border-primary hover:shadow-lg transition-all group"
    >
      <span className="material-symbols-outlined text-4xl text-primary mb-4">{icon}</span>
      <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant group-hover:text-primary">{label}</span>
    </Link>
  );
}

function FormInput({ label, placeholder, type }: { label: string; placeholder: string; type: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface-variant">{label}</label>
      <input 
        className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 transition-colors placeholder-outline/50 outline-none" 
        placeholder={placeholder} 
        type={type} 
      />
    </div>
  );
}
