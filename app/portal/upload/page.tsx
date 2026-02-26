'use client';

import React, { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import PortalDocumentUpload from '@/components/portal/PortalDocumentUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, FileCheck2, FolderOpen, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PortalUploadPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [documents, setDocuments] = useState<any[]>([]);
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDocsLoading, setIsDocsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      fetchDocumentsForCase(selectedCaseId);
    }
  }, [selectedCaseId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [dashboardRes, casesRes] = await Promise.all([
        immigrationApi.getApplicantDashboard(),
        immigrationApi.getCases(),
      ]);

      if (casesRes.success && casesRes.data?.data) {
        const activeCases = casesRes.data.data.filter(
          (c: any) => c.status !== 'closed' && c.status !== 'approved' && c.status !== 'refused'
        );
        setCases(activeCases);
        if (activeCases.length > 0) {
          setSelectedCaseId(activeCases[0].id);
        }
      }

      if (dashboardRes.success && dashboardRes.data?.pendingChecklistItems) {
        setPendingItems(dashboardRes.data.pendingChecklistItems);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load your cases');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentsForCase = async (caseId: string) => {
    try {
      setIsDocsLoading(true);
      const response = await immigrationApi.getDocumentsByCase(caseId);
      if (response.success && response.data) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsDocsLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!selectedCaseId) throw new Error('Please select a case first');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', selectedCaseId);
    formData.append('name', file.name);
    const response = await immigrationApi.uploadDocument(formData);
    if (!response.success) throw new Error(response.error || 'Upload failed');
    toast.success('Document uploaded successfully');
    fetchDocumentsForCase(selectedCaseId);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      approved: { label: 'Approved ✓', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected — re-upload needed', className: 'bg-red-100 text-red-800' },
      pending_review: { label: 'Under Review', className: 'bg-amber-100 text-amber-800' },
      expired: { label: 'Expired', className: 'bg-gray-100 text-gray-800' },
    };
    const entry = map[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={entry.className}>{entry.label}</Badge>;
  };

  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  const pendingForSelectedCase = pendingItems.filter(
    (item: any) => item.case?.id === selectedCaseId
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-1">Submit required documents for your cases</p>
        </div>
        <Card>
          <CardContent className="py-16 text-center">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No active cases</h3>
            <p className="text-gray-600 mb-4">
              Your consultant will create your case. Documents can be uploaded once a case is active.
            </p>
            <Button asChild variant="outline">
              <Link href="/portal">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
        <p className="text-gray-600 mt-1">Submit required documents for your cases</p>
      </div>

      {/* Case Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-gray-700 min-w-fit">Uploading for:</label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Select a case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="font-mono text-xs mr-2 text-gray-500">
                      {c.referenceNumber}
                    </span>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCase && (
              <Badge variant="outline">
                {selectedCase.status.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Documents Alert */}
      {pendingForSelectedCase.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-900 text-base">
              <Clock className="w-4 h-4" />
              {pendingForSelectedCase.length} document
              {pendingForSelectedCase.length > 1 ? 's' : ''} still needed for this case
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1">
              {pendingForSelectedCase.map((item: any) => (
                <li key={item.id} className="flex items-center gap-2 text-sm text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                  {item.name}
                  {item.checklistName && (
                    <span className="text-amber-600">({item.checklistName})</span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload a Document
          </CardTitle>
          <p className="text-sm text-gray-500">
            Accepted formats: PDF, Word (.doc/.docx), JPG, PNG — max 10MB
          </p>
        </CardHeader>
        <CardContent>
          <PortalDocumentUpload onUpload={handleUpload} />
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5" />
            Uploaded Documents
            {documents.length > 0 && (
              <Badge variant="outline" className="ml-auto">
                {documents.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isDocsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>No documents uploaded for this case yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {doc.category && (
                        <span className="capitalize mr-2">{doc.category}</span>
                      )}
                      Uploaded {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    {getStatusBadge(doc.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
