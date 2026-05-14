export default function CategoriesLoading() {
  return (
    <div className="flex min-h-[28vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
        <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        Đang tải dữ liệu...
      </div>
    </div>
  );
}

