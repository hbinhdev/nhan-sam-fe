"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth-api";
import { cn } from "@/lib/utils";

export function AuthHeaderActions() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = getAuthSession();
    setIsAuthenticated(Boolean(session?.access_token && session?.user));
  }, []);

  return (
    <div className="flex items-center gap-4">
      <button className="material-symbols-outlined text-on-surface-variant hover:text-primary p-2">
        search
      </button>
      <Link
        href="/cart"
        className="material-symbols-outlined text-on-surface-variant hover:text-primary p-2 relative"
      >
        shopping_bag
      </Link>
      <Link
        href={isAuthenticated ? "/products" : "/login"}
        className={cn(
          buttonVariants({ variant: "default" }),
          "hidden md:flex bg-primary text-on-primary px-6 rounded-lg h-11 font-medium items-center"
        )}
      >
        MUA NGAY
      </Link>
    </div>
  );
}
