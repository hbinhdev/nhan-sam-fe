"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getOrders, updateOrderStatus, type Order } from "@/lib/order-api";
import { formatCurrencyVND } from "@/lib/product-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
} from "lucide-react";

export function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Lỗi tải danh sách đơn hàng.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    status: Order["status"],
    adminNote?: string,
  ) => {
    setUpdatingId(id);
    try {
      const updated = await updateOrderStatus(id, status, adminNote);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Cập nhật trạng thái thất bại.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="warning"
            className="bg-amber-50 text-amber-700 border-amber-300 font-semibold px-2.5 py-1 flex items-center gap-1.5 shadow-xs w-fit"
          >
            <Clock size={13} className="text-amber-600 animate-pulse" /> Chờ xác
            nhận (CK)
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge
            variant="success"
            className="bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold px-2.5 py-1 flex items-center gap-1.5 shadow-xs w-fit"
          >
            <CheckCircle2 size={13} className="text-emerald-600" /> Đã xác nhận
            (Thành công)
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-700 border-blue-300 font-semibold px-2.5 py-1 flex items-center gap-1.5 shadow-xs w-fit"
          >
            <Truck size={13} className="text-blue-600" /> Đang giao
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge
            variant="success"
            className="bg-teal-50 text-teal-700 border-teal-300 font-semibold px-2.5 py-1 flex items-center gap-1.5 shadow-xs w-fit"
          >
            <PackageCheck size={13} className="text-teal-600" /> Đã giao hàng
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="danger"
            className="bg-red-50 text-red-700 border-red-300 font-semibold px-2.5 py-1 flex items-center gap-1.5 shadow-xs w-fit"
          >
            <XCircle size={13} className="text-red-600" /> Đã hủy
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mx-auto mb-3" />
        Đang tải danh sách đơn hàng...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 font-medium">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-16 text-center">
        <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <Clock size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
          Chưa có đơn hàng nào
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Các đơn hàng mới từ trang đặt hàng sẽ xuất hiện tự động tại đây để bạn
          đối soát thanh toán.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
            <TableRow>
              <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                Mã đơn
              </TableHead>
              <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                Khách hàng
              </TableHead>
              <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                Ngày đặt
              </TableHead>
              <TableHead className="font-bold text-slate-900 dark:text-slate-100">
                Nội dung CK
              </TableHead>
              <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-right">
                Tổng tiền
              </TableHead>
              <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-center">
                Trạng thái
              </TableHead>
              <TableHead className="font-bold text-slate-900 dark:text-slate-100 text-right">
                Đối soát / Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className={
                  order.status === "PENDING"
                    ? "bg-amber-50/30 dark:bg-amber-950/20"
                    : ""
                }
              >
                <TableCell className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-base">
                  {order.orderCode}
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {order.customerName}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {order.customerPhone}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  {new Date(order.createdAt).toLocaleString("vi-VN", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </TableCell>
                <TableCell className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2 rounded">
                  {order.paymentNote || order.orderCode}
                </TableCell>
                <TableCell className="text-right font-bold text-primary font-mono text-base">
                  <div className="space-y-0.5">
                    <div>{formatCurrencyVND(order.totalAmount)}</div>
                    {Number(order.couponDiscountAmount ?? 0) > 0 ? (
                      <div className="text-[11px] font-semibold text-red-600">
                        -{formatCurrencyVND(Number(order.couponDiscountAmount))}
                        {order.couponCode ? ` (${order.couponCode})` : ""}
                      </div>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center ml-4">
                    {getStatusBadge(order.status)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    {order.status === "PENDING" ? (
                      <Button
                        size="sm"
                        className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold gap-1.5 shadow-xs"
                        disabled={updatingId === order.id}
                        onClick={() =>
                          void handleUpdateStatus(
                            order.id,
                            "CONFIRMED",
                            "Đã nhận thanh toán qua mã QR",
                          )
                        }
                        title="Xác nhận đã nhận tiền chuyển khoản và hoàn tất đơn"
                      >
                        <CheckCircle2 size={16} />
                        Xác nhận CK (Thành công)
                      </Button>
                    ) : (
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          void handleUpdateStatus(
                            order.id,
                            e.target.value as any,
                          )
                        }
                        className="h-8 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="PENDING">Chờ CK</option>
                        <option value="CONFIRMED">Thành công</option>
                        <option value="SHIPPED">Đang giao</option>
                        <option value="DELIVERED">Đã giao</option>
                        <option value="CANCELLED">Hủy đơn</option>
                      </select>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye size={15} />
                      Chi tiết
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(selectedOrder)}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="w-[95vw] max-w-2xl sm:max-w-3xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 shadow-2xl">
          {selectedOrder && (
            <div className="flex max-h-[90vh] flex-col">
              <DialogHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-10 py-5">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3 font-mono">
                    Đơn hàng #{selectedOrder.orderCode}
                  </DialogTitle>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <DialogDescription className="text-xs text-slate-500 mt-1">
                  Thời gian đặt hàng:{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
                {selectedOrder.status === "PENDING" && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-amber-900 text-xs">
                    <AlertCircle
                      size={18}
                      className="text-amber-600 shrink-0 mt-0.5"
                    />
                    <div>
                      <strong className="font-bold block mb-1">
                        Hướng dẫn đối soát thanh toán:
                      </strong>
                      Khách hàng được yêu cầu thanh toán qua mã QR với nội dung
                      chính xác là{" "}
                      <strong className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        {selectedOrder.orderCode}
                      </strong>{" "}
                      số tiền{" "}
                      <strong className="font-bold text-primary">
                        {formatCurrencyVND(selectedOrder.totalAmount)}
                      </strong>
                      . Hãy kiểm tra biến động số dư trên app ngân hàng của bạn.
                      Nếu khớp giao dịch, bấm nút{" "}
                      <strong>Xác nhận CK (Thành công)</strong> bên dưới.
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Khách hàng:
                    </span>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {selectedOrder.customerName}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                      {selectedOrder.customerPhone}
                    </div>
                    {selectedOrder.customerEmail && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {selectedOrder.customerEmail}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                      Địa chỉ giao hàng:
                    </span>
                    <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {selectedOrder.shippingAddress}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block tracking-wider">
                    Danh sách sản phẩm:
                  </span>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                    {selectedOrder.items.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 relative overflow-hidden border">
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
                            <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm line-clamp-1">
                              {it.name}
                            </div>
                            {it.sku && (
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                SKU: {it.sku}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="font-semibold text-slate-600 dark:text-slate-400">
                            x{it.quantity}
                          </span>
                          <span className="font-bold text-primary font-mono">
                            {formatCurrencyVND(it.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2">
                  {Number(selectedOrder.couponDiscountAmount ?? 0) > 0 ? (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Giảm giá
                        {selectedOrder.couponCode
                          ? ` (${selectedOrder.couponCode})`
                          : ""}
                        :
                      </span>
                      <span className="font-bold text-red-600">
                        -
                        {formatCurrencyVND(
                          Number(selectedOrder.couponDiscountAmount),
                        )}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between items-center font-bold text-base">
                    <span className="text-slate-800 dark:text-slate-200">
                      Tổng thanh toán:
                    </span>
                    <span className="text-xl font-extrabold text-primary font-mono">
                      {formatCurrencyVND(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Chuyển trạng thái:
                  </span>
                  <select
                    value={selectedOrder.status}
                    disabled={updatingId === selectedOrder.id}
                    onChange={(e) =>
                      void handleUpdateStatus(
                        selectedOrder.id,
                        e.target.value as any,
                      )
                    }
                    className="h-10 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  >
                    <option value="PENDING">Chờ CK</option>
                    <option value="CONFIRMED">Thành công</option>
                    <option value="SHIPPED">Đang giao</option>
                    <option value="DELIVERED">Đã giao</option>
                    <option value="CANCELLED">Hủy đơn</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  {selectedOrder.status === "PENDING" && (
                    <Button
                      className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold h-10 px-5 shadow-md gap-1.5"
                      disabled={updatingId === selectedOrder.id}
                      onClick={() =>
                        void handleUpdateStatus(
                          selectedOrder.id,
                          "CONFIRMED",
                          "Đã đối soát thanh toán thành công",
                        )
                      }
                    >
                      <CheckCircle2 size={16} />
                      Xác nhận CK (Thành công)
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="h-10 px-5 font-semibold"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
