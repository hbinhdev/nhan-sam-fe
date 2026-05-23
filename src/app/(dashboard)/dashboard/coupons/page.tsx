"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  deleteAdminCoupon,
  getAdminCoupons,
  type Coupon,
} from '@/lib/coupon-api';
import { exportCouponsReport } from '@/lib/report-api';
import { useToast } from '@/components/shared/toast/ToastProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Download, Edit, Plus, Trash2 } from 'lucide-react';

function formatDateRange(startDate: string, endDate: string) {
  const start = new Date(startDate).toLocaleDateString('vi-VN');
  const end = new Date(endDate).toLocaleDateString('vi-VN');
  return `${start} - ${end}`;
}

function discountLabel(item: Coupon) {
  if (item.discountType === 'PERCENTAGE') {
    return `${item.discountValue}%`;
  }
  return new Intl.NumberFormat('vi-VN').format(item.discountValue) + 'đ';
}

export default function CouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminCoupons();
      setCoupons(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải danh sách mã giảm giá.');
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      void loadCoupons();
    });
  }, []);

  const confirmDeleteCoupon = async () => {
    if (!deletingCoupon) return;
    setDeleting(true);
    try {
      await deleteAdminCoupon(deletingCoupon.id);
      showToast('Xóa mã giảm giá thành công.', 'success');
      setDeletingCoupon(null);
      await loadCoupons();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Không thể xóa mã giảm giá.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCouponsReport();
      showToast('Xuất danh sách mã giảm giá thành công.', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Xuất danh sách mã giảm giá thất bại.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Mã giảm giá</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý mã ưu đãi.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void handleExport()} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? 'Đang xuất...' : 'Xuất Excel'}
          </Button>
          <Button onClick={() => router.push('/dashboard/coupons/add')} className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" />
            Thêm mã giảm giá
          </Button>
        </div>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      {loading ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">Đang tải mã giảm giá...</div>
      ) : coupons.length === 0 ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">Không tìm thấy mã giảm giá.</div>
      ) : (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount Name</TableHead>
                <TableHead>Giá trị giảm</TableHead>
                <TableHead>Lượt dùng</TableHead>
                <TableHead>Thời gian áp dụng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-semibold">{coupon.code}</TableCell>
                  <TableCell>{coupon.name}</TableCell>
                  <TableCell>{discountLabel(coupon)}</TableCell>
                  <TableCell>
                    {coupon.usedCount}/{coupon.usageLimit ?? '∞'}
                  </TableCell>
                  <TableCell>{formatDateRange(coupon.startDate, coupon.endDate)}</TableCell>
                  <TableCell>
                    <span className={coupon.isActive ? 'text-emerald-600' : 'text-red-600'}>
                      {coupon.isActive ? 'Đang bật' : 'Đang tắt'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon-sm" className="h-8 w-8" onClick={() => router.push(`/dashboard/coupons/${coupon.id}/edit`)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="destructive" size="icon-sm" className="h-8 w-8" onClick={() => setDeletingCoupon(coupon)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={Boolean(deletingCoupon)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeletingCoupon(null);
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl border border-slate-200 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-3 text-xl text-slate-900">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={20} />
              </span>
              Xác nhận xóa mã giảm giá
            </DialogTitle>
            <DialogDescription className="pt-2 text-[15px] leading-7 text-slate-600">
              Bạn có chắc muốn xóa mã:
              <span className="block mt-2 rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-900">
                {deletingCoupon?.code}
              </span>
              <span className="mt-2 block text-red-600">
                Hành động này không thể hoàn tác.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50/60">
            <Button variant="outline" onClick={() => setDeletingCoupon(null)} disabled={deleting} className="min-w-24 border-slate-300">
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => void confirmDeleteCoupon()} disabled={deleting} className="min-w-32">
              {deleting ? "Đang xóa..." : "Xóa mã"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
