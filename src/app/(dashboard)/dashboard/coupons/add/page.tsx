"use client";

import React from 'react';
import { CouponForm } from '@/components/dashboard/coupons/CouponForm';

export default function AddCouponPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thêm mã giảm giá mới</h1>
        <p className="text-sm text-slate-500">Tạo mã giảm giá mới.</p>
      </div>

      <CouponForm mode="create" />
    </div>
  );
}
