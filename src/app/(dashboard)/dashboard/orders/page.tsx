import React from 'react';
import { OrderTable } from '@/components/dashboard/orders/OrderTable';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Orders
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Monitor and manage your customer orders.
        </p>
      </div>

      <OrderTable />
    </div>
  );
}
