'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TrendData {
  month: string;
  count: number;
  approved: number;
  refused: number;
}

export default function CaseTrends() {
  const [data, setData] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getCaseTrends();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch case trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Volume — Last 6 Months</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No trend data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#0F2557"
                strokeWidth={2}
                name="Total Cases"
                dot={{ fill: '#0F2557', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="approved"
                stroke="#16a34a"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Approved"
                dot={{ fill: '#16a34a', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="refused"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="3 3"
                name="Refused"
                dot={{ fill: '#dc2626', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
