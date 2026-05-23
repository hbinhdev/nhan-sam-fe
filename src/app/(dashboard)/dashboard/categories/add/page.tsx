"use client";

import React from "react";
import { CategoryForm } from "@/components/dashboard/categories/CategoryForm";

export default function AddCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thêm danh mục mới</h1>
        <p className="text-sm text-slate-500">Tạo danh mục mới cho sản phẩm.</p>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}
