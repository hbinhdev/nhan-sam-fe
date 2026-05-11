import React from 'react';
import { CustomerTable } from '@/components/dashboard/customers/CustomerTable';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Customers
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View and manage your customer database.
        </p>
      </div>

      <CustomerTable />
    </div>
  );
}
