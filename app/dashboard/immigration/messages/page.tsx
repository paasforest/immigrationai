'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import MessagesTab from '@/components/immigration/cases/detail/tabs/MessagesTab';
import Link from 'next/link';

interface Case {
  id: string;
  referenceNumber: string;
  title: string;
  _count?: {
    messages: number;
  };
}

export default function MessagesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false); // For mobile

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getCases();
      if (response.success && response.data?.data) {
        // Sort by most recent message (simplified - would need message timestamps)
        setCases(response.data.data);
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
        <p className="text-gray-600 mt-1">Communicate with clients across all cases</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left Panel - Case List */}
        <div className={`${showPanel ? 'hidden lg:block' : 'block'}`}>
          <Card>
            <CardContent className="p-4 space-y-4">
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <h2 className="font-semibold">All Messages</h2>
                <Badge variant="outline">
                  {cases.reduce((sum, c) => sum + (c._count?.messages || 0), 0)} total
                </Badge>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading cases...</div>
                ) : filteredCases.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No cases with messages</p>
                  </div>
                ) : (
                  filteredCases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      onClick={() => {
                        setSelectedCaseId(caseItem.id);
                        setShowPanel(true);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCaseId === caseItem.id
                          ? 'bg-[#0F2557] text-white border-l-4 border-white'
                          : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-xs text-gray-500">{caseItem.referenceNumber}</p>
                        {caseItem._count && caseItem._count.messages > 0 && (
                          <Badge
                            className={
                              selectedCaseId === caseItem.id
                                ? 'bg-white text-[#0F2557]'
                                : 'bg-amber-100 text-amber-800'
                            }
                          >
                            {caseItem._count.messages}
                          </Badge>
                        )}
                      </div>
                      <p
                        className={`font-semibold truncate ${
                          selectedCaseId === caseItem.id ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {caseItem.title}
                      </p>
                      <p
                        className={`text-xs mt-1 truncate ${
                          selectedCaseId === caseItem.id
                            ? 'text-gray-200'
                            : 'text-gray-600'
                        }`}
                      >
                        Last message preview...
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Messages */}
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
                      <p className="text-sm text-gray-600">{selectedCase?.referenceNumber}</p>
                      <h3 className="text-lg font-semibold">{selectedCase?.title}</h3>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/immigration/cases/${selectedCaseId}`}>
                        View Full Case
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Messages Tab Component */}
                <MessagesTab caseId={selectedCaseId} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-24 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Select a case to view messages</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
