'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download, 
  Trash2,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Clock,
  Zap,
  Users,
  Globe,
  Target
} from 'lucide-react';

interface BulkDocument {
  id: string;
  fileName: string;
  type: 'visa_eligibility' | 'sop' | 'support_letter' | 'financial_letter' | 'travel_history' | 'purpose_visit';
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: any;
  error?: string;
  processingTime?: number;
  clientName?: string;
  country?: string;
  visaType?: string;
}

interface BulkJob {
  id: string;
  name: string;
  totalDocuments: number;
  completedDocuments: number;
  status: 'pending' | 'running' | 'completed' | 'paused' | 'error';
  createdAt: string;
  completedAt?: string;
  documents: BulkDocument[];
}

export default function BulkProcessing() {
  const [bulkJobs, setBulkJobs] = useState<BulkJob[]>([]);
  const [currentJob, setCurrentJob] = useState<BulkJob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('visa_eligibility');

  // Mock data for demonstration
  const mockJobs: BulkJob[] = [
    {
      id: '1',
      name: 'Student Visa Applications - October 2024',
      totalDocuments: 25,
      completedDocuments: 25,
      status: 'completed',
      createdAt: '2024-10-15T09:00:00Z',
      completedAt: '2024-10-15T11:30:00Z',
      documents: [
        {
          id: '1-1',
          fileName: 'student_visa_001.pdf',
          type: 'visa_eligibility',
          status: 'completed',
          progress: 100,
          processingTime: 2.3,
          clientName: 'John Smith',
          country: 'Canada',
          visaType: 'Study Permit'
        },
        {
          id: '1-2',
          fileName: 'student_visa_002.pdf',
          type: 'sop',
          status: 'completed',
          progress: 100,
          processingTime: 1.8,
          clientName: 'Sarah Johnson',
          country: 'USA',
          visaType: 'F1 Student'
        }
      ]
    },
    {
      id: '2',
      name: 'Family Reunion Applications',
      totalDocuments: 15,
      completedDocuments: 8,
      status: 'running',
      createdAt: '2024-10-17T14:00:00Z',
      documents: [
        {
          id: '2-1',
          fileName: 'family_visa_001.pdf',
          type: 'support_letter',
          status: 'completed',
          progress: 100,
          processingTime: 1.5,
          clientName: 'Mike Wilson',
          country: 'UK',
          visaType: 'Family Visa'
        },
        {
          id: '2-2',
          fileName: 'family_visa_002.pdf',
          type: 'support_letter',
          status: 'processing',
          progress: 65,
          clientName: 'Lisa Brown',
          country: 'Australia',
          visaType: 'Partner Visa'
        }
      ]
    }
  ];

  const documentTypes = [
    { id: 'visa_eligibility', name: 'Visa Eligibility Check', icon: Target, color: 'blue' },
    { id: 'sop', name: 'Statement of Purpose', icon: FileText, color: 'green' },
    { id: 'support_letter', name: 'Support Letter', icon: Users, color: 'purple' },
    { id: 'financial_letter', name: 'Financial Letter', icon: Globe, color: 'orange' },
    { id: 'travel_history', name: 'Travel History', icon: Clock, color: 'pink' },
    { id: 'purpose_visit', name: 'Purpose of Visit', icon: Zap, color: 'indigo' }
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      createBulkJob(files);
    }
  }, []);

  const createBulkJob = (files: File[]) => {
    const newJob: BulkJob = {
      id: Date.now().toString(),
      name: `Bulk Processing - ${new Date().toLocaleDateString()}`,
      totalDocuments: files.length,
      completedDocuments: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      documents: files.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        fileName: file.name,
        type: selectedTemplate as BulkDocument['type'],
        status: 'pending',
        progress: 0,
        clientName: `Client ${index + 1}`,
        country: 'Canada',
        visaType: 'Study Permit'
      }))
    };

    setBulkJobs([newJob, ...bulkJobs]);
    setCurrentJob(newJob);
  };

  const startProcessing = async (jobId: string) => {
    setIsProcessing(true);
    const job = bulkJobs.find(j => j.id === jobId);
    if (!job) return;

    setCurrentJob(job);
    
    // Simulate processing
    for (let i = 0; i < job.documents.length; i++) {
      const doc = job.documents[i];
      
      // Update document status to processing
      setBulkJobs(prev => prev.map(j => 
        j.id === jobId 
          ? {
              ...j,
              documents: j.documents.map(d => 
                d.id === doc.id 
                  ? { ...d, status: 'processing', progress: 0 }
                  : d
              )
            }
          : j
      ));

      // Simulate processing progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setBulkJobs(prev => prev.map(j => 
          j.id === jobId 
            ? {
                ...j,
                documents: j.documents.map(d => 
                  d.id === doc.id 
                    ? { ...d, progress }
                    : d
                )
              }
            : j
        ));
      }

      // Mark as completed
      setBulkJobs(prev => prev.map(j => 
        j.id === jobId 
          ? {
              ...j,
              documents: j.documents.map(d => 
                d.id === doc.id 
                  ? { 
                      ...d, 
                      status: 'completed', 
                      progress: 100,
                      processingTime: Math.random() * 3 + 1
                    }
                  : d
              ),
              completedDocuments: j.completedDocuments + 1
            }
          : j
      ));
    }

    // Mark job as completed
    setBulkJobs(prev => prev.map(j => 
      j.id === jobId 
        ? { ...j, status: 'completed', completedAt: new Date().toISOString() }
        : j
    ));

    setIsProcessing(false);
  };

  const pauseProcessing = (jobId: string) => {
    setBulkJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, status: 'paused' } : j
    ));
    setIsProcessing(false);
  };

  const deleteJob = (jobId: string) => {
    setBulkJobs(prev => prev.filter(j => j.id !== jobId));
    if (currentJob?.id === jobId) {
      setCurrentJob(null);
    }
  };

  const getStatusBadge = (status: BulkJob['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800"><Play className="w-3 h-3 mr-1" />Running</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'paused':
        return <Badge className="bg-orange-100 text-orange-800"><Pause className="w-3 h-3 mr-1" />Paused</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    }
  };

  const getDocumentStatusIcon = (status: BulkDocument['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Document Processing</h1>
          <p className="text-gray-600 mt-2">Process multiple documents efficiently for high-volume operations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {documentTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => setSelectedTemplate(type.id)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedTemplate === type.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mx-auto mb-1 text-${type.color}-500`} />
                          <span className="text-xs font-medium">{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supports PDF, DOC, DOCX files up to 25MB each
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Select Files
                  </Button>
                </div>

                {/* Processing Stats */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Processing Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Jobs:</span>
                      <span className="font-medium">{bulkJobs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Documents Processed:</span>
                      <span className="font-medium">
                        {bulkJobs.reduce((sum, job) => sum + job.completedDocuments, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium text-green-600">94.2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Processing Jobs
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentJob(null)}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear Selection
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bulkJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No processing jobs yet</p>
                    <p className="text-gray-400 text-sm">Upload some documents to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bulkJobs.map((job) => (
                      <div
                        key={job.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          currentJob?.id === job.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setCurrentJob(job)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-gray-900">{job.name}</h3>
                            <p className="text-sm text-gray-500">
                              {job.completedDocuments} of {job.totalDocuments} documents completed
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(job.status)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteJob(job.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{Math.round((job.completedDocuments / job.totalDocuments) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(job.completedDocuments / job.totalDocuments) * 100} 
                            className="h-2"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex space-x-4 text-sm text-gray-500">
                            <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
                            {job.completedAt && (
                              <span>Completed: {new Date(job.completedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {job.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startProcessing(job.id);
                                }}
                                disabled={isProcessing}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Start
                              </Button>
                            )}
                            {job.status === 'running' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  pauseProcessing(job.id);
                                }}
                              >
                                <Pause className="w-4 h-4 mr-1" />
                                Pause
                              </Button>
                            )}
                            {job.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Download results
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Document Details */}
        {currentJob && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Job Details: {currentJob.name}</span>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(currentJob.status)}
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Document</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Country</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Progress</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentJob.documents.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            {getDocumentStatusIcon(doc.status)}
                            <span className="font-medium">{doc.fileName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{doc.clientName}</td>
                        <td className="py-3 px-4">{doc.country}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            className={
                              doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                              doc.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              doc.status === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }
                          >
                            {doc.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-24">
                            <Progress value={doc.progress} className="h-2" />
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {doc.processingTime ? `${doc.processingTime.toFixed(1)}s` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {doc.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


