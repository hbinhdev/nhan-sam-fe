export type ProductReview = {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  customerLabel: string;
  createdAt: string;
};

export type ProductReviewListResponse = {
  data: ProductReview[];
  total: number;
  page: number;
  limit: number;
};

export type ProductReviewSummary = {
  averageRating: number;
  totalReviews: number;
  ratingCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

export type GetProductReviewsParams = {
  page?: number;
  limit?: number;
  rating?: number;
};

export type CreateProductReviewPayload = {
  rating: number;
  comment: string;
  reviewerName: string;
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

const EMPTY_REVIEW_LIST: ProductReviewListResponse = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
};

const EMPTY_REVIEW_SUMMARY: ProductReviewSummary = {
  averageRating: 0,
  totalReviews: 0,
  ratingCounts: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  },
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

function sanitizeReview(value: unknown): ProductReview | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" ||
    typeof item.comment !== "string" ||
    typeof item.reviewerName !== "string" ||
    typeof item.customerLabel !== "string"
  ) {
    return null;
  }

  const rating = Number(item.rating ?? 0);
  const createdAt = typeof item.createdAt === "string" ? item.createdAt : "";

  return {
    id: item.id,
    rating: Number.isFinite(rating) ? rating : 0,
    comment: item.comment,
    reviewerName: item.reviewerName,
    customerLabel: item.customerLabel,
    createdAt,
  };
}

function sanitizeSummary(value: unknown): ProductReviewSummary {
  if (!value || typeof value !== "object") {
    return EMPTY_REVIEW_SUMMARY;
  }

  const item = value as Record<string, unknown>;
  const ratingCountsRaw =
    item.ratingCounts && typeof item.ratingCounts === "object"
      ? (item.ratingCounts as Record<string, unknown>)
      : {};

  return {
    averageRating: Number.isFinite(Number(item.averageRating)) ? Number(item.averageRating) : 0,
    totalReviews: Number.isFinite(Number(item.totalReviews)) ? Number(item.totalReviews) : 0,
    ratingCounts: {
      1: Number.isFinite(Number(ratingCountsRaw["1"])) ? Number(ratingCountsRaw["1"]) : 0,
      2: Number.isFinite(Number(ratingCountsRaw["2"])) ? Number(ratingCountsRaw["2"]) : 0,
      3: Number.isFinite(Number(ratingCountsRaw["3"])) ? Number(ratingCountsRaw["3"]) : 0,
      4: Number.isFinite(Number(ratingCountsRaw["4"])) ? Number(ratingCountsRaw["4"]) : 0,
      5: Number.isFinite(Number(ratingCountsRaw["5"])) ? Number(ratingCountsRaw["5"]) : 0,
    },
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
    return null;
  }
}

export async function getProductReviews(
  productId: string,
  params?: GetProductReviewsParams,
): Promise<ProductReviewListResponse> {
  if (!productId) {
    return {
      ...EMPTY_REVIEW_LIST,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
  }

  const response = await safeFetch(
    `${API_BASE_URL}/products/${productId}/reviews${buildQuery({
      page: params?.page,
      limit: params?.limit,
      rating: params?.rating,
    })}`,
  );

  if (!response || !response.ok) {
    return {
      ...EMPTY_REVIEW_LIST,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return {
      ...EMPTY_REVIEW_LIST,
      page: params?.page ?? 1,
      limit: params?.limit ?? 10,
    };
  }

  const raw = payload as Partial<ProductReviewListResponse>;
  const data = Array.isArray(raw.data)
    ? raw.data
        .map((item) => sanitizeReview(item))
        .filter((item): item is ProductReview => item !== null)
    : [];

  return {
    data,
    total: typeof raw.total === "number" ? raw.total : 0,
    page: typeof raw.page === "number" ? raw.page : params?.page ?? 1,
    limit: typeof raw.limit === "number" ? raw.limit : params?.limit ?? 10,
  };
}

export async function getProductReviewSummary(productId: string): Promise<ProductReviewSummary> {
  if (!productId) {
    return EMPTY_REVIEW_SUMMARY;
  }

  const response = await safeFetch(`${API_BASE_URL}/products/${productId}/reviews/summary`);

  if (!response || !response.ok) {
    return EMPTY_REVIEW_SUMMARY;
  }

  try {
    const payload = await response.json();
    return sanitizeSummary(payload);
  } catch {
    return EMPTY_REVIEW_SUMMARY;
  }
}

export async function createProductReview(
  productId: string,
  payload: CreateProductReviewPayload,
): Promise<boolean> {
  if (!productId) {
    throw new Error("Thiếu mã sản phẩm");
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Không thể gửi đánh giá. Vui lòng thử lại.");
  }

  if (!response.ok) {
    throw new Error("Gửi đánh giá thất bại. Vui lòng thử lại.");
  }

  return true;
}
