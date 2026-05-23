"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatCurrencyVND } from "@/lib/product-api";
import Link from "next/link";

export function CartItems() {
  const { items, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="lg:col-span-12 flex flex-col items-center justify-center py-24 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
        <span className="material-symbols-outlined text-[80px] text-outline-variant mb-6">
          shopping_basket
        </span>
        <h3 className="text-headline-sm text-on-surface mb-4">
          Giỏ hàng của bạn đang trống
        </h3>
        <p className="text-on-surface-variant mb-8 text-center max-w-md px-6">
          Hãy khám phá bộ sưu tập tinh hoa nhân sâm để bồi bổ sức khỏe cho bạn
          và gia đình.
        </p>
        <Link
          href="/products"
          className="bg-primary text-on-primary px-8 py-3 rounded-lg text-label-caps hover:bg-primary-container transition-all"
        >
          TIẾP TỤC MUA SẮM
        </Link>
      </div>
    );
  }

  return (
    <div className="lg:col-span-8">
      <div className="flex flex-col gap-0">
        {items.map((item) => (
          <CartItem
            key={item.id}
            id={item.id}
            image={item.image}
            tag={item.brand || "Heritage"}
            name={item.name}
            subtitle={item.sku ? `Mã SP: ${item.sku}` : ""}
            price={formatCurrencyVND(item.price)}
            quantity={item.quantity}
            onUpdateQuantity={(q: number) => updateQuantity(item.id, q)}
            onRemove={() => removeItem(item.id)}
          />
        ))}
      </div>

      {/* Heritage Experience Section */}
      <div className="mt-16 p-8 bg-surface-container-lowest border border-yellow-600/10 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-headline-sm text-secondary mb-6">
            Cam Kết Chất Lượng
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CommitmentItem
              icon="verified"
              text="Chứng nhận nguồn gốc sâm 6 năm tuổi chính hiệu."
            />
            <CommitmentItem
              icon="eco"
              text="Quy trình chiết xuất thủ công bảo tồn dược tính."
            />
            <CommitmentItem
              icon="workspace_premium"
              text="Đóng gói sang trọng, phù hợp làm quà tặng di sản."
            />
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <span className="material-symbols-outlined text-[200px]">
            history_edu
          </span>
        </div>
      </div>
    </div>
  );
}

function CartItem({
  id,
  image,
  tag,
  name,
  subtitle,
  price,
  quantity,
  onUpdateQuantity,
  onRemove,
}: any) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-8 py-8 border-b border-outline-variant/30 group">
      <div className="w-32 h-32 bg-surface-container-low rounded-xl flex-shrink-0 flex items-center justify-center p-4">
        <div className="relative w-full h-full mix-blend-multiply">
          {image ? (
            <Image alt={name} src={image} fill className="object-contain" />
          ) : (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-outline-variant">
                image
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div className="flex flex-col gap-2">
          <span className="text-label-caps text-secondary uppercase">
            {tag}
          </span>
          <h3 className="text-headline-sm text-on-surface">{name}</h3>
          <p className="text-on-surface-variant text-sm">{subtitle}</p>
        </div>

        <div className="flex items-center space-x-4 border border-outline-variant rounded-lg px-3 py-2">
          <button
            onClick={() => onUpdateQuantity(quantity - 1)}
            className="p-1 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">remove</span>
          </button>
          <span className="w-8 text-center font-bold">{quantity}</span>
          <button
            onClick={() => onUpdateQuantity(quantity + 1)}
            className="p-1 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold text-primary">{price}</p>
          <button
            onClick={onRemove}
            className="text-label-caps text-on-surface-variant hover:text-error transition-colors mt-2 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">delete</span>{" "}
            LOẠI BỎ
          </button>
        </div>
      </div>
    </div>
  );
}

function CommitmentItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  );
}
