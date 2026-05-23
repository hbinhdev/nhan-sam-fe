import { notFound } from "next/navigation";
import { getPolicyBySlug } from "@/lib/policy-api";
import { normalizeBlogContentToHtml } from "@/lib/blog-helpers";

type PolicySlug = "privacy" | "return" | "shipping" | "payment" | "terms";

const POLICY_TITLES: Record<PolicySlug, string> = {
  privacy: "Chính sách bảo mật",
  return: "Chính sách đổi trả",
  shipping: "Chính sách vận chuyển",
  payment: "Chính sách thanh toán",
  terms: "Điều khoản và điều kiện",
};

const POLICY_SLUGS: PolicySlug[] = ["privacy", "return", "shipping", "payment", "terms"];

function isPolicySlug(value: string): value is PolicySlug {
  return POLICY_SLUGS.includes(value as PolicySlug);
}

function formatDateTime(date?: string) {
  if (!date) {
    return null;
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleString("vi-VN");
}

export async function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }));
}

export default async function PolicyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isPolicySlug(slug)) {
    notFound();
  }

  let policy = null;
  let hasLoadError = false;

  try {
    policy = await getPolicyBySlug(slug);
  } catch {
    hasLoadError = true;
  }

  const fallbackTitle = POLICY_TITLES[slug];

  if (hasLoadError) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <section className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="font-serif text-3xl text-primary">{fallbackTitle}</h1>
          <p className="mt-4 text-sm text-red-700">Không thể tải nội dung chính sách. Vui lòng thử lại sau.</p>
        </section>
      </main>
    );
  }

  if (!policy) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="font-serif text-3xl text-primary">{fallbackTitle}</h1>
          <p className="mt-4 text-sm text-slate-600">Nội dung chính sách này đang được cập nhật.</p>
        </section>
      </main>
    );
  }

  const updatedAt = formatDateTime(policy.updatedAt);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <section className="rounded-2xl border border-outline-variant/30 bg-white p-8 shadow-sm sm:p-10">
        <h1 className="font-serif text-3xl text-primary sm:text-4xl">{policy.title}</h1>
        {updatedAt ? (
          <p className="mt-3 text-sm text-on-surface-variant">Cập nhật lần cuối: {updatedAt}</p>
        ) : null}

        <article
          className="mt-8 text-[15px] leading-7 text-on-surface-variant [&_a]:text-primary [&_a]:underline [&_h1]:mt-6 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mt-5 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mb-4 [&_ul]:mb-4"
          dangerouslySetInnerHTML={{ __html: normalizeBlogContentToHtml(policy.content) }}
        />
      </section>
    </main>
  );
}
