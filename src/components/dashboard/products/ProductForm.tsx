"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImagePlus, Loader2, Trash2, Upload, Video, X } from "lucide-react";
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
import { useToast } from "@/components/shared/toast/ToastProvider";

type FormMode = "create" | "edit";

type ProductFormState = {
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

const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
]);
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function isAllowedUploadedAssetUrl(value: string) {
  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com"
    );
  } catch {
    return false;
  }
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function mapProductToForm(product: ProductSummary): ProductFormState {
  const images = Array.isArray(product.images)
    ? product.images.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];

  return {
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
    return "Tên sản phẩm là bắt buộc.";
  }

  if (!form.price.trim() || Number.isNaN(Number(form.price))) {
    return "Giá là bắt buộc và phải là số.";
  }

  if (Number(form.price) < 0) {
    return "Giá phải lớn hơn hoặc bằng 0.";
  }

  if (form.stock.trim() && Number.isNaN(Number(form.stock))) {
    return "Tồn kho phải là số.";
  }

  if (!form.categoryId) {
    return "Danh mục là bắt buộc.";
  }

  if (form.thumbnail.trim() && !isValidHttpUrl(form.thumbnail.trim())) {
    return "Thumbnail phải là URL hợp lệ.";
  }

  const hasInvalidImage = form.images.some((item) => !isValidHttpUrl(item));
  if (hasInvalidImage) {
    return "Ảnh chi tiết phải là URL hợp lệ.";
  }

  if (
    form.videoUrl?.trim() &&
    !isAllowedUploadedAssetUrl(form.videoUrl.trim())
  ) {
    return "Video phải là video đã tải từ máy lên.";
  }

  return null;
}

