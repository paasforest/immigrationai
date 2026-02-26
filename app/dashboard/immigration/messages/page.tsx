'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { immigrationApi } from '@/lib/api/immigration';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import MessagesTab from '@/components/immigration/cases/detail/tabs/MessagesTab';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Case {
  id: string;
  referenceNumber: string;
  title: string;
  updatedAt: string;
  applicant?: { id: string; fullName: string; email: string } | null;
  _count?: { messages: number };
  lastMessage?: { content: string; createdAt: string } | null;
}

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const applicantIdFilter = searchParams.get('applicantId');

  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getCases();
      if (response.success && response.data?.data) {
        let casesData: Case[] = response.data.data;

        // Load last message for cases that have messages (up to 20 cases)
        const casesWithMessages = casesData.filter((c) => (c._count?.messages || 0) > 0);
        const previewPromises = casesWithMessages.slice(0, 20).map(async (c) => {
          try {
            const msgResponse = await immigrationApi.getMessagesByCase(c.id, 1);
            if (msgResponse.success && msgResponse.data?.data?.length) {
              const msgs = msgResponse.data.data;
              // The API returns paginated data; grab the most recent one
              const latest = msgs[msgs.length - 1];
              return { caseId: c.id, message: latest };
            }
          } catch {
            // Silently fail for individual preview loads
          }
          return null;
        });

        const previews = await Promise.all(previewPromises);
        const previewMap: Record<string, { content: string; createdAt: string }> = {};
        previews.forEach((p) => {
          if (p) previewMap[p.caseId] = p.message;
        });

        casesData = casesData.map((c) => ({
          ...c,
          lastMessage: previewMap[c.id] || null,
        }));

        // Sort: cases with messages first (most recent activity), then rest
        casesData.sort((a, b) => {
          const aTime = a.lastMessage?.createdAt || a.updatedAt;
          const bTime = b.lastMessage?.createdAt || b.updatedAt;
          return new Date(bTime).getTime() - new Date(aTime).getTime();
        });

        setCases(casesData);

        // If navigated with applicantId, auto-select the most recent case of that applicant
        if (applicantIdFilter) {
          const targetCase = casesData.find((c) => c.applicant?.id === applicantIdFilter);
          if (targetCase) {
            setSelectedCaseId(targetCase.id);
            setShowPanel(true);
            return;
          }
        }

        // Otherwise auto-select the first case with messages
        const firstWithMessages = casesData.find((c) => (c._count?.messages || 0) > 0);
        if (firstWithMessages) setSelectedCaseId(firstWithMessages.id);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.applicant?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.applicant?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApplicant = applicantIdFilter
      ? c.applicant?.id === applicantIdFilter
      : true;

    return matchesSearch && matchesApplicant;
  });

  const selectedCase = cases.find((c) => c.id === selectedCaseId);
  const totalMessages = cases.reduce((sum, c) => sum + (c._count?.messages || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Communicate with clients across all cases</p>
        </div>
        {applicantIdFilter && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/immigration/messages">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Show all cases
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left Panel – Case List */}
        <div className={`${showPanel ? 'hidden lg:block' : 'block'}`}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <Input
                placeholder="Search cases or clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-sm">
                  {applicantIdFilter
                    ? `Cases for ${selectedCase?.applicant?.fullName || 'this client'}`
                    : 'All Conversations'}
                </h2>
                <Badge variant="outline" className="text-xs">
                  {totalMessages} messages
                </Badge>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0F2557] mx-auto" />
                  </div>
                ) : filteredCases.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No cases found</p>
                  </div>
                ) : (
                  filteredCases.map((caseItem) => {
                    const isSelected = selectedCaseId === caseItem.id;
                    const preview = caseItem.lastMessage?.content;
                    const previewTime = caseItem.lastMessage?.createdAt;

                    return (
                      <button
                        key={caseItem.id}
                        onClick={() => {
                          setSelectedCaseId(caseItem.id);
                          setShowPanel(true);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors border-l-4 ${
                          isSelected
                            ? 'bg-[#0F2557] text-white border-white'
                            : 'bg-gray-50 hover:bg-gray-100 border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p
                            className={`text-xs font-mono ${
                              isSelected ? 'text-blue-200' : 'text-gray-500'
                            }`}
                          >
                            {caseItem.referenceNumber}
                          </p>
                          {(caseItem._count?.messages || 0) > 0 && (
                            <Badge
                              className={
                                isSelected
                                  ? 'bg-white text-[#0F2557] text-xs'
                                  : 'bg-amber-100 text-amber-800 text-xs'
                              }
                            >
                              {caseItem._count!.messages}
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`font-semibold text-sm truncate ${
                            isSelected ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {caseItem.title}
                        </p>
                        {caseItem.applicant && (
                          <p
                            className={`text-xs truncate ${
                              isSelected ? 'text-blue-200' : 'text-gray-500'
                            }`}
                          >
                            {caseItem.applicant.fullName || caseItem.applicant.email}
                          </p>
                        )}
                        <p
                          className={`text-xs mt-1 truncate italic ${
                            isSelected ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {preview
                            ? `"${preview.length > 55 ? preview.slice(0, 55) + '…' : preview}"`
                            : 'No messages yet'}
                        </p>
                        {previewTime && (
                          <p
                            className={`text-xs mt-0.5 ${
                              isSelected ? 'text-blue-200' : 'text-gray-400'
                            }`}
                          >
                            {formatDistanceToNow(new Date(previewTime), { addSuffix: true })}
                          </p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel – Messages */}
        <div className={`${showPanel ? 'block' : 'hidden lg:block'}`}>
          {selectedCaseId ? (
            <Card>
              <CardContent className="p-6">
                {/* Mobile back button */}
                <div className="lg:hidden mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowPanel(false);
                      setSelectedCaseId(null);
                    }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Cases
                  </Button>
                </div>

                {/* Case Header */}
                <div className="mb-6 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-mono">
                        {selectedCase?.referenceNumber}
                      </p>
                      <h3 className="text-lg font-semibold">{selectedCase?.title}</h3>
                      {selectedCase?.applicant && (
                        <p className="text-sm text-gray-600">
                          Client: {selectedCase.applicant.fullName || selectedCase.applicant.email}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/immigration/cases/${selectedCaseId}`}>
                        View Full Case
                      </Link>
                    </Button>
                  </div>
                </div>

                <MessagesTab caseId={selectedCaseId} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-24 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 font-medium">Select a case to view messages</p>
                <p className="text-sm text-gray-500 mt-1">
                  All conversations with clients appear here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
