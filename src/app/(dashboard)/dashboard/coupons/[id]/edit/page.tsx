"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CouponForm } from '@/components/dashboard/coupons/CouponForm';
import { getAdminCouponById, type Coupon } from '@/lib/coupon-api';
import { useToast } from '@/components/shared/toast/ToastProvider';

export default function EditCouponPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (typeof id !== 'string') return;
      setLoading(true);
      setNotFound(false);
      try {
        const data = await getAdminCouponById(id);
        if (!data) {
          setNotFound(true);
          showToast('Không tìm thấy mã giảm giá.', 'error');
        } else {
          setCoupon(data);
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Không thể tải mã giảm giá.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sửa mã giảm giá</h1>
        <p className="text-sm text-slate-500">Cập nhật cấu hình mã giảm giá.</p>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-slate-500">Đang tải mã giảm giá...</div>
      ) : notFound ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">Không tìm thấy mã giảm giá.</div>
      ) : (
        <CouponForm mode="edit" initialData={coupon} />
      )}
    </div>
  );
}
