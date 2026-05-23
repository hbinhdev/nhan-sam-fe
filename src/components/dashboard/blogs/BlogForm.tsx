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
import {
  BLOG_CATEGORY_OPTIONS,
  normalizeBlogContentToHtml,
  slugifyVietnamese,
} from "@/lib/blog-helpers";
import { RichTextEditor } from "@/components/dashboard/blogs/RichTextEditor";
import { uploadImage } from "@/lib/admin-upload-api";

type FormMode = "create" | "edit";

type BlogFormState = {
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: BlogCategory;
  tags: string;
  authorName: string;
  isPublished: boolean;
};

interface BlogFormProps {
  mode: FormMode;
  initialData?: BlogPostItem | null;
}

const EMPTY_FORM: BlogFormState = {
  title: "",
  excerpt: "",
  content: "",
  thumbnail: "",
  category: "GINSENG_SEO",
  tags: "",
  authorName: "",
  isPublished: false,
};

function mapBlogToForm(blog: BlogPostItem): BlogFormState {
  return {
    title: blog.title,
    excerpt: blog.excerpt ?? "",
    content: normalizeBlogContentToHtml(blog.content),
    thumbnail: blog.thumbnail ?? "",
    category: blog.category,
    tags: blog.tags.join(", "),
    authorName: blog.authorName ?? "",
    isPublished: blog.isPublished,
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
  return {
    title: form.title.trim(),
    excerpt: form.excerpt.trim() || undefined,
    content: form.content.trim(),
    thumbnail: form.thumbnail.trim() || undefined,
    category: form.category,
    tags: buildTags(form.tags),
    authorName: form.authorName.trim() || undefined,
    isPublished: form.isPublished,
  };
}

function validateForm(form: BlogFormState) {
  if (!form.title.trim()) return "Tiêu đề là bắt buộc.";
  if (!slugifyVietnamese(form.title)) return "Không thể tạo slug từ tiêu đề.";
  if (!form.content.trim()) return "Nội dung là bắt buộc.";
  return null;
}

export function BlogForm({ mode, initialData }: BlogFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [form, setForm] = useState<BlogFormState>(
    initialData ? mapBlogToForm(initialData) : EMPTY_FORM,
  );

  const handleUploadThumbnail = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, thumbnail: url }));
      showToast("Tải ảnh thumbnail thành công.", "success");
    } catch (uploadError) {
      const message =
        uploadError instanceof Error
          ? uploadError.message
          : "Không thể tải ảnh thumbnail.";
      showToast(message, "error");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm(form);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    const payload = buildPayload(form);

    setSaving(true);
    try {
      if (mode === "create") {
        await adminCreateBlog(payload);
        showToast("Tạo bài viết thành công.", "success");
      } else if (initialData) {
        await adminUpdateBlog(initialData.id, payload);
        showToast("Cập nhật bài viết thành công.", "success");
      }
      router.push("/dashboard/blogs");
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu bài viết.";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <form className="flex flex-col" onSubmit={handleSubmitForm}>
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tiêu đề *</label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="h-10 border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Danh mục *</label>
              <select
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    category: e.target.value as BlogCategory,
                  }))
                }
              >
                {BLOG_CATEGORY_OPTIONS.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tên tác giả</label>
              <Input
                value={form.authorName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, authorName: e.target.value }))
                }
                className="h-10 border-slate-300 bg-white text-slate-900"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Tóm tắt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                className="min-h-24 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Nội dung *</label>
              <RichTextEditor
                value={form.content}
                onChange={(nextValue) =>
                  setForm((prev) => ({ ...prev, content: nextValue }))
                }
                placeholder="Nhập nội dung bài viết..."
                onUploadImage={uploadImage}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Ảnh thumbnail</label>
              <div className="rounded-lg border border-slate-300 bg-white p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex cursor-pointer items-center rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleUploadThumbnail}
                      disabled={uploadingThumbnail || saving}
                    />
                    {uploadingThumbnail ? "Đang tải lên..." : "Tải ảnh thumbnail"}
                  </label>
                  {form.thumbnail ? (
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:underline"
                      onClick={() =>
                        setForm((prev) => ({ ...prev, thumbnail: "" }))
                      }
                      disabled={uploadingThumbnail || saving}
                    >
                      Xóa thumbnail
                    </button>
                  ) : null}
                </div>
                {form.thumbnail ? (
                  <div className="mt-3">
                    <img
                      src={form.thumbnail}
                      alt="Thumbnail preview"
                      className="h-36 w-full max-w-xs rounded-md border border-slate-200 object-cover"
                    />
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">Chưa chọn thumbnail.</p>
                )}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Thẻ (phân tách bằng dấu phẩy)</label>
              <Input
                value={form.tags}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tags: e.target.value }))
                }
                className="h-10 border-slate-300 bg-white text-slate-900"
                placeholder="nhân sâm, sức khỏe, hướng dẫn"
              />
            </div>

            <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    isPublished: e.target.checked,
                  }))
                }
              />
              Xuất bản
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
            Hủy
          </Button>
          <Button
            type="submit"
            className="h-10 min-w-32 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-500 disabled:text-white"
            disabled={saving}
          >
            {saving
              ? "Đang lưu..."
              : mode === "create"
                ? "Lưu bài viết"
                : "Cập nhật bài viết"}
          </Button>
        </div>
      </form>
    </div>
  );
}
