"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductTable } from "@/components/dashboard/products/ProductTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Plus, Search, SearchIcon } from "lucide-react";
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

const PAGE_LIMIT = 10;

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [viewProduct, setViewProduct] = useState<ProductSummary | null>(null);
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
        loadError instanceof Error ? loadError.message : "Failed to load products.",
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

  const handleDelete = async (product: ProductSummary) => {
    const confirmed = window.confirm(`Delete product "${product.name}"?`);
    if (!confirmed) return;

    setError(null);
    setFlashMessage(null);

    try {
      await deleteAdminProduct(product.id);
      setFlashMessage("Product deleted successfully.");
      await loadProducts(page, search, categoryId);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete product.",
      );
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    setSearch(nextSearch);
    void loadProducts(1, nextSearch, categoryId);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
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
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Export products failed.",
        "error",
      );
    } finally {
      setExporting(false);
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
        Admin access is required to manage products.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Products
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your product inventory and catalog.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void handleExport()}
            disabled={exporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export Excel"}
          </Button>
          <Button onClick={() => router.push("/dashboard/products/add")} className="bg-slate-900 text-white hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="relative flex-1" onSubmit={handleSearchSubmit}>
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search products..."
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
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">No products found.</div>
      ) : (
        <ProductTable
          products={products}
          onView={(product) => setViewProduct(product)}
          onEdit={(product) => router.push(`/dashboard/products/${product.id}/edit`)}
          onDelete={handleDelete}
        />
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages} ({total} products)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page <= 1 || loading}
            onClick={() => void loadProducts(page - 1, search, categoryId)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page >= totalPages || loading}
            onClick={() => void loadProducts(page + 1, search, categoryId)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(viewProduct)} onOpenChange={() => setViewProduct(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Detail</DialogTitle>
            <DialogDescription>Read-only product information.</DialogDescription>
          </DialogHeader>

          {viewProduct ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <img
                    src={viewProduct.imageUrl || viewProduct.thumbnail || "/images/product-root.png"}
                    alt={viewProduct.name}
                    className="h-56 w-full rounded-lg object-cover bg-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {viewProduct.name}</p>
                  <p><strong>SKU:</strong> {viewProduct.sku || "-"}</p>
                  <p><strong>Price:</strong> {new Intl.NumberFormat("vi-VN").format(viewProduct.price)} VND</p>
                  <p><strong>Stock:</strong> {viewProduct.stock ?? 0}</p>
                  <p><strong>Category:</strong> {viewProduct.category?.name || "-"}</p>
                  <p><strong>Brand:</strong> {viewProduct.brand || "-"}</p>
                  <p><strong>Origin:</strong> {viewProduct.origin || "-"}</p>
                  <p><strong>Ginseng Age:</strong> {viewProduct.ginsengAge || "-"}</p>
                  <p><strong>Usage Purpose:</strong> {viewProduct.usagePurpose || "-"}</p>
                  <p><strong>Video URL:</strong> {viewProduct.videoUrl || "-"}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold">Description</p>
                <p className="text-slate-600">{viewProduct.description || "No description"}</p>
              </div>

              {viewProduct.videoUrl ? (
                <div>
                  <p className="mb-2 font-semibold">Video Preview</p>
                  <video className="max-h-72 w-full rounded-lg border border-slate-200 bg-black" controls src={viewProduct.videoUrl} />
                </div>
              ) : null}

              {Array.isArray(viewProduct.images) && viewProduct.images.length > 0 ? (
                <div>
                  <p className="mb-2 font-semibold">Gallery</p>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {viewProduct.images.map((imageUrl, index) => (
                      <img
                        key={`${viewProduct.id}-image-${index}`}
                        src={imageUrl}
                        alt={`${viewProduct.name} ${index + 1}`}
                        className="h-24 w-full rounded-md object-cover bg-slate-100"
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="text-xs text-slate-500">
                <p>Created at: {viewProduct.createdAt || "-"}</p>
                <p>Updated at: {viewProduct.updatedAt || "-"}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
