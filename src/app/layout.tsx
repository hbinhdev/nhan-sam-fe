import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import QueryProvider from "@/components/shared/QueryProvider";
import { ToastProvider } from "@/components/shared/toast/ToastProvider";
import { AuthProvider } from "@/components/shared/auth/AuthProvider";
import { RouteLoadingProvider } from "@/components/shared/routing/RouteLoadingProvider";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

export const metadata: Metadata = {
  title: "Heritage Ginseng - Tinh Hoa Sâm Việt",
  description: "Khám phá bí quyết trường thọ từ những củ sâm quý hiếm nhất, được nuôi dưỡng bởi tinh hoa đất trời.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
        />
      </head>
      <body
        className="font-manrope min-h-full flex flex-col antialiased"
        style={{
          fontFamily:
            'Manrope, "Noto Serif", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
        suppressHydrationWarning
      >
        <QueryProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <RouteLoadingProvider>
                <AuthProvider>
                  <CartProvider>
                    <WishlistProvider>{children}</WishlistProvider>
                  </CartProvider>
                </AuthProvider>
              </RouteLoadingProvider>
            </Suspense>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
