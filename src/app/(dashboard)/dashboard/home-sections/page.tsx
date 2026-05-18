"use client";

import { useEffect, useMemo, useState } from "react";
import { getAuthSession } from "@/lib/auth-api";
import {
  adminCreateHomeSection,
  adminGetHomeSections,
  adminUpdateHomeSection,
  type HomeSection,
  type HomeSectionType,
} from "@/lib/home-section-api";
import { uploadImage } from "@/lib/admin-upload-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_LIMIT = 50;

const PRESET_KEYS: Array<{ key: string; label: string; type: HomeSectionType }> = [
  { key: "hero", label: "Hero", type: "HERO" },
  { key: "featured-categories", label: "Featured Categories", type: "FEATURED_CATEGORIES" },
  { key: "featured-products", label: "Featured Products", type: "FEATURED_PRODUCTS" },
  { key: "promo-banners", label: "Promo Banners", type: "PROMO_BANNERS" },
  { key: "brand-story", label: "Brand Story", type: "BRAND_STORY" },
  { key: "consultation", label: "Consultation Section", type: "CONSULTATION_SECTION" },
  { key: "featured-blogs", label: "Featured Blogs", type: "FEATURED_BLOGS" },
  { key: "faq-commitments", label: "FAQ/Commitments", type: "FAQ_COMMITMENTS" },
  { key: "testimonials", label: "Testimonials", type: "FAQ_COMMITMENTS" },
];

type FormState = {
  id?: string;
  key: string;
  type: HomeSectionType;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  dataJson: string;
  isActive: boolean;
  sortOrder: number;
};

function toFormState(section: HomeSection | null, preset: { key: string; type: HomeSectionType }): FormState {
  return {
    id: section?.id,
    key: section?.key ?? preset.key,
    type: (section?.type as HomeSectionType) ?? preset.type,
    title: section?.title ?? "",
    subtitle: section?.subtitle ?? "",
    content: section?.content ?? "",
    imageUrl: section?.imageUrl ?? "",
    ctaText: section?.ctaText ?? "",
    ctaLink: section?.ctaLink ?? "",
    dataJson: section?.dataJson ? JSON.stringify(section.dataJson, null, 2) : "{}",
    isActive: section?.isActive ?? true,
    sortOrder: section?.sortOrder ?? PRESET_KEYS.findIndex((item) => item.key === preset.key) + 1,
  };
}

