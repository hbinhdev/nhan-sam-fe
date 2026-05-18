"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/shared/toast/ToastProvider";
import { useAuth } from "@/components/shared/auth/AuthProvider";
import {
  fetchCart,
  addToCartApi,
  updateCartItemApi,
  removeCartItemApi,
  syncCartApi,
  clearCartApi,
} from "@/lib/cart-api";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sku?: string;
  brand?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "heritage_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const { isAuthenticated, isAuthLoading } = useAuth();

  // Helper to load from API
  const loadCartFromApi = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiItems = await fetchCart();
      // Map API items to CartItem structure
      const mappedItems = apiItems.map((item: any) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.imageUrl || item.product.thumbnail || "",
        sku: item.product.sku,
        brand: item.product.brand,
      }));
      setItems(mappedItems);
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        console.warn("Cart API unauthorized, falling back to local storage");
      } else {
        console.error("Failed to load cart from API", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    if (isAuthenticated) {
      const localCart = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart) as CartItem[];
          if (parsed.length > 0) {
            const syncItems = parsed.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            }));
            syncCartApi(syncItems).then(() => {
              localStorage.removeItem(LOCAL_STORAGE_KEY);
              loadCartFromApi();
            });
            return;
          }
        } catch (e) {
          console.error("Failed to sync cart", e);
        }
      }
      loadCartFromApi()
    } else {
      const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error("Failed to parse cart from localStorage", error);
        }
      } else {
        setItems([]);
      }
      setIsLoading(false);
    }
  }, [isAuthenticated, isAuthLoading, loadCartFromApi]);

  useEffect(() => {
    if (!isAuthenticated && !isAuthLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isAuthenticated, isAuthLoading]);

  const addItem = async (newItem: CartItem) => {
    if (isAuthenticated) {
      await addToCartApi(newItem.id, newItem.quantity);
      await loadCartFromApi();
    } else {
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === newItem.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        }
        return [...prevItems, newItem];
      });
    }

    showToast(`Đã thêm ${newItem.name} x${newItem.quantity} vào giỏ hàng`, "success");
  };

  const removeItem = async (id: string) => {
    if (isAuthenticated) {
      await removeCartItemApi(id);
      await loadCartFromApi();
    } else {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    if (isAuthenticated) {
      await updateCartItemApi(id, quantity);
      await loadCartFromApi();
    } else {
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      await clearCartApi();
      setItems([]);
    } else {
      setItems([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
