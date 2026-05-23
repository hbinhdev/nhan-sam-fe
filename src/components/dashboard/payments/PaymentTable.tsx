import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { CreditCard, QrCode, Building } from 'lucide-react';
import { payments } from '@/data/mockData';

export function PaymentTable() {
  const getMethodIcon = (method: string) => {
    if (method.includes('Card'))
      return <CreditCard size={16} className="mr-2" />;
    if (method.includes('QR')) return <QrCode size={16} className="mr-2" />;
    return <Building size={16} className="mr-2" />;
  };

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã giao dịch</TableHead>
            <TableHead>Mã đơn hàng</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">{payment.id}</TableCell>
              <TableCell>{payment.orderId}</TableCell>
              <TableCell>{payment.date}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getMethodIcon(payment.method)}
                  {payment.method}
                </div>
              </TableCell>
              <TableCell>{payment.amount.toLocaleString("vi-VN")}đ</TableCell>
              <TableCell>
                <Badge
                  variant={payment.status === 'Success' ? 'success' : 'warning'}>
                  {payment.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
