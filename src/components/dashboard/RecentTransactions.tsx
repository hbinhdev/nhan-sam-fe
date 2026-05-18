import React from 'react';
import type { VariantProps } from 'class-variance-authority';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge, badgeVariants } from '@/components/ui/badge';

type RecentConsultationItem = {
  id: string;
  fullName: string;
  phone: string;
  interest: string;
  status: string;
  createdAt: string;
};

type RecentTransactionsProps = {
  consultations: RecentConsultationItem[];
};

type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export function RecentTransactions({ consultations }: RecentTransactionsProps) {
  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status.toLowerCase()) {
      case 'contacted':
        return 'success';
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
        <CardTitle>Recent Consultations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {consultations.length === 0 ? (
            <div className="text-sm text-slate-500">No consultations yet.</div>
          ) : (
            consultations.map((consultation) => (
              <div key={consultation.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium dark:bg-slate-800 dark:text-slate-300">
                    {consultation.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {consultation.fullName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(consultation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getStatusVariant(consultation.status)}>
                    {consultation.status}
                  </Badge>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 w-28 text-right">
                    {consultation.phone}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
