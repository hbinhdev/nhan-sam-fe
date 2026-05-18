"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/dashboard/products/ProductForm";
import { getAdminProductById, getCategoriesForProductForm } from "@/lib/admin-product-api";
import type { Category } from "@/lib/category-api";
import type { ProductSummary } from "@/lib/product-api";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (typeof id !== "string") return;
      setLoading(true);
      try {
        const [productData, categoryData] = await Promise.all([
          getAdminProductById(id),
          getCategoriesForProductForm(),
        ]);
        if (!productData) {
          setError("Product not found.");
        } else {
          setProduct(productData);
          setCategories(categoryData);
        }
      } catch (err) {
        setError("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Product</h1>
        <p className="text-sm text-slate-500">Update existing product details.</p>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-slate-500">Loading product...</div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
        <ProductForm mode="edit" initialData={product} categories={categories} />
      )}
    </div>
  );
}
