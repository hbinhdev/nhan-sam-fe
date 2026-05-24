import { getAuthSession } from "@/lib/auth-api";
import type { Category } from "@/lib/category-api";
import { getCategories } from "@/lib/category-api";
import type { ProductListResponse, ProductSummary } from "@/lib/product-api";

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

export type AdminProductQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
};

export type AdminProductPayload = {
  name: string;
  shortDescription?: string;
  description?: string;
  price: number;
  origin?: string;
  brand?: string;
  usagePurpose?: string;
  usageInstructions?: string;
  ginsengAge?: string;
  stock?: number;
  imageUrl?: string;
  images?: string[];
  videoUrl?: string | null;
  categoryId: string;
};

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.append(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

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

async function authorizedRequest(url: string, init: RequestInit = {}) {
  const token = getAdminToken();
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
}

function sanitizeProduct(value: unknown): ProductSummary | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.name !== "string") {
    return null;
  }

  const price = Number(item.price ?? 0);
  const stock = Number(item.stock ?? 0);

  return {
    id: item.id,
    slug: typeof item.slug === "string" && item.slug ? item.slug : item.id,
    sku: typeof item.sku === "string" ? item.sku : null,
    name: item.name,
    shortDescription:
      typeof item.shortDescription === "string" ? item.shortDescription : null,
    description: typeof item.description === "string" ? item.description : null,
    price: Number.isFinite(price) ? price : 0,
    stock: Number.isFinite(stock) ? stock : 0,
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
    thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : null,
    images: Array.isArray(item.images)
      ? item.images.filter((media): media is string => typeof media === "string" && media.trim().length > 0)
      : [],
    videoUrl: typeof item.videoUrl === "string" ? item.videoUrl : null,
    origin: typeof item.origin === "string" ? item.origin : null,
    brand: typeof item.brand === "string" ? item.brand : null,
    usagePurpose: typeof item.usagePurpose === "string" ? item.usagePurpose : null,
    usageInstructions:
      typeof item.usageInstructions === "string" ? item.usageInstructions : null,
    ginsengAge: typeof item.ginsengAge === "string" ? item.ginsengAge : null,
    isBestSeller: typeof item.isBestSeller === "boolean" ? item.isBestSeller : false,
    category:
      item.category && typeof item.category === "object"
        ? {
            id: String((item.category as Record<string, unknown>).id ?? ""),
            name: String((item.category as Record<string, unknown>).name ?? ""),
            slug: String((item.category as Record<string, unknown>).slug ?? ""),
          }
        : null,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
  };
}

export async function getAdminProducts(
  params: AdminProductQueryParams,
): Promise<ProductListResponse> {
  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/products${buildQuery({
        page: params.page,
        limit: params.limit,
        search: params.search,
        categoryId: params.categoryId,
      })}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );
  } catch {
    throw new Error("Cannot connect to server.");
  }

  if (!response.ok) {
    throw new Error(`Failed to load products (${response.status}).`);
  }

  const payload = (await response.json()) as Partial<ProductListResponse>;
  const data = Array.isArray(payload.data)
    ? payload.data
        .map((item) => sanitizeProduct(item))
        .filter((item): item is ProductSummary => item !== null)
    : [];

  return {
    data,
    total: typeof payload.total === "number" ? payload.total : data.length,
    page: typeof payload.page === "number" ? payload.page : params.page ?? 1,
    limit: typeof payload.limit === "number" ? payload.limit : params.limit ?? 10,
  };
}

export async function getAdminProductById(id: string): Promise<ProductSummary | null> {
  if (!id.trim()) {
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load product (${response.status}).`);
  }

  const payload = await response.json();
  return sanitizeProduct(payload);
}

export async function createAdminProduct(payload: AdminProductPayload) {
  let response: Response;
  try {
    response = await authorizedRequest(`${API_BASE_URL}/products`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Cannot connect to server.");
  }

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to create product.");
    throw new Error(message);
  }
}

export async function updateAdminProduct(id: string, payload: Partial<AdminProductPayload>) {
  let response: Response;
  try {
    response = await authorizedRequest(`${API_BASE_URL}/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Cannot connect to server.");
  }

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to update product.");
    throw new Error(message);
  }
}

export async function deleteAdminProduct(id: string) {
  let response: Response;
  try {
    response = await authorizedRequest(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
  } catch {
    throw new Error("Cannot connect to server.");
  }

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to delete product.");
    throw new Error(message);
  }
}

export async function getCategoriesForProductForm(): Promise<Category[]> {
  return getCategories();
}
