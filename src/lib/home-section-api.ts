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

export type HomeSectionType =
  | "HERO"
  | "FEATURED_CATEGORIES"
  | "FEATURED_PRODUCTS"
  | "PROMO_BANNERS"
  | "BRAND_STORY"
  | "CONSULTATION_SECTION"
  | "FEATURED_BLOGS"
  | "FAQ_COMMITMENTS";

export type HomeSection = {
  id: string;
  key: string;
  type: HomeSectionType | null;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  dataJson: Record<string, unknown> | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type HomeSectionListResponse = {
  data: HomeSection[];
  total: number;
  page: number;
  limit: number;
};

export type AdminHomeSectionQuery = {
  page?: number;
  limit?: number;
  search?: string;
  type?: HomeSectionType;
  isActive?: boolean;
};

export type UpsertHomeSectionPayload = {
  key: string;
  type?: HomeSectionType | null;
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  dataJson?: Record<string, unknown> | null;
  isActive?: boolean;
  sortOrder?: number;
};

function buildQuery(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

function parseSection(value: unknown): HomeSection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    typeof item.key !== "string" ||
    typeof item.isActive !== "boolean" ||
    typeof item.sortOrder !== "number" ||
    typeof item.createdAt !== "string" ||
    typeof item.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    id: item.id,
    key: item.key,
    type: typeof item.type === "string" ? (item.type as HomeSectionType) : null,
    title: typeof item.title === "string" ? item.title : null,
    subtitle: typeof item.subtitle === "string" ? item.subtitle : null,
    content: typeof item.content === "string" ? item.content : null,
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
    ctaText: typeof item.ctaText === "string" ? item.ctaText : null,
    ctaLink: typeof item.ctaLink === "string" ? item.ctaLink : null,
    dataJson: item.dataJson && typeof item.dataJson === "object" ? (item.dataJson as Record<string, unknown>) : null,
    isActive: item.isActive,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

async function parseError(response: Response, fallback: string) {
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

export async function getHomeSections(): Promise<HomeSection[]> {
  const response = await fetch(`${API_BASE_URL}/home`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch home sections.");
  }

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.map((item) => parseSection(item)).filter((item): item is HomeSection => item !== null);
}

function getAdminToken() {
  const token = getAuthSession()?.access_token;
  if (!token) {
    throw new Error("Session expired. Please sign in again.");
  }
  return token;
}

export async function adminGetHomeSections(
  params: AdminHomeSectionQuery = {},
): Promise<HomeSectionListResponse> {
  const token = getAdminToken();
  const response = await fetch(
    `${API_BASE_URL}/admin/home-sections${buildQuery({
      page: params.page,
      limit: params.limit,
      search: params.search,
      type: params.type,
      isActive: params.isActive,
    })}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to fetch home sections."));
  }

  const payload = (await response.json()) as Partial<HomeSectionListResponse>;
  const data = Array.isArray(payload.data)
    ? payload.data.map((item) => parseSection(item)).filter((item): item is HomeSection => item !== null)
    : [];

  return {
    data,
    total: typeof payload.total === "number" ? payload.total : data.length,
    page: typeof payload.page === "number" ? payload.page : params.page ?? 1,
    limit: typeof payload.limit === "number" ? payload.limit : params.limit ?? 20,
  };
}

export async function adminCreateHomeSection(payload: UpsertHomeSectionPayload) {
  const token = getAdminToken();
  const response = await fetch(`${API_BASE_URL}/admin/home-sections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to create home section."));
  }

  return parseSection(await response.json());
}

export async function adminUpdateHomeSection(id: string, payload: Partial<UpsertHomeSectionPayload>) {
  const token = getAdminToken();
  const response = await fetch(`${API_BASE_URL}/admin/home-sections/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to update home section."));
  }

  return parseSection(await response.json());
}

export async function adminDeleteHomeSection(id: string) {
  const token = getAdminToken();
  const response = await fetch(`${API_BASE_URL}/admin/home-sections/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to delete home section."));
  }
}
