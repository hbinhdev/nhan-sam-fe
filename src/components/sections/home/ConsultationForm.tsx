"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import {
  ACTIVE_CONSULTATION_MESSAGE,
  CONSULTATION_ERROR_MESSAGE,
  CONSULTATION_SUCCESS_MESSAGE,
  checkConsultationAvailability,
  createConsultation,
  isValidVietnamesePhone,
} from "@/lib/consultation-api";

const HOME_INTEREST_OPTIONS = [
  "Bồi bổ sức khỏe người già",
  "Tăng cường năng lượng làm việc",
  "Quà tặng doanh nghiệp cao cấp",
  "Phục hồi sau bệnh",
];

export function ConsultationForm({
  cms,
}: {
  cms?: {
    ctaTitle?: string | null;
    ctaSubtitle?: string | null;
    ctaButtonText?: string | null;
    formTitle?: string | null;
    formSubtitle?: string | null;
  };
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(HOME_INTEREST_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingActive, setIsCheckingActive] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizedPhone = phone.trim();
  const canCheckAvailability = useMemo(
    () => isValidVietnamesePhone(normalizedPhone),
    [normalizedPhone],
  );

  useEffect(() => {
    let cancelled = false;

    if (!canCheckAvailability) {
      setHasActiveRequest(false);
      setActiveMessage(null);
      return;
    }

    setIsCheckingActive(true);
    void checkConsultationAvailability(normalizedPhone)
      .then((result) => {
        if (cancelled) return;
        setHasActiveRequest(!result.canSubmit);
        setActiveMessage(result.message);
      })
      .catch(() => {
        if (cancelled) return;
        setHasActiveRequest(false);
        setActiveMessage(null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsCheckingActive(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canCheckAvailability, normalizedPhone]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasActiveRequest) {
      setErrorMessage(activeMessage || ACTIVE_CONSULTATION_MESSAGE);
      return;
    }

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
      setHasActiveRequest(true);
      setActiveMessage(ACTIVE_CONSULTATION_MESSAGE);
      setSuccessMessage(CONSULTATION_SUCCESS_MESSAGE);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : CONSULTATION_ERROR_MESSAGE;
      setErrorMessage(message);
      if (message.toLowerCase().includes("đang chờ xử lý")) {
        setHasActiveRequest(true);
        setActiveMessage(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitDisabled = isSubmitting || isCheckingActive || hasActiveRequest;

  return (
    <>
      <section
        className="w-full py-24 bg-primary text-on-primary text-center"
        id="consultation-cta"
      >
        <div className="max-w-[800px] mx-auto px-6 flex flex-col gap-8 items-center">
          <h2 className="text-2xl md:text-4xl font-serif leading-tight">
            {cms?.ctaTitle || "Bạn cần hỗ trợ chọn sản phẩm phù hợp?"}
          </h2>
          <p className="text-lg opacity-80 leading-relaxed">
            {cms?.ctaSubtitle ||
              "Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng lắng nghe và tư vấn giải pháp sức khỏe tối ưu cho bạn."}
          </p>
          <Link
            href="#consultation"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-white text-primary h-14 px-12 rounded-lg text-base font-semibold tracking-wide hover:bg-white hover:text-primary flex items-center",
            )}
          >
            {cms?.ctaButtonText || "Nhận tư vấn ngay"}
          </Link>
        </div>
      </section>

      <section className="w-full py-24 bg-surface" id="consultation">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col lg:flex-row gap-20 items-center">
          <Reveal
            direction="left"
            duration={1}
            distance={40}
            className="w-full lg:w-1/2"
          >
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl md:text-4xl font-serif text-primary leading-tight">
              {cms?.formTitle || "Nhận Tư Vấn Từ Chuyên Gia Sâm"}
            </h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              {cms?.formSubtitle ||
                "Để lại thông tin để chúng tôi có thể hỗ trợ bạn chọn lựa sản phẩm phù hợp nhất với thể trạng và nhu cầu sức khỏe của bạn."}
            </p>
            <div className="flex flex-row items-center gap-4 mt-4">
              <div className="w-14 h-14 rounded-full border border-outline text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">
                  support_agent
                </span>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold tracking-wide text-on-surface-variant/80">Hotline hỗ trợ 24/7</p>
                <p className="text-2xl font-bold text-primary">1900 8888 99</p>
              </div>
            </div>
          </div>
          </Reveal>
          <Reveal
            direction="right"
            duration={1}
            distance={40}
            delay={0.14}
            className="w-full lg:w-1/2"
          >
          <div className="bg-white p-12 rounded-2xl shadow-xl border border-outline-variant/30">
            <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface-variant">Họ và tên</label>
                <input
                  className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent"
                  placeholder="Nhập tên của bạn..."
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={submitDisabled}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface-variant">Số điện thoại</label>
                <input
                  className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent"
                  placeholder="090..."
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={submitDisabled}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-on-surface-variant">Nhu cầu quan tâm</label>
                <select
                  className="w-full border-0 border-b border-outline-variant focus:ring-0 focus:border-primary px-0 py-2 bg-transparent"
                  value={interest}
                  onChange={(event) => setInterest(event.target.value)}
                  disabled={submitDisabled}
                >
                  {HOME_INTEREST_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {isCheckingActive && canCheckAvailability ? (
                <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">
                  Đang kiểm tra trạng thái yêu cầu tư vấn...
                </p>
              ) : null}

              {hasActiveRequest && activeMessage ? (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  {activeMessage}
                </p>
              ) : null}

              {successMessage ? (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                  {successMessage}
                </p>
              ) : null}

              {errorMessage ? (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitDisabled}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full bg-primary text-on-primary h-14 rounded-lg text-base font-semibold tracking-wide flex items-center justify-center",
                  submitDisabled && "opacity-70 cursor-not-allowed",
                )}
              >
                {isSubmitting ? "Đang gửi..." : hasActiveRequest ? "Đang chờ xử lý" : "Đăng ký tư vấn"}
              </button>
            </form>
          </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
