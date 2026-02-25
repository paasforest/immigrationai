'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Clock, FolderOpen, FileText, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { immigrationApi } from '@/lib/api/immigration';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  resourceType?: string;
  resourceId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead?: () => void;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  new_message: MessageSquare,
  task_due: Clock,
  case_update: FolderOpen,
  document_uploaded: FileText,
  deadline_approaching: AlertTriangle,
};

const typeColors: Record<string, string> = {
  new_message: 'text-blue-600',
  task_due: 'text-orange-600',
  case_update: 'text-[#0F2557]',
  document_uploaded: 'text-green-600',
  deadline_approaching: 'text-red-600',
};

export default function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const router = useRouter();
  const Icon = typeIcons[notification.type] || MessageSquare;
  const color = typeColors[notification.type] || 'text-gray-600';

  const handleClick = async () => {
    // Mark as read if unread
    if (!notification.isRead) {
      try {
        await immigrationApi.markNotificationRead(notification.id);
        onMarkRead?.();
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate to resource
    if (notification.resourceType && notification.resourceId) {
      if (notification.resourceType === 'case') {
        router.push(`/dashboard/immigration/cases/${notification.resourceId}`);
      } else if (notification.resourceType === 'task') {
        router.push(`/dashboard/immigration/tasks?task=${notification.resourceId}`);
      } else if (notification.resourceType === 'message') {
        router.push(`/dashboard/immigration/messages?message=${notification.resourceId}`);
      }
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50',
        !notification.isRead && 'bg-blue-50'
      )}
      onClick={handleClick}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
      )}
      {notification.isRead && <div className="w-2 flex-shrink-0" />}

      {/* Icon */}
      <div className={cn('flex-shrink-0', color)}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium truncate',
            !notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-gray-600 line-clamp-2 mt-1">{notification.body}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
