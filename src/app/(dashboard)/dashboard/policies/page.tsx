"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getAuthSession } from "@/lib/auth-api";
import {
  adminCreatePolicy,
  adminDeletePolicy,
  adminGetPolicyById,
  adminGetPolicies,
  adminUpdatePolicy,
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
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/shared/toast/ToastProvider";

type FormMode = "create" | "edit";

type PolicyFormState = {
  type: PolicyType;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
};

const EMPTY_FORM: PolicyFormState = {
  type: "privacy",
  title: "",
  slug: "",
  content: "",
  isPublished: true,
};

const POLICY_TYPES: PolicyType[] = ["privacy", "return", "shipping", "payment", "terms"];
const PAGE_LIMIT = 10;

function formatDate(date?: string) {
  if (!date) return "-";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
}

export default function PoliciesPage() {
  const { showToast } = useToast();

  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | PolicyType>("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null);
  const [form, setForm] = useState<PolicyFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [viewPolicy, setViewPolicy] = useState<PolicyItem | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

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
    setError(null);

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
      const message = loadError instanceof Error ? loadError.message : "Failed to load policies.";
      setError(message);
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

  const openCreateModal = () => {
    setFormMode("create");
    setEditingPolicy(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditModal = (policy: PolicyItem) => {
    setFormMode("edit");
    setEditingPolicy(policy);
    setForm({
      type: policy.type,
      title: policy.title,
      slug: policy.slug,
      content: policy.content,
      isPublished: policy.isPublished,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const openViewModal = async (policy: PolicyItem) => {
    setViewLoading(true);
    setViewPolicy(policy);

    try {
      const latest = await adminGetPolicyById(policy.id);
      if (latest) {
        setViewPolicy(latest);
      }
    } catch {
      // Keep current table data when detail request fails.
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (policy: PolicyItem) => {
    const confirmed = window.confirm(`Delete policy \"${policy.title}\"?`);
    if (!confirmed) return;

    setError(null);

    try {
      await adminDeletePolicy(policy.id);
      showToast("Policy deleted successfully.", "success");
      await loadPolicies(page, search, typeFilter);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete policy.";
      setError(message);
      showToast(message, "error");
    }
  };

  const handleSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setError(null);

    const title = form.title.trim();
    const slug = form.slug.trim();
    const content = form.content.trim();

    if (!title || !slug || !content) {
      setFormError("Title, slug and content are required.");
      return;
    }

    setSaving(true);
    try {
      if (formMode === "create") {
        await adminCreatePolicy({
          type: form.type,
          title,
          slug,
          content,
          isPublished: form.isPublished,
        });
        showToast("Policy created successfully.", "success");
      } else if (editingPolicy) {
        await adminUpdatePolicy(editingPolicy.id, {
          type: form.type,
          title,
          slug,
          content,
          isPublished: form.isPublished,
        });
        showToast("Policy updated successfully.", "success");
      }

      setIsFormOpen(false);
      await loadPolicies(page, search, typeFilter);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Failed to save policy.";
      setFormError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Policies
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage CMS policy pages for website footer and legal pages.
          </p>
        </div>
        <Button onClick={openCreateModal} className="bg-slate-900 text-white hover:bg-slate-800">
          <Plus className="mr-2 h-4 w-4" />
          Add Policy
        </Button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="flex-1" onSubmit={handleSearchSubmit}>
          <Input
            placeholder="Search policies..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </form>

        <select
          className="h-8 rounded-lg border border-input bg-background px-3 text-sm"
          value={typeFilter}
          onChange={handleTypeFilterChange}
        >
          <option value="">All types</option>
          {POLICY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Loading policies...
        </div>
      ) : policies.length === 0 ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          No policies found.
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      {policy.isPublished ? "Published" : "Draft"}
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
                        onClick={() => openEditModal(policy)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        className="h-8 w-8"
                        onClick={() => void handleDelete(policy)}
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
          Page {page} of {totalPages} ({total} policies)
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page <= 1 || loading}
            onClick={() => void loadPolicies(page - 1, search, typeFilter)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="text-slate-800"
            disabled={page >= totalPages || loading}
            onClick={() => void loadPolicies(page + 1, search, typeFilter)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
          <form className="flex max-h-[90vh] w-full flex-col" onSubmit={handleSubmitForm}>
            <DialogHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
              <DialogTitle>{formMode === "create" ? "Add Policy" : "Edit Policy"}</DialogTitle>
              <DialogDescription>
                Manage title, slug, content and publish status for policy page.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-4">
              {formError ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Type *</label>
                  <select
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
                    value={form.type}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, type: event.target.value as PolicyType }))
                    }
                  >
                    {POLICY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Slug *</label>
                  <Input
                    value={form.slug}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, slug: event.target.value }))
                    }
                    className="h-10 border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Title *</label>
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="h-10 border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Content *</label>
                <textarea
                  value={form.content}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, content: event.target.value }))
                  }
                  className="min-h-[280px] w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, isPublished: event.target.checked }))
                  }
                />
                Published
              </label>
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
                {saving ? "Saving..." : formMode === "create" ? "Save Policy" : "Update Policy"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(viewPolicy)} onOpenChange={() => setViewPolicy(null)}>
        <DialogContent className="w-[95vw] max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
          <DialogHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <DialogTitle>Policy Detail</DialogTitle>
            <DialogDescription>Read-only policy information.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-4 py-5 text-sm sm:px-6">
            {viewLoading ? <p className="text-slate-500">Loading policy detail...</p> : null}

            {viewPolicy ? (
              <>
                <p>
                  <strong>Title:</strong> {viewPolicy.title}
                </p>
                <p>
                  <strong>Type:</strong> {viewPolicy.type}
                </p>
                <p>
                  <strong>Slug:</strong> {viewPolicy.slug}
                </p>
                <p>
                  <strong>Published:</strong> {viewPolicy.isPublished ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Updated at:</strong> {formatDate(viewPolicy.updatedAt)}
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Content:</strong>
                  </p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 whitespace-pre-wrap">
                    {viewPolicy.content}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
