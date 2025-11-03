'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Search,
  Calendar,
  Filter,
  ArrowLeft,
  Loader2,
  FileCheck,
  Mail,
  Plane,
  DollarSign,
  Target,
  Heart,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Document {
  id: string;
  type: string;
  title: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const documentTypeConfig: Record<string, { icon: any; label: string; color: string }> = {
  sop: { icon: FileText, label: 'Statement of Purpose', color: 'bg-blue-100 text-blue-800' },
  cover_letter: { icon: FileCheck, label: 'Cover Letter', color: 'bg-green-100 text-green-800' },
  review: { icon: Eye, label: 'SOP Review', color: 'bg-purple-100 text-purple-800' },
  email: { icon: Mail, label: 'Email Template', color: 'bg-cyan-100 text-cyan-800' },
  support_letter: { icon: FileCheck, label: 'Support Letter', color: 'bg-violet-100 text-violet-800' },
  travel_history: { icon: Plane, label: 'Travel History', color: 'bg-sky-100 text-sky-800' },
  financial_letter: { icon: DollarSign, label: 'Financial Letter', color: 'bg-emerald-100 text-emerald-800' },
  purpose_of_visit: { icon: Target, label: 'Purpose of Visit', color: 'bg-rose-100 text-rose-800' },
  relationship_proof: { icon: Heart, label: 'Relationship Proof', color: 'bg-pink-100 text-pink-800' },
};

export default function DocumentLibraryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [docContent, setDocContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    } else {
      fetchDocuments();
    }
  }, [user, page]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/documents?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDocuments(data.data.documents || []);
          setTotal(data.data.total || 0);
          setTotalPages(data.data.totalPages || 1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentContent = async (docId: string) => {
    try {
      setLoadingContent(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/documents/${docId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.document) {
          setDocContent(data.data.document.generated_output || 'No content available');
        }
      }
    } catch (error) {
      console.error('Failed to fetch document content:', error);
      setDocContent('Failed to load document content');
    } finally {
      setLoadingContent(false);
    }
  };

  const handleViewDocument = async (doc: Document) => {
    setSelectedDoc(doc);
    setShowViewModal(true);
    await fetchDocumentContent(doc.id);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(docId);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove from list
        setDocuments(docs => docs.filter(d => d.id !== docId));
        setTotal(t => t - 1);
        alert('Document deleted successfully');
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (doc: Document) => {
    if (!docContent) return;
    
    const blob = new Blob([docContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title || doc.type}_${new Date(doc.created_at).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      (doc.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getDocumentIcon = (type: string) => {
    const config = documentTypeConfig[type] || documentTypeConfig.sop;
    const Icon = config.icon;
    return <Icon className="w-5 h-5" />;
  };

  const getDocumentLabel = (type: string) => {
    return documentTypeConfig[type]?.label || type;
  };

  const getDocumentColor = (type: string) => {
    return documentTypeConfig[type]?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Library</h1>
              <p className="text-gray-600">
                View, download, and manage all your generated documents
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-3xl font-bold text-blue-600">{total}</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="sop">SOPs</option>
                  <option value="cover_letter">Cover Letters</option>
                  <option value="review">Reviews</option>
                  <option value="email">Emails</option>
                  <option value="support_letter">Support Letters</option>
                  <option value="travel_history">Travel History</option>
                  <option value="financial_letter">Financial Letters</option>
                  <option value="purpose_of_visit">Purpose of Visit</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Documents Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Start creating documents to see them here'}
              </p>
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg ${getDocumentColor(doc.type)} flex items-center justify-center`}>
                        {getDocumentIcon(doc.type)}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {doc.title || getDocumentLabel(doc.type)}
                          </h3>
                          <Badge className={getDocumentColor(doc.type)}>
                            {getDocumentLabel(doc.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(doc.created_at)}
                          </span>
                          <span className="capitalize">{doc.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {selectedDoc.title || getDocumentLabel(selectedDoc.type)}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Created on {formatDate(selectedDoc.created_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(selectedDoc)}
                    disabled={!docContent || loadingContent}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedDoc(null);
                      setDocContent('');
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6">
              {loadingContent ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {docContent}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

