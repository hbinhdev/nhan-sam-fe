"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/shared/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast/ToastProvider";

type Province = { code: number; name: string };
type District = { code: number; name: string };
type Ward = { code: number; name: string };

const phoneRegex = /^(0|\+84|84)(3|5|7|8|9)[0-9]{8}$/;

export function CheckoutForm() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

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
  const [isRestoringAddress, setIsRestoringAddress] = useState(false);
  const restoredCodesRef = useRef<{
    provinceCode?: string;
    districtCode?: string;
    wardCode?: string;
  }>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        if (parsed.selectedProvince || parsed.selectedDistrict || parsed.selectedWard) {
          restoredCodesRef.current = {
            provinceCode: parsed.selectedProvince || "",
            districtCode: parsed.selectedDistrict || "",
            wardCode: parsed.selectedWard || "",
          };
          setIsRestoringAddress(true);
        }
      }
    } catch {}
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

  useEffect(() => {
    if (!isRestoringAddress || provinces.length === 0) return;
    const { provinceCode } = restoredCodesRef.current;
    if (provinceCode) {
      setSelectedProvince(provinceCode);
    } else {
      setIsRestoringAddress(false);
    }
  }, [isRestoringAddress, provinces]);

  // Fetch Districts when Province changes
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      return;
    }
    async function fetchDistricts() {
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`,
        );
        const data = await res.json();
        setDistricts(data.districts);
        setWards([]);
        if (isRestoringAddress) {
          const { districtCode } = restoredCodesRef.current;
          setSelectedDistrict(districtCode || "");
        } else {
          setSelectedDistrict("");
          setSelectedWard("");
        }
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
      if (isRestoringAddress && !restoredCodesRef.current.districtCode) {
        setIsRestoringAddress(false);
      }
      return;
    }
    async function fetchWards() {
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`,
        );
        const data = await res.json();
        setWards(data.wards);
        if (isRestoringAddress) {
          const { wardCode } = restoredCodesRef.current;
          setSelectedWard(wardCode || "");
          setIsRestoringAddress(false);
        } else {
          setSelectedWard("");
        }
      } catch (err) {
        console.error("Error fetching wards:", err);
      }
    }
    void fetchWards();
  }, [selectedDistrict]);

  // Save info to localStorage
  useEffect(() => {
    const provName =
      provinces.find((p) => p.code.toString() === selectedProvince)?.name || "";
    const distName =
      districts.find((d) => d.code.toString() === selectedDistrict)?.name || "";
    const wardName =
      wards.find((w) => w.code.toString() === selectedWard)?.name || "";

    const fullAddress = [addressDetail, wardName, distName, provName]
      .filter(Boolean)
      .join(", ");

    const buyerInfo = {
      name: name.trim() || user?.name || "",
      phone: phone.trim() || user?.phone || "",
      email: email.trim() || user?.email || "",
      addressDetail,
      selectedProvince,
      selectedDistrict,
      selectedWard,
      fullAddress: fullAddress || "Nhận tại cửa hàng / Giao tận nơi",
    };

    localStorage.setItem("checkout_buyer_info", JSON.stringify(buyerInfo));
  }, [
    name,
    phone,
    email,
    addressDetail,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    provinces,
    districts,
    wards,
    user,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Họ và tên là bắt buộc";
    } else if (name.trim().length < 2) {
      newErrors.name = "Họ và tên phải có ít nhất 2 ký tự";
    }

    if (!phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!phoneRegex.test(phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!addressDetail.trim()) {
      newErrors.addressDetail = "Địa chỉ chi tiết là bắt buộc";
    } else if (addressDetail.trim().length < 5) {
      newErrors.addressDetail = "Địa chỉ chi tiết phải có ít nhất 5 ký tự";
    }

    if (!selectedProvince)
      newErrors.selectedProvince = "Vui lòng chọn Tỉnh/Thành phố";
    if (!selectedDistrict)
      newErrors.selectedDistrict = "Vui lòng chọn Quận/Huyện";
    if (!selectedWard) newErrors.selectedWard = "Vui lòng chọn Phường/Xã";

    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      showToast("Vui lòng kiểm tra lại thông tin thanh toán", "error");

      const firstErrorId = `checkout-${errorKeys[0]}`;
      const element = document.getElementById(firstErrorId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }

    router.push("/checkout/payment");
  };

  return (
    <form
      id="checkout-form"
      onSubmit={handleSubmit}
      className="lg:col-span-7 space-y-12"
    >
      <div>
        <h1 className="text-display-lg text-primary mb-2 font-bold">
          Thanh Toán
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Hoàn tất đơn hàng của bạn để tận hưởng tinh hoa từ thiên nhiên.
        </p>
      </div>

      {/* Buyer Info */}
      <section className="space-y-6">
        <SectionHeader icon="person" title="THÔNG TIN KHÁCH HÀNG" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            id="checkout-name"
            label="HỌ VÀ TÊN *"
            placeholder="Nguyễn Văn A"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={errors.name}
          />
          <InputGroup
            id="checkout-phone"
            label="SỐ ĐIỆN THOẠI *"
            placeholder="0901 234 567"
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
            }}
            error={errors.phone}
          />
          <div className="md:col-span-2">
            <InputGroup
              id="checkout-email"
              label="EMAIL"
              placeholder="khachhang@heritage.com"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
            />
          </div>
        </div>
      </section>

      {/* Shipping Address */}
      <section className="space-y-6">
        <SectionHeader icon="local_shipping" title="ĐỊA CHỈ GIAO HÀNG *" />
        <div className="space-y-6">
          <InputGroup
            id="checkout-addressDetail"
            label="ĐỊA CHỈ CHI TIẾT"
            placeholder="Số nhà, tên đường..."
            type="text"
            value={addressDetail}
            onChange={(e) => {
              setAddressDetail(e.target.value);
              if (errors.addressDetail)
                setErrors((prev) => ({ ...prev, addressDetail: "" }));
            }}
            error={errors.addressDetail}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              id="checkout-selectedProvince"
              placeholder="Chọn Tỉnh/Thành phố"
              options={provinces}
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                if (errors.selectedProvince)
                  setErrors((prev) => ({ ...prev, selectedProvince: "" }));
              }}
              error={errors.selectedProvince}
            />
            <Select
              id="checkout-selectedDistrict"
              placeholder="Chọn Quận/Huyện"
              options={districts}
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                if (errors.selectedDistrict)
                  setErrors((prev) => ({ ...prev, selectedDistrict: "" }));
              }}
              disabled={!selectedProvince}
              error={errors.selectedDistrict}
            />
            <Select
              id="checkout-selectedWard"
              placeholder="Chọn Phường/Xã"
              options={wards}
              value={selectedWard}
              onChange={(e) => {
                setSelectedWard(e.target.value);
                if (errors.selectedWard)
                  setErrors((prev) => ({ ...prev, selectedWard: "" }));
              }}
              disabled={!selectedDistrict}
              error={errors.selectedWard}
            />
          </div>
        </div>
      </section>
    </form>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-outline-variant pb-2">
      <span
        className="material-symbols-outlined text-primary"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <h2 className="text-label-caps text-primary font-bold">{title}</h2>
    </div>
  );
}

