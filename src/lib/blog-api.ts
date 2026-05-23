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

export type BlogCategory = "GINSENG_SEO" | "PRODUCT_COMPARISON" | "USAGE_GUIDE";

export type BlogPostItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  thumbnail: string | null;
  category: BlogCategory;
  tags: string[];
  authorName: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogListResponse = {
  data: BlogPostItem[];
  total: number;
  page: number;
  limit: number;
};

export type BlogQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: BlogCategory;
  tag?: string;
};

export type AdminBlogQueryParams = BlogQueryParams & {
  isPublished?: boolean;
};

export type AdminBlogPayload = {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
  category: BlogCategory;
  tags?: string[];
  authorName?: string;
  isPublished?: boolean;
  publishedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
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
  } catch {
    return fallback;
  }

  return fallback;
}

function sanitizeBlogPost(value: unknown): BlogPostItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;

  if (
    typeof item.id !== "string" ||
    typeof item.title !== "string" ||
    typeof item.slug !== "string" ||
    typeof item.content !== "string" ||
    typeof item.category !== "string"
  ) {
    return null;
  }

  if (!["GINSENG_SEO", "PRODUCT_COMPARISON", "USAGE_GUIDE"].includes(item.category)) {
    return null;
  }

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: typeof item.excerpt === "string" ? item.excerpt : null,
    content: item.content,
    thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : null,
    category: item.category as BlogCategory,
    tags: Array.isArray(item.tags)
      ? item.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    authorName: typeof item.authorName === "string" ? item.authorName : null,
    isPublished: typeof item.isPublished === "boolean" ? item.isPublished : false,
    publishedAt: typeof item.publishedAt === "string" ? item.publishedAt : null,
    seoTitle: typeof item.seoTitle === "string" ? item.seoTitle : null,
    seoDescription: typeof item.seoDescription === "string" ? item.seoDescription : null,
    createdAt: typeof item.createdAt === "string" ? item.createdAt : undefined,
    updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : undefined,
  };
}

async function adminRequest(url: string, init: RequestInit) {
  const token = getAdminToken();

  try {
    return await fetch(url, {
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
}

export async function getBlogs(params: BlogQueryParams = {}): Promise<BlogListResponse> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/blogs${buildQuery({
        page: params.page,
        limit: params.limit,
        search: params.search,
        category: params.category,
        tag: params.tag,
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
    throw new Error(`Failed to fetch blogs (${response.status}).`);
  }

  const payload = (await response.json()) as Partial<BlogListResponse>;
  const data = Array.isArray(payload.data)
    ? payload.data
        .map((item) => sanitizeBlogPost(item))
        .filter((item): item is BlogPostItem => item !== null)
    : [];

  return {
    data,
    total: typeof payload.total === "number" ? payload.total : data.length,
    page: typeof payload.page === "number" ? payload.page : params.page ?? 1,
    limit: typeof payload.limit === "number" ? payload.limit : params.limit ?? 10,
  };
}

export async function getBlogBySlug(slug: string): Promise<BlogPostItem | null> {
  if (!slug.trim()) {
    return null;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/blogs/${slug.trim()}`, {
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
    throw new Error(`Failed to fetch blog post (${response.status}).`);
  }

  const payload = await response.json();
  return sanitizeBlogPost(payload);
}

export async function adminGetBlogs(params: AdminBlogQueryParams): Promise<BlogListResponse> {
  const response = await adminRequest(
    `${API_BASE_URL}/admin/blogs${buildQuery({
      page: params.page,
      limit: params.limit,
      search: params.search,
      category: params.category,
      isPublished: params.isPublished,
    })}`,
    { method: "GET" },
  );

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to load blog posts.");
    throw new Error(message);
  }

  const payload = (await response.json()) as Partial<BlogListResponse>;
  const data = Array.isArray(payload.data)
    ? payload.data
        .map((item) => sanitizeBlogPost(item))
        .filter((item): item is BlogPostItem => item !== null)
    : [];

  return {
    data,
    total: typeof payload.total === "number" ? payload.total : data.length,
    page: typeof payload.page === "number" ? payload.page : params.page ?? 1,
    limit: typeof payload.limit === "number" ? payload.limit : params.limit ?? 10,
  };
}

export async function adminGetBlogById(id: string): Promise<BlogPostItem | null> {
  if (!id.trim()) {
    return null;
  }

  const response = await adminRequest(`${API_BASE_URL}/admin/blogs/${id}`, {
    method: "GET",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to load blog post.");
    throw new Error(message);
  }

  const payload = await response.json();
  return sanitizeBlogPost(payload);
}

export async function adminCreateBlog(payload: AdminBlogPayload) {
  const response = await adminRequest(`${API_BASE_URL}/admin/blogs`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to create blog post.");
    throw new Error(message);
  }
}

export async function adminUpdateBlog(id: string, payload: Partial<AdminBlogPayload>) {
  const response = await adminRequest(`${API_BASE_URL}/admin/blogs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to update blog post.");
    throw new Error(message);
  }
}

export async function adminDeleteBlog(id: string) {
  const response = await adminRequest(`${API_BASE_URL}/admin/blogs/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const message = await parseApiError(response, "Failed to delete blog post.");
    throw new Error(message);
  }
}
