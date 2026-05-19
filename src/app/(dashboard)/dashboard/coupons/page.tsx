"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  deleteAdminCoupon,
  getAdminCoupons,
  type Coupon,
} from '@/lib/coupon-api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Plus, Trash2 } from 'lucide-react';

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
  const [error, setError] = useState<string | null>(null);

  const loadCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminCoupons();
      setCoupons(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load coupons.');
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

  const handleDelete = async (coupon: Coupon) => {
    const confirmed = window.confirm(`Delete coupon "${coupon.code}"?`);
    if (!confirmed) return;

    try {
      await deleteAdminCoupon(coupon.id);
      await loadCoupons();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete coupon.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Coupons</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage discount codes.</p>
        </div>
        <Button onClick={() => router.push('/dashboard/coupons/add')} className="bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      {loading ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">No coupons found.</div>
      ) : (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount Type</TableHead>
                <TableHead>Discount Value</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Date Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-semibold">{coupon.code}</TableCell>
                  <TableCell>{coupon.discountType}</TableCell>
                  <TableCell>{discountLabel(coupon)}</TableCell>
                  <TableCell>
                    {coupon.usedCount}/{coupon.usageLimit ?? '∞'}
                  </TableCell>
                  <TableCell>{formatDateRange(coupon.startDate, coupon.endDate)}</TableCell>
                  <TableCell>
                    <span className={coupon.isActive ? 'text-emerald-600' : 'text-red-600'}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon-sm" className="h-8 w-8" onClick={() => router.push(`/dashboard/coupons/${coupon.id}/edit`)}>
                        <Edit size={16} />
                      </Button>
                      <Button variant="destructive" size="icon-sm" className="h-8 w-8" onClick={() => void handleDelete(coupon)}>
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
    </div>
  );
}
