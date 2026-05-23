"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BlogForm } from "@/components/dashboard/blogs/BlogForm";
import { adminGetBlogById, type BlogPostItem } from "@/lib/blog-api";
import { useToast } from "@/components/shared/toast/ToastProvider";

export default function EditBlogPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [blog, setBlog] = useState<BlogPostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (typeof id !== "string") return;
      setLoading(true);
      try {
        const data = await adminGetBlogById(id);
        if (!data) {
          setNotFound(true);
          showToast("Không tìm thấy bài viết.", "error");
        } else {
          setNotFound(false);
          setBlog(data);
        }
      } catch (err) {
        showToast("Không thể tải dữ liệu bài viết.", "error");
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
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sửa bài viết</h1>
        <p className="text-sm text-slate-500">Cập nhật nội dung bài viết hiện có.</p>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-slate-500">Đang tải bài viết...</div>
      ) : notFound ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">Không tìm thấy bài viết.</div>
      ) : (
        <BlogForm mode="edit" initialData={blog} />
      )}
    </div>
  );
}
