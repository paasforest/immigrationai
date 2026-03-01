'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';
import {
  Upload, FileText, Download, Trash2, CheckCircle2, Clock, AlertCircle,
  Package, Send, Eye, ShieldCheck, User, Briefcase, PackageCheck, Plus, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Doc {
  id: string;
  name: string;
  category: string | null;
  fileType: string | null;
  fileSize: bigint | null;
  status: string;
  uploadedByRole: string;
  isEmbassyPackage: boolean;
  notes: string | null;
  createdAt: string;
  uploadedBy: { id: string; fullName: string | null; email: string };
}

interface ChecklistItem {
  id: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  isCompleted: boolean;
  document: Doc | null;
}

interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}

interface Props {
  caseId: string;
  onRefresh: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.immigrationai.co.za/api';

export default function EnhancedDocumentsTab({ caseId, onRefresh }: Props) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSendingPackage, setIsSendingPackage] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadForChecklistItem, setUploadForChecklistItem] = useState<ChecklistItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadForm, setUploadForm] = useState({ file: null as File | null, name: '', notes: '' });

  const isPro = user?.role === 'org_admin' || user?.role === 'professional' || user?.role === 'staff';

  useEffect(() => { loadAll(); }, [caseId]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [docsRes, checkRes] = await Promise.all([
        apiClient.get<{ documents: Doc[] }>(`/case-documents/case/${caseId}`),
        apiClient.get<{ checklists: Checklist[] } | Checklist[]>(`/checklists/case/${caseId}`),
      ]);
      if (docsRes.success && docsRes.data) {
        const docsData = docsRes.data as { documents?: Doc[] };
        setDocuments(docsData.documents || []);
      }
      if (checkRes.success && checkRes.data) {
        const checkData = checkRes.data as { checklists?: Checklist[] } | Checklist[];
        if (Array.isArray(checkData)) {
          setChecklists(checkData);
        } else {
          setChecklists(checkData.checklists || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (checklistItemId?: string) => {
    if (!uploadForm.file) { toast.error('Please select a file'); return; }
    setIsUploading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('caseId', caseId);
      formData.append('name', uploadForm.name || uploadForm.file.name);
      formData.append('notes', uploadForm.notes);
      if (checklistItemId) formData.append('checklistItemId', checklistItemId);

      const res = await fetch(`${API_BASE}/case-documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Document uploaded');
        setUploadDialogOpen(false);
        setUploadForChecklistItem(null);
        setUploadForm({ file: null, name: '', notes: '' });
        loadAll();
        onRefresh();
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (e) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
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
      const a = document.createElement('a');
      a.href = url; a.download = fileName;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) { toast.error('Download failed'); }
  };

  const handleDelete = async (docId: string) => {
    try {
      const res = await apiClient.delete(`/case-documents/${docId}`);
      if (res.success) { toast.success('Deleted'); loadAll(); onRefresh(); }
      else toast.error(res.message || 'Delete failed');
    } catch (e) { toast.error('Delete failed'); }
  };

  const handleVerify = async (docId: string) => {
    try {
      const res = await apiClient.patch(`/case-documents/${docId}/verify`, {});
      if (res.success) { toast.success('Document verified ✅'); loadAll(); }
      else toast.error(res.message || 'Failed');
    } catch (e) { toast.error('Failed to verify'); }
  };

  const handleToggleEmbassy = async (docId: string, current: boolean) => {
    try {
      const res = await apiClient.patch(`/case-documents/${docId}/embassy-package`, {});
      if (res.success) {
        toast.success(current ? 'Removed from package' : 'Added to embassy package 📦');
        loadAll();
      } else toast.error(res.message || 'Failed');
    } catch (e) { toast.error('Failed'); }
  };

  const handleSendPackage = async () => {
    setIsSendingPackage(true);
    try {
      const res = await apiClient.post(`/case-documents/case/${caseId}/send-embassy-package`, {});
      if (res.success) {
        toast.success('📦 Embassy package sent to client!');
        loadAll();
      } else toast.error(res.message || 'Failed to send');
    } catch (e) { toast.error('Failed to send package'); }
    finally { setIsSendingPackage(false); }
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
      const a = document.createElement('a'); a.href = url;
      a.download = `embassy-package.zip`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) { toast.error('Download failed'); }
  };

  const clientDocs = documents.filter(d => d.uploadedByRole === 'client');
  const proDocs = documents.filter(d => d.uploadedByRole === 'professional');
  const embassyDocs = documents.filter(d => d.isEmbassyPackage);

  const allItems = checklists.flatMap(c => c.items);
  const completed = allItems.filter(i => i.isCompleted).length;
  const progress = allItems.length > 0 ? Math.round((completed / allItems.length) * 100) : 0;

  const openUploadDialog = (item?: ChecklistItem) => {
    setUploadForChecklistItem(item || null);
    setUploadForm({ file: null, name: item?.name || '', notes: '' });
    setUploadDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      {allItems.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Document Collection Progress</span>
              <Badge variant={progress === 100 ? 'default' : 'secondary'}>{progress}%</Badge>
            </div>
            <Progress value={progress} />
            <p className="text-xs text-gray-500 mt-1">{completed} of {allItems.length} items uploaded</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="checklist">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="checklist">📋 Checklist ({allItems.length})</TabsTrigger>
          <TabsTrigger value="client">👤 Client ({clientDocs.length})</TabsTrigger>
          <TabsTrigger value="professional">💼 Professional ({proDocs.length})</TabsTrigger>
          <TabsTrigger value="embassy">📦 Embassy Pkg ({embassyDocs.length})</TabsTrigger>
        </TabsList>

        {/* CHECKLIST TAB */}
        <TabsContent value="checklist" className="space-y-4 mt-4">
          {checklists.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No checklist yet. Add items or they will be auto-created when a case is accepted.</p>
              </CardContent>
            </Card>
          ) : (
            checklists.map(cl => (
              <Card key={cl.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{cl.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cl.items.map(item => (
                    <div key={item.id} className={`flex items-start justify-between p-3 rounded-lg border ${item.isCompleted ? 'bg-green-50 border-green-200' : item.isRequired ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {item.isCompleted
                          ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          : item.isRequired
                            ? <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            : <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        }
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                          {item.document && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-green-700 font-medium">📎 {item.document.name}</span>
                              <Badge variant={item.document.status === 'verified' ? 'default' : 'secondary'} className="text-xs">
                                {item.document.status === 'verified' ? '✅ Verified' : '⏳ Review'}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        {item.isRequired && !item.isCompleted && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        {item.document ? (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleDownload(item.document!.id, item.document!.name)}>
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            {isPro && item.document.status !== 'verified' && (
                              <Button size="sm" variant="ghost" className="text-green-600" onClick={() => handleVerify(item.document!.id)}>
                                <ShieldCheck className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ) : isPro ? (
                          <Button size="sm" variant="outline" onClick={() => openUploadDialog(item)}>
                            <Upload className="w-3 h-3 mr-1" /> Upload
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* CLIENT DOCS TAB */}
        <TabsContent value="client" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" /> Documents from Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clientDocs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No documents from client yet</p>
                  <p className="text-xs mt-1">Client will upload documents through their portal</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">{format(new Date(doc.createdAt), 'MMM d, yyyy HH:mm')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'} className="text-xs">
                          {doc.status === 'verified' ? '✅ Verified' : '⏳ Review'}
                        </Badge>
                        <Badge variant={doc.isEmbassyPackage ? 'default' : 'outline'} className="text-xs cursor-pointer"
                          onClick={() => isPro && handleToggleEmbassy(doc.id, doc.isEmbassyPackage)}>
                          {doc.isEmbassyPackage ? '📦 In Package' : '+ Package'}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(doc.id, doc.name)}>
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        {isPro && doc.status !== 'verified' && (
                          <Button size="sm" variant="ghost" className="text-green-600" title="Mark verified" onClick={() => handleVerify(doc.id)}>
                            <ShieldCheck className="w-3 h-3" />
                          </Button>
                        )}
                        {isPro && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="w-3 h-3" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete document?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete "{doc.name}".</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(doc.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFESSIONAL DOCS TAB */}
        <TabsContent value="professional" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Your Documents
              </CardTitle>
              {isPro && (
                <Button size="sm" onClick={() => openUploadDialog()}>
                  <Plus className="w-3 h-3 mr-1" /> Upload
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {proDocs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No professional documents yet</p>
                  {isPro && <p className="text-xs mt-1">Upload completed application forms, cover letters, assessments</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  {proDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">{format(new Date(doc.createdAt), 'MMM d, yyyy HH:mm')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={doc.isEmbassyPackage ? 'default' : 'outline'} className="text-xs cursor-pointer"
                          onClick={() => isPro && handleToggleEmbassy(doc.id, doc.isEmbassyPackage)}>
                          {doc.isEmbassyPackage ? '📦 In Package' : '+ Package'}
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(doc.id, doc.name)}>
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        {isPro && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="w-3 h-3" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete document?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete "{doc.name}".</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(doc.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMBASSY PACKAGE TAB */}
        <TabsContent value="embassy" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-4 h-4" /> Embassy Package
              </CardTitle>
              <p className="text-sm text-gray-500">
                Mark documents with "📦 Package" to include them. When ready, send the package to the client to download and take to the embassy.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {embassyDocs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <PackageCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No documents in embassy package yet</p>
                  <p className="text-xs mt-1">Click "📦 Package" on any document above to add it here</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {embassyDocs.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <PackageCheck className="w-4 h-4 text-blue-600 shrink-0" />
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-gray-500">
                              By {doc.uploadedByRole === 'client' ? '👤 Client' : '💼 Professional'} · {format(new Date(doc.createdAt), 'MMM d')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleDownload(doc.id, doc.name)}>
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          {isPro && (
                            <Button size="sm" variant="ghost" className="text-gray-400" onClick={() => handleToggleEmbassy(doc.id, true)}>
                              ✕
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isPro && (
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={handleDownloadZip} className="flex-1">
                        <Download className="w-4 h-4 mr-2" /> Download ZIP
                      </Button>
                      <Button onClick={handleSendPackage} disabled={isSendingPackage} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                        <Send className="w-4 h-4 mr-2" />
                        {isSendingPackage ? 'Sending...' : 'Send to Client'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {uploadForChecklistItem ? `Upload: ${uploadForChecklistItem.name}` : 'Upload Document'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>File (PDF, JPG, PNG, DOC, DOCX — max 10MB)</Label>
              <Input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={e => setUploadForm(f => ({ ...f, file: e.target.files?.[0] || null }))} />
            </div>
            <div>
              <Label>Document Name</Label>
              <Input value={uploadForm.name} placeholder="e.g. Bank Statement March 2026"
                onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea value={uploadForm.notes} placeholder="Any notes for this document"
                onChange={e => setUploadForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => handleUpload(uploadForChecklistItem?.id)} disabled={isUploading || !uploadForm.file}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
