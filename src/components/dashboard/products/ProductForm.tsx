"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, Loader2, Upload, Video, X } from "lucide-react";
import type { ProductSummary } from "@/lib/product-api";
import type { Category } from "@/lib/category-api";
import {
  createAdminProduct,
  updateAdminProduct,
  type AdminProductPayload,
} from "@/lib/admin-product-api";
import { uploadImage, uploadVideo } from "@/lib/admin-upload-api";
import { RichTextEditor } from "@/components/dashboard/blogs/RichTextEditor";
import { normalizeBlogContentToHtml } from "@/lib/blog-helpers";

type FormMode = "create" | "edit";

type ProductFormState = {
  sku: string;
  name: string;
  shortDescription: string;
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
};

interface ProductFormProps {
  mode: FormMode;
  initialData?: ProductSummary | null;
  categories: Category[];
}

const EMPTY_FORM: ProductFormState = {
  sku: "",
  name: "",
  shortDescription: "",
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
};

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
    shortDescription: product.shortDescription ?? "",
    description: normalizeBlogContentToHtml(product.description ?? ""),
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
    shortDescription: form.shortDescription.trim() || undefined,
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

export function ProductForm({ mode, initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductFormState>(
    initialData ? mapProductToForm(initialData) : EMPTY_FORM
  );
  const [formError, setFormError] = useState<string | null>(null);

  const [thumbnailUrlInput, setThumbnailUrlInput] = useState("");
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [videoUrlInput, setVideoUrlInput] = useState(form.videoUrl ?? "");
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const isUploadingMedia = uploadingThumbnail || uploadingGallery || uploadingVideo;

  const handleThumbnailUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setMediaError(null);
    setUploadingThumbnail(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, thumbnail: url }));
    } catch (uploadError) {
      setMediaError(uploadError instanceof Error ? uploadError.message : "Thumbnail upload failed.");
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
      setMediaError(uploadError instanceof Error ? uploadError.message : "Gallery upload failed.");
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
      setMediaError(uploadError instanceof Error ? uploadError.message : "Video upload failed.");
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
      if (mode === "create") {
        await createAdminProduct(payload);
      } else if (initialData) {
        await updateAdminProduct(initialData.id, payload);
      }
      router.push("/dashboard/products");
      router.refresh();
    } catch (submitError) {
      setFormError(submitError instanceof Error ? submitError.message : "Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <form className="flex flex-col" onSubmit={handleSubmitForm}>
        <div className="p-4 sm:p-6 space-y-6">
          {formError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          ) : null}

          {mediaError ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {mediaError}
            </div>
          ) : null}

          <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
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
              <label className="text-sm font-semibold text-slate-700">Short Description</label>
              <textarea
                className="min-h-20 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={form.shortDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Description</label>
              <RichTextEditor
                value={form.description}
                onChange={(nextValue) => setForm((prev) => ({ ...prev, description: nextValue }))}
                onUploadImage={uploadImage}
                placeholder="Enter detailed product description..."
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
                  <p className="text-xs text-slate-500">Upload multiple images.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  {uploadingGallery ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  Upload Gallery
                  <input type="file" multiple accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleGalleryUpload} />
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
                  <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" className="hidden" onChange={handleVideoUpload} />
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

          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-24 border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
            onClick={() => router.back()}
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
                : mode === "create"
                  ? "Save Product"
                  : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}
