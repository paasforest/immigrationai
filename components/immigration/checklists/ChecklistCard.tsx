'use client';

import React, { useState } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Upload, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isRequired: boolean;
  isCompleted: boolean;
  documentId: string | null;
  document?: {
    id: string;
    name: string;
    fileUrl: string;
  } | null;
}

interface Checklist {
  id: string;
  name: string;
  visaType: string | null;
  completionPercentage: number;
  completedItems: number;
  totalItems: number;
  items: ChecklistItem[];
}

interface ChecklistCardProps {
  checklist: Checklist;
  caseId: string;
  onUpdate: () => void;
  onDelete?: () => void;
}

function extractCategory(description: string | null): string {
  if (!description) return 'other';
  if (description.startsWith('Category: ')) {
    return description.split('\n')[0].replace('Category: ', '').trim();
  }
  return 'other';
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    identity: 'bg-blue-100 text-blue-800',
    financial: 'bg-green-100 text-green-800',
    educational: 'bg-purple-100 text-purple-800',
    employment: 'bg-orange-100 text-orange-800',
    travel: 'bg-cyan-100 text-cyan-800',
    supporting: 'bg-gray-100 text-gray-800',
  };
  return colors[category] || colors.supporting;
}

export default function ChecklistCard({ checklist, caseId, onUpdate, onDelete }: ChecklistCardProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleToggleItem = async (itemId: string, currentStatus: boolean) => {
    try {
      setIsUpdating(itemId);
      const response = await immigrationApi.updateChecklistItem(itemId, {
        isCompleted: !currentStatus,
      });

      if (response.success) {
        toast.success('Checklist item updated');
        onUpdate();
      } else {
        toast.error(response.error || 'Failed to update item');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update item');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleLinkDocument = async (itemId: string, documentId: string) => {
    try {
      setIsUpdating(itemId);
      const response = await immigrationApi.updateChecklistItem(itemId, {
        documentId,
        isCompleted: true,
      });

      if (response.success) {
        toast.success('Document linked to checklist item');
        onUpdate();
      } else {
        toast.error(response.error || 'Failed to link document');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to link document');
    } finally {
      setIsUpdating(null);
    }
  };

  // Group items by category
  const itemsByCategory = checklist.items.reduce((acc, item) => {
    const category = extractCategory(item.description);
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Separate completed and incomplete items
  const incompleteItems: ChecklistItem[] = [];
  const completedItems: ChecklistItem[] = [];

  Object.values(itemsByCategory).forEach((items) => {
    items.forEach((item) => {
      if (item.isCompleted) {
        completedItems.push(item);
      } else {
        incompleteItems.push(item);
      }
    });
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {checklist.name}
              {checklist.visaType && (
                <Badge variant="outline">{checklist.visaType}</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Progress value={checklist.completionPercentage} className="w-32" />
                <span className="text-sm text-gray-600">
                  {checklist.completedItems}/{checklist.totalItems} items complete
                </span>
              </div>
            </div>
          </div>
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Checklist</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this checklist? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Incomplete Items */}
          {Object.entries(itemsByCategory)
            .filter(([category, items]) => items.some((item) => !item.isCompleted))
            .map(([category, items]) => {
              const incomplete = items.filter((item) => !item.isCompleted);
              if (incomplete.length === 0) return null;

              return (
                <div key={category}>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2 capitalize">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {incomplete.map((item) => {
                      const categoryColor = getCategoryColor(category);
                      
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={item.isCompleted}
                            onCheckedChange={() => handleToggleItem(item.id, item.isCompleted)}
                            disabled={isUpdating === item.id}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{item.name}</p>
                            {item.description && !item.description.startsWith('Category:') && (
                              <p className="text-xs text-gray-500 mt-1">
                                {item.description.replace(/^Category: \w+\n?/, '')}
                              </p>
                            )}
                          </div>
                          <Badge
                            variant={item.isRequired ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {item.isRequired ? 'Required' : 'Optional'}
                          </Badge>
                          {item.documentId && item.document ? (
                            <Link
                              href={`/dashboard/immigration/cases/${caseId}?tab=documents`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {item.document.name}
                            </Link>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Open document upload dialog - this will be handled by parent
                                window.location.href = `/dashboard/immigration/cases/${caseId}?tab=documents&uploadFor=${item.id}`;
                              }}
                            >
                              <Upload className="w-3 h-3 mr-1" />
                              Upload
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {/* Completed Items (collapsed at bottom) */}
          {completedItems.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-sm text-gray-500 mb-2">
                Completed ({completedItems.length})
              </h4>
              <div className="space-y-1">
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 text-sm text-gray-500 line-through"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="flex-1">{item.name}</span>
                    {item.document && (
                      <Link
                        href={`/dashboard/immigration/cases/${caseId}?tab=documents`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.document.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
