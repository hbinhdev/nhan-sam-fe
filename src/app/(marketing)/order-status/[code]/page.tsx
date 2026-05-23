"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { getOrderByCode, type Order } from "@/lib/order-api";
import { formatCurrencyVND } from "@/lib/product-api";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function OrderStatusPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const unwrappedParams = use(params);
  const code = decodeURIComponent(unwrappedParams.code);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrder = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await getOrderByCode(code);
      if (!data) {
        setError("Không tìm thấy đơn hàng với mã này.");
      } else {
        setOrder(data);
      }
    } catch {
      setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadOrder();
  }, [code]);

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-container-lowest py-24 px-6 flex flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-on-surface-variant font-medium text-sm">
          Đang tra cứu thông tin đơn hàng {code}...
        </p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-surface-container-lowest py-24 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
            <XCircle size={36} />
          </div>
          <h2 className="text-headline-md text-primary font-bold">
            Không tìm thấy đơn hàng
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {error ||
              `Chúng tôi không thể tìm thấy đơn hàng nào khớp với mã "${code}". Vui lòng kiểm tra lại mã đơn hàng hoặc liên hệ CSKH.`}
          </p>
          <div className="pt-4 space-y-3">
            <Link
              href="/"
              className="w-full py-4 bg-primary text-white rounded-xl flex items-center justify-center font-semibold hover:bg-primary-container transition-all text-sm uppercase tracking-wider"
            >
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const steps = [
    {
      key: "PENDING",
      label: "Chờ xác nhận",
      desc: "Đang kiểm tra đối soát CK",
      icon: Clock,
    },
    {
      key: "CONFIRMED",
      label: "Đã xác nhận",
      desc: "Đơn hàng thành công",
      icon: CheckCircle2,
    },
    {
      key: "SHIPPED",
      label: "Đang vận chuyển",
      desc: "Đang trên đường giao",
      icon: Truck,
    },
    {
      key: "DELIVERED",
      label: "Đã giao hàng",
      desc: "Hoàn tất giao hàng",
      icon: PackageCheck,
    },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === "CANCELLED";
  const couponDiscount = Number(order.couponDiscountAmount ?? 0);

  return (
    <main className="min-h-screen bg-surface-container-lowest py-16 px-6 lg:px-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/20 pb-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-2 font-semibold"
            >
              <ArrowLeft size={16} /> Quay lại trang chủ
            </Link>
            <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
              Đơn hàng{" "}
              <span className="text-primary font-mono bg-primary/5 px-3 py-1 rounded-xl border border-primary/10">
                {order.orderCode}
              </span>
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Đặt lúc: {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>

          <button
            onClick={() => void loadOrder(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low transition-all text-xs font-semibold text-on-surface shadow-xs disabled:opacity-50 self-start sm:self-center"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin text-primary" : ""}
            />
            {refreshing ? "Đang cập nhật..." : "Làm mới trạng thái"}
          </button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-xs">
          <h2 className="text-label-caps text-on-surface-variant mb-8 font-bold">
            TIẾN TRÌNH ĐƠN HÀNG
          </h2>

          {isCancelled ? (
            <div className="flex items-center justify-center gap-3 p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 font-semibold">
              <XCircle size={24} className="text-red-600 shrink-0" />
              <span>
                Đơn hàng này đã bị hủy. (
                {order.adminNote ||
                  "Lý do: Không nhận được thanh toán hoặc theo yêu cầu"}
                )
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
              {steps.map((step, idx) => {
                const isPast = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.key}
                    className="flex flex-col items-center text-center relative group"
                  >
                    <div
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                        isCurrent
                          ? "bg-primary text-white scale-110 ring-4 ring-primary/20"
                          : isPast
                            ? "bg-emerald-600 text-white"
                            : "bg-surface-container text-on-surface-variant/40"
                      }`}
                    >
                      <StepIcon size={24} />
                    </div>
                    <h3
                      className={`mt-4 font-bold text-sm ${isCurrent ? "text-primary font-extrabold" : isPast ? "text-on-surface font-bold" : "text-on-surface-variant/50"}`}
                    >
                      {step.label}
                    </h3>
                    <p className="text-[11px] text-on-surface-variant/70 mt-1 max-w-[150px] leading-tight">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {order.status === "PENDING" && !isCancelled && (
            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
              <AlertCircle
                size={18}
                className="text-amber-600 shrink-0 mt-0.5"
              />
              <div>
                <strong className="font-bold text-amber-950 block mb-0.5">
                  Trạng thái: Đang chờ đối soát thanh toán
                </strong>
                Quản trị viên đang kiểm tra giao dịch thanh toán qua mã QR với
                nội dung{" "}
                <strong className="font-mono text-amber-950">
                  {order.orderCode}
                </strong>
                . Quá trình này thường mất từ 5-15 phút. Khi xác nhận khớp giao
                dịch, đơn hàng sẽ chuyển sang trạng thái{" "}
                <strong>Đã xác nhận (Thành công)</strong>.
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-xs space-y-4">
            <h2 className="text-label-caps text-on-surface-variant font-bold border-b border-outline-variant/20 pb-3">
              THÔNG TIN KHÁCH HÀNG
            </h2>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-on-surface-variant block mb-0.5 uppercase text-[10px]">
                  Người nhận:
                </span>
                <span className="font-bold text-sm text-on-surface">
                  {order.customerName}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block mb-0.5 uppercase text-[10px]">
                  Số điện thoại:
                </span>
                <span className="font-bold text-sm text-on-surface font-mono">
                  {order.customerPhone}
                </span>
              </div>
              {order.customerEmail && (
                <div>
                  <span className="text-on-surface-variant block mb-0.5 uppercase text-[10px]">
                    Email:
                  </span>
                  <span className="font-medium text-sm text-on-surface">
                    {order.customerEmail}
                  </span>
                </div>
              )}
              <div>
                <span className="text-on-surface-variant block mb-0.5 uppercase text-[10px]">
                  Địa chỉ giao hàng:
                </span>
                <span className="font-medium text-sm text-on-surface leading-normal">
                  {order.shippingAddress}
                </span>
              </div>
              <div>
                <span className="text-on-surface-variant block mb-0.5 uppercase text-[10px]">
                  Phương thức thanh toán:
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                  {order.paymentMethod === "VIETQR"
                    ? "Thanh toán qua mã QR"
                    : order.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-label-caps text-on-surface-variant font-bold border-b border-outline-variant/20 pb-3 mb-4">
                SẢN PHẨM ĐÃ ĐẶT
              </h2>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 divide-y divide-outline-variant/10">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pt-3 first:pt-0">
                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-surface-container shrink-0 relative border border-outline-variant/20">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-on-surface-variant font-bold">
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="font-bold text-sm text-on-surface line-clamp-1">
                          {item.name}
                        </h4>
                        {item.sku && (
                          <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                            Mã SP: {item.sku}
                          </p>
                        )}
                      </div>
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-on-surface-variant">
                          Số lượng: x{item.quantity}
                        </span>
                        <span className="text-primary font-bold">
                          {formatCurrencyVND(item.price)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-outline-variant/20 pt-4 mt-6 space-y-2">
              {couponDiscount > 0 ? (
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>
                    Giảm giá
                    {order.couponCode ? ` (${order.couponCode})` : ""}:
                  </span>
                  <span className="font-bold text-red-600">
                    -{formatCurrencyVND(couponDiscount)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-emerald-600">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold text-on-surface pt-1">
                <span>Tổng số tiền:</span>
                <span className="text-xl text-primary font-extrabold">
                  {formatCurrencyVND(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-on-surface-variant font-medium">
          <div>
            <p className="font-bold text-on-surface mb-0.5">
              Bạn cần hỗ trợ về đơn hàng?
            </p>
            <p className="text-xs">
              Hotline hỗ trợ khách hàng hoạt động 24/7 để giải đáp mọi thắc mắc.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-all font-semibold tracking-wide text-xs whitespace-nowrap text-center shadow-xs"
          >
            LIÊN HỆ CSKH
          </Link>
        </div>
      </div>
    </main>
  );
}
