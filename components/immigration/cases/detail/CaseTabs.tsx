'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ImmigrationCase } from '@/types/immigration';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './tabs/OverviewTab';
import EnhancedDocumentsTab from './tabs/EnhancedDocumentsTab';
import TasksTab from './tabs/TasksTab';
import MessagesTab from './tabs/MessagesTab';
import ChecklistTab from './tabs/ChecklistTab';
import DocumentStudioTab from './tabs/DocumentStudioTab';

interface CaseTabsProps {
  caseData: ImmigrationCase;
  caseId: string;
  onRefresh: () => void;
}

export default function CaseTabs({ caseData, caseId, onRefresh }: CaseTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`?${params.toString()}`);
  };

  const documentsCount = caseData._count?.caseDocuments || 0;
  const tasksCount = caseData._count?.tasks || 0;
  const messagesCount = caseData._count?.messages || 0;

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="documents">
          Documents {documentsCount > 0 && `(${documentsCount})`}
        </TabsTrigger>
        <TabsTrigger value="tasks">
          Tasks {tasksCount > 0 && `(${tasksCount})`}
        </TabsTrigger>
        <TabsTrigger value="messages">
          Messages {messagesCount > 0 && `(${messagesCount})`}
        </TabsTrigger>
        <TabsTrigger value="checklist">Checklist</TabsTrigger>
        <TabsTrigger value="studio" className="flex items-center gap-1">
          ✨ Studio
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <OverviewTab caseData={caseData} />
      </TabsContent>

      <TabsContent value="documents" className="mt-6">
        <EnhancedDocumentsTab caseId={caseId} onRefresh={onRefresh} />
      </TabsContent>

      <TabsContent value="tasks" className="mt-6">
        <TasksTab caseId={caseId} onRefresh={onRefresh} />
      </TabsContent>

      <TabsContent value="messages" className="mt-6">
        <MessagesTab caseId={caseId} />
      </TabsContent>

      <TabsContent value="checklist" className="mt-6">
        <ChecklistTab caseId={caseId} onRefresh={onRefresh} />
      </TabsContent>

      <TabsContent value="studio" className="mt-6">
        <DocumentStudioTab caseData={caseData} caseId={caseId} onRefresh={onRefresh} />
      </TabsContent>
    </Tabs>
  );
}
