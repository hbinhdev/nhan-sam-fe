"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/auth-api";
import {
  adminDeleteBlog,
  adminGetBlogById,
  adminGetBlogs,
  adminUpdateBlog,
  type BlogPostItem,
} from "@/lib/blog-api";
import type { BlogCategory } from "@/lib/blog-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { BLOG_CATEGORY_OPTIONS, getBlogCategoryLabel, normalizeBlogContentToHtml } from "@/lib/blog-helpers";

const PAGE_LIMIT = 10;

function formatDate(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("vi-VN");
}

export default function BlogsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [blogs, setBlogs] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"" | BlogCategory>("");
  const [publishedFilter, setPublishedFilter] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [viewBlog, setViewBlog] = useState<BlogPostItem | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    return Math.max(1, Math.ceil(total / PAGE_LIMIT));
  }, [total]);

  const loadBlogs = async (
    nextPage = page,
    nextSearch = search,
    nextCategory = categoryFilter,
    nextPublished = publishedFilter,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminGetBlogs({
        page: nextPage,
        limit: PAGE_LIMIT,
        search: nextSearch || undefined,
        category: nextCategory || undefined,
        isPublished:
          nextPublished === ""
            ? undefined
            : nextPublished === "true"
              ? true
              : false,
      });

      setBlogs(response.data);
      setTotal(response.total);
      setPage(response.page);
    } catch (loadError) {
      setBlogs([]);
      setTotal(0);
      const message =
        loadError instanceof Error ? loadError.message : "Failed to load blog posts.";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getAuthSession();
      setIsAdmin(session?.user?.role === "ADMIN");
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!authChecked || !isAdmin) {
      return;
    }

    Promise.resolve().then(() => {
      void loadBlogs(1, "", "", "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isAdmin]);

  const openViewModal = async (blog: BlogPostItem) => {
    setViewLoading(true);
    setViewBlog(blog);

    try {
      const latest = await adminGetBlogById(blog.id);
      if (latest) {
        setViewBlog(latest);
      }
    } catch {
      // Keep table data if detail request fails.
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (blog: BlogPostItem) => {
    const confirmed = window.confirm(`Delete blog post "${blog.title}"?`);
    if (!confirmed) return;

    try {
      await adminDeleteBlog(blog.id);
      showToast("Blog post deleted successfully.", "success");
      await loadBlogs(page, search, categoryFilter, publishedFilter);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete blog post.";
      setError(message);
      showToast(message, "error");
    }
  };

  const togglePublished = async (blog: BlogPostItem) => {
    try {
      await adminUpdateBlog(blog.id, { isPublished: !blog.isPublished });
      showToast(
        !blog.isPublished ? "Blog post published." : "Blog post unpublished.",
        "success",
      );
      await loadBlogs(page, search, categoryFilter, publishedFilter);
    } catch (toggleError) {
      const message =
        toggleError instanceof Error
          ? toggleError.message
          : "Failed to update publish status.";
      showToast(message, "error");
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = searchInput.trim();
    setSearch(keyword);
    void loadBlogs(1, keyword, categoryFilter, publishedFilter);
  };

  const handleCategoryFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCategory = event.target.value as "" | BlogCategory;
    setCategoryFilter(nextCategory);
    void loadBlogs(1, search, nextCategory, publishedFilter);
  };

  const handlePublishedFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextPublished = event.target.value as "" | "true" | "false";
    setPublishedFilter(nextPublished);
    void loadBlogs(1, search, categoryFilter, nextPublished);
  };

  if (!authChecked) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Checking admin access...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Admin access is required.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Blogs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage knowledge and SEO blog posts.
          </p>
        </div>
        <Button 
          onClick={() => router.push("/dashboard/blogs/add")} 
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Blog
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="flex-1" onSubmit={handleSearchSubmit}>
          <Input
            placeholder="Search blogs..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </form>

        <select
          className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
          value={categoryFilter}
          onChange={handleCategoryFilterChange}
        >
          <option value="">All categories</option>
          {BLOG_CATEGORY_OPTIONS.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <select
          className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
          value={publishedFilter}
          onChange={handlePublishedFilterChange}
        >
          <option value="">All status</option>
          <option value="true">Published</option>
          <option value="false">Unpublished</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Loading blog posts...
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          No blog posts found.
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[45%]">Title</TableHead>
                <TableHead className="w-[15%]">Status</TableHead>
                <TableHead className="w-[20%]">Published At</TableHead>
                <TableHead className="w-[20%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.map((blog) => (
                <TableRow key={blog.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1 max-w-md">
                      <span className="font-semibold text-slate-900 truncate block" title={blog.title}>
                        {blog.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {getBlogCategoryLabel(blog.category)}
                        </span>
                        <span className="text-[10px] text-slate-400 italic truncate max-w-[200px]">
                          {blog.slug}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={blog.isPublished ? "success" : "secondary"} className="font-medium">
                      {blog.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {formatDate(blog.publishedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        onClick={() => void openViewModal(blog)}
                        title="View"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => router.push(`/dashboard/blogs/${blog.id}/edit`)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => void handleDelete(blog)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages} ({total} blog posts)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page <= 1 || loading}
            onClick={() => void loadBlogs(page - 1, search, categoryFilter, publishedFilter)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page >= totalPages || loading}
            onClick={() => void loadBlogs(page + 1, search, categoryFilter, publishedFilter)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(viewBlog)} onOpenChange={() => setViewBlog(null)}>
        <DialogContent className="w-[95vw] max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
          <DialogHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <DialogTitle>Blog Detail</DialogTitle>
            <DialogDescription>Read-only blog information.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-4 py-5 text-sm sm:px-6">
            {viewLoading ? <p className="text-slate-500">Loading blog detail...</p> : null}

            {viewBlog ? (
              <>
                <p>
                  <strong>Title:</strong> {viewBlog.title}
                </p>
                <p>
                  <strong>Slug:</strong> {viewBlog.slug}
                </p>
                <p>
                  <strong>Category:</strong> {getBlogCategoryLabel(viewBlog.category)}
                </p>
                <p>
                  <strong>Status:</strong> {viewBlog.isPublished ? "Published" : "Draft"}
                </p>
                <p>
                  <strong>Author:</strong> {viewBlog.authorName || "-"}
                </p>
                <p>
                  <strong>Tags:</strong> {viewBlog.tags.length > 0 ? viewBlog.tags.join(", ") : "-"}
                </p>
                <p>
                  <strong>Published at:</strong> {formatDate(viewBlog.publishedAt)}
                </p>
                <p>
                  <strong>Updated at:</strong> {formatDate(viewBlog.updatedAt)}
                </p>
                {viewBlog.thumbnail ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Thumbnail:</strong>
                    </p>
                    <img
                      src={viewBlog.thumbnail}
                      alt={viewBlog.title}
                      className="h-52 w-full rounded-lg border border-slate-200 object-cover"
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <p>
                    <strong>Excerpt:</strong>
                  </p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 whitespace-pre-wrap">
                    {viewBlog.excerpt || "-"}
                  </div>
                </div>
                <div className="space-y-2">
                  <p>
                    <strong>Content:</strong>
                  </p>
                  <div
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                    dangerouslySetInnerHTML={{ __html: normalizeBlogContentToHtml(viewBlog.content) }}
                  />
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
