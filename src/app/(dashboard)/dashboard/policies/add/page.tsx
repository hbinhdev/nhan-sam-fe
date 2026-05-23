"use client";

import React from "react";
import { PolicyForm } from "@/components/dashboard/policies/PolicyForm";

export default function AddPolicyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thêm chính sách</h1>
        <p className="text-sm text-slate-500">Tạo nội dung chính sách mới.</p>
      </div>

      <PolicyForm mode="create" />
    </div>
  );
}
