"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrencyVND } from '@/lib/product-api';
import {
  createAdminCoupon,
  updateAdminCoupon,
  type Coupon,
  type CouponDiscountType,
} from '@/lib/coupon-api';
import { useToast } from '@/components/shared/toast/ToastProvider';

type FormMode = 'create' | 'edit';

interface CouponFormProps {
  mode: FormMode;
  initialData?: Coupon | null;
}

function toLocalDateTimeString(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

const defaultStart = toLocalDateTimeString(new Date());
const defaultEnd = toLocalDateTimeString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

function normalizeDiscountValueForInput(
  value: number | string | null | undefined,
  discountType: CouponDiscountType,
) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '';
  }

  if (discountType === 'FIXED_AMOUNT') {
    return String(Math.trunc(numeric));
  }

  return String(numeric);
}

function normalizeMoneyValueForInput(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '';
  }

  return String(Math.trunc(numeric));
}

export function CouponForm({ mode, initialData }: CouponFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const [form, setForm] = useState({
    code: initialData?.code || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    discountType: (initialData?.discountType || 'PERCENTAGE') as CouponDiscountType,
    discountValue: normalizeDiscountValueForInput(
      initialData?.discountValue,
      (initialData?.discountType || 'PERCENTAGE') as CouponDiscountType,
    ),
    minOrderAmount: normalizeMoneyValueForInput(initialData?.minOrderAmount ?? 0),
    maxDiscountAmount:
      initialData?.maxDiscountAmount !== null && initialData?.maxDiscountAmount !== undefined
        ? normalizeMoneyValueForInput(initialData.maxDiscountAmount)
        : '',
    usageLimit:
      initialData?.usageLimit !== null && initialData?.usageLimit !== undefined
        ? String(initialData.usageLimit)
        : '',
    startDate: initialData?.startDate ? initialData.startDate.slice(0, 16) : defaultStart,
    endDate: initialData?.endDate ? initialData.endDate.slice(0, 16) : defaultEnd,
    isActive: initialData?.isActive ?? true,
  });
  const previewDiscountValue = Number(form.discountValue || 0);
  const discountValueError =
    form.discountType === 'PERCENTAGE' &&
    form.discountValue.trim() !== '' &&
    (Number.isNaN(previewDiscountValue) ||
      previewDiscountValue < 0 ||
      previewDiscountValue > 100)
      ? 'Giá trị phần trăm phải từ 0 đến 100.'
      : null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!form.code.trim() || !form.name.trim()) {
      showToast('Code và Tên mã là bắt buộc.', 'error');
      return;
    }

    const discountValue = Number(form.discountValue);
    const minOrderAmount = Number(form.minOrderAmount || 0);
    const hasMaxDiscountAmount = form.maxDiscountAmount.trim() !== '';
    const hasUsageLimit = form.usageLimit.trim() !== '';
    const maxDiscountAmount = hasMaxDiscountAmount
      ? Number(form.maxDiscountAmount)
      : undefined;
    const usageLimit = hasUsageLimit ? Number(form.usageLimit) : undefined;

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      showToast('Giá trị giảm phải lớn hơn 0.', 'error');
      return;
    }

    if (form.discountType === 'PERCENTAGE' && discountValue > 100) {
      showToast('Giảm theo phần trăm không được lớn hơn 100.', 'error');
      return;
    }
    if (form.discountType === 'PERCENTAGE' && discountValue < 0) {
      showToast('Giảm theo phần trăm phải lớn hơn hoặc bằng 0.', 'error');
      return;
    }
    if (discountValueError) {
      showToast(discountValueError, 'error');
      return;
    }

    if (Number.isNaN(minOrderAmount) || minOrderAmount < 0) {
      showToast('Giá trị đơn hàng tối thiểu không hợp lệ.', 'error');
      return;
    }

    if (maxDiscountAmount !== undefined && (Number.isNaN(maxDiscountAmount) || maxDiscountAmount < 0)) {
      showToast('Mức giảm tối đa không hợp lệ.', 'error');
      return;
    }

    if (usageLimit !== undefined && (Number.isNaN(usageLimit) || usageLimit < 1)) {
      showToast('Giới hạn lượt dùng phải lớn hơn hoặc bằng 1.', 'error');
      return;
    }

    if (form.discountType === 'FIXED_AMOUNT' && maxDiscountAmount !== undefined) {
      showToast('Giảm số tiền cố định không dùng mức giảm tối đa.', 'error');
      return;
    }

    setSaving(true);
    try {
      const basePayload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue,
        minOrderAmount,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        isActive: form.isActive,
      };

      if (mode === 'create') {
        const payload = {
          ...basePayload,
          maxDiscountAmount,
          usageLimit,
        };
        await createAdminCoupon(payload);
      } else if (initialData?.id) {
        const payload = {
          ...basePayload,
          maxDiscountAmount: hasMaxDiscountAmount ? maxDiscountAmount : null,
          usageLimit: hasUsageLimit ? usageLimit : null,
        };
        await updateAdminCoupon(initialData.id, payload);
      }

      showToast(mode === 'create' ? 'Tạo mã giảm giá thành công.' : 'Cập nhật mã giảm giá thành công.', 'success');
      router.push('/dashboard/coupons');
      router.refresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không thể lưu mã giảm giá.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <form className="flex flex-col" onSubmit={handleSubmit}>
        <div className="p-4 sm:p-6 space-y-6">`r`n
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Code *">
              <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} />
            </Field>
            <Field label="Tên mã *">
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </Field>

            <Field label="Loại giảm giá *">
              <select
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={form.discountType}
                onChange={(e) =>
                  setForm((p) => {
                    const nextType = e.target.value as CouponDiscountType;
                    return {
                      ...p,
                      discountType: nextType,
                      discountValue: normalizeDiscountValueForInput(p.discountValue, nextType),
                    };
                  })
                }
              >
                <option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Giảm số tiền cố định (đ)</option>
              </select>
            </Field>
            <Field label="Giá trị giảm *">
              <div className="space-y-2">
                <Input
                  type="number"
                  min="0"
                  max={form.discountType === 'PERCENTAGE' ? '100' : undefined}
                  step={form.discountType === 'PERCENTAGE' ? '1' : '1'}
                  value={form.discountValue}
                  onChange={(e) => {
                    const nextRaw = e.target.value;
                    if (form.discountType === 'FIXED_AMOUNT') {
                      setForm((p) => ({
                        ...p,
                        discountValue: nextRaw.includes('.')
                          ? nextRaw.split('.')[0]
                          : nextRaw,
                      }));
                      return;
                    }

                    setForm((p) => ({ ...p, discountValue: nextRaw }));
                  }}
                />
                <p className="text-xs text-slate-500">
                  {form.discountType === 'FIXED_AMOUNT'
                    ? `≈ ${formatCurrencyVND(
                        Number.isFinite(previewDiscountValue) ? previewDiscountValue : 0,
                      )}`
                    : `Giảm ${Number.isFinite(previewDiscountValue) ? previewDiscountValue : 0}%`}
                </p>
                {discountValueError ? (
                  <p className="text-xs text-red-600 font-medium">{discountValueError}</p>
                ) : null}
              </div>
            </Field>

            <Field label="Bắt đầu *">
              <Input type="datetime-local" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
            </Field>
            <Field label="Kết thúc *">
              <Input type="datetime-local" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
            </Field>

            <Field label="Trạng thái">
              <label className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                />
                <span className="font-medium text-slate-700">Đang bật</span>
              </label>
            </Field>
          </div>

          <details className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <summary className="cursor-pointer select-none text-sm font-semibold text-slate-800">
              Cài đặt nâng cao
            </summary>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Mô tả">
                <textarea
                  className="min-h-[90px] w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </Field>

              <Field label="Giá trị đơn hàng tối thiểu">
                <Input type="number" min="0" step="1" value={form.minOrderAmount} onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))} />
                <p className="text-xs text-slate-500">{formatCurrencyVND(Number(form.minOrderAmount || 0))}</p>
              </Field>

              <Field label="Mức giảm tối đa">
                <Input type="number" min="0" step="1" value={form.maxDiscountAmount} onChange={(e) => setForm((p) => ({ ...p, maxDiscountAmount: e.target.value }))} />
                <p className="text-xs text-slate-500">{formatCurrencyVND(Number(form.maxDiscountAmount || 0))}</p>
              </Field>

              <Field label="Giới hạn lượt dùng">
                <Input type="number" min="1" step="1" value={form.usageLimit} onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))} />
              </Field>
            </div>
          </details>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>Hủy</Button>
          <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800" disabled={saving}>
            {saving ? 'Đang lưu...' : mode === 'create' ? 'Lưu mã giảm giá' : 'Cập nhật mã giảm giá'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

