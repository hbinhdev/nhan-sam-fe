"use client";

import { useEffect, useMemo, useState } from "react";
import { getAuthSession } from "@/lib/auth-api";
import {
  adminGetConsultations,
  adminUpdateConsultationNote,
  adminUpdateConsultationStatus,
  type ConsultationItem,
  type ConsultationStatus,
} from "@/lib/consultation-api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { exportConsultationsReport } from "@/lib/report-api";
import { useToast } from "@/components/shared/toast/ToastProvider";

const PAGE_LIMIT = 10;

const STATUSES: Array<"" | ConsultationStatus> = [
  "",
  "PENDING",
  "CONTACTED",
  "CANCELLED",
];

function formatDate(date?: string) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("vi-VN");
}

function statusLabel(status: ConsultationStatus) {
  if (status === "PENDING") return "Đang chờ";
  if (status === "CONTACTED") return "Đã tư vấn";
  return "Đã hủy";
}

function statusBadgeVariant(
  status: ConsultationStatus,
): "secondary" | "success" | "destructive" {
  if (status === "CONTACTED") return "success";
  if (status === "CANCELLED") return "destructive";
  return "secondary";
}

export default function ConsultationsPage() {
  const [items, setItems] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | ConsultationStatus>("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [savingStatusId, setSavingStatusId] = useState<string | null>(null);
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    return Math.max(1, Math.ceil(total / PAGE_LIMIT));
  }, [total]);

  const loadData = async (
    nextPage = page,
    nextSearch = search,
    nextStatus = statusFilter,
  ) => {
    setLoading(true);

    try {
      const response = await adminGetConsultations({
        page: nextPage,
        limit: PAGE_LIMIT,
        search: nextSearch || undefined,
        status: nextStatus || undefined,
      });

      setItems(response.data);
      setTotal(response.total);
      setPage(response.page);

      setNoteDrafts((prev) => {
        const next = { ...prev };
        response.data.forEach((item) => {
          if (next[item.id] === undefined) {
            next[item.id] = item.note ?? "";
          }
        });
        return next;
      });
    } catch (loadError) {
      setItems([]);
      setTotal(0);
      showToast(
        loadError instanceof Error
          ? loadError.message
          : "Không tải được yêu cầu tư vấn.",
        "error",
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
    if (!authChecked || !isAdmin) return;
    void loadData(1, "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, isAdmin]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = searchInput.trim();
    setSearch(keyword);
    void loadData(1, keyword, statusFilter);
  };

  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextStatus = event.target.value as "" | ConsultationStatus;
    setStatusFilter(nextStatus);
    void loadData(1, search, nextStatus);
  };

  const handleStatusUpdate = async (
    id: string,
    nextStatus: ConsultationStatus,
  ) => {
    setSavingStatusId(id);

    try {
      await adminUpdateConsultationStatus(id, nextStatus);
      showToast("Cập nhật trạng thái thành công.", "success");
      await loadData(page, search, statusFilter);
    } catch (updateError) {
      showToast(
        updateError instanceof Error
          ? updateError.message
          : "Không thể cập nhật trạng thái.",
        "error",
      );
    } finally {
      setSavingStatusId(null);
    }
  };

  const handleNoteSave = async (id: string) => {
    setSavingNoteId(id);

    try {
      await adminUpdateConsultationNote(id, noteDrafts[id] ?? "");
      showToast("Cập nhật ghi chú nội bộ thành công.", "success");
      await loadData(page, search, statusFilter);
    } catch (updateError) {
      showToast(
        updateError instanceof Error
          ? updateError.message
          : "Không thể cập nhật ghi chú.",
        "error",
      );
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportConsultationsReport({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      showToast("Export consultations thành công.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Export consultations failed.",
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
        Cần quyền quản trị.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Tư vấn
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý yêu cầu tư vấn và trạng thái chăm sóc khách hàng.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => void handleExport()}
          disabled={exporting}
        >
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Đang xuất..." : "Xuất Excel"}
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="flex-1" onSubmit={handleSearchSubmit}>
          <Input
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </form>

        <select
          className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
          value={statusFilter}
          onChange={handleStatusFilterChange}
        >
          {STATUSES.map((status) => (
            <option key={status || "ALL"} value={status}>
              {status
                ? statusLabel(status as ConsultationStatus)
                : "Tất cả trạng thái"}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Đang tải yêu cầu tư vấn...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Không tìm thấy yêu cầu tư vấn.
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Quan tâm</TableHead>
                <TableHead>Ghi chú khách hàng</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú nội bộ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.fullName}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>{item.interest}</TableCell>
                  <TableCell className="max-w-56 whitespace-pre-wrap text-slate-600">
                    {item.message || "-"}
                  </TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <select
                      className={cn(
                        "h-8 rounded-md border px-2 text-xs font-medium outline-none transition-colors",
                        item.status === "PENDING" &&
                          "bg-slate-100 text-slate-800 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
                        item.status === "CONTACTED" &&
                          "bg-emerald-100 text-emerald-800 border-emerald-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200",
                        item.status === "CANCELLED" &&
                          "bg-red-100 text-red-800 border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-200",
                      )}
                      value={item.status}
                      disabled={savingStatusId === item.id}
                      onChange={(event) =>
                        void handleStatusUpdate(
                          item.id,
                          event.target.value as ConsultationStatus,
                        )
                      }
                    >
                      <option
                        value="PENDING"
                        className="bg-white text-slate-900"
                      >
                        Đang chờ
                      </option>
                      <option
                        value="CONTACTED"
                        className="bg-white text-slate-900"
                      >
                        Đã tư vấn
                      </option>
                      <option
                        value="CANCELLED"
                        className="bg-white text-slate-900"
                      >
                        Đã hủy
                      </option>
                    </select>
                  </TableCell>
                  <TableCell className="min-w-64">
                    <div className="flex flex-col gap-2">
                      <textarea
                        className="min-h-20 w-full rounded-md border border-slate-300 bg-white p-2 text-xs outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                        value={noteDrafts[item.id] ?? ""}
                        onChange={(event) =>
                          setNoteDrafts((prev) => ({
                            ...prev,
                            [item.id]: event.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        className="h-8 w-fit bg-slate-900 text-white hover:bg-slate-800"
                        disabled={savingNoteId === item.id}
                        onClick={() => void handleNoteSave(item.id)}
                      >
                        {savingNoteId === item.id
                          ? "Đang lưu..."
                          : "Lưu ghi chú"}
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
          Page {page} of {totalPages} ({total} consultations)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page <= 1 || loading}
            onClick={() => void loadData(page - 1, search, statusFilter)}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page >= totalPages || loading}
            onClick={() => void loadData(page + 1, search, statusFilter)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
