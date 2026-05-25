import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug, getBlogs } from "@/lib/blog-api";
import { getBlogCategoryLabel, normalizeBlogContentToHtml } from "@/lib/blog-helpers";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const blog = await getBlogBySlug(slug);

    if (!blog) {
      return {
        title: "Bài viết không tồn tại | Heritage Ginseng",
        description: "Nội dung bạn tìm kiếm không tồn tại hoặc chưa được xuất bản.",
      };
    }

    return {
      title: blog.seoTitle || blog.title,
      description:
        blog.seoDescription || blog.excerpt || "Bài viết kiến thức về nhân sâm Hàn Quốc.",
    };
  } catch {
    return {
      title: "Kiến thức | Heritage Ginseng",
      description: "Bài viết kiến thức về nhân sâm Hàn Quốc.",
    };
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  let blog = null;
  let recentBlogs: any[] = [];

  try {
    blog = await getBlogBySlug(slug);
    if (blog) {
      // Fetch latest blogs to show on the sidebar
      const recentBlogsRes = await getBlogs({ page: 1, limit: 6 });
      recentBlogs = recentBlogsRes.data
        .filter((item) => item.slug !== slug)
        .slice(0, 5);
    }
  } catch {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          Không thể tải bài viết. Vui lòng thử lại sau.
        </section>
      </main>
    );
  }

  if (!blog) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-6 py-12">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-on-surface-variant/70">
        <Link href="/" className="hover:text-primary transition hover:underline">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/blogs" className="hover:text-primary transition hover:underline">
          Kiến thức
        </Link>
        <span>/</span>
        <span className="truncate max-w-[200px] sm:max-w-[400px] font-medium text-on-surface">
          {blog.title}
        </span>
      </nav>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Column: Main Blog Content (No Box/Card wrapping to prevent "boxed" feel) */}
        <article className="lg:col-span-8 space-y-6">
          {/* Header Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-on-surface-variant/80">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
              {getBlogCategoryLabel(blog.category)}
            </span>
            {blog.publishedAt ? <span>• Ngày đăng: {formatDate(blog.publishedAt)}</span> : null}
            {blog.authorName ? <span>• Tác giả: {blog.authorName}</span> : null}
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-primary">
            {blog.title}
          </h1>

          {/* Main Thumbnail Image */}
          <div className="overflow-hidden rounded-2xl border border-outline-variant/20 shadow-sm bg-surface-variant/10">
            <img
              src={blog.thumbnail || "/images/product-root.png"}
              alt={blog.title}
              className="w-full max-h-[500px] object-cover transition-transform duration-500 hover:scale-[1.01]"
            />
          </div>

          {/* Excerpt if present */}
          {blog.excerpt ? (
            <p className="text-lg leading-relaxed font-medium text-on-surface-variant/90 border-l-4 border-primary/50 pl-4 py-1 italic bg-primary/5 rounded-r-xl">
              {blog.excerpt}
            </p>
          ) : null}

          {/* Tags */}
          {blog.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-outline-variant/30 bg-surface/50 px-3 py-1 text-xs font-medium text-on-surface-variant"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {/* Divider */}
          <div className="h-px w-full bg-outline-variant/30" />

          {/* Blog Content Body */}
          <div
            className="prose max-w-none text-[15px] leading-8 text-on-surface-variant 
              [&_a]:text-primary [&_a]:underline [&_a]:font-semibold [&_a:hover]:opacity-80
              [&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_img]:shadow-md
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
              [&_p]:mb-4 [&_p]:leading-relaxed
              [&_h2]:text-2xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-8 [&_h2]:mb-4
              [&_h3]:text-xl [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-primary [&_h3]:mt-6 [&_h3]:mb-3"
            dangerouslySetInnerHTML={{ __html: normalizeBlogContentToHtml(blog.content) }}
          />
        </article>

        {/* Right Column: Sidebar (Sticky on Large Screens) */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="lg:sticky lg:top-24 space-y-8">
            {recentBlogs.length > 0 ? (
              <div className="rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-sm">
                <h3 className="font-serif text-lg font-bold text-primary uppercase tracking-wider relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-secondary">
                  Bài viết mới nhất
                </h3>

                <div className="flex flex-col gap-5 mt-6">
                  {recentBlogs.map((item) => (
                    <article key={item.id} className="flex gap-4 group">
                      <Link
                        href={`/blogs/${item.slug}`}
                        className="block w-20 h-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface border border-outline-variant/20 shadow-sm"
                      >
                        <img
                          src={item.thumbnail || "/images/product-root.png"}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </Link>

                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary mb-1">
                          {getBlogCategoryLabel(item.category)}
                        </span>

                        <h4 className="font-serif text-sm font-bold text-primary leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-secondary group-hover:underline">
                          <Link href={`/blogs/${item.slug}`}>
                            {item.title}
                          </Link>
                        </h4>

                        {item.publishedAt ? (
                          <span className="text-[11px] text-on-surface-variant/70 mt-1">
                            {formatDate(item.publishedAt)}
                          </span>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Additional Sidebar Section: Quick Info / Call to Action */}
            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-container p-6 text-on-primary shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-secondary/15 blur-xl pointer-events-none" />
              <h4 className="font-serif text-xl font-bold mb-2">Heritage Ginseng</h4>
              <p className="text-sm text-on-primary/80 leading-relaxed mb-4">
                Mang đến những sản phẩm nhân sâm chất lượng thượng hạng, kế thừa trọn vẹn tinh hoa thảo dược ngàn năm từ Hàn Quốc.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-xl bg-secondary px-4 py-2.5 text-xs font-bold text-on-secondary transition-all hover:bg-secondary-container hover:text-on-secondary-container active:scale-95 shadow-sm"
              >
                Khám phá sản phẩm
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
