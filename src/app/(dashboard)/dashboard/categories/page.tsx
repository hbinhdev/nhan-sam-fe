"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/auth-api";
import {
  deleteAdminCategory,
  getAdminCategories,
  getAdminCategoryById,
  type AdminCategory,
} from "@/lib/admin-category-api";
import { Button } from "@/components/ui/button";
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
import { Edit, Eye, Plus, Trash2 } from "lucide-react";

function formatDate(date?: string) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const [viewCategory, setViewCategory] = useState<AdminCategory | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const total = useMemo(() => categories.length, [categories]);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (loadError) {
      setCategories([]);
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load categories.",
      );
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
      void loadCategories();
    });
  }, [authChecked, isAdmin]);

  const openViewModal = async (category: AdminCategory) => {
    setViewLoading(true);
    setViewCategory(category);

    try {
      const latest = await getAdminCategoryById(category.id);
      if (latest) {
        setViewCategory(latest);
      }
    } catch {
      // Keep current row data if detail request fails
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (category: AdminCategory) => {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) return;

    setError(null);
    setFlashMessage(null);

    try {
      await deleteAdminCategory(category.id);
      setFlashMessage("Category deleted successfully.");
      await loadCategories();
    } catch (deleteError) {
      const rawMessage =
        deleteError instanceof Error ? deleteError.message : "Failed to delete category.";
      const lower = rawMessage.toLowerCase();

      if (
        lower.includes("foreign key") ||
        lower.includes("constraint") ||
        lower.includes("unable to delete")
      ) {
        setError("Cannot delete category because it is used by existing products.");
        return;
      }

      setError(rawMessage);
    }
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
            Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage product categories.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/categories/add")}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {flashMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {flashMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          No categories found.
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <Table className="table-fixed min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[16%]">Name</TableHead>
                <TableHead className="w-[16%]">Slug</TableHead>
                <TableHead className="w-[34%]">Description</TableHead>
                <TableHead className="w-[14%] whitespace-nowrap">Created At</TableHead>
                <TableHead className="w-[14%] whitespace-nowrap">Updated At</TableHead>
                <TableHead className="w-[120px] text-right whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium break-words">{category.name}</TableCell>
                  <TableCell className="break-words">{category.slug}</TableCell>
                  <TableCell>
                    <p
                      className="text-slate-600 break-words line-clamp-2 leading-5"
                      title={category.description ?? ""}
                    >
                      {category.description?.trim() ? category.description.trim() : "No description"}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(category.createdAt)}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDate(category.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="h-8 w-8 text-slate-700"
                        onClick={() => void openViewModal(category)}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="h-8 w-8 text-slate-700"
                        onClick={() => router.push(`/dashboard/categories/${category.id}/edit`)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        className="h-8 w-8"
                        onClick={() => void handleDelete(category)}
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

      <div className="text-sm text-slate-500">{total} categories</div>

      <Dialog open={Boolean(viewCategory)} onOpenChange={() => setViewCategory(null)}>
        <DialogContent className="w-[95vw] max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
          <DialogHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <DialogTitle>Category Detail</DialogTitle>
            <DialogDescription>Read-only category information.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-4 py-5 text-sm sm:px-6">
            {viewLoading ? <p className="text-slate-500">Loading category detail...</p> : null}

            {viewCategory ? (
              <>
                <p><strong>Name:</strong> {viewCategory.name}</p>
                <p><strong>Slug:</strong> {viewCategory.slug}</p>
                <p>
                  <strong>Description:</strong>{" "}
                  {viewCategory.description?.trim() || "No description"}
                </p>
                <p><strong>Created at:</strong> {formatDate(viewCategory.createdAt)}</p>
                <p><strong>Updated at:</strong> {formatDate(viewCategory.updatedAt)}</p>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
