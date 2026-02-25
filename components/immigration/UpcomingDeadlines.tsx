'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { immigrationApi } from '@/lib/api/immigration';
import { CaseTask } from '@/types/immigration';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function getUrgencyColor(days: number): { border: string; pill: string } {
  if (days <= 2) {
    return { border: 'border-red-500', pill: 'bg-red-100 text-red-800' };
  } else if (days <= 5) {
    return { border: 'border-amber-500', pill: 'bg-amber-100 text-amber-800' };
  } else {
    return { border: 'border-green-500', pill: 'bg-green-100 text-green-800' };
  }
}

function formatDate(date: string | null): string {
  if (!date) return 'No date';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysRemaining(dueDate: string | null): number {
  if (!dueDate) return Infinity;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function UpcomingDeadlines() {
  const [tasks, setTasks] = useState<CaseTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        setIsLoading(true);
        const response = await immigrationApi.getUpcomingDeadlines();
        if (response.success && response.data) {
          setTasks(response.data.slice(0, 5)); // Limit to 5
        }
      } catch (error) {
        console.error('Failed to fetch deadlines:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeadlines();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <CheckCircle className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">No upcoming deadlines</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Deadlines</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/immigration/tasks">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => {
            const days = getDaysRemaining(task.dueDate);
            const colors = getUrgencyColor(days);
            
            return (
              <div
                key={task.id}
                className={`border-l-4 ${colors.border} pl-4 py-2 rounded-r bg-white`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Case: {task.caseId.slice(0, 8)}...
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <Badge className={colors.pill}>
                    {days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days} days`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
