"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { ProductTable } from '@/components/dashboard/products/ProductTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ProductSummary } from '@/lib/product-api';
import type { Category } from '@/lib/category-api';
import { getAuthSession } from '@/lib/auth-api';
import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  getCategoriesForProductForm,
  updateAdminProduct,
  type AdminProductPayload,
} from '@/lib/admin-product-api';

type FormMode = 'create' | 'edit';

type ProductFormState = {
  sku: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  thumbnail: string;
  imagesText: string;
  videoUrl: string;
  usagePurpose: string;
  usageInstructions: string;
  ginsengAge: string;
  brand: string;
  origin: string;
  isBestSeller: boolean;
};

const EMPTY_FORM: ProductFormState = {
  sku: '',
  name: '',
  description: '',
  price: '',
  stock: '',
  categoryId: '',
  thumbnail: '',
  imagesText: '',
  videoUrl: '',
  usagePurpose: '',
  usageInstructions: '',
  ginsengAge: '',
  brand: '',
  origin: '',
  isBestSeller: false,
};

const PAGE_LIMIT = 10;

function mapProductToForm(product: ProductSummary): ProductFormState {
  const images = Array.isArray(product.images) ? product.images : [];

  return {
    sku: product.sku ?? '',
    name: product.name,
    description: product.description ?? '',
    price: String(product.price ?? ''),
    stock: String(product.stock ?? 0),
    categoryId: product.category?.id ?? '',
    thumbnail: product.thumbnail ?? product.imageUrl ?? '',
    imagesText: images.join('\n'),
    videoUrl: product.videoUrl ?? '',
    usagePurpose: product.usagePurpose ?? '',
    usageInstructions: product.usageInstructions ?? '',
    ginsengAge: product.ginsengAge ?? '',
    brand: product.brand ?? '',
    origin: product.origin ?? '',
    isBestSeller: Boolean(product.isBestSeller),
  };
}

