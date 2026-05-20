"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/components/shared/auth/AuthProvider";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { formatCurrencyVND } from "@/lib/product-api";
import { getDefaultPaymentQrConfig, type PaymentQrConfig } from "@/lib/payment-qr-api";
import { createOrder } from "@/lib/order-api";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

const CHECKOUT_COUPON_KEY = "checkout_coupon";

type AppliedCouponState = {
  couponId: string;
  code: string;
  discountAmount: number;
  finalTotal: number;
  cartTotal: number;
};

export default function PaymentPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { session } = useAuth();
  const { showToast } = useToast();
  const [orderId] = useState(() => "HRT-" + Math.random().toString(36).substring(2, 9).toUpperCase());
  const [config, setConfig] = useState<PaymentQrConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [appliedCoupon] = useState<AppliedCouponState | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const saved = window.localStorage.getItem(CHECKOUT_COUPON_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved) as AppliedCouponState;
      if (!parsed?.code) return null;
      if (Number(parsed.cartTotal) !== Number(totalPrice || 0)) {
        window.localStorage.removeItem(CHECKOUT_COUPON_KEY);
        return null;
      }
      return parsed;
    } catch {
      window.localStorage.removeItem(CHECKOUT_COUPON_KEY);
      return null;
    }
  });

  const orderSubtotal = totalPrice || 0;
  const orderDiscount = appliedCoupon?.discountAmount ?? 0;
  const orderTotal = Math.max(0, orderSubtotal - orderDiscount);

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getDefaultPaymentQrConfig();
        setConfig(data);
      } catch (err) {
        console.error("Failed to load payment QR config:", err);
      } finally {
        setLoading(false);
      }
    }
    void loadConfig();
  }, []);

  const bankName = config?.bankName || "";
  const accountNumber = config?.accountNumber || "";
  const accountName = config?.accountName || "";
  const bankCode = config?.bankCode || "";

  const qrUrl =
    config?.customQrImage ||
    (bankCode && accountNumber
      ? `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${orderTotal}&addInfo=${orderId}&accountName=${encodeURIComponent(accountName)}`
      : "");

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    try {
      let buyerInfo = {
        name: session?.user?.name || "Khách hàng",
        phone: session?.user?.phone || "0900000000",
        email: session?.user?.email || "",
        fullAddress: "Nhận tại cửa hàng / Giao tận nơi",
      };
      const saved = localStorage.getItem("checkout_buyer_info");
      if (saved) {
        buyerInfo = { ...buyerInfo, ...JSON.parse(saved) };
      }

      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      const toNumberPrice = (value: unknown) => {
        if (typeof value === "number") {
          return Number.isFinite(value) ? value : NaN;
        }
        if (typeof value === "string") {
          const normalized = value.replace(/[^\d.-]/g, "");
          const parsed = Number(normalized);
          return Number.isFinite(parsed) ? parsed : NaN;
        }
        return NaN;
      };

      const orderItems = items.map((it) => {
        const normalizedPrice = toNumberPrice(it.price);
        const normalizedQuantity = Number(it.quantity);
        return {
          productId: it.id,
          name: it.name,
          price: normalizedPrice,
          quantity: normalizedQuantity,
          image: it.image,
        };
      });

      if (orderItems.length === 0) {
        throw new Error("Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng.");
      }

      for (const item of orderItems) {
        if (!uuidRegex.test(item.productId)) {
          throw new Error("Sản phẩm trong giỏ hàng không hợp lệ. Vui lòng tải lại trang.");
        }
        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new Error(`Số lượng sản phẩm "${item.name}" không hợp lệ.`);
        }
        if (!Number.isFinite(item.price) || item.price < 0) {
          throw new Error(`Giá sản phẩm "${item.name}" không hợp lệ. Vui lòng cập nhật lại giỏ hàng.`);
        }
      }

      await createOrder({
        orderCode: orderId,
        customerName: buyerInfo.name,
        userId: session?.user?.id || undefined,
        customerPhone: buyerInfo.phone,
        customerEmail: buyerInfo.email || session?.user?.email || undefined,
        shippingAddress: buyerInfo.fullAddress,
        totalAmount: orderTotal,
        couponId: appliedCoupon?.couponId || undefined,
        couponCode: appliedCoupon?.code || undefined,
        couponDiscountAmount: appliedCoupon?.discountAmount || undefined,
        paymentMethod: "VIETQR",
        paymentNote: orderId,
        items: orderItems,
      });

      void clearCart();
      localStorage.removeItem(CHECKOUT_COUPON_KEY);
      setShowSuccessModal(true);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi tạo đơn hàng.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && !config) {
    return (
      <main className="min-h-screen bg-surface-container-lowest py-24 px-6 relative flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-xl text-center space-y-6 z-10">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <span className="material-symbols-outlined text-4xl">info</span>
          </div>
          <h2 className="text-headline-md text-primary font-bold">Chưa thiết lập tài khoản</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Hệ thống hiện chưa được cấu hình tài khoản ngân hàng để nhận thanh toán. Quý khách vui lòng liên hệ trực tiếp với bộ phận chăm sóc khách hàng hoặc quản trị viên để hoàn tất đơn hàng.
          </p>
          <div className="pt-4 space-y-3">
            <Link
              href="/"
              className="w-full py-4 bg-primary text-white rounded-xl flex items-center justify-center font-semibold hover:bg-primary/90 transition-all text-sm tracking-wider uppercase"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-container-lowest py-16 px-6 lg:px-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-secondary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary"
          >
            <span className="material-symbols-outlined text-4xl">payments</span>
          </motion.div>
          <h1 className="text-display-sm text-on-surface mb-2 font-bold">Thanh Toán Đơn Hàng</h1>
          <p className="text-on-surface-variant font-medium">Mã đơn hàng của bạn: <span className="font-bold text-primary">{orderId}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center relative"
          >
            <div className="text-label-caps text-secondary mb-6 tracking-widest font-bold">QUÉT MÃ ĐỂ THANH TOÁN</div>

            <div className="relative w-64 h-64 bg-slate-50 p-3 rounded-2xl border-4 border-primary/10 mb-6 flex items-center justify-center overflow-hidden shadow-xs">
              {loading ? (
                <div className="flex flex-col items-center justify-center text-on-surface-variant text-xs">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
                  Đang tải mã QR...
                </div>
              ) : (
                qrUrl && (
                  <Image
                    src={qrUrl}
                    alt="Payment QR"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                )
              )}
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-on-surface-variant font-medium">Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã</p>
              <div className="flex items-center justify-center gap-4 pt-4 opacity-50 grayscale">
                <span className="text-[10px] font-bold border border-current px-2 py-1 rounded">VNPAY</span>
                <span className="text-[10px] font-bold border border-current px-2 py-1 rounded">MOMO</span>
                <span className="text-[10px] font-bold border border-current px-2 py-1 rounded">NAPAS</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 shadow-xs">
              <h3 className="text-label-caps text-primary mb-6 font-bold">THÔNG TIN CHUYỂN KHOẢN</h3>

              <div className="space-y-4">
                <InfoRow label="Ngân hàng" value={bankName} />
                <InfoRow label="Số tài khoản" value={accountNumber} isCopyable={Boolean(accountNumber)} />
                <InfoRow label="Chủ tài khoản" value={accountName} />
                <InfoRow label="Số tiền" value={formatCurrencyVND(orderTotal)} highlight />
                <InfoRow label="Nội dung" value={orderId} isCopyable />
              </div>
            </div>

            <div className="bg-amber-500/10 p-8 rounded-3xl border border-amber-500/20 shadow-xs">
              <h3 className="text-label-caps text-amber-900 dark:text-amber-400 mb-4 font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                LƯU Ý QUAN TRỌNG
              </h3>
              <ul className="text-sm text-amber-950 dark:text-amber-300 space-y-3 font-medium leading-relaxed">
                <li className="flex gap-2 items-start">
                  <span className="font-bold text-amber-700 shrink-0">•</span>
                  <span>
                    Quý khách vui lòng nhập chính xác mã đơn hàng <strong className="font-bold underline text-amber-900 dark:text-amber-100">{orderId}</strong> trong phần nội dung chuyển khoản. Nếu nhập không đúng nội dung, hệ thống sẽ không thể tự động xác nhận và chúng tôi sẽ không chịu trách nhiệm cho các vấn đề phát sinh.
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="font-bold text-amber-700 shrink-0">•</span>
                  <span>Sau khi đã hoàn tất chuyển khoản thành công, vui lòng nhấn nút xác nhận bên dưới. Đơn hàng sẽ chuyển sang trạng thái chờ xác nhận từ hệ thống.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={handleConfirmPayment}
                disabled={submitting}
                className="w-full py-4 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container tracking-wider font-semibold shadow-md active:scale-[0.99] disabled:opacity-50 transition-all uppercase text-sm"
              >
                {submitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐÃ CHUYỂN KHOẢN"}
              </button>
              <Link
                href="/"
                className="w-full py-3.5 text-on-surface-variant flex items-center justify-center gap-2 text-sm font-medium hover:text-primary transition-all"
              >
                Quay lại trang chủ
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="w-[95vw] max-w-md overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 mb-2 animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Đã ghi nhận thanh toán!
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Đơn hàng của bạn với mã <strong className="text-primary font-bold">{orderId}</strong> đã được ghi nhận thành công và đang ở trạng thái <strong className="text-amber-600 font-bold">Đang chờ xác nhận</strong>.
            </DialogDescription>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl w-full text-xs text-slate-500 leading-normal text-left space-y-1 my-4 border border-slate-200 dark:border-slate-800">
              <p>📌 Quản trị viên sẽ tiến hành kiểm tra đối soát giao dịch chuyển khoản với nội dung <strong className="text-slate-700 dark:text-slate-300">{orderId}</strong>.</p>
              <p>📌 Khi đối soát thành công, trạng thái đơn hàng sẽ được chuyển sang <strong className="text-emerald-600 font-semibold">Thành công / Đã xác nhận</strong>.</p>
            </div>

            <div className="w-full space-y-3 pt-2">
              <Button
                onClick={() => router.push(`/order-status/${orderId}`)}
                className="w-full h-12 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-primary-container"
              >
                Theo dõi đơn hàng
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full h-11 rounded-xl font-semibold border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function InfoRow({
  label,
  value,
  isCopyable,
  highlight,
}: {
  label: string;
  value: string;
  isCopyable?: boolean;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex justify-between items-center group py-1 border-b border-outline-variant/20 last:border-0 pb-3 last:pb-0">
      <span className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${highlight ? "text-xl text-primary font-bold" : "text-on-surface"}`}>
          {value}
        </span>
        {isCopyable && (
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors relative"
            title="Sao chép"
          >
            <span className="material-symbols-outlined text-sm">
              {copied ? "check" : "content_copy"}
            </span>
            {copied && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-2 rounded whitespace-nowrap shadow-md">
                Đã chép
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
