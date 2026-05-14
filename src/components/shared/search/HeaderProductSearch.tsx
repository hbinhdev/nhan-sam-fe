"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRouteLoading } from "@/components/shared/routing/RouteLoadingProvider";

function normalizeRoute(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function HeaderProductSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startRouteLoading } = useRouteLoading();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const currentKeyword = searchParams.get("search") ?? "";

  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !rootRef.current) {
        return;
      }
      if (!rootRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = keyword.trim();
    if (!value) {
      return;
    }

    const nextParams =
      pathname === "/products"
        ? new URLSearchParams(searchParams.toString())
        : new URLSearchParams();

    nextParams.set("search", value);
    nextParams.delete("page");

    const nextRoute = normalizeRoute("/products", nextParams);
    const currentRoute = normalizeRoute(pathname, new URLSearchParams(searchParams.toString()));

    if (nextRoute === currentRoute) {
      setIsOpen(false);
      return;
    }

    startRouteLoading();
    router.push(nextRoute);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => {
          if (!isOpen) {
            setKeyword(currentKeyword);
          }
          setIsOpen((prev) => !prev);
        }}
        className="material-symbols-outlined p-2 text-on-surface-variant transition-all duration-300 hover:text-primary"
        aria-label="Tìm kiếm sản phẩm"
      >
        search
      </button>

      {isOpen ? (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 top-11 z-50 w-[min(86vw,360px)] rounded-xl border border-outline-variant/40 bg-white p-3 shadow-xl"
        >
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
            Tìm sản phẩm
          </label>
          <div className="flex items-center gap-2">
            <input
              autoFocus
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Nhập tên hoặc công dụng..."
              className="h-10 w-full rounded-lg border border-outline-variant/60 bg-white px-3 text-sm text-on-surface outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Tìm
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
