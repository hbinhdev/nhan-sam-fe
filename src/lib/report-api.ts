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

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.append(key, value);
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

async function exportExcel(path: string, filename: string) {
  const token = getAdminToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Export failed (${response.status}).`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function exportProductsReport(params?: {
  search?: string;
  categoryId?: string;
}) {
  await exportExcel(
    `/reports/products/export${buildQuery({
      search: params?.search,
      categoryId: params?.categoryId,
    })}`,
    "products-report.xlsx",
  );
}

export async function exportOrdersReport(params?: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
}) {
  await exportExcel(
    `/reports/orders/export${buildQuery({
      dateFrom: params?.dateFrom,
      dateTo: params?.dateTo,
      status: params?.status,
      search: params?.search,
    })}`,
    "orders-report.xlsx",
  );
}

export async function exportCustomersReport(params?: {
  search?: string;
  role?: string;
}) {
  await exportExcel(
    `/reports/customers/export${buildQuery({
      search: params?.search,
      role: params?.role,
    })}`,
    "customers-report.xlsx",
  );
}

export async function exportCouponsReport() {
  await exportExcel("/reports/coupons/export", "coupons-report.xlsx");
}

export async function exportConsultationsReport(params?: {
  search?: string;
  status?: string;
}) {
  await exportExcel(
    `/reports/consultations/export${buildQuery({
      search: params?.search,
      status: params?.status,
    })}`,
    "consultations-report.xlsx",
  );
}
