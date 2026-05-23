"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAdminCategory,
  updateAdminCategory,
  type AdminCategory,
} from "@/lib/admin-category-api";
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
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();
    if (!name) {
      showToast("Tên danh mục là bắt buộc.", "error");
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        await createAdminCategory({ name, description });
      } else if (initialData) {
        await updateAdminCategory(initialData.id, { name, description });
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
                ? "Lưu danh mục"
                : "Cập nhật danh mục"}
          </Button>
        </div>
      </form>
    </div>
  );
}