function parseImages(imagesText: string) {
  return imagesText
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function buildPayload(form: ProductFormState): AdminProductPayload {
  const images = parseImages(form.imagesText);
  const thumbnail = form.thumbnail.trim();

  const normalizedImages =
    images.length > 0
      ? images
      : thumbnail
        ? [thumbnail]
        : [];

  const imageUrl = thumbnail || normalizedImages[0] || undefined;

  return {
    sku: form.sku.trim() || undefined,
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    price: Number(form.price),
    stock: form.stock.trim() ? Number(form.stock) : undefined,
    categoryId: form.categoryId,
    imageUrl,
    images: normalizedImages,
    videoUrl: form.videoUrl.trim() || null,
    usagePurpose: form.usagePurpose.trim() || undefined,
    usageInstructions: form.usageInstructions.trim() || undefined,
    ginsengAge: form.ginsengAge.trim() || undefined,
    brand: form.brand.trim() || undefined,
    origin: form.origin.trim() || undefined,
    isBestSeller: form.isBestSeller,
  };
}

function validateForm(form: ProductFormState) {
  if (!form.name.trim()) {
    return 'Product name is required.';
  }

  if (!form.price.trim() || Number.isNaN(Number(form.price))) {
    return 'Price is required and must be numeric.';
  }

  if (Number(form.price) < 0) {
    return 'Price must be greater than or equal to 0.';
  }

  if (form.stock.trim() && Number.isNaN(Number(form.stock))) {
    return 'Stock must be numeric.';
  }

  if (!form.categoryId) {
    return 'Category is required.';
  }

  return null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingProduct, setEditingProduct] = useState<ProductSummary | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const [viewProduct, setViewProduct] = useState<ProductSummary | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    return Math.max(1, Math.ceil(total / PAGE_LIMIT));
  }, [total]);

  const loadProducts = async (nextPage = page, nextSearch = search, nextCategory = categoryId) => {
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
      setError(loadError instanceof Error ? loadError.message : 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getAuthSession();
      setIsAdmin(session?.user?.role === 'ADMIN');
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

      await loadProducts(1, '', '');
    };

    void loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isAdmin]);

  const openCreateModal = () => {
    setFormMode('create');
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (product: ProductSummary) => {
    setFormMode('edit');
    setEditingProduct(product);
    setForm(mapProductToForm(product));
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleDelete = async (product: ProductSummary) => {
    const confirmed = window.confirm(`Delete product "${product.name}"?`);
    if (!confirmed) return;

    setError(null);
    setFlashMessage(null);

    try {
      await deleteAdminProduct(product.id);
      setFlashMessage('Product deleted successfully.');
      await loadProducts(page, search, categoryId);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete product.');
    }
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setError(null);
    setFlashMessage(null);

    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = buildPayload(form);

    setSaving(true);
    try {
      if (formMode === 'create') {
        await createAdminProduct(payload);
        setFlashMessage('Product created successfully.');
      } else if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        setFlashMessage('Product updated successfully.');
      }

      setIsFormOpen(false);
      await loadProducts(page, search, categoryId);
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : 'Failed to save product.');
    } finally {
      setSaving(false);
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
        <Button
          onClick={openCreateModal}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="relative flex-1" onSubmit={handleSearchSubmit}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
          onEdit={openEditModal}
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="h-auto w-[95vw] max-w-6xl sm:max-w-6xl md:max-w-6xl lg:max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
          <form className="flex max-h-[90vh] w-full flex-col" onSubmit={handleSubmitForm}>
            <DialogHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
              <DialogTitle>{formMode === 'create' ? 'Add Product' : 'Edit Product'}</DialogTitle>
              <DialogDescription>
                Fill in product details and save changes.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {formError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            <div className="mt-4 grid w-full grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Name *</label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">SKU</label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.sku}
                  onChange={(e) => setForm((prev) => ({ ...prev, sku: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Price *</label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Stock</label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm((prev) => ({ ...prev, stock: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Category *</label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.categoryId}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Thumbnail URL</label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.thumbnail}
                  onChange={(e) => setForm((prev) => ({ ...prev, thumbnail: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Image URLs (one URL per line)</label>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.imagesText}
                  onChange={(e) => setForm((prev) => ({ ...prev, imagesText: e.target.value }))}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Video URL</label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.videoUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Usage Purpose</label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.usagePurpose}
                  onChange={(e) => setForm((prev) => ({ ...prev, usagePurpose: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Usage Instructions</label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.usageInstructions}
                  onChange={(e) => setForm((prev) => ({ ...prev, usageInstructions: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Ginseng Age</label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.ginsengAge}
                  onChange={(e) => setForm((prev) => ({ ...prev, ginsengAge: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Brand</label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.brand}
                  onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Origin</label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.origin}
                  onChange={(e) => setForm((prev) => ({ ...prev, origin: e.target.value }))}
                />
              </div>

              <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
                  checked={form.isBestSeller}
                  onChange={(e) => setForm((prev) => ({ ...prev, isBestSeller: e.target.checked }))}
                />
                Best Seller
              </label>
            </div>
            </div>

            <div className="sticky bottom-0 z-10 flex justify-end gap-3 border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="h-10 min-w-24 border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                onClick={() => setIsFormOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 min-w-32 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-500 disabled:text-white"
                disabled={saving}
              >
                {saving ? 'Saving...' : formMode === 'create' ? 'Save Product' : 'Update Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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
                    src={viewProduct.imageUrl || viewProduct.thumbnail || '/images/product-root.png'}
                    alt={viewProduct.name}
                    className="h-56 w-full rounded-lg object-cover bg-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {viewProduct.name}</p>
                  <p><strong>SKU:</strong> {viewProduct.sku || '-'}</p>
                  <p><strong>Price:</strong> {new Intl.NumberFormat('vi-VN').format(viewProduct.price)} VND</p>
                  <p><strong>Stock:</strong> {viewProduct.stock ?? 0}</p>
                  <p><strong>Category:</strong> {viewProduct.category?.name || '-'}</p>
                  <p><strong>Brand:</strong> {viewProduct.brand || '-'}</p>
                  <p><strong>Origin:</strong> {viewProduct.origin || '-'}</p>
                  <p><strong>Ginseng Age:</strong> {viewProduct.ginsengAge || '-'}</p>
                  <p><strong>Usage Purpose:</strong> {viewProduct.usagePurpose || '-'}</p>
                  <p><strong>Best Seller:</strong> {viewProduct.isBestSeller ? 'Yes' : 'No'}</p>
                  <p><strong>Video URL:</strong> {viewProduct.videoUrl || '-'}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold">Description</p>
                <p className="text-slate-600">{viewProduct.description || 'No description'}</p>
              </div>

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
                <p>Created at: {viewProduct.createdAt || '-'}</p>
                <p>Updated at: {viewProduct.updatedAt || '-'}</p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