export function ProductForm({
  mode,
  initialData,
  categories,
}: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductFormState>(
    initialData ? mapProductToForm(initialData) : EMPTY_FORM,
  );
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const isUploadingMedia =
    uploadingThumbnail || uploadingGallery || uploadingVideo;

  const handleThumbnailUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingThumbnail(true);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, thumbnail: url }));
    } catch (uploadError) {
      showToast(
        uploadError instanceof Error
          ? uploadError.message
          : "Tải thumbnail thất bại.",
        "error",
      );
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleGalleryUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files
      ? Array.from(event.target.files)
      : [];
    event.target.value = "";
    if (selectedFiles.length === 0) return;

    setUploadingGallery(true);

    try {
      const uploadedUrls: string[] = [];
      const failedFiles: string[] = [];
      console.info("[product-form][gallery] selected_files", {
        count: selectedFiles.length,
        files: selectedFiles.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
        })),
      });

      for (const file of selectedFiles) {
        const lowerFileName = file.name.toLowerCase();
        const hasAllowedExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
          lowerFileName.endsWith(ext),
        );
        const hasAllowedMimeType =
          !file.type || ALLOWED_IMAGE_MIME_TYPES.has(file.type);

        if (!hasAllowedMimeType || !hasAllowedExtension) {
          console.warn("[product-form][gallery] rejected_by_type", {
            name: file.name,
            type: file.type,
            hasAllowedExtension,
            hasAllowedMimeType,
          });
          failedFiles.push(`${file.name} (định dạng không hỗ trợ)`);
          continue;
        }

        if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
          console.warn("[product-form][gallery] rejected_by_size", {
            name: file.name,
            size: file.size,
            maxSize: MAX_IMAGE_FILE_SIZE_BYTES,
          });
          failedFiles.push(`${file.name} (vượt quá 5MB)`);
          continue;
        }

        try {
          const url = await uploadImage(file);
          uploadedUrls.push(url);
          console.info("[product-form][gallery] uploaded", {
            name: file.name,
            url,
          });
        } catch (uploadError) {
          console.error("[product-form][gallery] upload_failed", {
            name: file.name,
            type: file.type,
            size: file.size,
            uploadError,
          });
          const detail =
            uploadError instanceof Error && uploadError.message.trim()
              ? uploadError.message.trim()
              : "tải lên thất bại";
          failedFiles.push(`${file.name} (${detail})`);
        }
      }

      if (uploadedUrls.length > 0) {
        setForm((prev) => {
          const nextImages = Array.from(
            new Set([...prev.images, ...uploadedUrls]),
          );
          const nextThumbnail = prev.thumbnail || nextImages[0] || "";

          return {
            ...prev,
            thumbnail: nextThumbnail,
            images: nextImages,
          };
        });
      }

      if (failedFiles.length > 0) {
        console.warn("[product-form][gallery] completed_with_failures", {
          uploadedCount: uploadedUrls.length,
          failedCount: failedFiles.length,
          failedFiles,
        });
        showToast(
          `Một số ảnh không tải được: ${failedFiles.slice(0, 3).join(", ")}${
            failedFiles.length > 3 ? "..." : ""
          }`,
          "error",
        );
      } else {
        console.info("[product-form][gallery] completed_success", {
          uploadedCount: uploadedUrls.length,
        });
        showToast("Tải ảnh chi tiết thành công.", "success");
      }
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingVideo(true);
    try {
      const url = await uploadVideo(file);
      setForm((prev) => ({ ...prev, videoUrl: url }));
    } catch (uploadError) {
      showToast(
        uploadError instanceof Error
          ? uploadError.message
          : "Tải video thất bại.",
        "error",
      );
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeGalleryImage = (url: string) => {
    setForm((prev) => {
      const nextImages = prev.images.filter((item) => item !== url);
      const nextThumbnail =
        prev.thumbnail === url ? (nextImages[0] ?? "") : prev.thumbnail;
      return {
        ...prev,
        thumbnail: nextThumbnail,
        images: nextImages,
      };
    });
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isUploadingMedia) {
      showToast("Vui lòng đợi tải media hoàn tất.", "error");
      return;
    }

    const validationError = validateForm(form);
    if (validationError) {
      showToast(validationError, "error");
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
      showToast(
        mode === "create"
          ? "Tạo sản phẩm thành công."
          : "Cập nhật sản phẩm thành công.",
        "success",
      );
      router.push("/dashboard/products");
      router.refresh();
    } catch (submitError) {
      showToast(
        submitError instanceof Error
          ? submitError.message
          : "Không thể lưu sản phẩm.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <form className="flex flex-col" onSubmit={handleSubmitForm}>
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Tên *
              </label>
              <Input
                className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Mô tả ngắn
              </label>
              <textarea
                className="min-h-20 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={form.shortDescription}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    shortDescription: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Mô tả
              </label>
              <RichTextEditor
                value={form.description}
                onChange={(nextValue) =>
                  setForm((prev) => ({ ...prev, description: nextValue }))
                }
                onUploadImage={uploadImage}
                placeholder="Nhập mô tả chi tiết sản phẩm..."
              />
            </div>

            <div className="grid grid-cols-1 gap-5 md:col-span-2 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Giá *
                </label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
                <p className="text-xs text-slate-500">
                  {new Intl.NumberFormat("vi-VN").format(
                    Number.isFinite(Number(form.price))
                      ? Number(form.price)
                      : 0,
                  )}
                  đ
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Tồn kho
                </label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, stock: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Danh mục *
                </label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, categoryId: e.target.value }))
                  }
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Xuất xứ
                </label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.origin}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, origin: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Thương hiệu
                </label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.brand}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, brand: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Tuổi sâm
                </label>
                <Input
                  className="h-10 border-slate-300 bg-white text-slate-900 focus-visible:border-slate-500 focus-visible:ring-slate-300"
                  value={form.ginsengAge}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, ginsengAge: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Công dụng
              </label>
              <textarea
                className="min-h-28 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={form.usagePurpose}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, usagePurpose: e.target.value }))
                }
                placeholder="Nhập công dụng sản phẩm..."
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Hướng dẫn sử dụng
              </label>
              <RichTextEditor
                value={form.usageInstructions}
                onChange={(nextValue) =>
                  setForm((prev) => ({
                    ...prev,
                    usageInstructions: nextValue,
                  }))
                }
                onUploadImage={uploadImage}
                placeholder="Nhập hướng dẫn sử dụng..."
              />
            </div>

            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Ảnh thumbnail
                  </h3>
                  <p className="text-xs text-slate-500">
                    PNG/JPG/JPEG/WEBP, max 5MB
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  {uploadingThumbnail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Tải thumbnail
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                  />
                </label>
              </div>

              {form.thumbnail ? (
                <div className="relative w-fit">
                  <img
                    src={form.thumbnail}
                    alt="Thumbnail preview"
                    className="h-28 w-28 rounded-lg border border-slate-200 object-cover bg-white"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    className="absolute -right-3 -top-3 h-9 w-9 rounded-full border border-white bg-red-600 text-white shadow-md hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
                    aria-label="Xóa thumbnail"
                    title="Xóa thumbnail"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, thumbnail: "" }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Chưa tải thumbnail.</p>
              )}
            </div>

            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Media sản phẩm
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tải lên ảnh chi tiết và video sản phẩm.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    {uploadingGallery ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImagePlus className="h-4 w-4" />
                    )}
                    Tải ảnh chi tiết
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleGalleryUpload}
                    />
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    {uploadingVideo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Video className="h-4 w-4" />
                    )}
                    Tải video
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                      className="hidden"
                      onChange={handleVideoUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  Ảnh: JPG/JPEG/PNG/WEBP. Video: MP4/WEBM/MOV/AVI.
                </p>
              </div>

              {form.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {form.images.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative">
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="h-24 w-full rounded-lg border border-slate-200 object-cover bg-white"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="absolute -right-3 -top-3 h-9 w-9 rounded-full border border-white bg-red-600 text-white shadow-md hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
                        aria-label="Xóa ảnh chi tiết"
                        title="Xóa ảnh chi tiết"
                        onClick={() => removeGalleryImage(url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Chưa có ảnh chi tiết.</p>
              )}

              {form.videoUrl ? (
                <div className="space-y-3">
                  <video
                    className="max-h-56 w-full rounded-lg border border-slate-200 bg-black"
                    controls
                    src={form.videoUrl}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      className="h-10 min-w-24"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, videoUrl: null }));
                      }}
                    >
                      Xóa video
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Chưa tải video.</p>
              )}
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
            Hủy
          </Button>
          <Button
            type="submit"
            className="h-10 min-w-32 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-500 disabled:text-white"
            disabled={saving || isUploadingMedia}
          >
            {saving
              ? "Đang lưu..."
              : isUploadingMedia
                ? "Đang tải media..."
                : mode === "create"
                  ? "Lưu sản phẩm"
                  : "Cập nhật sản phẩm"}
          </Button>
        </div>
      </form>
    </div>
  );
}
