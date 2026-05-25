"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, Trash2, Loader2, Upload } from "lucide-react";
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-semibold text-slate-700">Tóm tắt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                className="min-h-24 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div className="space-y-2 md:col-span-3">
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

            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-semibold text-slate-700">Ảnh đại diện (Thumbnail)</label>
              
              {form.thumbnail ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm max-w-xl">
                  <div className="relative group overflow-hidden rounded-xl border border-slate-200 w-28 h-28 flex-shrink-0 bg-slate-50 flex items-center justify-center">
                    <img
                      src={form.thumbnail}
                      alt="Thumbnail preview"
                      className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        className="h-8 w-8 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 flex items-center justify-center transition-colors duration-200"
                        title="Xóa thumbnail"
                        onClick={() => setForm((prev) => ({ ...prev, thumbnail: "" }))}
                        disabled={uploadingThumbnail || saving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-800">Đã tải ảnh đại diện thành công</h4>
                    <p className="text-xs text-slate-500">Ảnh của bạn đang được hiển thị đầy đủ và sắc nét. Bạn có thể xóa để chọn ảnh mới.</p>
                    <label className="mt-2.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                      {uploadingThumbnail ? "Đang tải ảnh mới..." : "Thay đổi ảnh"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleUploadThumbnail}
                        disabled={uploadingThumbnail || saving}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 max-w-xl bg-white hover:bg-slate-50/50 hover:border-slate-400 transition-all duration-200 cursor-pointer group text-center shadow-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                      {uploadingThumbnail ? (
                        <Loader2 className="h-5 w-5 text-slate-600 animate-spin" />
                      ) : (
                        <Upload className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700">Tải ảnh thumbnail bài viết</p>
                      <p className="text-xs text-slate-500">Định dạng hỗ trợ: JPG, JPEG, PNG hoặc WEBP (Tối đa 5MB)</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleUploadThumbnail}
                    disabled={uploadingThumbnail || saving}
                  />
                </label>
              )}
            </div>

            <div className="space-y-2 md:col-span-3">
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

            <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700 md:col-span-3">
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
