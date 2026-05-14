"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { PageLoading } from "@/components/shared/loading/PageLoading";
import { useRouteLoading } from "@/components/shared/routing/RouteLoadingProvider";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { getAuthSession } from "@/lib/auth-api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const { startRouteLoading } = useRouteLoading();
  const unauthorizedNotifiedRef = useRef(false);

  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      const session = getAuthSession();
      const hasToken = Boolean(session?.access_token);
      const hasAdminRole = session?.user?.role === "ADMIN";

      if (!hasToken) {
        setAuthChecked(true);
        setIsAdmin(false);
        const redirect = pathname?.trim() ? `?redirect=${encodeURIComponent(pathname)}` : "";
        startRouteLoading();
        router.replace(`/login${redirect}`);
        return;
      }

      if (!hasAdminRole) {
        setAuthChecked(true);
        setIsAdmin(false);
        if (!unauthorizedNotifiedRef.current) {
          showToast("Bạn không có quyền truy cập trang này.", "error");
          unauthorizedNotifiedRef.current = true;
        }
        startRouteLoading();
        router.replace("/");
        return;
      }

      setIsAdmin(true);
      setAuthChecked(true);
    });
  }, [pathname, router, showToast, startRouteLoading]);

  useEffect(() => {
    if (!authChecked || !isAdmin) {
      return;
    }

    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [authChecked, isAdmin]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (!authChecked || !isAdmin) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <div className="admin-theme min-h-screen bg-background">
          <PageLoading message="Đang kiểm tra quyền truy cập..." />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="admin-theme flex min-h-screen bg-background font-sans text-foreground transition-colors duration-300">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />

        <div
          className={`flex-1 flex min-h-screen flex-col transition-all duration-300 ${
            !isMobile ? (isSidebarOpen ? "ml-[240px]" : "ml-[70px]") : "ml-0"
          }`}
        >
          <Header toggleSidebar={toggleSidebar} />

          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
