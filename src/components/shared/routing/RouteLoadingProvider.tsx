"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  type AnchorHTMLAttributes,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { PageLoading } from "@/components/shared/loading/PageLoading";

type RouteLoadingContextValue = {
  isRouteLoading: boolean;
  startRouteLoading: () => void;
  stopRouteLoading: () => void;
};

const RouteLoadingContext = createContext<RouteLoadingContextValue | null>(null);

const AUTO_STOP_MS = 10000;

function normalizeRoute(href: string) {
  if (!href) return href;
  const [path, query = ""] = href.split("?");
  const normalizedPath = path.replace(/\/+$/, "") || "/";
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export function RouteLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const routeKeyRef = useRef(routeKey);

  const startRouteLoading = useCallback(() => {
    setIsRouteLoading(true);
  }, []);

  const stopRouteLoading = useCallback(() => {
    setIsRouteLoading(false);
  }, []);

  useEffect(() => {
    if (routeKeyRef.current !== routeKey) {
      routeKeyRef.current = routeKey;
      setIsRouteLoading(false);
    }
  }, [routeKey]);

  useEffect(() => {
    if (!isRouteLoading) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsRouteLoading(false);
    }, AUTO_STOP_MS);

    return () => window.clearTimeout(timeout);
  }, [isRouteLoading]);

  const contextValue = useMemo<RouteLoadingContextValue>(
    () => ({
      isRouteLoading,
      startRouteLoading,
      stopRouteLoading,
    }),
    [isRouteLoading, startRouteLoading, stopRouteLoading],
  );

  return (
    <RouteLoadingContext.Provider value={contextValue}>
      {children}
      {isRouteLoading ? (
        <>
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[10000] h-1 bg-slate-200/70">
            <div className="h-full w-1/3 animate-[route-progress_1.1s_ease-in-out_infinite] bg-slate-900" />
          </div>
          <PageLoading
            fullScreen
            overlay
            message="Đang tải trang..."
            className="pointer-events-none"
          />
        </>
      ) : null}
    </RouteLoadingContext.Provider>
  );
}

export function useRouteLoading() {
  const context = useContext(RouteLoadingContext);
  if (!context) {
    throw new Error("useRouteLoading must be used within RouteLoadingProvider");
  }
  return context;
}

type LoadingLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function LoadingLink({
  href,
  onClick,
  target,
  children,
  ...rest
}: LoadingLinkProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startRouteLoading } = useRouteLoading();

  const currentRoute = normalizeRoute(
    `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
  );
  const nextRoute = typeof href === "string" ? normalizeRoute(href) : null;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isModifiedClick(event)) {
      return;
    }

    if (target && target !== "_self") {
      return;
    }

    if (typeof href === "string") {
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      if (href.startsWith("http://") || href.startsWith("https://")) {
        return;
      }

      if (nextRoute === currentRoute) {
        return;
      }
    }

    startRouteLoading();
  };

  return (
    <Link href={href} onClick={handleClick} target={target} {...rest}>
      {children}
    </Link>
  );
}
