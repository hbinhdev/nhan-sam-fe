"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminCreateBlog,
  adminUpdateBlog,
  type BlogCategory,
  type BlogPostItem,
} from "@/lib/blog-api";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { BLOG_CATEGORY_OPTIONS, normalizeBlogContentToHtml, slugifyVietnamese } from "@/lib/blog-helpers";
import { RichTextEditor } from "@/components/dashboard/blogs/RichTextEditor";

type FormMode = "create" | "edit";

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: BlogCategory;
  tags: string;
  authorName: string;
  isPublished: boolean;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
};

interface BlogFormProps {
  mode: FormMode;
  initialData?: BlogPostItem | null;
}

const EMPTY_FORM: BlogFormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  thumbnail: "",
  category: "GINSENG_SEO",
  tags: "",
  authorName: "",
  isPublished: false,
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
};

function toLocalDateTimeInput(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function mapBlogToForm(blog: BlogPostItem): BlogFormState {
  return {
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt ?? "",
    content: normalizeBlogContentToHtml(blog.content),
    thumbnail: blog.thumbnail ?? "",
    category: blog.category,
    tags: blog.tags.join(", "),
    authorName: blog.authorName ?? "",
    isPublished: blog.isPublished,
    publishedAt: toLocalDateTimeInput(blog.publishedAt),
    seoTitle: blog.seoTitle ?? "",
    seoDescription: blog.seoDescription ?? "",
  };
}

function buildTags(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => Boolean(tag)),
    ),
  );
}

function buildPayload(form: BlogFormState) {
  const generatedSlug = slugifyVietnamese(form.title);
  return {
    title: form.title.trim(),
    slug: generatedSlug,
    excerpt: form.excerpt.trim() || undefined,
    content: form.content.trim(),
    thumbnail: form.thumbnail.trim() || undefined,
    category: form.category,
    tags: buildTags(form.tags),
    authorName: form.authorName.trim() || undefined,
    isPublished: form.isPublished,
    publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
    seoTitle: form.seoTitle.trim() || undefined,
    seoDescription: form.seoDescription.trim() || undefined,
  };
}

function validateForm(form: BlogFormState) {
  if (!form.title.trim()) return "Title is required.";
  if (!slugifyVietnamese(form.title)) return "Slug cannot be generated from title.";
  if (!form.content.trim()) return "Content is required.";
  return null;
}

export function BlogForm({ mode, initialData }: BlogFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BlogFormState>(
    initialData ? mapBlogToForm(initialData) : EMPTY_FORM
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = buildPayload(form);

    setSaving(true);
    try {
      if (mode === "create") {
        await adminCreateBlog(payload);
        showToast("Blog post created successfully.", "success");
      } else if (initialData) {
        await adminUpdateBlog(initialData.id, payload);
        showToast("Blog post updated successfully.", "success");
      }
      router.push("/dashboard/blogs");
      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Failed to save blog post.";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <form className="flex flex-col" onSubmit={handleSubmitForm}>
        <div className="p-4 sm:p-6 space-y-6">
          {formError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Title *</label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => {
                    const title = e.target.value;
                    return {
                      ...prev,
                      title,
                      slug: slugifyVietnamese(title),
                    };
                  })
                }
                className="h-10 border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Slug (auto-generated)</label>
              <Input
                value={form.slug}
                className="h-10 border-slate-300 bg-slate-100 text-slate-700"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Category *</label>
              <select
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as BlogCategory }))}
              >
                {BLOG_CATEGORY_OPTIONS.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Author Name</label>
              <Input
                value={form.authorName}
                onChange={(e) => setForm((prev) => ({ ...prev, authorName: e.target.value }))}
                className="h-10 border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                className="min-h-24 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Content *</label>
              <RichTextEditor
                value={form.content}
                onChange={(nextValue) => setForm((prev) => ({ ...prev, content: nextValue }))}
                placeholder="Nhập nội dung bài viết..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Thumbnail URL</label>
              <Input
                value={form.thumbnail}
                onChange={(e) => setForm((prev) => ({ ...prev, thumbnail: e.target.value }))}
                className="h-10 border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Tags (comma separated)</label>
              <Input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                className="h-10 border-slate-300 bg-white text-slate-900"
                placeholder="nhân sâm, sức khỏe, hướng dẫn"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">SEO Title</label>
              <Input
                value={form.seoTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                className="h-10 border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Published At</label>
              <Input
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => setForm((prev) => ({ ...prev, publishedAt: e.target.value }))}
                className="h-10 border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">SEO Description</label>
              <textarea
                value={form.seoDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                className="min-h-24 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
              />
              Published
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-24 border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="h-10 min-w-32 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-500 disabled:text-white"
            disabled={saving}
          >
            {saving ? "Saving..." : mode === "create" ? "Save Blog" : "Update Blog"}
          </Button>
        </div>
      </form>
    </div>
  );
}
