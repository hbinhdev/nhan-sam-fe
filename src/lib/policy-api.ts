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

export type PolicyType = "privacy" | "return" | "shipping" | "payment" | "terms";

export type PolicyItem = {
  id: string;
  type: PolicyType;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PolicyListResponse = {
  data: PolicyItem[];
  total: number;
  page: number;
  limit: number;
};

export type AdminPolicyPayload = {
  type: PolicyType;
  title: string;
  slug: string;
  content: string;
  isPublished?: boolean;
};

export type AdminPolicyQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: PolicyType;
};

function buildQuery(params: Record<string, string | number | undefined>) {
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
  } catch {
    return fallback;
  }

  return fallback;
}

function sanitizePolicy(value: unknown): PolicyItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    typeof item.type !== "string" ||
    typeof item.title !== "string" ||
    typeof item.slug !== "string" ||
    typeof item.content !== "string"
  ) {
    return null;
  }

  if (!["privacy", "return", "shipping", "payment", "terms"].includes(item.type)) {
    return null;
  }

  return {
    id: item.id,
    type: item.type as PolicyType,
    title: item.title,
    slug: item.slug,
    content: item.content,
    isPublished: typeof item.isPublished === "boolean" ? item.isPublished : true,
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
      cache: "no-store",
    });
  } catch {
    throw new Error("Cannot connect to server.");
  }

  return response;
}

export async function getPolicies(): Promise<PolicyItem[]> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/policies`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new Error("Cannot connect to server.");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch policies (${response.status}).`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => sanitizePolicy(item))
    .filter((item): item is PolicyItem => item !== null);
}

export async function getPolicyBySlug(slug: string): Promise<PolicyItem | null> {
  if (!slug.trim()) {
    return null;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/policies/${slug}`, {
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
    throw new Error(`Failed to fetch policy (${response.status}).`);
  }

  const payload = await response.json();
  return sanitizePolicy(payload);
}

export async function adminGetPolicies(
  params: AdminPolicyQueryParams,
): Promise<PolicyListResponse> {
  const response = await adminRequest(
    `${API_BASE_URL}/admin/policies${buildQuery({
      page: params.page,
      limit: params.limit,
      search: params.search,
      type: params.type,
    })}`,
    { method: "GET" },
  );

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to load policies.");
    throw new Error(message);
  }

  const payload = (await response.json()) as Partial<PolicyListResponse>;
  const data = Array.isArray(payload.data)
    ? payload.data
        .map((item) => sanitizePolicy(item))
        .filter((item): item is PolicyItem => item !== null)
    : [];

  return {
    data,
    total: typeof payload.total === "number" ? payload.total : data.length,
    page: typeof payload.page === "number" ? payload.page : params.page ?? 1,
    limit: typeof payload.limit === "number" ? payload.limit : params.limit ?? 10,
  };
}

export async function adminGetPolicyById(id: string): Promise<PolicyItem | null> {
  if (!id.trim()) {
    return null;
  }

  const response = await adminRequest(`${API_BASE_URL}/admin/policies/${id}`, {
    method: "GET",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to load policy.");
    throw new Error(message);
  }

  const payload = await response.json();
  return sanitizePolicy(payload);
}

export async function adminCreatePolicy(payload: AdminPolicyPayload) {
  const response = await adminRequest(`${API_BASE_URL}/admin/policies`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to create policy.");
    throw new Error(message);
  }
}

export async function adminUpdatePolicy(id: string, payload: Partial<AdminPolicyPayload>) {
  const response = await adminRequest(`${API_BASE_URL}/admin/policies/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to update policy.");
    throw new Error(message);
  }
}

export async function adminDeletePolicy(id: string) {
  const response = await adminRequest(`${API_BASE_URL}/admin/policies/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to delete policy.");
    throw new Error(message);
  }
}
