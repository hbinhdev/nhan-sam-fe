import type { BlogCategory } from "@/lib/blog-api";

export const BLOG_CATEGORY_OPTIONS: Array<{ value: BlogCategory; label: string }> = [
  { value: "GINSENG_SEO", label: "Kiến thức nhân sâm" },
  { value: "PRODUCT_COMPARISON", label: "So sánh sản phẩm" },
  { value: "USAGE_GUIDE", label: "Hướng dẫn sử dụng" },
];

const BLOG_CATEGORY_LABEL_MAP: Record<BlogCategory, string> = {
  GINSENG_SEO: "Kiến thức nhân sâm",
  PRODUCT_COMPARISON: "So sánh sản phẩm",
  USAGE_GUIDE: "Hướng dẫn sử dụng",
};

export function getBlogCategoryLabel(category: BlogCategory) {
  return BLOG_CATEGORY_LABEL_MAP[category] ?? category;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function normalizeBlogContentToHtml(content: string) {
  const trimmed = content.trim();
  if (!trimmed) {
    return "";
  }

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (hasHtmlTag) {
    return trimmed;
  }

  return escapeHtml(trimmed).replace(/\r?\n/g, "<br />");
}

export function slugifyVietnamese(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
