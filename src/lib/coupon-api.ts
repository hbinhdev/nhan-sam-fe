import { getAuthSession } from '@/lib/auth-api';

const DEFAULT_API_BASE_URL = 'http://localhost:3001/api';

function resolveApiBaseUrl() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const candidate =
    rawBaseUrl && rawBaseUrl.trim() ? rawBaseUrl.trim() : DEFAULT_API_BASE_URL;

  try {
    const parsed = new URL(candidate);
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_API_BASE_URL;
  }
}

const API_BASE_URL = resolveApiBaseUrl();

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export type Coupon = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponPayload = {
  code: string;
  name: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  startDate: string;
  endDate: string;
  isActive?: boolean;
};

export type CouponValidationResponse = {
  coupon: Coupon;
  discountAmount: number;
  finalTotal: number;
};

function getAdminToken() {
  const session = getAuthSession();
  if (!session?.access_token) {
    throw new Error('Session expired. Please sign in again.');
  }
  return session.access_token;
}

async function parseApiError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message[0];
    }
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

async function adminRequest(url: string, init: RequestInit) {
  const token = getAdminToken();
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new Error('Cannot connect to server.');
  }

  return response;
}

export async function getAdminCoupons(): Promise<Coupon[]> {
  const response = await adminRequest(`${API_BASE_URL}/coupons`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch coupons (${response.status}).`);
  }

  const payload = (await response.json()) as Coupon[];
  return Array.isArray(payload) ? payload : [];
}

export async function getAdminCouponById(id: string): Promise<Coupon | null> {
  const response = await adminRequest(`${API_BASE_URL}/coupons/${id}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch coupon (${response.status}).`);
  }

  return (await response.json()) as Coupon;
}

export async function createAdminCoupon(payload: CouponPayload) {
  const response = await adminRequest(`${API_BASE_URL}/coupons`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, 'Failed to create coupon.');
    throw new Error(message);
  }

  return (await response.json()) as Coupon;
}

export async function updateAdminCoupon(id: string, payload: Partial<CouponPayload>) {
  const response = await adminRequest(`${API_BASE_URL}/coupons/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, 'Failed to update coupon.');
    throw new Error(message);
  }

  return (await response.json()) as Coupon;
}

export async function deleteAdminCoupon(id: string) {
  const response = await adminRequest(`${API_BASE_URL}/coupons/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const message = await parseApiError(response, 'Failed to delete coupon.');
    throw new Error(message);
  }
}

export async function validateCoupon(code: string, cartTotal: number): Promise<CouponValidationResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, cartTotal }),
    });
  } catch {
    throw new Error('Cannot connect to server.');
  }

  if (!response.ok) {
    const message = await parseApiError(response, 'Mã giảm giá không hợp lệ.');
    throw new Error(message);
  }

  return (await response.json()) as CouponValidationResponse;
}
