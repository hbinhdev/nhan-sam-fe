"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/shared/auth/AuthProvider";
import { LoadingLink } from "@/components/shared/routing/RouteLoadingProvider";
import { HeaderProductSearch } from "@/components/shared/search/HeaderProductSearch";

export function AuthHeaderActions() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex items-center gap-4">
      <HeaderProductSearch />
      <LoadingLink
        href="/cart"
        className="material-symbols-outlined text-on-surface-variant hover:text-primary p-2 relative"
      >
        shopping_bag
      </LoadingLink>
      <LoadingLink
        href={isAuthenticated ? "/products" : "/login"}
        className={cn(
          buttonVariants({ variant: "default" }),
          "hidden md:flex bg-primary text-on-primary px-6 rounded-lg h-11 font-medium items-center"
        )}
      >
        MUA NGAY
      </LoadingLink>
    </div>
  );
}
