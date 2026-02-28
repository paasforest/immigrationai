'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { immigrationApi } from '@/lib/api/immigration';
import { ImmigrationCase } from '@/types/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Upload, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import PortalDocumentUpload from '@/components/portal/PortalDocumentUpload';
import MessagesTab from '@/components/immigration/cases/detail/tabs/MessagesTab';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const stages = [
  { id: 'created', labelKey: 'stage.created', icon: '📋' },
  { id: 'documents', labelKey: 'stage.documents', icon: '📁' },
  { id: 'submitted', labelKey: 'stage.submitted', icon: '✉️' },
  { id: 'decision', labelKey: 'stage.decision', icon: '⚖️' },
];

function getCurrentStage(status: string, outcome: string | null): string {
  if (outcome) return 'decision';
  if (status === 'submitted') return 'submitted';
  if (status === 'in_progress') return 'documents';
  return 'created';
}

export default function PortalCaseDetailPage() {
  const params = useParams();
  const caseId = params.id as string;
  const { t } = useLanguage();
  const [caseData, setCaseData] = useState<ImmigrationCase | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'documents' | 'messages'>('progress');

  useEffect(() => {
    fetchCase();
    fetchDocuments();
  }, [caseId]);

  const fetchCase = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getCaseById(caseId);
      if (response.success && response.data) {
        setCaseData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch case:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await immigrationApi.getDocumentsByCase(caseId);
      if (response.success && response.data) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('caseId', caseId);
      formData.append('name', file.name);

      const response = await immigrationApi.uploadDocument(formData);
      if (response.success) {
        await fetchDocuments();
        return Promise.resolve();
      } else {
        throw new Error(response.error || 'Upload failed');
      }
    } catch (error: any) {
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-600">{t('case.myCase')}</p>
          <Button asChild className="mt-4">
            <Link href="/portal">{t('ui.back')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentStage = getCurrentStage(caseData.status, caseData.outcome);
  const stageIndex = stages.findIndex((s) => s.id === currentStage);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/portal">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('ui.back')}
        </Link>
      </Button>

      {/* Case Header */}
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-2">{caseData.title}</h1>
          <p className="text-sm text-gray-500 font-mono mb-4">{caseData.referenceNumber}</p>
          <div className="flex flex-wrap gap-2">
            <Badge>{caseData.visaType || 'N/A'}</Badge>
            <Badge variant="outline">{caseData.status.replace('_', ' ')}</Badge>
            {caseData.assignedProfessional && (
              <Badge variant="secondary">
                Consultant: {caseData.assignedProfessional.fullName}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === 'progress'
                ? 'border-[#0F2557] text-[#0F2557] font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('portal.appProgress')}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === 'documents'
                ? 'border-[#0F2557] text-[#0F2557] font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('case.documents')}
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === 'messages'
                ? 'border-[#0F2557] text-[#0F2557] font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('case.messages')}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'progress' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('portal.appProgress')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Timeline */}
              <div className="relative">
                {stages.map((stage, idx) => {
                  const isCompleted = idx < stageIndex;
                  const isCurrent = idx === stageIndex;

                  return (
                    <div key={stage.id} className="flex items-start gap-4 mb-6 last:mb-0">
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                          isCompleted
                            ? 'bg-green-600 text-white'
                            : isCurrent
                            ? 'bg-[#0F2557] text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? '✓' : stage.icon}
                      </div>
                      <div className="flex-1 pt-2">
                        <p
                          className={`font-semibold ${
                            isCompleted
                              ? 'text-green-600'
                              : isCurrent
                              ? 'text-[#0F2557]'
                              : 'text-gray-400'
                          }`}
                        >
                          {t(stage.labelKey)}
                        </p>
                        {isCurrent && (
                          <p className="text-sm text-gray-600 mt-1">{t('stage.current')}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>{t('case.uploadDoc')}</CardTitle>
            </CardHeader>
            <CardContent>
              <PortalDocumentUpload onUpload={handleDocumentUpload} />
            </CardContent>
          </Card>

          {/* My Documents */}
          <Card>
            <CardHeader>
              <CardTitle>{t('case.documents')}</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-4" />
                  <p>{t('portal.noCasesBody')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">
                          {doc.category} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge
                        variant={
                          doc.status === 'approved'
                            ? 'default'
                            : doc.status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {doc.status === 'approved'
                          ? t('status.approved') + ' ✓'
                          : doc.status === 'rejected'
                          ? t('status.rejected')
                          : t('doc.required')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'messages' && (
        <Card>
          <CardContent className="p-0">
            <MessagesTab caseId={caseId} />
          </CardContent>
        </Card>
      )}

      {/* Case Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t('case.myCase')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">{t('case.status')}</p>
              <p className="font-medium">{caseData.visaType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">{t('intake.destination')}</p>
              <p className="font-medium">{caseData.destinationCountry || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">{t('portal.specialist')}</p>
              <p className="font-medium">
                {caseData.assignedProfessional?.fullName || t('portal.noCasesTitle')}
              </p>
            </div>
            <div>
              <p className="text-gray-600">{t('portal.timeline')}</p>
              <p className="font-medium">
                {caseData.submissionDeadline
                  ? format(new Date(caseData.submissionDeadline), 'MMM d, yyyy')
                  : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
