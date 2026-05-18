import { getAuthSession } from "@/lib/auth-api";

const DEFAULT_API_BASE_URL = "http://localhost:3001/api";

function resolveApiBaseUrl() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const candidate = rawBaseUrl && rawBaseUrl.trim() ? rawBaseUrl.trim() : DEFAULT_API_BASE_URL;

  try {
    const parsed = new URL(candidate);
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_API_BASE_URL;
  }
}

const API_BASE_URL = resolveApiBaseUrl();

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
};

export type Order = {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  totalAmount: number;
  paymentMethod: string;
  paymentNote?: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  items: OrderItem[];
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderPayload = {
  orderCode: string;
  customerName: string;
  userId?: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  totalAmount: number;
  paymentMethod?: string;
  paymentNote?: string;
  items: OrderItem[];
};

function getAuthToken() {
  const session = getAuthSession();
  if (!session?.access_token) {
    throw new Error("Session expired. Please sign in again.");
  }
  return session.access_token;
}

async function parseApiError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message[0];
    }
    if (typeof payload.message === "string" && payload.message.trim()) {
      return payload.message;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Đặt hàng thất bại. Vui lòng thử lại sau.");
    throw new Error(message);
  }

  return await response.json();
}

export async function getOrderByCode(code: string): Promise<Order | null> {
  const response = await fetch(`${API_BASE_URL}/orders/code/${encodeURIComponent(code)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Lỗi tải đơn hàng (${response.status})`);
  }

  return await response.json();
}

// Fetch logged-in customer's orders
export async function getMyOrders(): Promise<Order[]> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Lỗi tải đơn hàng của tôi (${response.status})`);
  }

  return await response.json();
}

// Admin APIs
export async function getOrders(): Promise<Order[]> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Lỗi tải danh sách đơn hàng (${response.status})`);
  }

  return await response.json();
}

export async function updateOrderStatus(id: string, status: Order["status"], adminNote?: string): Promise<Order> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status, adminNote }),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Cập nhật trạng thái thất bại.");
    throw new Error(message);
  }

  return await response.json();
}
