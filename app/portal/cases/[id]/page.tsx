'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { immigrationApi } from '@/lib/api/immigration';
import { apiClient } from '@/lib/api/client';
import { ImmigrationCase } from '@/types/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Upload, CheckCircle2, AlertCircle, Clock, Download, FileText, Package, PackageCheck } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import MessagesTab from '@/components/immigration/cases/detail/tabs/MessagesTab';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.immigrationai.co.za/api';

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
  const [checklists, setChecklists] = useState<any[]>([]);
  const [embassyDocs, setEmbassyDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'documents' | 'messages'>('progress');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadItem, setUploadItem] = useState<any | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadAll(); }, [caseId]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [caseRes, docsRes, checkRes, embassyRes] = await Promise.all([
        immigrationApi.getCaseById(caseId),
        apiClient.get(`/case-documents/case/${caseId}`),
        apiClient.get(`/checklists/case/${caseId}`),
        apiClient.get(`/case-documents/case/${caseId}/embassy-package`),
      ]);
      if (caseRes.success && caseRes.data) setCaseData(caseRes.data);
      if (docsRes.success && docsRes.data) {
        const docsData = docsRes.data as unknown as { documents?: any[] };
        setDocuments(docsData.documents || []);
      }
      if (checkRes.success && checkRes.data) {
        const checkData = checkRes.data as unknown as { checklists?: any[] } | any[];
        if (Array.isArray(checkData)) {
          setChecklists(checkData);
        } else {
          setChecklists((checkData as { checklists?: any[] }).checklists || []);
        }
      }
      if (embassyRes.success && embassyRes.data) {
        const embassyData = embassyRes.data as unknown as { documents?: any[] };
        setEmbassyDocs(embassyData.documents || []);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const openUpload = (item?: any) => {
    setUploadItem(item || null);
    setUploadFile(null);
    setUploadDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!uploadFile) { toast.error('Please select a file'); return; }
    setIsUploading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('caseId', caseId);
      formData.append('name', uploadItem?.name || uploadFile.name);
      if (uploadItem?.id) formData.append('checklistItemId', uploadItem.id);

      const res = await fetch(`${API_BASE}/case-documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Document uploaded ✅');
        setUploadDialogOpen(false);
        loadAll();
      } else toast.error(data.message || 'Upload failed');
    } catch (e) { toast.error('Upload failed'); }
    finally { setIsUploading(false); }
  };

  const handleDownload = async (docId: string, fileName: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/case-documents/${docId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { toast.error('Download failed'); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) { toast.error('Download failed'); }
  };

  const handleDownloadZip = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/case-documents/case/${caseId}/embassy-package/zip`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { toast.error('ZIP download failed'); return; }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'embassy-package.zip';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) { toast.error('Download failed'); }
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

          {/* Embassy Package — shown when professional has sent it */}
          {embassyDocs.length > 0 && (
            <Card className="border-green-300 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-green-800">
                  <PackageCheck className="w-5 h-5" /> Your Embassy Documents Are Ready!
                </CardTitle>
                <p className="text-sm text-green-700">
                  Your specialist has prepared {embassyDocs.length} document(s) for you to take to the embassy.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {embassyDocs.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{doc.name}</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(doc.id, doc.name)}>
                      <Download className="w-3 h-3 mr-1" /> Download
                    </Button>
                  </div>
                ))}
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleDownloadZip}>
                  <Download className="w-4 h-4 mr-2" /> Download All as ZIP
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Checklist — what the specialist needs from you */}
          {checklists.length > 0 && checklists.map((cl: any) => {
            const items = cl.items || [];
            const done = items.filter((i: any) => i.isCompleted).length;
            const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0;
            return (
              <Card key={cl.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>📋 Documents Required from You</span>
                    <Badge variant={pct === 100 ? 'default' : 'secondary'}>{pct}%</Badge>
                  </CardTitle>
                  <Progress value={pct} className="mt-1" />
                  <p className="text-xs text-gray-500 mt-1">{done} of {items.length} uploaded</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {items.map((item: any) => (
                    <div key={item.id} className={`flex items-start justify-between p-3 rounded-lg border ${item.isCompleted ? 'bg-green-50 border-green-200' : item.isRequired ? 'bg-red-50 border-red-100' : 'bg-gray-50'}`}>
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        {item.isCompleted
                          ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          : item.isRequired
                            ? <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            : <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
                          {item.document && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-green-700">📎 {item.document.name}</span>
                              <Badge variant={item.document.status === 'verified' ? 'default' : 'secondary'} className="text-xs">
                                {item.document.status === 'verified' ? '✅ Verified' : '⏳ Under Review'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 shrink-0 flex items-center gap-2">
                        {item.isRequired && !item.isCompleted && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        {item.isCompleted && item.document ? (
                          <Button size="sm" variant="ghost" onClick={() => handleDownload(item.document.id, item.document.name)}>
                            <Download className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => openUpload(item)}>
                            <Upload className="w-3 h-3 mr-1" /> Upload
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          {/* Documents from your specialist */}
          {documents.filter((d: any) => d.uploadedByRole === 'professional').length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">💼 Documents from Your Specialist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {documents.filter((d: any) => d.uploadedByRole === 'professional').map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">{format(new Date(doc.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleDownload(doc.id, doc.name)}>
                      <Download className="w-3 h-3 mr-1" /> Download
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upload a document (not tied to checklist item) */}
          <Card>
            <CardContent className="pt-4">
              <Button variant="outline" className="w-full" onClick={() => openUpload()}>
                <Upload className="w-4 h-4 mr-2" /> Upload Additional Document
              </Button>
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

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{uploadItem ? `Upload: ${uploadItem.name}` : 'Upload Document'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>File (PDF, JPG, PNG, DOC — max 10MB)</Label>
              <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={e => setUploadFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={isUploading || !uploadFile}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
