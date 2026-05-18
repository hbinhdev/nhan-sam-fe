"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/shared/auth/AuthProvider";

type Province = { code: number; name: string };
type District = { code: number; name: string };
type Ward = { code: number; name: string };

export function CheckoutForm() {
  const { user } = useAuth();

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("checkout_buyer_info");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && !name) setName(parsed.name);
        if (parsed.phone && !phone) setPhone(parsed.phone);
        if (parsed.email && !email) setEmail(parsed.email);
        if (parsed.addressDetail) setAddressDetail(parsed.addressDetail);
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    async function fetchProvinces() {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await res.json();
        setProvinces(data);
      } catch (err) {
        console.error("Error fetching provinces:", err);
      }
    }
    void fetchProvinces();
  }, []);

  // Fetch Districts when Province changes
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      return;
    }
    async function fetchDistricts() {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`);
        const data = await res.json();
        setDistricts(data.districts);
        setWards([]);
        setSelectedDistrict("");
        setSelectedWard("");
      } catch (err) {
        console.error("Error fetching districts:", err);
      }
    }
    void fetchDistricts();
  }, [selectedProvince]);

  // Fetch Wards when District changes
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }
    async function fetchWards() {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`);
        const data = await res.json();
        setWards(data.wards);
        setSelectedWard("");
      } catch (err) {
        console.error("Error fetching wards:", err);
      }
    }
    void fetchWards();
  }, [selectedDistrict]);

  // Save info to localStorage
  useEffect(() => {
    const provName = provinces.find((p) => p.code.toString() === selectedProvince)?.name || "";
    const distName = districts.find((d) => d.code.toString() === selectedDistrict)?.name || "";
    const wardName = wards.find((w) => w.code.toString() === selectedWard)?.name || "";

    const fullAddress = [addressDetail, wardName, distName, provName].filter(Boolean).join(", ");

    const buyerInfo = {
      name: name.trim() || user?.name || "Khách hàng",
      phone: phone.trim() || user?.phone || "0900000000",
      email: email.trim() || user?.email || "",
      addressDetail,
      fullAddress: fullAddress || "Nhận tại cửa hàng / Giao tận nơi",
    };

    localStorage.setItem("checkout_buyer_info", JSON.stringify(buyerInfo));
  }, [name, phone, email, addressDetail, selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards, user]);

  return (
    <div className="lg:col-span-7 space-y-12">
      <div>
        <h1 className="text-display-lg text-primary mb-2 font-bold">Thanh Toán</h1>
        <p className="text-body-lg text-on-surface-variant">
          Hoàn tất đơn hàng của bạn để tận hưởng tinh hoa từ thiên nhiên.
        </p>
      </div>

      {/* Buyer Info */}
      <section className="space-y-6">
        <SectionHeader icon="person" title="THÔNG TIN KHÁCH HÀNG" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label="HỌ VÀ TÊN *"
            placeholder="Nguyễn Văn A"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <InputGroup
            label="SỐ ĐIỆN THOẠI *"
            placeholder="0901 234 567"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="md:col-span-2">
            <InputGroup
              label="EMAIL"
              placeholder="khachhang@heritage.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Shipping Address */}
      <section className="space-y-6">
        <SectionHeader icon="local_shipping" title="ĐỊA CHỈ GIAO HÀNG *" />
        <div className="space-y-6">
          <InputGroup
            label="ĐỊA CHỈ CHI TIẾT"
            placeholder="Số nhà, tên đường..."
            type="text"
            value={addressDetail}
            onChange={(e) => setAddressDetail(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              placeholder="Chọn Tỉnh/Thành phố"
              options={provinces}
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
            />
            <Select
              placeholder="Chọn Quận/Huyện"
              options={districts}
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedProvince}
            />
            <Select
              placeholder="Chọn Phường/Xã"
              options={wards}
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={!selectedDistrict}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-outline-variant pb-2">
      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icon}
      </span>
      <h2 className="text-label-caps text-primary font-bold">{title}</h2>
    </div>
  );
}

function InputGroup({
  label,
  placeholder,
  type,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-label-caps text-[10px] text-on-surface-variant uppercase font-semibold">{label}</label>
      <input
        className="w-full bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 text-body-md font-medium transition-all placeholder:text-stone-300"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function Select({
  placeholder,
  options = [],
  value,
  onChange,
  disabled,
}: {
  placeholder: string;
  options?: Array<{ code: number; name: string }>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "bg-transparent border-0 border-b border-outline focus:border-primary focus:ring-0 px-0 py-2 text-body-md font-medium appearance-none w-full cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.name}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-sm">
        expand_more
      </span>
    </div>
  );
}
