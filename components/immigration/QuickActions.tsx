'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Upload, CheckSquare, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const actions = [
  {
    href: '/dashboard/immigration/cases/new',
    label: 'New Case',
    icon: Plus,
  },
  {
    href: '/dashboard/immigration/documents',
    label: 'Upload Document',
    icon: Upload,
  },
  {
    href: '/dashboard/immigration/tasks',
    label: 'Add Task',
    icon: CheckSquare,
  },
  {
    href: '/dashboard/immigration/messages',
    label: 'Messages',
    icon: MessageSquare,
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        
        return (
          <Link key={action.href} href={action.href}>
            <Card className="bg-[#0F2557] text-white hover:bg-amber-600 transition-colors cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center min-h-[120px]">
                <Icon className="w-8 h-8 mb-3" />
                <p className="font-semibold">{action.label}</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
