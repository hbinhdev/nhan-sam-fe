import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { orders } from '@/data/mockData';

export function RecentTransactions() {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'default';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium dark:bg-slate-800 dark:text-slate-300">
                  {order.customer.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {order.customer}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {order.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={getStatusVariant(order.status) as any}>
                  {order.status}
                </Badge>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 w-24 text-right">
                  {order.total.toLocaleString()}đ
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
