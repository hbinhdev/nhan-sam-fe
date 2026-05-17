"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CategoryForm } from "@/components/dashboard/categories/CategoryForm";
import { getAdminCategoryById, type AdminCategory } from "@/lib/admin-category-api";

export default function EditCategoryPage() {
  const { id } = useParams();
  const [category, setCategory] = useState<AdminCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (typeof id !== "string") return;
      setLoading(true);
      try {
        const data = await getAdminCategoryById(id);
        if (!data) {
          setError("Category not found.");
        } else {
          setCategory(data);
        }
      } catch (err) {
        setError("Failed to load category.");
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Category</h1>
        <p className="text-sm text-slate-500">Update existing category details.</p>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-slate-500">Loading category...</div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
        <CategoryForm mode="edit" initialData={category} />
      )}
    </div>
  );
}
