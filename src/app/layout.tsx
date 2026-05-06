import type { Metadata } from "next";
import { Noto_Serif, Manrope } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/shared/QueryProvider";

const notoSerif = Noto_Serif({ subsets: ["latin", "vietnamese"], variable: "--font-serif" });
const manrope = Manrope({ subsets: ["latin", "vietnamese"], variable: "--font-manrope" });

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
    <html lang="vi" className="h-full">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1"
        />
      </head>
      <body
        className={`${notoSerif.variable} ${manrope.variable} font-manrope min-h-full flex flex-col antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
