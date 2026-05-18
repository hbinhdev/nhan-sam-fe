"use client";

import React from "react";
import { CategoryForm } from "@/components/dashboard/categories/CategoryForm";

export default function AddCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Category</h1>
        <p className="text-sm text-slate-500">Create a new category for your products.</p>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}
