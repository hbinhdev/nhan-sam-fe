"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CouponForm } from '@/components/dashboard/coupons/CouponForm';
import { getAdminCouponById, type Coupon } from '@/lib/coupon-api';

export default function EditCouponPage() {
  const { id } = useParams();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (typeof id !== 'string') return;
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminCouponById(id);
        if (!data) {
          setError('Coupon not found.');
        } else {
          setCoupon(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load coupon.');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Coupon</h1>
        <p className="text-sm text-slate-500">Update coupon settings.</p>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-slate-500">Loading coupon...</div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
        <CouponForm mode="edit" initialData={coupon} />
      )}
    </div>
  );
}