function InputGroup({
  id,
  label,
  placeholder,
  type,
  value,
  onChange,
  error,
}: {
  id?: string;
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-label-caps text-[10px] text-on-surface-variant uppercase font-semibold"
      >
        {label}
      </label>
      <input
        id={id}
        className={cn(
          "w-full bg-transparent border-0 border-b focus:ring-0 px-0 py-2 text-body-md font-medium transition-all placeholder:text-stone-300",
          error
            ? "border-error focus:border-error text-error"
            : "border-outline focus:border-primary",
        )}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
      {error && (
        <p className="text-[11px] text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in slide-in-from-top-1">
          <span className="material-symbols-outlined text-[14px] shrink-0">
            error
          </span>
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  id,
  placeholder,
  options = [],
  value,
  onChange,
  disabled,
  error,
}: {
  id?: string;
  placeholder: string;
  options?: Array<{ code: number; name: string }>;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div className="relative space-y-2">
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "bg-transparent border-0 border-b focus:ring-0 px-0 py-2 text-body-md font-medium appearance-none w-full cursor-pointer transition-all",
            disabled && "opacity-50 cursor-not-allowed",
            error
              ? "border-error focus:border-error text-error"
              : "border-outline focus:border-primary",
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
      {error && (
        <p className="text-[11px] text-error mt-1 flex items-center gap-1 font-medium animate-in fade-in slide-in-from-top-1">
          <span className="material-symbols-outlined text-[14px] shrink-0">
            error
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
