"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getAuthSession } from "@/lib/auth-api";
import { uploadImage } from "@/lib/admin-upload-api";
import {
  getPaymentQrConfigs,
  createPaymentQrConfig,
  updatePaymentQrConfig,
  setDefaultPaymentQrConfig,
  deletePaymentQrConfig,
  type PaymentQrConfig,
} from "@/lib/payment-qr-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Edit, Eye, Plus, Trash2, CheckCircle, Upload, QrCode, Star } from "lucide-react";

const POPULAR_BANKS = [
  { name: "Vietcombank (VCB)", code: "VCB", bin: "970436" },
  { name: "Techcombank (TCB)", code: "TCB", bin: "970407" },
  { name: "MBBank (MB)", code: "MB", bin: "970422" },
  { name: "VietinBank (CTG)", code: "CTG", bin: "970415" },
  { name: "BIDV (BIDV)", code: "BIDV", bin: "970418" },
  { name: "VPBank (VPB)", code: "VPB", bin: "970432" },
  { name: "ACB (ACB)", code: "ACB", bin: "970416" },
  { name: "TPBank (TPB)", code: "TPB", bin: "970423" },
  { name: "Sacombank (STB)", code: "STB", bin: "970403" },
  { name: "VIB (VIB)", code: "VIB", bin: "970441" },
  { name: "HDBank (HDB)", code: "HDB", bin: "970437" },
  { name: "SHB (SHB)", code: "SHB", bin: "970443" },
  { name: "SeABank (SSB)", code: "SSB", bin: "970440" },
  { name: "MSB (MSB)", code: "MSB", bin: "970426" },
  { name: "LienVietPostBank (LPB)", code: "LPB", bin: "970449" },
  { name: "Agribank (VBA)", code: "VBA", bin: "970405" },
];

type FormMode = "create" | "edit";

type QrFormState = {
  bankName: string;
  bankCode: string;
  bin: string;
  accountNumber: string;
  accountName: string;
  customQrImage?: string | null;
  isDefault: boolean;
  isActive: boolean;
};

const EMPTY_FORM: QrFormState = {
  bankName: "Vietcombank (VCB)",
  bankCode: "VCB",
  bin: "970436",
  accountNumber: "",
  accountName: "",
  customQrImage: null,
  isDefault: true,
  isActive: true,
};

