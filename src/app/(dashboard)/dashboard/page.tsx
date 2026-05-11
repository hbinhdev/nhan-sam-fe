import React from 'react';
import { KPICard } from '@/components/dashboard/KPICard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { DollarSign, ShoppingBag, Users, Activity } from 'lucide-react';
import { kpiData } from '@/data/mockData';

export default function DashboardPage() {
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
          title="Total Revenue"
          value={kpiData.revenue.value}
          change={kpiData.revenue.change}
          trend={kpiData.revenue.trend as 'up' | 'down'}
          icon={<DollarSign size={20} />} 
        />
        
        <KPICard
          title="Total Orders"
          value={kpiData.orders.value}
          change={kpiData.orders.change}
          trend={kpiData.orders.trend as 'up' | 'down'}
          icon={<ShoppingBag size={20} />} 
        />
        
        <KPICard
          title="Active Customers"
          value={kpiData.activeUsers.value}
          change={kpiData.activeUsers.change}
          trend={kpiData.activeUsers.trend as 'up' | 'down'}
          icon={<Users size={20} />} 
        />
        
        <KPICard
          title="Conversion Rate"
          value={kpiData.conversion.value}
          change={kpiData.conversion.change}
          trend={kpiData.conversion.trend as 'up' | 'down'}
          icon={<Activity size={20} />} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <RevenueChart />
        <CategoryChart />
      </div>

      <div className="grid gap-4">
        <RecentTransactions />
      </div>
    </div>
  );
}
