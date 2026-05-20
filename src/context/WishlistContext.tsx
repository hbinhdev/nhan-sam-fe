"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/components/shared/auth/AuthProvider";
import {
  addToWishlistApi,
  clearWishlistApi,
  fetchWishlist,
  removeWishlistItemApi,
} from "@/lib/wishlist-api";

export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  sku?: string;
  brand?: string;
  href?: string;
};

type WishlistContextType = {
  items: WishlistItem[];
  totalItems: number;
  addToWishlist: (item: WishlistItem) => Promise<void>;
  removeFromWishlist: (id: string) => Promise<void>;
  toggleWishlist: (item: WishlistItem) => Promise<void>;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = "heritage_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { isAuthenticated, isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthenticated) {
      const sync = async () => {
        const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as WishlistItem[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              for (const item of parsed) {
                await addToWishlistApi(item.id);
              }
            }
            window.localStorage.removeItem(LOCAL_STORAGE_KEY);
          } catch (error) {
            console.error("Failed to sync wishlist", error);
          }
        }

        try {
          const apiItems = await fetchWishlist();
          const mappedItems = apiItems.map((item: any) => ({
            id: item.product.id,
            name: item.product.name,
            price: Number(item.product.price ?? 0),
            image: item.product.imageUrl || item.product.thumbnail || "",
            sku: item.product.sku,
            brand: item.product.brand,
            href: item.product.slug ? `/products/${item.product.slug}` : undefined,
          }));
          setItems(mappedItems);
        } catch (error) {
          console.error("Failed to load wishlist from API", error);
        }
      };

      sync();
      return;
    }

    const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) {
      setItems([]);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as WishlistItem[];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    }
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (!isAuthenticated && !isAuthLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isAuthenticated, isAuthLoading]);

  const addToWishlist = async (item: WishlistItem) => {
    if (isAuthenticated) {
      await addToWishlistApi(item.id);
      const apiItems = await fetchWishlist();
      setItems(
        apiItems.map((entry: any) => ({
          id: entry.product.id,
          name: entry.product.name,
          price: Number(entry.product.price ?? 0),
          image: entry.product.imageUrl || entry.product.thumbnail || "",
          sku: entry.product.sku,
          brand: entry.product.brand,
          href: entry.product.slug ? `/products/${entry.product.slug}` : undefined,
        })),
      );
      return;
    }

    setItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromWishlist = async (id: string) => {
    if (isAuthenticated) {
      await removeWishlistItemApi(id);
      const apiItems = await fetchWishlist();
      setItems(
        apiItems.map((entry: any) => ({
          id: entry.product.id,
          name: entry.product.name,
          price: Number(entry.product.price ?? 0),
          image: entry.product.imageUrl || entry.product.thumbnail || "",
          sku: entry.product.sku,
          brand: entry.product.brand,
          href: entry.product.slug ? `/products/${entry.product.slug}` : undefined,
        })),
      );
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleWishlist = async (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      await removeFromWishlist(item.id);
      return;
    }
    await addToWishlist(item);
  };

  const isInWishlist = (id: string) => items.some((item) => item.id === id);

  const clearWishlist = async () => {
    if (isAuthenticated) {
      await clearWishlistApi();
      setItems([]);
      return;
    }

    setItems([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const value = {
    items,
    totalItems: items.length,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }

  return context;
}
