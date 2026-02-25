'use client';

import { useState, useEffect, useRef } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { type IntakeAssignment } from '@/types/immigration';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Inbox, Clock, CheckCircle2, X, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import LeadCard from './LeadCard';
import RespondToLeadDialog from './RespondToLeadDialog';
import Link from 'next/link';

type TabType = 'all' | 'pending' | 'accepted' | 'declined';

export default function LeadInbox() {
  const [leads, setLeads] = useState<IntakeAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [respondingTo, setRespondingTo] = useState<{
    assignment: IntakeAssignment;
    action: 'accept' | 'decline';
  } | null>(null);
  const previousPendingCount = useRef(0);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const response = await immigrationApi.getMyLeads(status);

      if (response.success && response.data) {
        const assignments = response.data.assignments || [];

        // Sort by urgency, then by assignedAt
        const sorted = assignments.sort((a, b) => {
          const urgencyOrder: Record<string, number> = {
            emergency: 0,
            urgent: 1,
            soon: 2,
            normal: 3,
          };
          const aUrgency = urgencyOrder[a.intake.urgencyLevel] || 3;
          const bUrgency = urgencyOrder[b.intake.urgencyLevel] || 3;
          if (aUrgency !== bUrgency) return aUrgency - bUrgency;
          return (
            new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
          );
        });

        setLeads(sorted);

        // Check for new pending leads
        const pendingCount = assignments.filter((a) => a.status === 'pending').length;
        if (pendingCount > previousPendingCount.current && previousPendingCount.current > 0) {
          toast.success('🔔 New lead received!');
        }
        previousPendingCount.current = pendingCount;
      }
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [activeTab]);

  // Polling every 2 minutes
  useEffect(() => {
    const interval = setInterval(fetchLeads, 120000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const stats = {
    pending: leads.filter((l) => l.status === 'pending').length,
    accepted: leads.filter((l) => l.status === 'accepted').length,
    declined: leads.filter((l) => l.status === 'declined').length,
    acceptRate:
      leads.filter((l) => l.status === 'accepted' || l.status === 'declined').length > 0
        ? Math.round(
            (leads.filter((l) => l.status === 'accepted').length /
              leads.filter((l) => l.status === 'accepted' || l.status === 'declined').length) *
              100
          )
        : 0,
  };

  const filteredLeads =
    activeTab === 'all'
      ? leads
      : leads.filter((l) => {
          if (activeTab === 'pending') return l.status === 'pending';
          if (activeTab === 'accepted') return l.status === 'accepted';
          if (activeTab === 'declined') return l.status === 'declined';
          return true;
        });

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Declined</p>
                <p className="text-2xl font-bold text-gray-600">{stats.declined}</p>
              </div>
              <X className="w-8 h-8 text-gray-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Accept Rate</p>
                <p className="text-2xl font-bold text-[#0F2557]">{stats.acceptRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-[#0F2557] opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b">
        {(['all', 'pending', 'accepted', 'declined'] as TabType[]).map((tab) => {
          const count =
            tab === 'all'
              ? leads.length
              : leads.filter((l) => {
                  if (tab === 'pending') return l.status === 'pending';
                  if (tab === 'accepted') return l.status === 'accepted';
                  if (tab === 'declined') return l.status === 'declined';
                  return true;
                }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#0F2557] text-[#0F2557]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {count > 0 && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* Lead Cards */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2557] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            {activeTab === 'pending' ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending leads</h3>
                <p className="text-gray-600 mb-4">
                  Set up your specializations to start receiving leads
                </p>
                <Button asChild className="bg-[#0F2557] text-white">
                  <Link href="/dashboard/immigration/profile">Set Up Specializations</Link>
                </Button>
              </>
            ) : (
              <p className="text-gray-600">No {activeTab} leads yet</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((assignment) => (
            <LeadCard
              key={assignment.id}
              assignment={assignment}
              onRespond={(assignment, action) =>
                setRespondingTo({ assignment, action })
              }
            />
          ))}
        </div>
      )}

      {/* Respond Dialog */}
      <RespondToLeadDialog
        isOpen={!!respondingTo}
        assignment={respondingTo?.assignment || null}
        action={respondingTo?.action || null}
        onClose={() => setRespondingTo(null)}
        onSuccess={() => {
          setRespondingTo(null);
          fetchLeads();
        }}
      />
    </div>
  );
}
