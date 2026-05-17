export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
};

export type ProductSummary = {
  id: string;
  slug: string;
  sku?: string | null;
  name: string;
  description?: string | null;
  price: number;
  stock?: number | null;
  imageUrl?: string | null;
  thumbnail?: string | null;
  images?: string[];
  videoUrl?: string | null;
  origin?: string | null;
  brand?: string | null;
  usagePurpose?: string | null;
  usageInstructions?: string | null;
  ginsengAge?: string | null;
  isBestSeller?: boolean;
  category?: CategorySummary | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductListResponse = {
  data: ProductSummary[];
  total: number;
  page: number;
  limit: number;
};

export type ProductFilterParams = {
  search?: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  usagePurpose?: string;
  ginsengAge?: string;
  brand?: string;
  origin?: string;
  isBestSeller?: boolean;
};

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

function sanitizeCategorySummary(value: unknown): CategorySummary | null {
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
  };
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

  return {
    id: item.id,
    slug: typeof item.slug === "string" && item.slug ? item.slug : item.id,
    sku: typeof item.sku === "string" ? item.sku : null,
    name: item.name,
    description: typeof item.description === "string" ? item.description : null,
    price: Number.isFinite(price) ? price : 0,
    stock: typeof item.stock === "number" ? item.stock : null,
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
    category: sanitizeCategorySummary(item.category),
    createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
  };
}

async function safeFetch(url: string) {
  try {
    return await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });
  } catch {
    throw new Error("Network error");
  }
}

export async function getProducts(params?: ProductFilterParams) {
  const response = await safeFetch(
    `${API_BASE_URL}/products${buildQuery({
      search: params?.search,
      page: params?.page,
      limit: params?.limit,
      categoryId: params?.categoryId,
      minPrice: params?.minPrice,
      maxPrice: params?.maxPrice,
      usagePurpose: params?.usagePurpose,
      ginsengAge: params?.ginsengAge,
      brand: params?.brand,
      origin: params?.origin,
      isBestSeller: params?.isBestSeller,
    })}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return {
      data: [],
      total: 0,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
  }

  const raw = payload as Partial<ProductListResponse>;
  const data = Array.isArray(raw?.data)
    ? raw.data
        .map((item) => sanitizeProduct(item))
        .filter((item): item is ProductSummary => item !== null)
    : [];

  return {
    data,
    total: typeof raw?.total === "number" ? raw.total : data.length,
    page: typeof raw?.page === "number" ? raw.page : params?.page ?? 1,
    limit: typeof raw?.limit === "number" ? raw.limit : params?.limit ?? 10,
  };
}

export async function getProductById(id: string): Promise<ProductSummary | null> {
  if (!id) {
    return null;
  }

  const response = await safeFetch(`${API_BASE_URL}/products/${id}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.status}`);
  }

  try {
    const data = await response.json();
    return sanitizeProduct(data);
  } catch {
    return null;
  }
}

export function formatCurrencyVND(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN").format(Number.isFinite(amount) ? amount : 0) + "Ä‘";
}
