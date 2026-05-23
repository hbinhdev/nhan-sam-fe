"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PolicyForm } from "@/components/dashboard/policies/PolicyForm";
import { adminGetPolicyById, type PolicyItem } from "@/lib/policy-api";
import { useToast } from "@/components/shared/toast/ToastProvider";

export default function EditPolicyPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [policy, setPolicy] = useState<PolicyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (typeof id !== "string") return;
      setLoading(true);
      try {
        const data = await adminGetPolicyById(id);
        if (!data) {
          setNotFound(true);
          showToast("Không tìm thấy chính sách.", "error");
        } else {
          setNotFound(false);
          setPolicy(data);
        }
      } catch (err) {
        showToast("Không thể tải dữ liệu chính sách.", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sửa chính sách</h1>
        <p className="text-sm text-slate-500">Cập nhật nội dung chính sách hiện có.</p>
      </div>

      {loading ? (
        <div className="p-4 text-sm text-slate-500">Đang tải chính sách...</div>
      ) : notFound ? (
        <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-500">
          Không tìm thấy chính sách.
        </div>
      ) : (
        <PolicyForm mode="edit" initialData={policy} />
      )}
    </div>
  );
}
