import React from 'react';
import { PaymentTable } from '@/components/dashboard/payments/PaymentTable';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Payments
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track all incoming payments and transaction status.
        </p>
      </div>

      <PaymentTable />
    </div>
  );
}
