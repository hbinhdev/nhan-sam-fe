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
import { AlertTriangle, Edit, Eye, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/components/shared/toast/ToastProvider";

function formatDate(date?: string) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("vi-VN");
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const [viewCategory, setViewCategory] = useState<AdminCategory | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<AdminCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

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
        loadError instanceof Error ? loadError.message : "Không thể tải danh sách danh mục.",
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

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    setError(null);

    try {
      await deleteAdminCategory(deletingCategory.id);
      showToast("Xóa danh mục thành công.", "success");
      setDeletingCategory(null);
      await loadCategories();
    } catch (deleteError) {
      const rawMessage =
        deleteError instanceof Error ? deleteError.message : "Không thể xóa danh mục.";
      const lower = rawMessage.toLowerCase();

      if (
        lower.includes("foreign key") ||
        lower.includes("constraint") ||
        lower.includes("unable to delete")
      ) {
        showToast("Không thể xóa danh mục vì đang được dùng bởi sản phẩm hiện có.", "error");
        return;
      }

      showToast(rawMessage, "error");
    } finally {
      setDeleting(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Đang kiểm tra quyền quản trị...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Cần quyền quản trị.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Danh mục
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý danh mục sản phẩm.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/categories/add")}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Đang tải danh mục...
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Không tìm thấy danh mục.
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <Table className="table-fixed min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[16%]">Tên</TableHead>
                <TableHead className="w-[16%]">Slug</TableHead>
                <TableHead className="w-[34%]">Mô tả</TableHead>
                <TableHead className="w-[14%] whitespace-nowrap">Ngày tạo</TableHead>
                <TableHead className="w-[14%] whitespace-nowrap">Ngày cập nhật</TableHead>
                <TableHead className="w-[120px] text-right whitespace-nowrap">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium break-words">
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex-shrink-0">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-400 flex-shrink-0">
                          No Pic
                        </div>
                      )}
                      <span className="truncate max-w-[120px] sm:max-w-none">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="break-words">{category.slug}</TableCell>
                  <TableCell>
                    <p
                      className="text-slate-600 break-words line-clamp-2 leading-5"
                      title={category.description ?? ""}
                    >
                      {category.description?.trim() ? category.description.trim() : "Không có mô tả"}
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
                        onClick={() => setDeletingCategory(category)}
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

      <div className="text-sm text-slate-500">{total} danh mục</div>

      <Dialog open={Boolean(viewCategory)} onOpenChange={() => setViewCategory(null)}>
        <DialogContent className="w-[95vw] max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setViewCategory(null)}
            className="absolute right-4 top-4 z-20 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
          <DialogHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <DialogTitle>Chi tiết danh mục</DialogTitle>
            <DialogDescription>Thông tin danh mục (chỉ xem).</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-4 py-5 text-sm sm:px-6">
            {viewLoading ? <p className="text-slate-500">Đang tải chi tiết danh mục...</p> : null}

            {viewCategory ? (
              <div className="space-y-4">
                {viewCategory.image ? (
                  <div className="relative aspect-video w-full max-h-56 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <img
                      src={viewCategory.image}
                      alt={viewCategory.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="space-y-3">
                  <p><strong>Tên:</strong> {viewCategory.name}</p>
                  <p><strong>Slug:</strong> {viewCategory.slug}</p>
                  <p>
                    <strong>Mô tả:</strong>{" "}
                    {viewCategory.description?.trim() || "Không có mô tả"}
                  </p>
                  <p><strong>Tạo lúc:</strong> {formatDate(viewCategory.createdAt)}</p>
                  <p><strong>Cập nhật lúc:</strong> {formatDate(viewCategory.updatedAt)}</p>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeletingCategory(null);
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl border border-slate-200 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-3 text-xl text-slate-900">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={20} />
              </span>
              Xác nhận xóa danh mục
            </DialogTitle>
            <DialogDescription className="pt-2 text-[15px] leading-7 text-slate-600">
              Bạn có chắc muốn xóa danh mục:
              <span className="block mt-2 rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-900">
                {deletingCategory?.name}
              </span>
              <span className="mt-2 block text-red-600">
                Hành động này không thể hoàn tác.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50/60">
            <Button variant="outline" onClick={() => setDeletingCategory(null)} disabled={deleting} className="min-w-24 border-slate-300">
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => void confirmDeleteCategory()} disabled={deleting} className="min-w-32">
              {deleting ? "Đang xóa..." : "Xóa danh mục"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