export default function QrManagementPage() {
  const [configs, setConfigs] = useState<PaymentQrConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QrFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const [previewConfig, setPreviewConfig] = useState<PaymentQrConfig | null>(null);

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPaymentQrConfigs();
      setConfigs(data);
    } catch (err) {
      setConfigs([]);
      setError(err instanceof Error ? err.message : "Failed to load QR configs.");
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
    if (!authChecked || !isAdmin) return;
    Promise.resolve().then(() => {
      void loadConfigs();
    });
  }, [authChecked, isAdmin]);

  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const bank = POPULAR_BANKS.find((b) => b.code === selectedCode);
    if (bank) {
      setForm((prev) => ({
        ...prev,
        bankName: bank.name,
        bankCode: bank.code,
        bin: bank.bin,
      }));
    }
  };

  const openCreateModal = () => {
    setFormMode("create");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (item: PaymentQrConfig) => {
    setFormMode("edit");
    setEditingId(item.id);
    setForm({
      bankName: item.bankName,
      bankCode: item.bankCode,
      bin: item.bin,
      accountNumber: item.accountNumber,
      accountName: item.accountName,
      customQrImage: item.customQrImage,
      isDefault: item.isDefault,
      isActive: item.isActive,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormError(null);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, customQrImage: url }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: PaymentQrConfig) => {
    if (item.isDefault) {
      alert("Không thể xóa tài khoản đang đặt làm mặc định!");
      return;
    }
    const confirmed = window.confirm(`Bạn có chắc muốn xóa tài khoản ${item.bankName} - ${item.accountNumber}?`);
    if (!confirmed) return;

    setError(null);
    setFlashMessage(null);
    try {
      await deletePaymentQrConfig(item.id);
      setFlashMessage("Đã xóa cấu hình tài khoản QR.");
      await loadConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xóa thất bại.");
    }
  };

  const handleSetDefault = async (item: PaymentQrConfig) => {
    setError(null);
    setFlashMessage(null);
    try {
      await setDefaultPaymentQrConfig(item.id);
      setFlashMessage(`Đã thiết lập ${item.bankName} làm tài khoản thanh toán mặc định.`);
      await loadConfigs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Thiết lập mặc định thất bại.");
    }
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setError(null);
    setFlashMessage(null);

    const accountNumber = form.accountNumber.trim();
    const accountName = form.accountName.trim();

    if (!accountNumber) {
      setFormError("Vui lòng nhập số tài khoản.");
      return;
    }
    if (!accountName) {
      setFormError("Vui lòng nhập tên chủ tài khoản.");
      return;
    }

    setSaving(true);
    try {
      if (formMode === "create") {
        await createPaymentQrConfig({
          bankName: form.bankName,
          bankCode: form.bankCode,
          bin: form.bin,
          accountNumber,
          accountName: accountName.toUpperCase(),
          customQrImage: form.customQrImage,
          isDefault: form.isDefault,
          isActive: form.isActive,
        });
        setFlashMessage("Thêm cấu hình QR thành công.");
      } else if (editingId) {
        await updatePaymentQrConfig(editingId, {
          bankName: form.bankName,
          bankCode: form.bankCode,
          bin: form.bin,
          accountNumber,
          accountName: accountName.toUpperCase(),
          customQrImage: form.customQrImage,
          isDefault: form.isDefault,
          isActive: form.isActive,
        });
        setFlashMessage("Cập nhật cấu hình QR thành công.");
      }

      setIsFormOpen(false);
      await loadConfigs();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Lưu cấu hình thất bại.");
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <QrCode className="text-indigo-600 h-7 w-7" />
            Quản lý mã QR Thanh toán
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Thiết lập tài khoản ngân hàng và mã VietQR tự động phục vụ thanh toán khi khách hàng đặt hàng.
          </p>
        </div>
        {configs.length > 0 && !loading && (
          <Button onClick={openCreateModal} className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md">
            <Plus className="mr-2 h-4 w-4" />
            Thêm tài khoản QR
          </Button>
        )}
      </div>

      {flashMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2 font-medium">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          {flashMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-md border border-slate-200 p-8 text-center text-sm text-slate-500">
          Đang tải dữ liệu cấu hình QR...
        </div>
      ) : configs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <QrCode size={24} />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Chưa có tài khoản thanh toán nào</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            Hãy thêm tài khoản ngân hàng của bạn để tự động tạo mã VietQR cho khách hàng quét khi thanh toán.
          </p>
          <Button onClick={openCreateModal} className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Thêm tài khoản đầu tiên
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow>
                <TableHead className="font-semibold">Ngân hàng</TableHead>
                <TableHead className="font-semibold">Số tài khoản</TableHead>
                <TableHead className="font-semibold">Chủ tài khoản</TableHead>
                <TableHead className="font-semibold text-center">Trạng thái</TableHead>
                <TableHead className="font-semibold text-center">Mã QR</TableHead>
                <TableHead className="font-semibold text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((item) => (
                <TableRow key={item.id} className={item.isDefault ? "bg-indigo-50/30 dark:bg-indigo-950/20" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 shrink-0 font-bold text-xs">
                        {item.bankCode}
                      </div>
                      <span className="text-slate-900 dark:text-slate-100 font-semibold">{item.bankName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                    {item.accountNumber}
                  </TableCell>
                  <TableCell className="font-semibold tracking-wide text-slate-700 dark:text-slate-300">
                    {item.accountName}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      {item.isDefault && (
                        <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold px-2.5 py-1 flex items-center gap-1 shadow-xs">
                          <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                          Mặc định
                        </Badge>
                      )}
                      {!item.isDefault && item.isActive && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          Hoạt động
                        </Badge>
                      )}
                      {!item.isActive && (
                        <Badge variant="danger">Đã khóa</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 font-medium border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950"
                      onClick={() => setPreviewConfig(item)}
                    >
                      <Eye size={15} />
                      Xem QR
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end items-center gap-2">
                      {!item.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={() => void handleSetDefault(item)}
                          title="Đặt làm tài khoản thanh toán chính trên trang thanh toán"
                        >
                          Đặt mặc định
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="h-8 w-8 text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => openEditModal(item)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        className="h-8 w-8"
                        disabled={item.isDefault}
                        onClick={() => void handleDelete(item)}
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

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] max-w-2xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 shadow-2xl">
          <form className="flex max-h-[90vh] w-full flex-col" onSubmit={handleSubmitForm}>
            <DialogHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-5">
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="text-indigo-600 h-6 w-6" />
                {formMode === "create" ? "Thêm tài khoản thanh toán QR" : "Cập nhật tài khoản thanh toán QR"}
              </DialogTitle>
              <DialogDescription className="text-sm mt-1 text-slate-500">
                Thông tin tài khoản sẽ được dùng để tự động tạo mã VietQR trên trang thanh toán.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {formError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-medium">
                  {formError}
                </div>
              ) : null}

              {/* Select Bank */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ngân hàng thụ hưởng *</label>
                <select
                  className="w-full h-11 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs"
                  value={form.bankCode}
                  onChange={handleBankSelect}
                >
                  {POPULAR_BANKS.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name} (BIN: {b.bin})
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Số tài khoản *</label>
                <Input
                  placeholder="Nhập số tài khoản chính xác..."
                  className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-base font-semibold focus-visible:ring-indigo-500 shadow-xs"
                  value={form.accountNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountNumber: e.target.value.replace(/\s+/g, "") }))}
                />
              </div>

              {/* Account Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tên chủ tài khoản (Viết hoa không dấu) *</label>
                <Input
                  placeholder="Ví dụ: CONG TY CP DI SAN NHAN SAM"
                  className="h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-semibold text-base focus-visible:ring-indigo-500 shadow-xs"
                  value={form.accountName}
                  onChange={(e) => setForm((prev) => ({ ...prev, accountName: e.target.value }))}
                />
              </div>

              {/* Custom QR Upload (Optional) */}
              <div className="space-y-3 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Ảnh mã QR tĩnh thay thế (Tùy chọn)
                  </label>
                  {form.customQrImage && (
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, customQrImage: null }))}
                      className="text-xs text-red-600 hover:underline font-medium"
                    >
                      Xóa ảnh tải lên
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Mặc định hệ thống sẽ tự động tạo mã VietQR kèm số tiền và mã đơn hàng của khách. Nếu tải lên ảnh tĩnh ở đây, hệ thống sẽ ưu tiên hiển thị ảnh này.
                </p>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer transition-colors font-medium text-sm">
                    <Upload size={16} />
                    {uploading ? "Đang tải lên..." : "Tải lên ảnh QR tĩnh"}
                    <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
                  </label>
                  {form.customQrImage && (
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xs">
                      <Image src={form.customQrImage} alt="Custom QR" fill className="object-contain p-1" />
                    </div>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Đặt làm tài khoản thanh toán chính trên trang đặt hàng
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Trạng thái hoạt động (Bật để có thể sử dụng)
                  </span>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl px-5 font-semibold border-slate-300 text-slate-700 hover:bg-slate-100"
                onClick={() => setIsFormOpen(false)}
                disabled={saving || uploading}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                className="h-11 rounded-xl px-7 bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md"
                disabled={saving || uploading}
              >
                {saving ? "Đang lưu..." : formMode === "create" ? "Lưu tài khoản" : "Cập nhật"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Preview Dialog */}
      <Dialog open={Boolean(previewConfig)} onOpenChange={() => setPreviewConfig(null)}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 shadow-2xl">
          {previewConfig && (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 mb-4">
                <QrCode size={26} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Xem trước mã QR Thanh toán</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Khách hàng sẽ quét mã này trên ứng dụng ngân hàng hoặc ví điện tử.
              </p>

              {/* Dynamic QR Preview Box */}
              <div className="relative w-64 h-64 bg-white p-4 rounded-3xl border-4 border-indigo-600/10 shadow-xl mb-6 flex items-center justify-center overflow-hidden group">
                <Image
                  src={
                    previewConfig.customQrImage ||
                    `https://img.vietqr.io/image/${previewConfig.bankCode}-${previewConfig.accountNumber}-compact2.png?accountName=${encodeURIComponent(previewConfig.accountName)}`
                  }
                  alt="QR Preview"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              </div>

              {/* Account Details Box */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-2 mb-6">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Ngân hàng:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{previewConfig.bankName}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Số tài khoản:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">{previewConfig.accountNumber}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Chủ tài khoản:</span>
                  <span className="font-bold text-indigo-600">{previewConfig.accountName}</span>
                </div>
              </div>

              <div className="mt-8 w-full">
                <Button
                  onClick={() => setPreviewConfig(null)}
                  className="w-full h-12 rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-semibold"
                >
                  Đóng cửa sổ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
