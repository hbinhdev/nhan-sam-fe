"use client";

import React from "react";
import { BlogForm } from "@/components/dashboard/blogs/BlogForm";

export default function AddBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Blog Post</h1>
        <p className="text-sm text-slate-500">Create a new article for your website.</p>
      </div>

      <BlogForm mode="create" />
    </div>
  );
}
