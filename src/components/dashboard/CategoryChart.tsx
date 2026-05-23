"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

type CategoryChartProps = {
  data: Array<{ name: string; value: number }>;
};

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Trạng thái tư vấn</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-slate-500">
              Chưa có dữ liệu tư vấn.
            </div>
          ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
