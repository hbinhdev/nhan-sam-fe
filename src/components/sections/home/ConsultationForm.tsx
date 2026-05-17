"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CONSULTATION_ERROR_MESSAGE,
  CONSULTATION_SUCCESS_MESSAGE,
  createConsultation,
} from "@/lib/consultation-api";

const HOME_INTEREST_OPTIONS = [
  "Bồi bổ sức khỏe người già",
  "Tăng cường năng lượng làm việc",
  "Quà tặng doanh nghiệp cao cấp",
  "Phục hồi sau bệnh",
];

export function ConsultationForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(HOME_INTEREST_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await createConsultation({
        fullName,
        phone,
        interest,
      });

      setFullName("");
      setPhone("");
      setInterest(HOME_INTEREST_OPTIONS[0]);
      setSuccessMessage(CONSULTATION_SUCCESS_MESSAGE);
    } catch (error) {
      const message = error instanceof Error ? error.message : CONSULTATION_ERROR_MESSAGE;
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
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
            <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">Họ và tên</label>
                <input
                  className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent"
                  placeholder="Nhập tên của bạn..."
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">Số điện thoại</label>
                <input
                  className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent"
                  placeholder="090..."
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold tracking-[0.1em] uppercase text-on-surface-variant">Nhu cầu quan tâm</label>
                <select
                  className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent"
                  value={interest}
                  onChange={(event) => setInterest(event.target.value)}
                  disabled={isSubmitting}
                >
                  {HOME_INTEREST_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {successMessage && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                  {successMessage}
                </p>
              )}

              {errorMessage && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full bg-primary text-on-primary h-14 rounded-lg text-sm font-bold tracking-widest uppercase flex items-center justify-center",
                  isSubmitting && "opacity-70 cursor-not-allowed"
                )}
              >
                {isSubmitting ? "ĐANG GỬI..." : "ĐĂNG KÝ TƯ VẤN"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
