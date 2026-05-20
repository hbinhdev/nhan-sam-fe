"use client";

import React, { useEffect, useMemo, useState } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import {
  Boxes,
  MessageSquare,
  ShoppingCart,
  Phone,
  TrendingDown,
} from "lucide-react";
import {
  getDashboardSummary,
  type DashboardSummary,
} from "@/lib/dashboard-api";

type RequestState = {
  loading: boolean;
  error: string | null;
  summary: DashboardSummary | null;
};

export default function DashboardPage() {
  const [state, setState] = useState<RequestState>({
    loading: true,
    error: null,
    summary: null,
  });

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const summary = await getDashboardSummary();
        if (!mounted) return;
        setState({ loading: false, error: null, summary });
      } catch (error) {
        if (!mounted) return;
        const message =
          error instanceof Error ? error.message : "Failed to load dashboard.";
        setState({ loading: false, error: message, summary: null });
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const ordersChartData = useMemo(() => {
    const overview = state.summary?.ordersOverview;
    if (!overview) return [];

    return overview.map((item) => ({
      date: item.date,
      orders: Number(item.orders) || 0,
    }));
  }, [state.summary]);

  const consultationStatusData = useMemo(() => {
    const overview = state.summary?.overview;
    if (!overview) return [];

    return [
      { name: "Pending", value: overview.pendingConsultations },
      { name: "Contacted", value: overview.contactedConsultations },
      { name: "Cancelled", value: overview.cancelledConsultations },
    ];
  }, [state.summary]);

  if (state.loading) {
    return (
      <div className="text-sm text-slate-500">Loading dashboard data...</div>
    );
  }

  if (state.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {state.error}
      </div>
    );
  }

  const summary = state.summary;
  if (!summary) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        No dashboard data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Dashboard Overview
        </h1>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Products"
          value={summary.overview.totalProducts.toLocaleString()}
          icon={<Boxes size={20} />}
        />

        <KPICard
          title="Total Reviews"
          value={summary.overview.totalReviews.toLocaleString()}
          change={`${summary.overview.pendingReviews} pending`}
          trend={summary.overview.pendingReviews > 0 ? "down" : "up"}
          icon={<MessageSquare size={20} />}
        />

        <KPICard
          title="Total Orders"
          value={summary.overview.totalOrders.toLocaleString()}
          icon={<ShoppingCart size={20} />}
        />

        <KPICard
          title="Consultations"
          value={summary.overview.totalConsultations.toLocaleString()}
          change={`${summary.overview.cancelledConsultations} cancelled`}
          trend={summary.overview.cancelledConsultations > 0 ? "down" : "up"}
          icon={<Phone size={20} />}
          description=""
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RevenueChart data={ordersChartData} />
        <CategoryChart data={consultationStatusData} />
      </div>

      <div className="grid gap-4">
        <RecentTransactions consultations={summary.recentConsultations} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 flex items-center gap-2">
        <TrendingDown size={14} />
        Revenue, orders, and payment statistics are not available yet.
      </div>
    </div>
  );
}
