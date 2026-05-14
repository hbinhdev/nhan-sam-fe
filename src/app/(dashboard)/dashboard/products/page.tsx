"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ProductTable } from "@/components/dashboard/products/ProductTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, Loader2, Plus, Search, Upload, Video, X } from "lucide-react";
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
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  getCategoriesForProductForm,
  updateAdminProduct,
  type AdminProductPayload,
} from "@/lib/admin-product-api";
import { uploadImage, uploadVideo } from "@/lib/admin-upload-api";

type FormMode = "create" | "edit";

type ProductFormState = {
  sku: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  thumbnail: string;
  images: string[];
  videoUrl: string | null;
  usagePurpose: string;
  usageInstructions: string;
  ginsengAge: string;
  brand: string;
  origin: string;
  isBestSeller: boolean;
};

const EMPTY_FORM: ProductFormState = {
  sku: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  thumbnail: "",
  images: [],
  videoUrl: null,
  usagePurpose: "",
  usageInstructions: "",
  ginsengAge: "",
  brand: "",
  origin: "",
  isBestSeller: false,
};

const PAGE_LIMIT = 10;

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol && parsed.hostname);
  } catch {
    return false;
  }
}

function mapProductToForm(product: ProductSummary): ProductFormState {
  const images = Array.isArray(product.images)
    ? product.images.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      )
    : [];

  return {
    sku: product.sku ?? "",
    name: product.name,
    description: product.description ?? "",
    price: String(product.price ?? ""),
    stock: String(product.stock ?? 0),
    categoryId: product.category?.id ?? "",
    thumbnail: product.thumbnail ?? product.imageUrl ?? "",
    images,
    videoUrl: product.videoUrl ?? null,
    usagePurpose: product.usagePurpose ?? "",
    usageInstructions: product.usageInstructions ?? "",
    ginsengAge: product.ginsengAge ?? "",
    brand: product.brand ?? "",
    origin: product.origin ?? "",
    isBestSeller: Boolean(product.isBestSeller),
  };
}