export default function HomeSectionsPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(PRESET_KEYS[0]);
  const [form, setForm] = useState<FormState>(() => toFormState(null, PRESET_KEYS[0]));

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const sectionsByKey = useMemo(() => {
    const map = new Map<string, HomeSection>();
    sections.forEach((item) => map.set(item.key, item));
    return map;
  }, [sections]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminGetHomeSections({ page: 1, limit: PAGE_LIMIT });
      setSections(response.data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load home sections.");
      setSections([]);
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
    void loadData();
  }, [authChecked, isAdmin]);

  useEffect(() => {
    const section = sectionsByKey.get(selectedPreset.key) ?? null;
    setForm(toFormState(section, selectedPreset));
  }, [sectionsByKey, selectedPreset]);

  const handlePresetSelect = (presetKey: string) => {
    const preset = PRESET_KEYS.find((item) => item.key === presetKey);
    if (!preset) return;
    setSelectedPreset(preset);
    setError(null);
    setFlash(null);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const url = await uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setFlash(null);

    let parsedDataJson: Record<string, unknown> | null = null;
    try {
      parsedDataJson = form.dataJson.trim() ? (JSON.parse(form.dataJson) as Record<string, unknown>) : null;
    } catch {
      setSaving(false);
      setError("dataJson phải là JSON hợp lệ.");
      return;
    }

    const payload = {
      key: form.key,
      type: form.type,
      title: form.title || null,
      subtitle: form.subtitle || null,
      content: form.content || null,
      imageUrl: form.imageUrl || null,
      ctaText: form.ctaText || null,
      ctaLink: form.ctaLink || null,
      dataJson: parsedDataJson,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (form.id) {
        await adminUpdateHomeSection(form.id, payload);
      } else {
        await adminCreateHomeSection(payload);
      }
      setFlash("Lưu section trang chủ thành công.");
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu section.");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickToggle = async (preset: { key: string }) => {
    const item = sectionsByKey.get(preset.key);
    if (!item) return;

    setError(null);
    setFlash(null);
    try {
      await adminUpdateHomeSection(item.id, { isActive: !item.isActive });
      await loadData();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Toggle failed.");
    }
  };

  const handleMove = async (preset: { key: string }, direction: "up" | "down") => {
    const item = sectionsByKey.get(preset.key);
    if (!item) return;

    const nextOrder = direction === "up" ? item.sortOrder - 1 : item.sortOrder + 1;
    try {
      await adminUpdateHomeSection(item.id, { sortOrder: nextOrder });
      await loadData();
    } catch (moveError) {
      setError(moveError instanceof Error ? moveError.message : "Reorder failed.");
    }
  };

  if (!authChecked) {
    return <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">Checking admin access...</div>;
  }

  if (!isAdmin) {
    return <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Admin access is required.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý trang chủ</h1>
        <p className="text-sm text-slate-500">Quản lý nội dung CMS cho Home page theo từng section key.</p>
      </div>

      {flash ? <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{flash}</div> : null}
      {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Sections</h2>
          <div className="space-y-2">
            {PRESET_KEYS.map((preset) => {
              const item = sectionsByKey.get(preset.key);
              const active = selectedPreset.key === preset.key;
              return (
                <div key={preset.key} className={`rounded-lg border p-3 ${active ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
                  <button className="w-full text-left" onClick={() => handlePresetSelect(preset.key)}>
                    <p className="text-sm font-semibold text-slate-800">{preset.label}</p>
                    <p className="text-xs text-slate-500">{preset.key}</p>
                  </button>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${item?.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {item ? (item.isActive ? "ACTIVE" : "INACTIVE") : "NOT CREATED"}
                    </span>
                    {item ? (
                      <>
                        <Button type="button" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => void handleQuickToggle(preset)}>
                          Toggle
                        </Button>
                        <Button type="button" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => void handleMove(preset, "up")}>↑</Button>
                        <Button type="button" variant="outline" className="h-6 px-2 text-[10px]" onClick={() => void handleMove(preset, "down")}>↓</Button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          {loading ? <p className="text-sm text-slate-500">Loading home sections...</p> : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Key</label>
              <Input value={form.key} onChange={(e) => setForm((prev) => ({ ...prev, key: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Type</label>
              <select className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm" value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as HomeSectionType }))}>
                {Array.from(new Set(PRESET_KEYS.map((item) => item.type))).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Title</label>
              <Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Subtitle</label>
              <textarea className="min-h-20 w-full rounded-lg border border-slate-300 p-3 text-sm" value={form.subtitle} onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Content</label>
              <textarea className="min-h-28 w-full rounded-lg border border-slate-300 p-3 text-sm" value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Image URL</label>
              <div className="flex gap-2">
                <Input value={form.imageUrl} onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))} />
                <label className="inline-flex h-10 cursor-pointer items-center rounded-lg border border-slate-300 px-3 text-sm">
                  {uploading ? "Uploading..." : "Upload"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">CTA Text</label>
              <Input value={form.ctaText} onChange={(e) => setForm((prev) => ({ ...prev, ctaText: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">CTA Link</label>
              <Input value={form.ctaLink} onChange={(e) => setForm((prev) => ({ ...prev, ctaLink: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Sort Order</label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))} />
            </div>
            <label className="mt-8 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
              Is Active
            </label>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">dataJson (JSON)</label>
              <textarea className="min-h-56 w-full rounded-lg border border-slate-300 p-3 font-mono text-xs" value={form.dataJson} onChange={(e) => setForm((prev) => ({ ...prev, dataJson: e.target.value }))} />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button className="bg-slate-900 text-white hover:bg-slate-800" disabled={saving || uploading} onClick={() => void handleSave()}>
              {saving ? "Saving..." : form.id ? "Update Section" : "Create Section"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
