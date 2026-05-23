"use client";

import React, { useEffect, useState } from "react";
import { ProductForm } from "@/components/dashboard/products/ProductForm";
import { getCategoriesForProductForm } from "@/lib/admin-product-api";
import type { Category } from "@/lib/category-api";

export default function AddProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategoriesForProductForm();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thêm sản phẩm mới</h1>
        <p className="text-sm text-slate-500">Tạo sản phẩm mới trong danh mục.</p>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-slate-500">Đang tải biểu mẫu...</div>
      ) : (
        <ProductForm mode="create" categories={categories} />
      )}
    </div>
  );
}