function buildPayload(form: ProductFormState): AdminProductPayload {
  const normalizedImages = form.images
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const thumbnailCandidate = form.thumbnail.trim() || normalizedImages[0] || "";
  const images =
    normalizedImages.length > 0
      ? normalizedImages
      : thumbnailCandidate
        ? [thumbnailCandidate]
        : [];

  return {
    sku: form.sku.trim() || undefined,
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    price: Number(form.price),
    stock: form.stock.trim() ? Number(form.stock) : undefined,
    categoryId: form.categoryId,
    imageUrl: thumbnailCandidate || undefined,
    images,
    videoUrl: form.videoUrl?.trim() ? form.videoUrl.trim() : null,
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
    return "Product name is required.";
  }

  if (!form.price.trim() || Number.isNaN(Number(form.price))) {
    return "Price is required and must be numeric.";
  }

  if (Number(form.price) < 0) {
    return "Price must be greater than or equal to 0.";
  }

  if (form.stock.trim() && Number.isNaN(Number(form.stock))) {
    return "Stock must be numeric.";
  }

  if (!form.categoryId) {
    return "Category is required.";
  }

  if (form.thumbnail.trim() && !isValidUrl(form.thumbnail.trim())) {
    return "Thumbnail URL is invalid.";
  }

  const hasInvalidImage = form.images.some((item) => !isValidUrl(item));
  if (hasInvalidImage) {
    return "One or more gallery image URLs are invalid.";
  }

  if (form.videoUrl?.trim() && !isValidUrl(form.videoUrl.trim())) {
    return "Video URL is invalid.";
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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingProduct, setEditingProduct] = useState<ProductSummary | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const [thumbnailUrlInput, setThumbnailUrlInput] = useState("");
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState("");
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [viewProduct, setViewProduct] = useState<ProductSummary | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    return Math.max(1, Math.ceil(total / PAGE_LIMIT));
  }, [total]);

  const isUploadingMedia = uploadingThumbnail || uploadingGallery || uploadingVideo;

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

  const resetMediaHelpers = () => {
    setThumbnailUrlInput("");
    setGalleryUrlInput("");
    setVideoUrlInput("");
    setMediaError(null);
  };

  const openCreateModal = () => {
    setFormMode("create");
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    resetMediaHelpers();
    setIsFormOpen(true);
  };

  const openEditModal = (product: ProductSummary) => {
    const next = mapProductToForm(product);
    setFormMode("edit");
    setEditingProduct(product);
    setForm(next);
    setFormError(null);
    resetMediaHelpers();
    setVideoUrlInput(next.videoUrl ?? "");
    setIsFormOpen(true);
  };

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

  const handleThumbnailUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setMediaError(null);
    setUploadingThumbnail(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, thumbnail: url }));
    } catch (uploadError) {
      setMediaError(
        uploadError instanceof Error
          ? uploadError.message
          : "Thumbnail upload failed.",
      );
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    event.target.value = "";
    if (!files || files.length === 0) return;

    setMediaError(null);
    setUploadingGallery(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }

      setForm((prev) => {
        const nextImages = Array.from(new Set([...prev.images, ...uploadedUrls]));
        const nextThumbnail = prev.thumbnail || nextImages[0] || "";

        return {
          ...prev,
          thumbnail: nextThumbnail,
          images: nextImages,
        };
      });
    } catch (uploadError) {
      setMediaError(
        uploadError instanceof Error ? uploadError.message : "Gallery upload failed.",
      );
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setMediaError(null);
    setUploadingVideo(true);
    try {
      const url = await uploadVideo(file);
      setForm((prev) => ({ ...prev, videoUrl: url }));
      setVideoUrlInput(url);
    } catch (uploadError) {
      setMediaError(
        uploadError instanceof Error ? uploadError.message : "Video upload failed.",
      );
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeGalleryImage = (url: string) => {
    setForm((prev) => {
      const nextImages = prev.images.filter((item) => item !== url);
      const nextThumbnail = prev.thumbnail === url ? nextImages[0] ?? "" : prev.thumbnail;
      return {
        ...prev,
        thumbnail: nextThumbnail,
        images: nextImages,
      };
    });
  };

  const applyThumbnailUrl = () => {
    const value = thumbnailUrlInput.trim();
    if (!value) return;

    if (!isValidUrl(value)) {
      setMediaError("Thumbnail URL is invalid.");
      return;
    }

    setMediaError(null);
    setForm((prev) => ({ ...prev, thumbnail: value }));
    setThumbnailUrlInput("");
  };

  const addGalleryUrl = () => {
    const value = galleryUrlInput.trim();
    if (!value) return;

    if (!isValidUrl(value)) {
      setMediaError("Gallery URL is invalid.");
      return;
    }

    setMediaError(null);
    setForm((prev) => {
      const nextImages = prev.images.includes(value) ? prev.images : [...prev.images, value];
      const nextThumbnail = prev.thumbnail || nextImages[0] || "";
      return {
        ...prev,
        thumbnail: nextThumbnail,
        images: nextImages,
      };
    });
    setGalleryUrlInput("");
  };

  const applyVideoUrl = () => {
    const value = videoUrlInput.trim();
    if (!value) {
      setForm((prev) => ({ ...prev, videoUrl: null }));
      return;
    }

    if (!isValidUrl(value)) {
      setMediaError("Video URL is invalid.");
      return;
    }

    setMediaError(null);
    setForm((prev) => ({ ...prev, videoUrl: value }));
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setError(null);
    setFlashMessage(null);

    if (isUploadingMedia) {
      setFormError("Please wait until media upload is completed.");
      return;
    }

    const validationError = validateForm(form);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = buildPayload(form);

    setSaving(true);
    try {
      if (formMode === "create") {
        await createAdminProduct(payload);
        setFlashMessage("Product created successfully.");
      } else if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        setFlashMessage("Product updated successfully.");
      }

      setIsFormOpen(false);
      await loadProducts(page, search, categoryId);
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : "Failed to save product.",
      );
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
        <Button onClick={openCreateModal} className="bg-slate-900 text-white hover:bg-slate-800">
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
              <DialogTitle>{formMode === "create" ? "Add Product" : "Edit Product"}</DialogTitle>
              <DialogDescription>
                Upload media from your computer, then complete product details and save.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {formError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              {mediaError ? (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  {mediaError}
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
                  <label className="text-sm font-semibold text-slate-700">Origin</label>
                  <Input
                    className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                    value={form.origin}
                    onChange={(e) => setForm((prev) => ({ ...prev, origin: e.target.value }))}
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
                  <label className="text-sm font-semibold text-slate-700">Ginseng Age</label>
                  <Input
                    className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                    value={form.ginsengAge}
                    onChange={(e) => setForm((prev) => ({ ...prev, ginsengAge: e.target.value }))}
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

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Usage Instructions</label>
                  <Input
                    className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                    value={form.usageInstructions}
                    onChange={(e) => setForm((prev) => ({ ...prev, usageInstructions: e.target.value }))}
                  />
                </div>

                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Thumbnail Image</h3>
                      <p className="text-xs text-slate-500">PNG/JPG/JPEG/WEBP, max 5MB</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                      {uploadingThumbnail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload Thumbnail
                      <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleThumbnailUpload} />
                    </label>
                  </div>

                  {form.thumbnail ? (
                    <div className="relative w-fit">
                      <img src={form.thumbnail} alt="Thumbnail preview" className="h-28 w-28 rounded-lg border border-slate-200 object-cover bg-white" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-xs"
                        className="absolute -right-2 -top-2"
                        onClick={() => setForm((prev) => ({ ...prev, thumbnail: "" }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No thumbnail uploaded.</p>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={thumbnailUrlInput}
                      onChange={(e) => setThumbnailUrlInput(e.target.value)}
                      placeholder="Optional: paste thumbnail URL"
                      className="h-10 border-slate-300 bg-white"
                    />
                    <Button type="button" variant="outline" className="h-10 border-slate-300 text-slate-800" onClick={applyThumbnailUrl}>
                      Add by URL
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Gallery Images</h3>
                      <p className="text-xs text-slate-500">Upload multiple images. Existing images are kept when editing.</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                      {uploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      Upload Gallery
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleGalleryUpload}
                      />
                    </label>
                  </div>

                  {form.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {form.images.map((url, index) => (
                        <div key={`${url}-${index}`} className="relative">
                          <img src={url} alt={`Gallery ${index + 1}`} className="h-24 w-full rounded-lg border border-slate-200 object-cover bg-white" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-xs"
                            className="absolute -right-2 -top-2"
                            onClick={() => removeGalleryImage(url)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No gallery images uploaded.</p>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={galleryUrlInput}
                      onChange={(e) => setGalleryUrlInput(e.target.value)}
                      placeholder="Optional: paste gallery image URL"
                      className="h-10 border-slate-300 bg-white"
                    />
                    <Button type="button" variant="outline" className="h-10 border-slate-300 text-slate-800" onClick={addGalleryUrl}>
                      Add by URL
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">Product Video</h3>
                      <p className="text-xs text-slate-500">MP4/WEBM/MOV/AVI, max 50MB</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                      {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                      Upload Video
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                    </label>
                  </div>

                  {form.videoUrl ? (
                    <div className="space-y-3">
                      <video className="max-h-56 w-full rounded-lg border border-slate-200 bg-black" controls src={form.videoUrl} />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="destructive"
                          className="h-10 min-w-24"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, videoUrl: null }));
                            setVideoUrlInput("");
                          }}
                        >
                          Remove Video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No video uploaded.</p>
                  )}

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      placeholder="Optional: paste video URL"
                      className="h-10 border-slate-300 bg-white"
                    />
                    <Button type="button" variant="outline" className="h-10 border-slate-300 text-slate-800" onClick={applyVideoUrl}>
                      Set URL
                    </Button>
                  </div>
                </div>

                <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
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
                disabled={saving || isUploadingMedia}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 min-w-32 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-500 disabled:text-white"
                disabled={saving || isUploadingMedia}
              >
                {saving
                  ? "Saving..."
                  : isUploadingMedia
                    ? "Uploading media..."
                    : formMode === "create"
                      ? "Save Product"
                      : "Update Product"}
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
                  <p><strong>Best Seller:</strong> {viewProduct.isBestSeller ? "Yes" : "No"}</p>
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
