"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { getAuthSession } from "@/lib/auth-api";
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUserRole,
  type AdminUser,
  type AdminUserRole,
} from "@/lib/user-api";

const PAGE_LIMIT = 10;

function formatDate(value?: string) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
}

function getDisplayName(user: AdminUser) {
  const label = user.name?.trim();
  return label && label.length > 0 ? label : "Unknown";
}

function getInitial(user: AdminUser) {
  const label = getDisplayName(user);
  return label.charAt(0).toUpperCase();
}

export function CustomerTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | AdminUserRole>("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [processingUserId, setProcessingUserId] = useState<string | null>(null);

  const currentUserId = getAuthSession()?.user?.id ?? null;

  const totalPages = useMemo(() => {
    if (total <= 0) return 1;
    return Math.max(1, Math.ceil(total / PAGE_LIMIT));
  }, [total]);

  const loadUsers = async (
    nextPage = page,
    nextSearch = search,
    nextRole = roleFilter,
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAdminUsers({
        page: nextPage,
        limit: PAGE_LIMIT,
        search: nextSearch || undefined,
        role: nextRole || undefined,
      });

      setUsers(response.data);
      setTotal(response.total);
      setPage(response.page);
    } catch (loadError) {
      setUsers([]);
      setTotal(0);
      setError(loadError instanceof Error ? loadError.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      void loadUsers(1, "", "");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyword = searchInput.trim();
    setSearch(keyword);
    setPage(1);
    void loadUsers(1, keyword, roleFilter);
  };

  const handleRoleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as "" | AdminUserRole;
    setRoleFilter(value);
    setPage(1);
    void loadUsers(1, search, value);
  };

  const handleUpdateRole = async (user: AdminUser, role: AdminUserRole) => {
    if (user.role === role) {
      return;
    }

    setProcessingUserId(user.id);
    setError(null);
    setFlashMessage(null);

    try {
      await updateAdminUserRole(user.id, role);
      setFlashMessage(`Updated role for ${getDisplayName(user)}.`);
      await loadUsers(page, search, roleFilter);
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : "Failed to update role.",
      );
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    const confirmed = window.confirm(`Delete user \"${getDisplayName(user)}\"?`);
    if (!confirmed) return;

    setProcessingUserId(user.id);
    setError(null);
    setFlashMessage(null);

    try {
      await deleteAdminUser(user.id);
      setFlashMessage("User deleted successfully.");

      const shouldGoPreviousPage = page > 1 && users.length === 1;
      const targetPage = shouldGoPreviousPage ? page - 1 : page;
      await loadUsers(targetPage, search, roleFilter);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Failed to delete user.",
      );
    } finally {
      setProcessingUserId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form className="flex-1" onSubmit={handleSearchSubmit}>
          <Input
            placeholder="Search by name, email, phone..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </form>

        <select
          className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
          value={roleFilter}
          onChange={handleRoleFilterChange}
        >
          <option value="">All roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </select>
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

      <div className="rounded-md border border-slate-200 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center text-slate-500">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-20 text-center text-slate-500">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const isSelf = currentUserId === user.id;
                const isProcessing = processingUserId === user.id;

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                          {getInitial(user)}
                        </div>
                        {getDisplayName(user)}
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "ADMIN" ? "warning" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <select
                          className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs"
                          value={user.role}
                          onChange={(event) =>
                            void handleUpdateRole(user, event.target.value as AdminUserRole)
                          }
                          disabled={isProcessing || isSelf}
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>

                        <Button
                          variant="destructive"
                          size="icon-sm"
                          className="h-8 w-8"
                          onClick={() => void handleDelete(user)}
                          disabled={isProcessing || isSelf}
                          title={isSelf ? "You cannot delete your own account" : "Delete user"}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages} ({total} users)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page <= 1 || loading}
            onClick={() => void loadUsers(page - 1, search, roleFilter)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page >= totalPages || loading}
            onClick={() => void loadUsers(page + 1, search, roleFilter)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
