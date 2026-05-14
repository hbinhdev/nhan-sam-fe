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

export type AdminUserRole = "USER" | "ADMIN";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: AdminUserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUsersResponse = {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
};

export type AdminUsersQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: AdminUserRole;
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

function sanitizeUser(value: unknown): AdminUser | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    typeof item.email !== "string" ||
    typeof item.role !== "string"
  ) {
    return null;
  }

  const role = item.role === "ADMIN" ? "ADMIN" : "USER";

  return {
    id: item.id,
    email: item.email,
    name: typeof item.name === "string" ? item.name : null,
    phone: typeof item.phone === "string" ? item.phone : null,
    role,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
  };
}

export async function getAdminUsers(
  params: AdminUsersQueryParams,
): Promise<AdminUsersResponse> {
  const response = await adminRequest(
    `${API_BASE_URL}/users${buildQuery({
      page: params.page,
      limit: params.limit,
      search: params.search,
      role: params.role,
    })}`,
    { method: "GET" },
  );

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to load users.");
    throw new Error(message);
  }

  const payload = (await response.json()) as Partial<AdminUsersResponse>;
  const data = Array.isArray(payload.data)
    ? payload.data
        .map((item) => sanitizeUser(item))
        .filter((item): item is AdminUser => item !== null)
    : [];

  return {
    data,
    total: typeof payload.total === "number" ? payload.total : data.length,
    page: typeof payload.page === "number" ? payload.page : params.page ?? 1,
    limit: typeof payload.limit === "number" ? payload.limit : params.limit ?? 10,
  };
}

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  if (!id.trim()) {
    return null;
  }

  const response = await adminRequest(`${API_BASE_URL}/users/${id}`, {
    method: "GET",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to load user.");
    throw new Error(message);
  }

  const payload = await response.json();
  return sanitizeUser(payload);
}

export async function updateAdminUserRole(id: string, role: AdminUserRole) {
  const response = await adminRequest(`${API_BASE_URL}/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to update user role.");
    throw new Error(message);
  }

  const payload = await response.json();
  return sanitizeUser(payload);
}

export async function deleteAdminUser(id: string) {
  const response = await adminRequest(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to delete user.");
    throw new Error(message);
  }
}

