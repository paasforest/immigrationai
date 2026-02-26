'use client';

import React, { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import MessagesTab from '@/components/immigration/cases/detail/tabs/MessagesTab';
import { format } from 'date-fns';

interface CaseItem {
  id: string;
  referenceNumber: string;
  title: string;
  status: string;
  updatedAt: string;
  _count?: { messages: number };
}

export default function PortalMessagesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
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
        const sorted = [...response.data.data].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setCases(sorted);
        // Auto-select first case with messages, or just first case
        const firstWithMessages = sorted.find((c) => (c._count?.messages || 0) > 0);
        if (firstWithMessages) setSelectedCaseId(firstWithMessages.id);
        else if (sorted.length > 0) setSelectedCaseId(sorted[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCases = cases.filter(
    (c) =>
      c.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate with your immigration consultant</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Left Panel – Case List */}
        <div className={`${showPanel ? 'hidden lg:block' : 'block'}`}>
          <Card className="h-full">
            <CardContent className="p-4 space-y-4">
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Your Cases</p>
                <Badge variant="outline" className="text-xs">
                  {cases.length}
                </Badge>
              </div>

              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredCases.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No cases found</p>
                  </div>
                ) : (
                  filteredCases.map((caseItem) => {
                    const isSelected = selectedCaseId === caseItem.id;
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
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-xs font-mono ${
                              isSelected ? 'text-blue-200' : 'text-gray-500'
                            }`}
                          >
                            {caseItem.referenceNumber}
                          </span>
                          {(caseItem._count?.messages || 0) > 0 && (
                            <Badge
                              className={
                                isSelected
                                  ? 'bg-white text-[#0F2557] text-xs'
                                  : 'bg-blue-100 text-blue-800 text-xs'
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
                        <p
                          className={`text-xs mt-1 ${
                            isSelected ? 'text-blue-200' : 'text-gray-500'
                          }`}
                        >
                          Updated {format(new Date(caseItem.updatedAt), 'MMM d, yyyy')}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel – Message Thread */}
        <div className={`${showPanel ? 'block' : 'hidden lg:block'}`}>
          {selectedCaseId ? (
            <Card className="h-full">
              <CardContent className="p-6">
                {/* Mobile Back */}
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
                  <p className="text-xs font-mono text-gray-500">
                    {selectedCase?.referenceNumber}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedCase?.title}
                  </h3>
                  <Badge variant="outline" className="text-xs mt-1 capitalize">
                    {selectedCase?.status.replace('_', ' ')}
                  </Badge>
                </div>

                <MessagesTab caseId={selectedCaseId} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-24 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">Select a case to view messages</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your consultant can see everything you send here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
