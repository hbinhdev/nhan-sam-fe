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

function getAuthToken() {
  const session = getAuthSession();
  return session?.access_token;
}

export async function fetchCart() {
  const token = getAuthToken();
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (!response.ok) return [];
  return response.json();
}

export async function addToCartApi(productId: string, quantity: number) {
  const token = getAuthToken();
  if (!token) return;

  await fetch(`${API_BASE_URL}/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });
}

export async function updateCartItemApi(productId: string, quantity: number) {
  const token = getAuthToken();
  if (!token) return;

  await fetch(`${API_BASE_URL}/cart/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItemApi(productId: string) {
  const token = getAuthToken();
  if (!token) return;

  await fetch(`${API_BASE_URL}/cart/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function syncCartApi(items: { productId: string; quantity: number }[]) {
  const token = getAuthToken();
  if (!token) return;

  await fetch(`${API_BASE_URL}/cart/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });
}

export async function clearCartApi() {
  const token = getAuthToken();
  if (!token) return;

  await fetch(`${API_BASE_URL}/cart`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
