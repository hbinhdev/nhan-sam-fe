"use client";

import { useState } from "react";
import type { ProductSummary } from "@/lib/product-api";
import { cn } from "@/lib/utils";
import { normalizeBlogContentToHtml } from "@/lib/blog-helpers";

type ProductTabsProps = {
  product?: ProductSummary | null;
};

type TabKey = "description" | "information" | "usage" | "faq";

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("description");

  const description =
    product?.description?.trim() || "Chưa có mô tả chi tiết cho sản phẩm này.";

  const usagePurpose =
    product?.usagePurpose?.trim() || "Chưa có thông tin công dụng.";

  const usageInstructions =
    product?.usageInstructions?.trim() || "Chưa có hướng dẫn sử dụng.";

  const detailItems = [
    {
      label: "Thương hiệu",
      value: product?.brand?.trim() || "Chưa có thông tin",
    },
    { label: "Xuất xứ", value: product?.origin?.trim() || "Chưa có thông tin" },
    {
      label: "Tuổi sâm",
      value: product?.ginsengAge?.trim() || "Chưa có thông tin",
    },
    {
      label: "Danh mục",
      value: product?.category?.name?.trim() || "Chưa có thông tin",
    },
    {
      label: "Mã sản phẩm",
      value: product?.sku?.trim() || "Chưa có thông tin",
    },
    {
      label: "Tồn kho",
      value:
        typeof product?.stock === "number"
          ? `${product.stock}`
          : "Chưa có thông tin",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto py-24 border-t border-outline-variant/30">
      <div className="flex border-b border-outline-variant/20 mb-12 overflow-x-auto scrollbar-hide">
        <TabButton
          active={activeTab === "description"}
          onClick={() => setActiveTab("description")}
        >
          Mô tả
        </TabButton>
        <TabButton
          active={activeTab === "information"}
          onClick={() => setActiveTab("information")}
        >
          Thông tin
        </TabButton>
        <TabButton
          active={activeTab === "usage"}
          onClick={() => setActiveTab("usage")}
        >
          Hướng dẫn sử dụng
        </TabButton>
        <TabButton
          active={activeTab === "faq"}
          onClick={() => setActiveTab("faq")}
        >
          Câu hỏi thường gặp
        </TabButton>
      </div>

      {activeTab === "description" && (
        <div className="rounded-2xl bg-surface-container-low p-8 md:p-10">
          <div
            className="text-on-surface-variant leading-relaxed [&_a]:text-primary [&_a]:underline [&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: normalizeBlogContentToHtml(description) }}
          />
        </div>
      )}

      {activeTab === "information" && (
        <div className="bg-surface-container-low p-10 border-l-4 border-primary rounded-r-2xl">
          <div className="text-[11px] font-bold tracking-[0.2em] text-primary uppercase mb-6">
            Thông tin chi tiết
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {detailItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start justify-between gap-4 border-b border-outline-variant/20 pb-3"
              >
                <span className="text-[11px] font-bold tracking-widest uppercase text-on-surface-variant/70">
                  {item.label}
                </span>
                <span className="text-sm text-primary font-medium text-right">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "usage" && (
        <div className="flex flex-col gap-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            <InfoItem icon="info" title="Công dụng" desc={usagePurpose} />
            <InfoItem
              icon="menu_book"
              title="Hướng dẫn sử dụng"
              desc={usageInstructions}
            />
          </div>
        </div>
      )}

      {activeTab === "faq" && (
        <div className="flex flex-col gap-6">
          <FaqItem
            question="Sản phẩm này dùng như thế nào?"
            answer={usageInstructions}
          />
          <FaqItem question="Sản phẩm phù hợp với ai?" answer={usagePurpose} />
          <FaqItem
            question="Sản phẩm còn hàng không?"
            answer={
              typeof product?.stock === "number"
                ? `Hiện còn ${product.stock} sản phẩm trong kho.`
                : "Thông tin tồn kho đang được cập nhật."
            }
          />
        </div>
      )}
    </section>
  );
}

function TabButton({
  children,
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-8 py-5 text-[11px] font-bold tracking-widest uppercase transition-all shrink-0 border-b-2",
        active
          ? "border-primary text-primary"
          : "border-transparent text-on-surface-variant/60 hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

function InfoItem({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <h3 className="text-xl font-serif text-primary">{title}</h3>
      <p className="text-on-surface-variant leading-relaxed">{desc}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-surface-container-low p-6 border-l-4 border-primary rounded-r-2xl">
      <h3 className="text-[12px] font-bold tracking-widest uppercase text-primary mb-3">
        {question}
      </h3>
      <p className="text-on-surface-variant leading-relaxed">{answer}</p>
    </div>
  );
}
