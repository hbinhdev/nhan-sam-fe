"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BlogForm } from "@/components/dashboard/blogs/BlogForm";
import { adminGetBlogById, type BlogPostItem } from "@/lib/blog-api";

export default function EditBlogPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<BlogPostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (typeof id !== "string") return;
      setLoading(true);
      try {
        const data = await adminGetBlogById(id);
        if (!data) {
          setError("Blog post not found.");
        } else {
          setBlog(data);
        }
      } catch (err) {
        setError("Failed to load blog post.");
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Blog Post</h1>
        <p className="text-sm text-slate-500">Update existing article content.</p>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-slate-500">Loading blog post...</div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : (
        <BlogForm mode="edit" initialData={blog} />
      )}
    </div>
  );
}
