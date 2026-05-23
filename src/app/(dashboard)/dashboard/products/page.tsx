"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductTable } from "@/components/dashboard/products/ProductTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Download, Plus, SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductSummary } from "@/lib/product-api";
import type { Category } from "@/lib/category-api";
import { getAuthSession } from "@/lib/auth-api";
import {
  deleteAdminProduct,
  getAdminProducts,
  getCategoriesForProductForm,
} from "@/lib/admin-product-api";
import { exportProductsReport } from "@/lib/report-api";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { normalizeBlogContentToHtml } from "@/lib/blog-helpers";

const PAGE_LIMIT = 10;

function decodeHtmlEntities(value: string) {
  if (typeof window === "undefined") return value;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function renderRichText(value?: string | null) {
  if (!value?.trim()) return "";
  return normalizeBlogContentToHtml(decodeHtmlEntities(value));
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [viewProduct, setViewProduct] = useState<ProductSummary | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showToast } = useToast();

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    return Math.max(1, Math.ceil(total / PAGE_LIMIT));
  }, [total]);

  const loadProducts = async (
    nextPage = page,
    nextSearch = search,
    nextCategory = categoryId,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminProducts({
        page: nextPage,
        limit: PAGE_LIMIT,
        search: nextSearch || undefined,
        categoryId: nextCategory || undefined,
      });

      setProducts(response.data);
      setTotal(response.total);
      setPage(response.page);
    } catch (loadError) {
      setProducts([]);
      setTotal(0);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh sách sản phẩm.",
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

    const loadInitialData = async () => {
      try {
        const categoryData = await getCategoriesForProductForm();
        setCategories(categoryData);
      } catch {
        setCategories([]);
      }

      await loadProducts(1, "", "");
    };

    void loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isAdmin]);

  const confirmDeleteProduct = async () => {
    if (!deletingProduct) return;
    setError(null);
    setDeleting(true);

    try {
      await deleteAdminProduct(deletingProduct.id);
      showToast("Xóa sản phẩm thành công.", "success");
      setDeletingProduct(null);
      await loadProducts(page, search, categoryId);
    } catch (deleteError) {
      showToast(
        deleteError instanceof Error
          ? deleteError.message
          : "Không thể xóa sản phẩm.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    setSearch(nextSearch);
    void loadProducts(1, nextSearch, categoryId);
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextCategoryId = event.target.value;
    setCategoryId(nextCategoryId);
    void loadProducts(1, search, nextCategoryId);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportProductsReport({
        search: search || undefined,
        categoryId: categoryId || undefined,
      });
      showToast("Xuất danh sách sản phẩm thành công.", "success");
    } catch (exportError) {
      showToast(
        exportError instanceof Error
          ? exportError.message
          : "Xuất danh sách sản phẩm thất bại.",
        "error",
      );
    } finally {
      setExporting(false);
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
        Cần quyền quản trị để quản lý sản phẩm.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Sản phẩm
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý tồn kho và danh mục sản phẩm.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void handleExport()}
            disabled={exporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Button
            onClick={() => router.push("/dashboard/products/add")}
            className="bg-slate-900 text-white hover:bg-slate-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="relative flex-1" onSubmit={handleSearchSubmit}>
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </form>

        <select
          className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
          value={categoryId}
          onChange={handleCategoryChange}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Đang tải sản phẩm...
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Không tìm thấy sản phẩm.
        </div>
      ) : (
        <ProductTable
          products={products}
          onView={(product) => setViewProduct(product)}
          onEdit={(product) => router.push(`/dashboard/products/${product.id}/edit`)}
          onDelete={(product) => setDeletingProduct(product)}
        />
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Trang {page} / {totalPages} ({total} sản phẩm)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page <= 1 || loading}
            onClick={() => void loadProducts(page - 1, search, categoryId)}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page >= totalPages || loading}
            onClick={() => void loadProducts(page + 1, search, categoryId)}
          >
            Sau
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(viewProduct)} onOpenChange={() => setViewProduct(null)}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader>
            <DialogTitle className="px-6 pt-6">Chi tiết sản phẩm</DialogTitle>
            <DialogDescription className="px-6 pb-4">
              Thông tin sản phẩm (chỉ xem).
            </DialogDescription>
          </DialogHeader>

          {viewProduct ? (
            <div className="space-y-6 px-6 pb-6 text-sm">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3 space-y-4">
                  <img
                    src={viewProduct.imageUrl || viewProduct.thumbnail || "/images/product-root.png"}
                    alt={viewProduct.name}
                    className="h-[340px] w-full rounded-xl object-cover bg-slate-100"
                  />

                  {Array.isArray(viewProduct.images) && viewProduct.images.length > 0 ? (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Bộ sưu tập
                      </p>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {viewProduct.images.map((imageUrl, index) => (
                          <img
                            key={`${viewProduct.id}-image-${index}`}
                            src={imageUrl}
                            alt={`${viewProduct.name} ${index + 1}`}
                            className="h-20 w-full rounded-lg object-cover bg-slate-100"
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-lg font-semibold text-slate-900">{viewProduct.name}</h3>
                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
                    <p><strong>Mã SP:</strong> {viewProduct.sku || "-"}</p>
                    <p><strong>Giá:</strong> {new Intl.NumberFormat("vi-VN").format(viewProduct.price)}đ</p>
                    <p><strong>Tồn kho:</strong> {viewProduct.stock ?? 0}</p>
                    <p><strong>Danh mục:</strong> {viewProduct.category?.name || "-"}</p>
                    <p><strong>Thương hiệu:</strong> {viewProduct.brand || "-"}</p>
                    <p><strong>Xuất xứ:</strong> {viewProduct.origin || "-"}</p>
                    <p><strong>Tuổi sâm:</strong> {viewProduct.ginsengAge || "-"}</p>
                    <p className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                      Tạo lúc: {viewProduct.createdAt || "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Cập nhật lúc: {viewProduct.updatedAt || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-3 font-semibold text-slate-900">Mô tả</p>
                  {viewProduct.description ? (
                    <div
                      className="prose prose-sm max-w-none text-slate-700 [&_img]:rounded-md [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                      dangerouslySetInnerHTML={{ __html: renderRichText(viewProduct.description) }}
                    />
                  ) : (
                    <p className="text-slate-500">Không có mô tả</p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-3 font-semibold text-slate-900">Công dụng</p>
                  {viewProduct.usagePurpose ? (
                    <div
                      className="prose prose-sm max-w-none text-slate-700 [&_img]:rounded-md [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                      dangerouslySetInnerHTML={{ __html: renderRichText(viewProduct.usagePurpose) }}
                    />
                  ) : (
                    <p className="text-slate-500">Không có thông tin</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-3 font-semibold text-slate-900">Hướng dẫn sử dụng</p>
                {viewProduct.usageInstructions ? (
                  <div
                    className="prose prose-sm max-w-none text-slate-700 [&_img]:rounded-md [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
                    dangerouslySetInnerHTML={{ __html: renderRichText(viewProduct.usageInstructions) }}
                  />
                ) : (
                  <p className="text-slate-500">Không có thông tin</p>
                )}
              </div>

              {viewProduct.videoUrl ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-3 font-semibold text-slate-900">Video sản phẩm</p>
                  <video
                    className="max-h-80 w-full rounded-lg border border-slate-200 bg-black"
                    controls
                    src={viewProduct.videoUrl}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeletingProduct(null);
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl border border-slate-200 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-3 text-xl text-slate-900">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={20} />
              </span>
              Xác nhận xóa sản phẩm
            </DialogTitle>
            <DialogDescription className="pt-2 text-[15px] leading-7 text-slate-600">
              Bạn có chắc muốn xóa sản phẩm:
              <span className="block mt-2 rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-900">
                {deletingProduct?.name}
              </span>
              <span className="mt-2 block text-red-600">
                Hành động này không thể hoàn tác.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50/60">
            <Button
              variant="outline"
              onClick={() => setDeletingProduct(null)}
              disabled={deleting}
              className="min-w-24 border-slate-300"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDeleteProduct()}
              disabled={deleting}
              className="min-w-32"
            >
              {deleting ? "Đang xóa..." : "Xóa sản phẩm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
