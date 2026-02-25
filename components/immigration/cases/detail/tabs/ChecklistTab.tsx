'use client';

import React, { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ChecklistCard from '@/components/immigration/checklists/ChecklistCard';
import CreateChecklistDialog from '@/components/immigration/checklists/CreateChecklistDialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ChecklistTabProps {
  caseId: string;
  onRefresh: () => void;
}

export default function ChecklistTab({ caseId, onRefresh }: ChecklistTabProps) {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.role === 'org_admin';

  useEffect(() => {
    fetchChecklists();
  }, [caseId]);

  const fetchChecklists = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getChecklistsByCase(caseId);
      if (response.success && response.data) {
        setChecklists(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch checklists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (checklistId: string) => {
    try {
      const response = await immigrationApi.deleteChecklist(checklistId);
      if (response.success) {
        toast.success('Checklist deleted successfully');
        fetchChecklists();
        onRefresh();
      } else {
        toast.error(response.error || 'Failed to delete checklist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete checklist');
    }
  };

  // Calculate overall completion
  const totalItems = checklists.reduce((sum, c) => sum + c.totalItems, 0);
  const completedItems = checklists.reduce((sum, c) => sum + c.completedItems, 0);
  const overallCompletion = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      {checklists.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Overall Progress</h3>
                <p className="text-sm text-gray-600">
                  {completedItems} of {totalItems} items completed across all checklists
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#0F2557]">{overallCompletion}%</p>
                <p className="text-xs text-gray-500">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Checklist Button */}
      <div className="flex justify-end">
        <CreateChecklistDialog caseId={caseId} onSuccess={fetchChecklists} />
      </div>

      {/* Checklists */}
      {checklists.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <ClipboardList className="w-16 h-16 mb-4" />
              <p className="text-xl font-medium mb-2">No checklists yet</p>
              <Button onClick={() => {}} variant="outline" className="mt-4">
                Create your first checklist
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {checklists.map((checklist) => (
            <ChecklistCard
              key={checklist.id}
              checklist={checklist}
              caseId={caseId}
              onUpdate={fetchChecklists}
              onDelete={isAdmin ? () => handleDelete(checklist.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
