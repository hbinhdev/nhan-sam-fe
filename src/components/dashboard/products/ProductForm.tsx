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

  const handleMediaUpload = async (
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

      for (const file of selectedFiles) {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
          failedFiles.push(`${file.name} (định dạng không hỗ trợ)`);
          continue;
        }

        try {
          let url = "";
          if (isImage) {
            url = await uploadImage(file);
          } else {
            url = await uploadVideo(file);
          }
          uploadedUrls.push(url);
        } catch (uploadError) {
          failedFiles.push(`${file.name} (tải lên thất bại)`);
        }
      }

      if (uploadedUrls.length > 0) {
        setForm((prev) => {
          const nextImages = Array.from(
            new Set([...prev.images, ...uploadedUrls]),
          );
          // Set first image (not a video) as thumbnail if thumbnail is empty
          const nextThumbnail = prev.thumbnail || nextImages.find(u => !/\.(mp4|webm|ogg|mov|avi|quicktime)(\?.*)?$/i.test(u)) || nextImages[0] || "";

          return {
            ...prev,
            thumbnail: nextThumbnail,
            images: nextImages,
          };
        });
      }

      if (failedFiles.length > 0) {
        showToast(
          `Một số tệp tải lên thất bại: ${failedFiles.slice(0, 3).join(", ")}`,
          "error",
        );
      } else {
        showToast("Tải media thành công.", "success");
      }
    } finally {
      setUploadingGallery(false);
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
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-6 md:col-span-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Ảnh thumbnail</h3>
                <p className="text-xs text-slate-500">Ảnh đại diện chính hiển thị cho sản phẩm.</p>
              </div>

              {form.thumbnail ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative group overflow-hidden rounded-xl border border-slate-200 w-28 h-28 flex-shrink-0 bg-slate-50">
                    <img
                      src={form.thumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <button
                        type="button"
                        className="h-8 w-8 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 flex items-center justify-center transition-colors duration-200"
                        title="Xóa thumbnail"
                        onClick={() => setForm((prev) => ({ ...prev, thumbnail: "" }))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-800">Đã tải ảnh thumbnail thành công</h4>
                    <p className="text-xs text-slate-500">Ảnh của bạn đang được hiển thị sắc nét. Bạn có thể xóa để chọn ảnh mới.</p>
                    <label className="mt-2.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                      Thay đổi ảnh
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleThumbnailUpload}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 bg-white hover:bg-slate-50/50 hover:border-slate-400 transition-all duration-200 cursor-pointer group text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:scale-105 transition-transform duration-200">
                      {uploadingThumbnail ? (
                        <Loader2 className="h-5 w-5 text-slate-600 animate-spin" />
                      ) : (
                        <Upload className="h-5 w-5 text-slate-500" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-700">Tải ảnh thumbnail</p>
                      <p className="text-xs text-slate-500">Định dạng hỗ trợ: PNG, JPG, JPEG hoặc WEBP (Tối đa 5MB)</p>
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleThumbnailUpload}
                    disabled={uploadingThumbnail}
                  />
                </label>
              )}
            </div>

            {/* Premium Product Media (Images and Video) Section */}
            <div className="space-y-6 rounded-xl border border-slate-200 bg-slate-50/50 p-6 md:col-span-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Media sản phẩm</h3>
                <p className="text-xs text-slate-500">Tải lên các hình ảnh chi tiết và video của sản phẩm.</p>
              </div>

              <div className="space-y-4">
                {form.images.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Danh sách media ({form.images.length})
                      </h4>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                        Tải thêm ảnh/video
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleMediaUpload}
                        />
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 animate-fade-in">
                      {form.images.map((url, index) => {
                        const lowercaseUrl = url.toLowerCase();
                        const isVideo =
                          lowercaseUrl.includes("/video/") ||
                          lowercaseUrl.includes(".mp4") ||
                          lowercaseUrl.includes(".webm") ||
                          lowercaseUrl.includes(".mov") ||
                          lowercaseUrl.includes(".avi") ||
                          lowercaseUrl.includes(".quicktime") ||
                          lowercaseUrl.includes(".m4v") ||
                          lowercaseUrl.includes(".mkv") ||
                          lowercaseUrl.includes(".3gp") ||
                          lowercaseUrl.includes(".flv") ||
                          lowercaseUrl.includes(".wmv") ||
                          lowercaseUrl.includes(".ogg") ||
                          lowercaseUrl.includes(".mpeg") ||
                          lowercaseUrl.includes(".mpg") ||
                          lowercaseUrl.includes(".ogv");
                        return (
                          <div key={`${url}-${index}`} className="relative group overflow-hidden rounded-xl border border-slate-200 aspect-square shadow-sm bg-slate-900 flex items-center justify-center">
                            {isVideo ? (
                              <video
                                src={url}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                                autoPlay
                                loop
                                controls
                              />
                            ) : (
                              <img
                                src={url}
                                alt={`Media ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <button
                                type="button"
                                className="h-8 w-8 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 flex items-center justify-center transition-colors duration-200"
                                onClick={() => removeGalleryImage(url)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            {isVideo && (
                              <div className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full shadow">
                                <Video className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                              #{index + 1}
                            </span>
                          </div>
                        );
                      })}
                      
                      {/* Plus button inside the grid */}
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl aspect-square bg-white hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 cursor-pointer text-center group shadow-sm">
                        <ImagePlus className="h-6 w-6 text-slate-400 group-hover:text-slate-600 group-hover:scale-105 transition-all duration-200" />
                        <span className="text-[11px] font-semibold text-slate-500 mt-2">Thêm media</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleMediaUpload}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-10 bg-white hover:bg-slate-50/50 hover:border-slate-400 transition-all duration-200 cursor-pointer group text-center animate-fade-in">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                        {uploadingGallery ? (
                          <Loader2 className="h-6 w-6 text-slate-600 animate-spin" />
                        ) : (
                          <Upload className="h-6 w-6 text-slate-500" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-semibold text-slate-700">Tải ảnh/video sản phẩm</p>
                        <p className="text-xs text-slate-500 max-w-sm">Định dạng hỗ trợ: JPG, JPEG, PNG, WEBP, MP4, WEBM, MOV, AVI (Tải lên nhiều tệp cùng lúc)</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleMediaUpload}
                      disabled={uploadingGallery}
                    />
                  </label>
                )}
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
