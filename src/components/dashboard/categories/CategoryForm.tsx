"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Trash2 } from "lucide-react";
import {
  createAdminCategory,
  updateAdminCategory,
  type AdminCategory,
} from "@/lib/admin-category-api";
import { uploadImage } from "@/lib/admin-upload-api";
import { useToast } from "@/components/shared/toast/ToastProvider";

type FormMode = "create" | "edit";

interface CategoryFormProps {
  mode: FormMode;
  initialData?: AdminCategory | null;
}

export function CategoryForm({ mode, initialData }: CategoryFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, image: url }));
      showToast("Tải ảnh thành công.", "success");
    } catch (uploadError) {
      showToast(
        uploadError instanceof Error
          ? uploadError.message
          : "Tải ảnh thất bại.",
        "error",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (uploadingImage) {
      showToast("Vui lòng đợi tải ảnh hoàn tất.", "error");
      return;
    }

    const name = form.name.trim();
    const description = form.description.trim();
    const image = form.image.trim() || null;

    if (!name) {
      showToast("Tên danh mục là bắt buộc.", "error");
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        await createAdminCategory({ name, description, image });
      } else if (initialData) {
        await updateAdminCategory(initialData.id, { name, description, image });
      }

      showToast(
        mode === "create" ? "Tạo danh mục thành công." : "Cập nhật danh mục thành công.",
        "success",
      );
      router.push("/dashboard/categories");
      router.refresh();
    } catch (submitError) {
      showToast(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu danh mục.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <form className="flex flex-col" onSubmit={handleSubmitForm}>
        <div className="p-4 sm:p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Tên *</label>
            <Input
              className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Mô tả</label>
            <textarea
              className="min-h-[120px] w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Hình ảnh danh mục</h3>
              <p className="text-xs text-slate-500">Ảnh hiển thị đại diện cho danh mục sản phẩm.</p>
            </div>

            {form.image ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="relative group overflow-hidden rounded-xl border border-slate-200 w-28 h-28 flex-shrink-0 bg-slate-50">
                  <img
                    src={form.image}
                    alt="Category preview"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 flex items-center justify-center transition-colors duration-200"
                      title="Xóa hình ảnh"
                      onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-slate-800">Đã tải ảnh thành công</h4>
                  <p className="text-xs text-slate-500">Hình ảnh của bạn đang được hiển thị sắc nét. Bạn có thể xóa để chọn ảnh mới.</p>
                  <label className="mt-2.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                    Thay đổi ảnh
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 bg-white hover:bg-slate-50/50 hover:border-slate-400 transition-all duration-200 cursor-pointer group text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:scale-105 transition-transform duration-200">
                    {uploadingImage ? (
                      <Loader2 className="h-5 w-5 text-slate-600 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-700">Tải ảnh danh mục</p>
                    <p className="text-xs text-slate-500">Định dạng hỗ trợ: PNG, JPG, JPEG hoặc WEBP (Tối đa 5MB)</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-24 border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            onClick={() => router.back()}
            disabled={saving || uploadingImage}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="h-10 min-w-32 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-500 disabled:text-white"
            disabled={saving || uploadingImage}
          >
            {saving
              ? "Đang lưu..."
              : uploadingImage
                ? "Đang tải ảnh..."
                : mode === "create"
                  ? "Lưu danh mục"
                  : "Cập nhật danh mục"}
          </Button>
        </div>
      </form>
    </div>
  );
}
