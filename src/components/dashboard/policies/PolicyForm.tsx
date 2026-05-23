"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/dashboard/blogs/RichTextEditor";
import { useToast } from "@/components/shared/toast/ToastProvider";
import {
  adminCreatePolicy,
  adminUpdatePolicy,
  type PolicyItem,
  type PolicyType,
} from "@/lib/policy-api";
import { normalizeBlogContentToHtml } from "@/lib/blog-helpers";

type FormMode = "create" | "edit";

type PolicyFormState = {
  type: PolicyType;
  title: string;
  content: string;
  isPublished: boolean;
};

interface PolicyFormProps {
  mode: FormMode;
  initialData?: PolicyItem | null;
}

const POLICY_TYPES: PolicyType[] = ["privacy", "return", "shipping", "payment", "terms"];

const EMPTY_FORM: PolicyFormState = {
  type: "privacy",
  title: "",
  content: "",
  isPublished: true,
};

function mapPolicyToForm(policy: PolicyItem): PolicyFormState {
  return {
    type: policy.type,
    title: policy.title,
    content: normalizeBlogContentToHtml(policy.content),
    isPublished: policy.isPublished,
  };
}

export function PolicyForm({ mode, initialData }: PolicyFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PolicyFormState>(
    initialData ? mapPolicyToForm(initialData) : EMPTY_FORM,
  );

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    const content = form.content.trim();

    if (!title || !content) {
      showToast("Tiêu đề và nội dung là bắt buộc.", "error");
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        await adminCreatePolicy({
          type: form.type,
          title,
          content,
          isPublished: form.isPublished,
        });
      } else if (initialData) {
        await adminUpdatePolicy(initialData.id, {
          type: form.type,
          title,
          content,
          isPublished: form.isPublished,
        });
      }

      showToast(
        mode === "create" ? "Tạo chính sách thành công." : "Cập nhật chính sách thành công.",
        "success",
      );
      router.push("/dashboard/policies");
      router.refresh();
    } catch (submitError) {
      showToast(
        submitError instanceof Error ? submitError.message : "Không thể lưu chính sách.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <form className="flex flex-col" onSubmit={handleSubmitForm}>
        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Loại *</label>
              <select
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, type: event.target.value as PolicyType }))
                }
              >
                {POLICY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Tiêu đề *</label>
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              className="h-10 border-slate-300 bg-white text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nội dung *</label>
            <RichTextEditor
              value={form.content}
              onChange={(nextValue) =>
                setForm((prev) => ({ ...prev, content: nextValue }))
              }
              placeholder="Nhập nội dung chính sách..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, isPublished: event.target.checked }))
              }
            />
            Xuất bản
          </label>
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
                ? "Lưu chính sách"
                : "Cập nhật chính sách"}
          </Button>
        </div>
      </form>
    </div>
  );
}
