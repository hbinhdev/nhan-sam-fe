"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Phổ biến nhất" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "name-asc", label: "Tên A-Z" },
];

type ProductSortSelectProps = {
  sortBy?: "createdAt" | "price" | "name";
  sortOrder?: "asc" | "desc";
};

export function ProductSortSelect({ sortBy = "createdAt", sortOrder = "desc" }: ProductSortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentValue = `${sortBy}-${sortOrder}`;

  const handleChange = (nextValue: string) => {
    const [nextSortBy, nextSortOrder] = nextValue.split("-") as [
      "createdAt" | "price" | "name",
      "asc" | "desc",
    ];

    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (nextSortBy === "createdAt" && nextSortOrder === "desc") {
      params.delete("sortBy");
      params.delete("sortOrder");
    } else {
      params.set("sortBy", nextSortBy);
      params.set("sortOrder", nextSortOrder);
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <select
      className="bg-transparent border-none text-sm font-bold text-primary focus:ring-0 cursor-pointer p-0 pr-8"
      value={currentValue}
      onChange={(event) => handleChange(event.target.value)}
    >
      {SORT_OPTIONS.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
