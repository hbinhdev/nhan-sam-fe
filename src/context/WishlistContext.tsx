"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = "heritage_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) {
      return [];
    }

    try {
      const parsed = JSON.parse(saved) as WishlistItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToWishlist = (item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleWishlist = (item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((existing) => existing.id === item.id)) {
        return prev.filter((existing) => existing.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isInWishlist = (id: string) => items.some((item) => item.id === id);

  const clearWishlist = () => {
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
