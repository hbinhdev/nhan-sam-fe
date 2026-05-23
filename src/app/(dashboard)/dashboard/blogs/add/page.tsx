"use client";
export const dynamic = "force-dynamic";

import React from "react";
import { BlogForm } from "@/components/dashboard/blogs/BlogForm";

export default function AddBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thêm bài viết mới</h1>
        <p className="text-sm text-slate-500">Tạo bài viết mới cho website.</p>
      </div>

      <BlogForm mode="create" />
    </div>
  );
}
