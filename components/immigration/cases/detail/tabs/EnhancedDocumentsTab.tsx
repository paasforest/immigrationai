'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { immigrationApi } from '@/lib/api/immigration';
import { caseDocumentsApi, type CaseDocumentChecklist, type CaseDocument } from '@/lib/api/caseDocuments';
import { Upload, FileText, Download, Trash2, File, Plus, CheckCircle, AlertCircle, Clock, Sparkles } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface DocumentsTabProps {
  caseId: string;
  onRefresh: () => void;
}

export default function DocumentsTab({ caseId, onRefresh }: DocumentsTabProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [checklist, setChecklist] = useState<CaseDocumentChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    name: '',
    category: '',
    notes: '',
    expiryDate: '',
  });
  const [generateForm, setGenerateForm] = useState({
    documentType: 'sop',
    motivation: '',
    academicBackground: '',
    workExperience: '',
    futureGoals: '',
  });

  const isAdminOrProfessional = user?.role === 'org_admin' || user?.role === 'professional';

  useEffect(() => {
    fetchDocuments();
    fetchChecklist();
  }, [caseId]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await caseDocumentsApi.getAllDocuments(caseId);
      if (response.success && response.data) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChecklist = async () => {
    try {
      const response = await caseDocumentsApi.getDocumentChecklist(caseId);
      if (response.success && response.data) {
        setChecklist(response.data.checklist);
      }
    } catch (error) {
      console.error('Failed to fetch checklist:', error);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('caseId', caseId);
      formData.append('name', uploadForm.name || uploadForm.file.name);
      formData.append('category', uploadForm.category);
      formData.append('notes', uploadForm.notes);
      if (uploadForm.expiryDate) {
        formData.append('expiryDate', uploadForm.expiryDate);
      }

      const response = await immigrationApi.uploadDocument(formData);
      if (response.success) {
        toast.success('Document uploaded successfully');
        setIsUploadDialogOpen(false);
        setUploadForm({ file: null, name: '', category: '', notes: '', expiryDate: '' });
        fetchDocuments();
        fetchChecklist();
        onRefresh();
      } else {
        toast.error(response.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const inputData = {
        fullName: generateForm.motivation ? generateForm.motivation.split(' ')[0] : 'Applicant',
        targetCountry: checklist?.destinationCountry || 'Unknown',
        purpose: 'Visa Application',
        motivation: generateForm.motivation,
        academicBackground: generateForm.academicBackground,
        workExperience: generateForm.workExperience,
        futureGoals: generateForm.futureGoals,
        caseId,
      };

      const response = await caseDocumentsApi.generateDocument({
        caseId,
        documentType: generateForm.documentType as 'sop' | 'cover_letter',
        inputData,
      });

      if (response.success) {
        toast.success(`${generateForm.documentType === 'sop' ? 'Statement of Purpose' : 'Cover Letter'} generated successfully`);
        setIsGenerateDialogOpen(false);
        setGenerateForm({
          documentType: 'sop',
          motivation: '',
          academicBackground: '',
          workExperience: '',
          futureGoals: '',
        });
        fetchDocuments();
        fetchChecklist();
        onRefresh();
      } else {
        toast.error(response.error || 'Failed to generate document');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const response = await immigrationApi.deleteDocument(documentId);
      if (response.success) {
        toast.success('Document deleted successfully');
        fetchDocuments();
        fetchChecklist();
        onRefresh();
      } else {
        toast.error(response.error || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const blob = await immigrationApi.downloadDocument(documentId);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download document');
    }
  };

  // Separate documents by category
  const clientDocuments = documents.filter(doc => doc.category === 'client');
  const systemDocuments = documents.filter(doc => doc.category === 'system');

  // Calculate completion percentage
  const totalRequired = checklist?.clientUploads.filter(doc => doc.required).length || 0;
  const completedRequired = clientDocuments.filter(doc => 
    checklist?.clientUploads.some(req => req.name === doc.name && req.required)
  ).length;
  const completionPercentage = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Generated Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      {checklist && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Document Progress
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                {Math.round(completionPercentage)}% Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercentage} className="w-full" />
            <p className="text-sm text-gray-600 mt-2">
              {completedRequired} of {totalRequired} required documents uploaded
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="client-docs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="client-docs">Client Documents ({clientDocuments.length})</TabsTrigger>
          <TabsTrigger value="generated-docs">Generated Documents ({systemDocuments.length})</TabsTrigger>
          <TabsTrigger value="checklist">Document Checklist</TabsTrigger>
        </TabsList>

        {/* Client Documents Tab */}
        <TabsContent value="client-docs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Client Uploads</CardTitle>
              {isAdminOrProfessional && (
                <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="file">Select File</Label>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] || null })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="name">Document Name</Label>
                        <Input
                          id="name"
                          value={uploadForm.name}
                          onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                          placeholder="e.g., Passport Copy"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={uploadForm.category} onValueChange={(value) => setUploadForm({ ...uploadForm, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="financial">Financial Documents</SelectItem>
                            <SelectItem value="academic">Academic Documents</SelectItem>
                            <SelectItem value="work">Work Documents</SelectItem>
                            <SelectItem value="medical">Medical Documents</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={uploadForm.notes}
                          onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                          placeholder="Any additional notes about this document"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={isUploading}>
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {clientDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No client documents uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {format(new Date(doc.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.id, doc.title || 'document')}>
                          <Download className="w-4 h-4" />
                        </Button>
                        {isAdminOrProfessional && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{doc.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(doc.id)}>
                                  Delete
                                </AlertDialogAction>
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

        {/* Generated Documents Tab */}
        <TabsContent value="generated-docs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                AI-Generated Documents
              </CardTitle>
              {isAdminOrProfessional && (
                <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Generate Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="documentType">Document Type</Label>
                        <Select value={generateForm.documentType} onValueChange={(value) => setGenerateForm({ ...generateForm, documentType: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sop">Statement of Purpose</SelectItem>
                            <SelectItem value="cover_letter">Cover Letter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="motivation">Motivation Statement</Label>
                        <Textarea
                          id="motivation"
                          value={generateForm.motivation}
                          onChange={(e) => setGenerateForm({ ...generateForm, motivation: e.target.value })}
                          placeholder="Why do you want to immigrate to this country?"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="academicBackground">Academic Background</Label>
                        <Textarea
                          id="academicBackground"
                          value={generateForm.academicBackground}
                          onChange={(e) => setGenerateForm({ ...generateForm, academicBackground: e.target.value })}
                          placeholder="Your educational qualifications and achievements"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="workExperience">Work Experience</Label>
                        <Textarea
                          id="workExperience"
                          value={generateForm.workExperience}
                          onChange={(e) => setGenerateForm({ ...generateForm, workExperience: e.target.value })}
                          placeholder="Your professional experience and skills"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="futureGoals">Future Goals</Label>
                        <Textarea
                          id="futureGoals"
                          value={generateForm.futureGoals}
                          onChange={(e) => setGenerateForm({ ...generateForm, futureGoals: e.target.value })}
                          placeholder="Your career goals and plans"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                          {isGenerating ? 'Generating...' : 'Generate'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {systemDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No AI-generated documents yet</p>
                  {isAdminOrProfessional && (
                    <p className="text-sm text-gray-500 mt-2">
                      Generate SOPs, cover letters, and other documents using AI
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {systemDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                      <div className="flex items-center space-x-3">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-gray-500">
                            Generated {format(new Date(doc.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">AI Generated</Badge>
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(doc.id, doc.title || 'document')}>
                          <Download className="w-4 h-4" />
                        </Button>
                        {isAdminOrProfessional && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{doc.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(doc.id)}>
                                  Delete
                                </AlertDialogAction>
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

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Uploads Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Client Uploads
                </CardTitle>
              </CardHeader>
              <CardContent>
                {checklist ? (
                  <div className="space-y-3">
                    {checklist.clientUploads.map((doc, index) => {
                      const isUploaded = clientDocuments.some(uploaded => uploaded.name === doc.name);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center space-x-2">
                            {isUploaded ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : doc.required ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-500" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {doc.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {isUploaded && (
                              <Badge variant="default" className="text-xs">
                                Uploaded
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Loading checklist...</p>
                )}
              </CardContent>
            </Card>

            {/* System Generated Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  System Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                {checklist ? (
                  <div className="space-y-3">
                    {checklist.systemGenerated.map((doc, index) => {
                      const isGenerated = systemDocuments.some(generated => generated.title === doc.name);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center space-x-2">
                            {isGenerated ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-500" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isGenerated ? (
                              <Badge variant="default" className="text-xs">
                                Generated
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Available
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">Loading checklist...</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Processing Time and Requirements */}
          {checklist && (
            <Card>
              <CardHeader>
                <CardTitle>Visa Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Processing Time</h4>
                    <p className="text-gray-600">{checklist.processingTime}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Key Requirements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {checklist.keyRequirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
