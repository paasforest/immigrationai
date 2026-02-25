'use client';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeadPerformanceChartProps {
  leadsByMonth: Array<{ month: string; received: number; accepted: number }>;
}

export default function LeadPerformanceChart({ leadsByMonth }: LeadPerformanceChartProps) {
  const data = leadsByMonth.map((item) => ({
    month: item.month,
    received: item.received,
    accepted: item.accepted,
    acceptanceRate: item.received > 0 ? Math.round((item.accepted / item.received) * 100) : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Performance — Last 6 Months</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis yAxisId="left" stroke="#6b7280" />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="received"
              fill="#d1d5db"
              name="Received Leads"
            />
            <Bar
              yAxisId="left"
              dataKey="accepted"
              fill="#10b981"
              name="Accepted Leads"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="acceptanceRate"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Acceptance Rate %"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
