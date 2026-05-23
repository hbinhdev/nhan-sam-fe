import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import { Edit, Eye, Trash2 } from "lucide-react";
import type { ProductSummary } from "@/lib/product-api";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

type ProductTableProps = {
  products: ProductSummary[];
  onView: (product: ProductSummary) => void;
  onEdit: (product: ProductSummary) => void;
  onDelete: (product: ProductSummary) => void;
};

function getStockBadge(stock: number | null | undefined): BadgeVariant {
  if (!stock || stock <= 0) return "danger";
  if (stock <= 10) return "warning";
  return "success";
}

function getStockLabel(stock: number | null | undefined) {
  if (!stock || stock <= 0) return "Hết hàng";
  if (stock <= 10) return "Sắp hết hàng";
  return "Còn hàng";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export function ProductTable({
  products,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Hình ảnh</TableHead>
            <TableHead className="w-[34%]">Tên sản phẩm</TableHead>
            <TableHead>Mã SP</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Tồn kho</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <img
                  src={
                    product.imageUrl ||
                    product.thumbnail ||
                    "/images/product-root.png"
                  }
                  alt={product.name}
                  className="h-10 w-10 rounded-md object-cover bg-slate-100"
                />
              </TableCell>
              <TableCell className="font-medium">
                <p
                  className="block max-w-[320px] truncate leading-5"
                  title={product.name}
                >
                  {product.name}
                </p>
              </TableCell>
              <TableCell>{product.sku || "-"}</TableCell>
              <TableCell>{product.category?.name || "-"}</TableCell>
              <TableCell>{formatCurrency(product.price)}</TableCell>
              <TableCell>
                <Badge variant={getStockBadge(product.stock)}>
                  {getStockLabel(product.stock)} ({product.stock ?? 0})
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="h-8 w-8 text-slate-700"
                    onClick={() => onView(product)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="h-8 w-8 text-slate-700"
                    onClick={() => onEdit(product)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    className="h-8 w-8"
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
