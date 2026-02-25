'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Download, Eye, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  category: string;
  status: string;
  expiryDate: string | null;
  createdAt: string;
  case: {
    id: string;
    referenceNumber: string;
    title: string;
  };
}

function getCategoryBadge(category: string) {
  const colors: Record<string, string> = {
    identity: 'bg-blue-100 text-blue-800',
    financial: 'bg-green-100 text-green-800',
    educational: 'bg-purple-100 text-purple-800',
    employment: 'bg-orange-100 text-orange-800',
    travel: 'bg-cyan-100 text-cyan-800',
    supporting: 'bg-gray-100 text-gray-800',
  };
  return (
    <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
}

function getStatusBadge(status: string) {
  const colors: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    pending_review: 'bg-amber-100 text-amber-800',
    expired: 'bg-gray-100 text-gray-800',
  };
  return (
    <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
      {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
    </Badge>
  );
}

function getExpiryColor(expiryDate: string | null): string {
  if (!expiryDate) return 'text-gray-600';
  const days = Math.ceil(
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return 'text-red-600 font-semibold';
  if (days <= 30) return 'text-amber-600 font-semibold';
  return 'text-gray-600';
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    expiringSoon: false,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchDocuments();
  }, [filters, pagination.page]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.expiringSoon) params.expiringWithin = 30;

      const response = await immigrationApi.getAllDocuments(params);
      if (response.success && response.data) {
        setDocuments(response.data.documents);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const blob = await immigrationApi.downloadDocument(documentId);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document-${documentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      toast.error('Failed to download document');
    }
  };

  const expiringSoon = documents.filter((doc) => {
    if (!doc.expiryDate) return false;
    const days = Math.ceil(
      (new Date(doc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return days <= 30 && days >= 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Manage all documents across your cases</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {pagination.total} documents
        </Badge>
      </div>

      {/* Expiring Soon Section */}
      {expiringSoon.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-5 h-5" />
              {expiringSoon.length} documents expiring soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.slice(0, 5).map((doc) => {
                const days = Math.ceil(
                  (new Date(doc.expiryDate!).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 bg-white rounded border border-amber-200"
                  >
                    <div>
                      <span className="font-medium">{doc.name}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        {doc.case.referenceNumber}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-amber-700 font-semibold">
                        {days} days remaining
                      </span>
                      <span className="text-gray-600 ml-2">
                        Expires: {format(new Date(doc.expiryDate!), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="identity">Identity</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="employment">Employment</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="supporting">Supporting</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Switch
                checked={filters.expiringSoon}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, expiringSoon: checked })
                }
              />
              <Label>Expiring Soon (30 days)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading documents...
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/immigration/cases/${doc.case.id}`}
                        className="text-[#0F2557] hover:underline flex items-center gap-1"
                      >
                        {doc.case.referenceNumber}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell className={getExpiryColor(doc.expiryDate)}>
                      {doc.expiryDate
                        ? format(new Date(doc.expiryDate), 'MMM d, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(doc.id)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/dashboard/immigration/cases/${doc.case.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
