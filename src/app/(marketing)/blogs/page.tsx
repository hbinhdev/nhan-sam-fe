import Link from "next/link";
import { getBlogs, type BlogCategory } from "@/lib/blog-api";
import { BLOG_CATEGORY_OPTIONS, getBlogCategoryLabel } from "@/lib/blog-helpers";

type BlogsSearchParams = {
  page?: string;
  search?: string;
  category?: string;
};

type BlogsPageProps = {
  searchParams?: Promise<BlogsSearchParams>;
};

const BLOGS_PER_PAGE = 9;

function parsePage(value?: string) {
  const parsed = Number(value ?? "1");
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("vi-VN");
}

function buildListLink(params: {
  page?: number;
  search?: string;
  category?: string;
}) {
  const query = new URLSearchParams();

  if (params.page && params.page > 1) {
    query.set("page", String(params.page));
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.category?.trim()) {
    query.set("category", params.category.trim());
  }

  const queryString = query.toString();
  return queryString ? `/blogs?${queryString}` : "/blogs";
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const currentPage = parsePage(resolvedSearchParams?.page);
  const activeSearch = resolvedSearchParams?.search?.trim() || undefined;
  const activeCategoryRaw = resolvedSearchParams?.category?.trim();
  const activeCategory = BLOG_CATEGORY_OPTIONS.some((item) => item.value === activeCategoryRaw)
    ? (activeCategoryRaw as BlogCategory)
    : undefined;

  let response = {
    data: [],
    total: 0,
    page: currentPage,
    limit: BLOGS_PER_PAGE,
  } as Awaited<ReturnType<typeof getBlogs>>;
  let loadError: string | null = null;

  try {
    response = await getBlogs({
      page: currentPage,
      limit: BLOGS_PER_PAGE,
      search: activeSearch,
      category: activeCategory,
    });
  } catch {
    loadError = "Không thể tải bài viết kiến thức. Vui lòng thử lại sau.";
  }

  const totalPages = Math.max(1, Math.ceil(response.total / (response.limit || BLOGS_PER_PAGE)));

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-6 py-16">
      <section className="mb-4 text-center">
        <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-secondary">
          Chuyên mục kiến thức
        </span>
        <h1 className="mt-3 text-balance font-serif text-5xl leading-[1.1] tracking-tight text-primary md:text-6xl">
          Kiến Thức Nhân Sâm
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-on-surface-variant">
          Tổng hợp bài viết chuyên sâu về nhân sâm Hàn Quốc, cách sử dụng hiệu quả và kinh nghiệm
          chọn sản phẩm phù hợp.
        </p>
      </section>

      <section className="rounded-2xl border border-outline-variant/30 bg-white p-4 sm:p-5">
        <form action="/blogs" className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            type="text"
            name="search"
            defaultValue={activeSearch ?? ""}
            placeholder="Tìm theo tiêu đề hoặc nội dung"
            className="h-11 rounded-xl border border-outline-variant/40 px-4 text-sm outline-none transition focus:border-primary"
          />
          <select
            name="category"
            defaultValue={activeCategory ?? ""}
            className="h-11 rounded-xl border border-outline-variant/40 px-4 text-sm outline-none transition focus:border-primary"
          >
            <option value="">Tất cả danh mục</option>
            {BLOG_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary transition hover:opacity-90"
          >
            Lọc bài viết
          </button>
          <Link
            href="/blogs"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-outline-variant/40 px-4 text-sm font-semibold text-primary transition hover:bg-surface"
          >
            Xóa bộ lọc
          </Link>
        </form>
      </section>

      {loadError ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {loadError}
        </section>
      ) : response.data.length === 0 ? (
        <section className="rounded-2xl border border-outline-variant/30 bg-white p-10 text-center text-on-surface-variant">
          Chưa có bài viết phù hợp.
        </section>
      ) : (
        <>
          <section className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {response.data.map((blog) => (
              <article
                key={blog.id}
                className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link href={`/blogs/${blog.slug}`} className="block">
                  <img
                    src={blog.thumbnail || "/images/product-root.png"}
                    alt={blog.title}
                    className="h-52 w-full object-cover"
                  />
                </Link>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {getBlogCategoryLabel(blog.category)}
                    </span>
                    <span className="text-xs text-on-surface-variant">{formatDate(blog.publishedAt)}</span>
                  </div>

                  <h2 className="line-clamp-2 font-serif text-2xl leading-tight text-primary">
                    <Link href={`/blogs/${blog.slug}`} className="hover:underline">
                      {blog.title}
                    </Link>
                  </h2>

                  <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant">
                    {blog.excerpt || "Bài viết đang được cập nhật tóm tắt nội dung."}
                  </p>

                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="inline-flex text-sm font-semibold text-primary transition hover:opacity-80"
                  >
                    Đọc bài viết →
                  </Link>
                </div>
              </article>
            ))}
          </section>

          {totalPages > 1 ? (
            <section className="mt-6 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((itemPage) => {
                const isActive = itemPage === response.page;
                return (
                  <Link
                    key={itemPage}
                    href={buildListLink({
                      page: itemPage,
                      search: activeSearch,
                      category: activeCategory,
                    })}
                    className={
                      isActive
                        ? "inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary"
                        : "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-outline-variant/40 px-3 text-sm font-semibold text-on-surface-variant hover:border-primary hover:text-primary"
                    }
                  >
                    {itemPage}
                  </Link>
                );
              })}
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
