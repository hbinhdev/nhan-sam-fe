import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/lib/blog-api";
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

  try {
    blog = await getBlogBySlug(slug);
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
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="mb-8">
        <Link
          href="/blogs"
          className="inline-flex items-center text-sm font-semibold text-primary transition hover:opacity-80"
        >
          ← Quay lại chuyên mục kiến thức
        </Link>
      </div>

      <article className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-white shadow-sm">
        <img
          src={blog.thumbnail || "/images/product-root.png"}
          alt={blog.title}
          className="h-72 w-full object-cover"
        />

        <div className="space-y-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
              {getBlogCategoryLabel(blog.category)}
            </span>
            {blog.publishedAt ? <span>Ngày đăng: {formatDate(blog.publishedAt)}</span> : null}
            {blog.authorName ? <span>Tác giả: {blog.authorName}</span> : null}
          </div>

          <h1 className="font-serif text-4xl leading-tight text-primary">{blog.title}</h1>

          {blog.excerpt ? (
            <p className="text-lg leading-relaxed text-on-surface-variant">{blog.excerpt}</p>
          ) : null}

          {blog.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-outline-variant/40 px-3 py-1 text-xs font-medium text-on-surface-variant"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="h-px w-full bg-outline-variant/30" />

          <div
            className="text-[15px] leading-8 text-on-surface-variant [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: normalizeBlogContentToHtml(blog.content) }}
          />
        </div>
      </article>
    </main>
  );
}
