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

export type DashboardSummary = {
  overview: {
    totalOrders: number;
    totalProducts: number;
    totalCategories: number;
    totalReviews: number;
    pendingReviews: number;
    approvedReviews: number;
    rejectedReviews: number;
    totalConsultations: number;
    pendingConsultations: number;
    contactedConsultations: number;
    cancelledConsultations: number;
  };
  reviews: {
    averageRating: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  ordersOverview: Array<{
    date: string;
    orders: number;
  }>;
  recentProducts: Array<{
    id: string;
    name: string;
    sku: string | null;
    price: number;
    stock: number;
    categoryName: string | null;
    createdAt: string;
  }>;
  recentReviews: Array<{
    id: string;
    productId: string | null;
    productName: string | null;
    reviewerName: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    createdAt: string;
  }>;
  recentConsultations: Array<{
    id: string;
    fullName: string;
    phone: string;
    interest: string;
    status: string;
    createdAt: string;
  }>;
};

export type DashboardNotification = {
  id: string;
  type: "ORDER" | "CONSULTATION";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  targetUrl: string;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const session = getAuthSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error("Session expired. Please sign in again.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Cannot connect to server.");
  }

  if (response.status === 401) {
    throw new Error("Unauthorized. Please sign in again.");
  }

  if (response.status === 403) {
    throw new Error("Forbidden. Admin access is required.");
  }

  if (!response.ok) {
    throw new Error("Failed to load dashboard data.");
  }

  return (await response.json()) as DashboardSummary;
}

export async function getDashboardNotifications(): Promise<DashboardNotification[]> {
  const session = getAuthSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error("Session expired. Please sign in again.");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/dashboard/notifications`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Cannot connect to server.");
  }

  if (response.status === 401) {
    throw new Error("Unauthorized. Please sign in again.");
  }

  if (response.status === 403) {
    throw new Error("Forbidden. Admin access is required.");
  }

  if (!response.ok) {
    throw new Error("Failed to load dashboard notifications.");
  }

  return (await response.json()) as DashboardNotification[];
}
