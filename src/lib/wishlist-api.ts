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

export async function fetchWishlist() {
  const token = getAuthToken();
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/wishlist`, {
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

export async function addToWishlistApi(productId: string) {
  const token = getAuthToken();
  if (!token) return;

  await fetch(`${API_BASE_URL}/wishlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId }),
  });
}

export async function removeWishlistItemApi(productId: string) {
  const token = getAuthToken();
  if (!token) return;

  await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function clearWishlistApi() {
  const token = getAuthToken();
  if (!token) return;

  await fetch(`${API_BASE_URL}/wishlist`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
