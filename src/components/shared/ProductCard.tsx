import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  price: string;
  tag?: string;
  image: string;
  subtitle?: string;
  aspectRatio?: "square" | "portrait";
  className?: string;
}

export function ProductCard({
  name,
  price,
  tag,
  image,
  subtitle,
  aspectRatio = "square",
  className,
}: ProductCardProps) {
  return (
    <div className={cn(
      "flex flex-col bg-white border border-outline-variant group rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300",
      className
    )}>
      <div className={cn(
        "overflow-hidden bg-white p-8 flex items-center justify-center relative",
        aspectRatio === "square" ? "aspect-square" : "aspect-[4/5]"
      )}>
        <Image
          alt={`Sản phẩm ${name} của Heritage Ginseng`}
          src={image}
          fill
          className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
        />
        {tag && (
          <div className="absolute top-4 left-4 bg-primary text-on-primary text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-md shadow-lg z-10">
            {tag}
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col gap-4 bg-surface/30 flex-1">
        <div className="flex flex-col gap-2 flex-1">
          {subtitle && (
            <p className="text-[11px] font-bold text-on-surface-variant/60 tracking-[0.2em] uppercase">
              {subtitle}
            </p>
          )}
          <h3 className="text-lg font-serif text-primary min-h-[54px] leading-tight group-hover:text-secondary transition-colors">
            {name}
          </h3>
        </div>
        <div className="flex flex-row justify-between items-center mt-2 border-t border-outline-variant/20 pt-4">
          <span className="text-primary font-bold text-lg">{price}</span>
          <button className="bg-primary text-on-primary w-11 h-11 rounded-full flex items-center justify-center hover:bg-primary-container transition-colors shadow-md">
            <span className="material-symbols-outlined text-xl">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
