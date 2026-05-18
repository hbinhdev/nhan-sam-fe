import { getAuthSession } from "@/lib/auth-api";

const DEFAULT_API_BASE_URL = "http://localhost:3001/api";

function resolveApiBaseUrl() {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const candidate =
    rawBaseUrl && rawBaseUrl.trim() ? rawBaseUrl.trim() : DEFAULT_API_BASE_URL;

  try {
    const parsed = new URL(candidate);
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_API_BASE_URL;
  }
}

const API_BASE_URL = resolveApiBaseUrl();

export type PaymentQrConfig = {
  id: string;
  bankName: string;
  bankCode: string;
  bin: string;
  accountNumber: string;
  accountName: string;
  customQrImage?: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PaymentQrPayload = {
  bankName: string;
  bankCode: string;
  bin: string;
  accountNumber: string;
  accountName: string;
  customQrImage?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
};

function getAdminToken() {
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

async function adminRequest(url: string, init: RequestInit) {
  const token = getAdminToken();
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new Error("Cannot connect to server.");
  }

  return response;
}

export async function getPaymentQrConfigs(): Promise<PaymentQrConfig[]> {
  const response = await adminRequest(`${API_BASE_URL}/payment-qr`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch QR configs (${response.status}).`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload;
}

export async function getDefaultPaymentQrConfig(): Promise<PaymentQrConfig | null> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/payment-qr/default`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new Error("Cannot connect to server.");
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch default QR config (${response.status}).`);
  }

  return await response.json();
}

export async function createPaymentQrConfig(payload: PaymentQrPayload) {
  const response = await adminRequest(`${API_BASE_URL}/payment-qr`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to create QR config.");
    throw new Error(message);
  }
  return await response.json();
}

export async function updatePaymentQrConfig(id: string, payload: PaymentQrPayload) {
  const response = await adminRequest(`${API_BASE_URL}/payment-qr/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to update QR config.");
    throw new Error(message);
  }
  return await response.json();
}

export async function setDefaultPaymentQrConfig(id: string) {
  const response = await adminRequest(`${API_BASE_URL}/payment-qr/${id}/set-default`, {
    method: "POST",
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to set default QR config.");
    throw new Error(message);
  }
  return await response.json();
}

export async function deletePaymentQrConfig(id: string) {
  const response = await adminRequest(`${API_BASE_URL}/payment-qr/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to delete QR config.");
    throw new Error(message);
  }
}
