"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/auth-api";
import {
  adminDeletePolicy,
  adminGetPolicies,
  adminGetPolicyById,
  type PolicyItem,
  type PolicyType,
} from "@/lib/policy-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Edit, Eye, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { normalizeBlogContentToHtml } from "@/lib/blog-helpers";

const POLICY_TYPES: PolicyType[] = ["privacy", "return", "shipping", "payment", "terms"];
const PAGE_LIMIT = 10;

function formatDate(date?: string) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("vi-VN");
}

export default function PoliciesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | PolicyType>("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [viewPolicy, setViewPolicy] = useState<PolicyItem | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState<PolicyItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    return Math.max(1, Math.ceil(total / PAGE_LIMIT));
  }, [total]);

  const loadPolicies = async (
    nextPage = page,
    nextSearch = search,
    nextType = typeFilter,
  ) => {
    setLoading(true);

    try {
      const response = await adminGetPolicies({
        page: nextPage,
        limit: PAGE_LIMIT,
        search: nextSearch || undefined,
        type: nextType || undefined,
      });

      setPolicies(response.data);
      setTotal(response.total);
      setPage(response.page);
    } catch (loadError) {
      setPolicies([]);
      setTotal(0);
      const message =
        loadError instanceof Error ? loadError.message : "Không thể tải danh sách chính sách.";
      showToast(message, "error");
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
      void loadPolicies(1, "", "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isAdmin]);

  const openViewModal = async (policy: PolicyItem) => {
    setViewLoading(true);
    setViewPolicy(policy);

    try {
      const latest = await adminGetPolicyById(policy.id);
      if (latest) {
        setViewPolicy(latest);
      }
    } catch {
      // Keep current row data when detail request fails.
    } finally {
      setViewLoading(false);
    }
  };

  const confirmDeletePolicy = async () => {
    if (!deletingPolicy) return;
    setDeleting(true);

    try {
      await adminDeletePolicy(deletingPolicy.id);
      showToast("Xóa chính sách thành công.", "success");
      setDeletingPolicy(null);
      await loadPolicies(page, search, typeFilter);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "Không thể xóa chính sách.";
      showToast(message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = searchInput.trim();
    setSearch(keyword);
    void loadPolicies(1, keyword, typeFilter);
  };

  const handleTypeFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value as "" | PolicyType;
    setTypeFilter(nextType);
    void loadPolicies(1, search, nextType);
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
            Chính sách
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý trang chính sách cho chân trang và nội dung pháp lý.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/policies/add")}
          className="bg-slate-900 text-white hover:bg-slate-800"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm chính sách
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="flex-1" onSubmit={handleSearchSubmit}>
          <Input
            placeholder="Tìm kiếm chính sách..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </form>

        <select
          className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
          value={typeFilter}
          onChange={handleTypeFilterChange}
        >
          <option value="">Tất cả loại</option>
          {POLICY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Đang tải chính sách...
        </div>
      ) : policies.length === 0 ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Không tìm thấy chính sách.
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Xuất bản</TableHead>
                <TableHead>Cập nhật lúc</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{policy.type}</Badge>
                  </TableCell>
                  <TableCell>{policy.slug}</TableCell>
                  <TableCell>
                    <Badge variant={policy.isPublished ? "success" : "secondary"}>
                      {policy.isPublished ? "Đã xuất bản" : "Nháp"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(policy.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="h-8 w-8 text-slate-700"
                        onClick={() => void openViewModal(policy)}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="h-8 w-8 text-slate-700"
                        onClick={() => router.push(`/dashboard/policies/${policy.id}/edit`)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        className="h-8 w-8"
                        onClick={() => setDeletingPolicy(policy)}
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Trang {page} / {totalPages} ({total} chính sách)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page <= 1 || loading}
            onClick={() => void loadPolicies(page - 1, search, typeFilter)}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page >= totalPages || loading}
            onClick={() => void loadPolicies(page + 1, search, typeFilter)}
          >
            Sau
          </Button>
        </div>
      </div>

      <Dialog open={Boolean(viewPolicy)} onOpenChange={() => setViewPolicy(null)}>
        <DialogContent className="w-[95vw] max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setViewPolicy(null)}
            className="absolute right-4 top-4 z-20 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
          <DialogHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <DialogTitle>Chi tiết chính sách</DialogTitle>
            <DialogDescription>Thông tin chính sách (chỉ xem).</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-4 py-5 text-sm sm:px-6">
            {viewLoading ? <p className="text-slate-500">Đang tải chi tiết chính sách...</p> : null}

            {viewPolicy ? (
              <>
                <p>
                  <strong>Tiêu đề:</strong> {viewPolicy.title}
                </p>
                <p>
                  <strong>Loại:</strong> {viewPolicy.type}
                </p>
                <p>
                  <strong>Slug:</strong> {viewPolicy.slug}
                </p>
                <p>
                  <strong>Xuất bản:</strong> {viewPolicy.isPublished ? "Có" : "Không"}
                </p>
                <p>
                  <strong>Cập nhật lúc:</strong> {formatDate(viewPolicy.updatedAt)}
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Nội dung:</strong>
                  </p>
                  <div
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-slate-700 [&_a]:text-primary [&_a]:underline [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:mb-3"
                    dangerouslySetInnerHTML={{ __html: normalizeBlogContentToHtml(viewPolicy.content) }}
                  />
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deletingPolicy)}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeletingPolicy(null);
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-2xl border border-slate-200 p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="flex items-center gap-3 text-xl text-slate-900">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={20} />
              </span>
              Xác nhận xóa chính sách
            </DialogTitle>
            <DialogDescription className="pt-2 text-[15px] leading-7 text-slate-600">
              Bạn có chắc muốn xóa:
              <span className="block mt-2 rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-900">
                {deletingPolicy?.title}
              </span>
              <span className="mt-2 block text-red-600">Hành động này không thể hoàn tác.</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50/60">
            <Button variant="outline" onClick={() => setDeletingPolicy(null)} disabled={deleting} className="min-w-24 border-slate-300">
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => void confirmDeletePolicy()} disabled={deleting} className="min-w-32">
              {deleting ? "Đang xóa..." : "Xóa chính sách"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

