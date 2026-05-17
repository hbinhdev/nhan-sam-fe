"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  ACTIVE_CONSULTATION_MESSAGE,
  CONSULTATION_ERROR_MESSAGE,
  CONSULTATION_SUCCESS_MESSAGE,
  checkConsultationAvailability,
  createConsultation,
  isValidVietnamesePhone,
} from "@/lib/consultation-api";

const CONTACT_INTEREST_OPTIONS = [
  "Tư vấn bồi bổ sức khỏe",
  "Chương trình quà tặng doanh nghiệp",
  "Kiểm tra mã xác thực sản phẩm",
  "Khác",
];

export function ContactBento() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState(CONTACT_INTEREST_OPTIONS[0]);
  const [message, setMessage] = useState("");
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
        message,
      });

      setFullName("");
      setPhone("");
      setInterest(CONTACT_INTEREST_OPTIONS[0]);
      setMessage("");
      setHasActiveRequest(true);
      setActiveMessage(ACTIVE_CONSULTATION_MESSAGE);
      setSuccessMessage(CONSULTATION_SUCCESS_MESSAGE);
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : CONSULTATION_ERROR_MESSAGE;
      setErrorMessage(messageText);
      if (messageText.toLowerCase().includes("đang chờ xử lý")) {
        setHasActiveRequest(true);
        setActiveMessage(messageText);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitDisabled = isSubmitting || isCheckingActive || hasActiveRequest;

  return (
    <section className="py-32 max-w-[1280px] mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 flex flex-col gap-8">
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

          <div className="grid grid-cols-2 gap-6">
            <SocialLink icon="chat" label="Messenger" />
            <SocialLink icon="forum" label="Zalo OA" />
          </div>

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

        <div className="lg:col-span-7 bg-white p-12 border border-outline-variant/30 shadow-xl rounded-2xl">
          <h2 className="text-3xl font-serif text-primary mb-3">Đăng Ký Tư Vấn Chuyên Sâu</h2>
          <p className="text-on-surface-variant mb-10 leading-relaxed">Để lại thông tin, chuyên gia dinh dưỡng của chúng tôi sẽ liên hệ trong vòng 24 giờ làm việc.</p>

          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput label="Họ và tên" placeholder="Nguyễn Văn A" type="text" value={fullName} onChange={setFullName} disabled={submitDisabled} />
              <FormInput label="Số điện thoại" placeholder="090 123 4567" type="tel" value={phone} onChange={setPhone} disabled={submitDisabled} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface-variant">Dịch vụ quan tâm</label>
              <select
                className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 transition-colors cursor-pointer outline-none"
                value={interest}
                onChange={(event) => setInterest(event.target.value)}
                disabled={submitDisabled}
              >
                {CONTACT_INTEREST_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface-variant">Lời nhắn</label>
              <textarea
                className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 transition-colors placeholder-outline/50 min-h-[120px] outline-none"
                placeholder="Tôi muốn tìm hiểu về nhân sâm 6 năm tuổi..."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={submitDisabled}
              />
            </div>

            {isCheckingActive && canCheckAvailability ? (
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-3 py-2">Đang kiểm tra trạng thái yêu cầu tư vấn...</p>
            ) : null}

            {hasActiveRequest && activeMessage ? (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">{activeMessage}</p>
            ) : null}

            {successMessage ? (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">{successMessage}</p>
            ) : null}

            {errorMessage ? (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitDisabled}
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full md:w-auto h-14 px-12 bg-primary text-on-primary font-bold text-xs tracking-widest uppercase rounded-xl hover:bg-primary-container transition-all active:scale-95",
                submitDisabled && "opacity-70 cursor-not-allowed",
              )}
            >
              {isSubmitting ? "ĐANG GỬI..." : hasActiveRequest ? "ĐANG CHỜ XỬ LÝ" : "Gửi yêu cầu tư vấn"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function SocialLink({ icon, label }: { icon: string; label: string }) {
  return (
    <Link href="#" className="flex flex-col items-center justify-center p-10 bg-white border border-outline-variant/30 rounded-2xl hover:border-primary hover:shadow-lg transition-all group">
      <span className="material-symbols-outlined text-4xl text-primary mb-4">{icon}</span>
      <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant group-hover:text-primary">{label}</span>
    </Link>
  );
}

function FormInput({
  label,
  placeholder,
  type,
  value,
  onChange,
  disabled,
}: {
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-bold tracking-[0.2em] uppercase text-on-surface-variant">{label}</label>
      <input
        className="w-full bg-transparent border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 transition-colors placeholder-outline/50 outline-none"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
