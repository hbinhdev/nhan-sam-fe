"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMyOrders, type Order } from "@/lib/order-api";
import { formatCurrencyVND } from "@/lib/product-api";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ArrowRight,
  PackageOpen,
  ShoppingBag,
} from "lucide-react";

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách đơn hàng.",
        );
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const getStatusDisplay = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Đang chờ xác nhận",
          class: "bg-amber-50 text-amber-700 border-amber-300 font-semibold",
          icon: Clock,
          color: "text-amber-600",
        };
      case "CONFIRMED":
        return {
          label: "Đã xác nhận / Thành công",
          class:
            "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold",
          icon: CheckCircle2,
          color: "text-emerald-600",
        };
      case "SHIPPED":
        return {
          label: "Đang giao hàng",
          class: "bg-blue-50 text-blue-700 border-blue-300 font-semibold",
          icon: Truck,
          color: "text-blue-600",
        };
      case "DELIVERED":
        return {
          label: "Đã giao hàng thành công",
          class: "bg-teal-50 text-teal-700 border-teal-300 font-semibold",
          icon: PackageCheck,
          color: "text-teal-600",
        };
      case "CANCELLED":
        return {
          label: "Đã hủy",
          class: "bg-red-50 text-red-700 border-red-300 font-semibold",
          icon: XCircle,
          color: "text-red-600",
        };
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-surface-container-lowest py-24 px-6 flex flex-col items-center justify-center text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-on-surface-variant font-medium text-sm">
          Đang tải lịch sử đơn hàng của bạn...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-surface-container-lowest py-24 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
            <XCircle size={36} />
          </div>
          <h2 className="text-headline-md text-primary font-bold">
            Lỗi truy xuất đơn hàng
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {error}. Vui lòng kiểm tra lại trạng thái đăng nhập hoặc liên hệ
            CSKH.
          </p>
          <div className="pt-4 space-y-3">
            <Link
              href="/"
              className="w-full py-4 bg-primary text-white rounded-xl flex items-center justify-center font-semibold hover:bg-primary-container transition-all text-sm uppercase tracking-wider"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface-container-lowest py-16 px-6 lg:px-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 space-y-12">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
              <ShoppingBag className="text-primary h-8 w-8" />
              Đơn hàng của tôi
            </h1>
            <p className="text-xs text-on-surface-variant mt-1 font-medium">
              Quản lý và theo dõi trạng thái các đơn hàng bạn đã đặt mua
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Tiếp tục mua sắm <ArrowRight size={16} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-16 rounded-3xl border border-outline-variant/30 text-center space-y-6 shadow-xs max-w-xl mx-auto"
          >
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
              <PackageOpen size={40} />
            </div>
            <h2 className="text-2xl font-bold text-on-surface">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Bạn chưa thực hiện bất kỳ giao dịch mua sắm nào. Khám phá các sản
              phẩm nhân sâm tự nhiên cao cấp của chúng tôi ngay hôm nay!
            </p>
            <div className="pt-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold tracking-wider text-sm uppercase shadow-lg hover:bg-primary-container transition-all"
              >
                Khám phá sản phẩm <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusDisplay = getStatusDisplay(order.status);
              const StatusIcon = statusDisplay.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-outline-variant/30 shadow-xs overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-lg font-bold text-primary">
                          #{order.orderCode}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border shadow-xs ${statusDisplay.class}`}
                        >
                          <StatusIcon
                            size={14}
                            className={statusDisplay.color}
                          />
                          {statusDisplay.label}
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant">
                        Ngày đặt:{" "}
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        router.push(`/order-status/${order.orderCode}`)
                      }
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-xs tracking-wider uppercase hover:bg-primary-container shadow-xs self-start sm:self-center transition-all"
                    >
                      Theo dõi đơn hàng <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="p-6 divide-y divide-outline-variant/10 max-h-[320px] overflow-y-auto pr-2">
                    {order.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0 gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 bg-surface-container rounded-2xl overflow-hidden relative shrink-0 border border-outline-variant/20 shadow-xs">
                            {it.image ? (
                              <Image
                                src={it.image}
                                alt={it.name}
                                fill
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-on-surface line-clamp-1">
                              {it.name}
                            </h4>
                            {it.sku && (
                              <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                                Mã SP: {it.sku}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs">
                          <span className="font-semibold text-on-surface-variant">
                            x{it.quantity}
                          </span>
                          <span className="font-bold text-primary font-mono sm:text-sm">
                            {formatCurrencyVND(it.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-surface-container-low p-6 border-t border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-on-surface-variant font-medium">
                      <span>
                        Địa chỉ nhận:{" "}
                        <strong className="text-on-surface">
                          {order.shippingAddress}
                        </strong>
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        Thanh toán:{" "}
                        <strong className="text-on-surface">
                          {order.paymentMethod === "VIETQR"
                            ? "Thanh toán qua mã QR"
                            : order.paymentMethod}
                        </strong>
                      </span>
                    </div>

                    <div className="self-end sm:self-center text-right space-y-1">
                      {Number(order.couponDiscountAmount ?? 0) > 0 ? (
                        <div className="text-xs font-semibold text-red-600">
                          Giảm giá
                          {order.couponCode ? ` (${order.couponCode})` : ""}: -
                          {formatCurrencyVND(
                            Number(order.couponDiscountAmount),
                          )}
                        </div>
                      ) : null}
                      <div className="flex items-center justify-end gap-3 font-bold">
                        <span className="text-xs text-on-surface-variant uppercase tracking-wider">
                          Tổng số tiền:
                        </span>
                        <span className="text-xl font-extrabold text-primary font-mono">
                          {formatCurrencyVND(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
