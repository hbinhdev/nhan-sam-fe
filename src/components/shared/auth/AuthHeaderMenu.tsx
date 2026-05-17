"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { type AuthResponse } from "@/lib/auth-api";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { useAuth } from "@/components/shared/auth/AuthProvider";
import { useRouteLoading } from "@/components/shared/routing/RouteLoadingProvider";

function getDisplayName(session: AuthResponse | null) {
  if (!session?.user) return "";
  const name = session.user.name?.trim();
  if (name) return name;
  return session.user.email;
}

function getInitial(session: AuthResponse | null) {
  const label = getDisplayName(session);
  return label ? label.charAt(0).toUpperCase() : "P";
}

export function AuthHeaderMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { session, isAuthenticated, isAuthLoading, signOut } = useAuth();
  const { startRouteLoading } = useRouteLoading();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !rootRef.current) return;
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

  const handleAccountClick = () => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      if (pathname !== "/login") {
        startRouteLoading();
      }
      router.push("/login");
      return;
    }

    setIsOpen((prev) => !prev);
  };

  const handleGoDashboard = () => {
    setIsOpen(false);
    if (pathname !== "/dashboard") {
      startRouteLoading();
    }
    router.push("/dashboard");
  };

  const handleLogout = () => {
    signOut();
    setIsOpen(false);
    showToast("Đăng xuất thành công.", "success");
    if (pathname !== "/") {
      startRouteLoading();
    }
    router.push("/");
  };

  const displayName = getDisplayName(session);
  const userEmail = session?.user?.email ?? "";

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={handleAccountClick}
        className="flex items-center gap-2 text-primary dark:text-red-500 focus:outline-none hover:text-primary/70 transition-all duration-300"
        aria-haspopup={isAuthenticated ? "menu" : undefined}
        aria-expanded={isAuthenticated ? isOpen : undefined}
        aria-label="Tài khoản"
      >
        {isAuthLoading ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-red-500/20 dark:text-red-400" aria-hidden="true">
            <span className="material-symbols-outlined text-base leading-none">person</span>
          </span>
        ) : isAuthenticated ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary dark:bg-red-500/20 dark:text-red-400">
            {getInitial(session)}
          </span>
        ) : (
          <span className="material-symbols-outlined">person</span>
        )}
      </button>

      {isAuthenticated && isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-64 rounded-xl border border-outline-variant/40 bg-white shadow-xl p-3"
        >
          <div className="border-b border-outline-variant/30 pb-3 mb-3">
            <p className="text-sm font-semibold text-primary truncate">{displayName}</p>
            <p className="text-xs text-on-surface-variant truncate">{userEmail}</p>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={handleGoDashboard}
              className="mb-2 w-full rounded-lg border border-outline-variant/40 bg-white px-3 py-2 text-sm font-medium text-primary hover:bg-surface transition-colors"
              role="menuitem"
            >
              Dashboard
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg bg-primary text-on-primary px-3 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            role="menuitem"
          >
            Đăng xuất
          </button>
        </div>
      ) : null}
    </div>
  );
}
