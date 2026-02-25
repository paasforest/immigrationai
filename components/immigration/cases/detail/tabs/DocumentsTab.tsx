'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { immigrationApi } from '@/lib/api/immigration';
import { CaseDocument } from '@/types/immigration';
import { Upload, FileText, Download, Trash2, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  pending_review: 'bg-gray-100 text-gray-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-orange-100 text-orange-800',
};

function getFileIcon(fileType: string | null): { icon: React.ReactNode; color: string } {
  if (!fileType) return { icon: <File className="w-5 h-5" />, color: 'text-gray-500' };
  
  if (fileType.includes('pdf')) {
    return { icon: <FileText className="w-5 h-5" />, color: 'text-red-500' };
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return { icon: <FileText className="w-5 h-5" />, color: 'text-blue-500' };
  } else if (fileType.includes('image')) {
    return { icon: <FileText className="w-5 h-5" />, color: 'text-green-500' };
  }
  return { icon: <File className="w-5 h-5" />, color: 'text-gray-500' };
}

function formatFileSize(size: string | null): string {
  if (!size) return 'Unknown';
  const bytes = parseInt(size);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface DocumentsTabProps {
  caseId: string;
  onRefresh: () => void;
}

export default function DocumentsTab({ caseId, onRefresh }: DocumentsTabProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    name: '',
    category: '',
    notes: '',
    expiryDate: '',
  });

  const isAdminOrProfessional = user?.role === 'org_admin' || user?.role === 'professional';

  useEffect(() => {
    fetchDocuments();
  }, [caseId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getDocumentsByCase(caseId);
      if (response.success && response.data) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed');
      return;
    }

    setUploadForm({
      ...uploadForm,
      file,
      name: file.name,
    });
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.error('Please select a file');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('caseId', caseId);
      formData.append('name', uploadForm.name);
      if (uploadForm.category) formData.append('category', uploadForm.category);
      if (uploadForm.notes) formData.append('notes', uploadForm.notes);
      if (uploadForm.expiryDate) formData.append('expiryDate', uploadForm.expiryDate);

      const response = await immigrationApi.uploadDocument(formData);
      
      if (response.success) {
        toast.success('Document uploaded successfully');
        setIsUploadDialogOpen(false);
        setUploadForm({ file: null, name: '', category: '', notes: '', expiryDate: '' });
        fetchDocuments();
        onRefresh();
      } else {
        toast.error(response.error || 'Failed to upload document');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (doc: CaseDocument) => {
    try {
      const blob = await immigrationApi.downloadDocument(doc.id);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const response = await immigrationApi.deleteDocument(documentId);
      if (response.success) {
        toast.success('Document deleted successfully');
        fetchDocuments();
        onRefresh();
      } else {
        toast.error(response.error || 'Failed to delete document');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
  };

  const groupedByCategory = documents.reduce((acc, doc) => {
    const category = doc.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, CaseDocument[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>File</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadForm.file ? uploadForm.file.name : 'Choose File'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>
              </div>

              <div>
                <Label>Document Name</Label>
                <Input
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="Enter document name"
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="identity">Identity</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="employment">Employment</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="supporting">Supporting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={uploadForm.notes}
                  onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                  placeholder="Add any notes..."
                  rows={3}
                />
              </div>

              <div>
                <Label>Expiry Date (Optional)</Label>
                <Input
                  type="date"
                  value={uploadForm.expiryDate}
                  onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={isUploading || !uploadForm.file}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {Object.entries(groupedByCategory).map(([category, docs]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {docs.map((doc) => {
                const fileIcon = getFileIcon(doc.fileType);
                const isExpired = doc.expiryDate && new Date(doc.expiryDate) < new Date();
                const isExpiringSoon = doc.expiryDate && 
                  new Date(doc.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={fileIcon.color}>{fileIcon.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={statusColors[doc.status] || statusColors.pending_review}>
                            {doc.status.replace('_', ' ')}
                          </Badge>
                          {doc.category && (
                            <Badge variant="outline">{doc.category}</Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                          </span>
                          {doc.expiryDate && (
                            <span className={`text-xs ${isExpired || isExpiringSoon ? 'text-red-600' : 'text-gray-500'}`}>
                              Expires: {format(new Date(doc.expiryDate), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                        {doc.notes && (
                          <p className="text-sm text-gray-600 mt-1">{doc.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      {isAdminOrProfessional && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Document</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this document? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(doc.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {documents.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4" />
            <p>No documents uploaded yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
