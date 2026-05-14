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

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminCategoryPayload = {
  name: string;
  description?: string;
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

function sanitizeCategory(value: unknown): AdminCategory | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    typeof item.name !== "string" ||
    typeof item.slug !== "string"
  ) {
    return null;
  }

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: typeof item.description === "string" ? item.description : null,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
  };
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

export async function getAdminCategories(): Promise<AdminCategory[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/categories`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new Error("Cannot connect to server.");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch categories (${response.status}).`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => sanitizeCategory(item))
    .filter((item): item is AdminCategory => item !== null);
}

export async function getAdminCategoryById(id: string): Promise<AdminCategory | null> {
  if (!id.trim()) {
    return null;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/categories/${id}`, {
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
    throw new Error(`Failed to fetch category (${response.status}).`);
  }

  const payload = await response.json();
  return sanitizeCategory(payload);
}

export async function createAdminCategory(payload: AdminCategoryPayload) {
  const response = await adminRequest(`${API_BASE_URL}/categories`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to create category.");
    throw new Error(message);
  }
}

export async function updateAdminCategory(id: string, payload: AdminCategoryPayload) {
  const response = await adminRequest(`${API_BASE_URL}/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to update category.");
    throw new Error(message);
  }
}

export async function deleteAdminCategory(id: string) {
  const response = await adminRequest(`${API_BASE_URL}/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to delete category.");
    throw new Error(message);
  }
}
