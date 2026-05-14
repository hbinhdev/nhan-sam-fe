"use client";

import { cn } from "@/lib/utils";

type PageLoadingProps = {
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  className?: string;
};

export function PageLoading({
  message = "Đang tải...",
  fullScreen = false,
  overlay = false,
  className,
}: PageLoadingProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "fixed inset-0 z-[9999]" : "min-h-[220px] w-full",
        overlay ? "bg-white/60 backdrop-blur-sm" : "",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-outline-variant border-t-primary" />
        <p className="text-sm font-medium text-on-surface">{message}</p>
      </div>
    </div>
  );
}

