'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { immigrationApi } from '@/lib/api/immigration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Loader2, MessageSquare, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
}

interface ClientWithCases extends Client {
  activeCaseCount: number;
  lastActivity: string | null;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientWithCases[]>([]);
  const [allCases, setAllCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteData, setInviteData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    personalMessage: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersResponse, casesResponse] = await Promise.all([
        immigrationApi.getOrgUsers(),
        immigrationApi.getCases(),
      ]);

      if (usersResponse.success && usersResponse.data) {
        const applicants = usersResponse.data.filter((u: any) => u.role === 'applicant');
        
        if (casesResponse.success && casesResponse.data?.data) {
          setAllCases(casesResponse.data.data);
          
          // Calculate case counts and last activity
          const clientsWithStats = applicants.map((client: Client) => {
            const clientCases = casesResponse.data.data.filter(
              (c: any) => c.applicantId === client.id && c.status !== 'closed'
            );
            const lastCase = clientCases.sort(
              (a: any, b: any) => 
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )[0];
            
            return {
              ...client,
              activeCaseCount: clientCases.length,
              lastActivity: lastCase?.updatedAt || null,
            };
          });
          
          setClients(clientsWithStats);
        } else {
          setClients(applicants.map((c: Client) => ({ ...c, activeCaseCount: 0, lastActivity: null })));
        }
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteData.email) {
      toast.error('Email is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await immigrationApi.inviteUser({
        email: inviteData.email,
        fullName: `${inviteData.firstName} ${inviteData.lastName}`.trim() || undefined,
        role: 'applicant', // Force applicant role
      });

      if (response.success) {
        toast.success('Invitation sent successfully');
        setInviteData({ firstName: '', lastName: '', email: '', personalMessage: '' });
        setIsInviteDialogOpen(false);
        fetchData();
      } else {
        toast.error(response.error || 'Failed to send invitation');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getDaysAgo = (dateString: string | null) => {
    if (!dateString) return null;
    const days = Math.floor(
      (new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const filteredClients = clients.filter(
    (client) =>
      client.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">
            Manage your client relationships and case assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {clients.length} clients
          </Badge>
          <Button onClick={() => setIsInviteDialogOpen(true)} className="bg-[#0F2557]">
            Invite Client
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">No clients yet</p>
            <p className="text-gray-600 mb-4">
              Clients will appear here when you link them to a case
            </p>
            <Button onClick={() => setIsInviteDialogOpen(true)}>Invite Your First Client</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const daysAgo = getDaysAgo(client.lastActivity);
            return (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-semibold">
                      {getInitials(client.fullName)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {client.fullName || 'No name'}
                      </h3>
                      <p className="text-sm text-gray-600">{client.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Cases</span>
                      <Badge className="bg-[#0F2557] text-white">
                        {client.activeCaseCount}
                      </Badge>
                    </div>
                    {daysAgo !== null && (
                      <p className="text-xs text-gray-500">
                        Last case updated {daysAgo === 0 ? 'today' : `${daysAgo} days ago`}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(`/dashboard/immigration/cases?applicantId=${client.id}`)
                      }
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Cases
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() =>
                        router.push(`/dashboard/immigration/messages?applicantId=${client.id}`)
                      }
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Invite Client Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={inviteData.firstName}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, firstName: e.target.value })
                  }
                  placeholder="John"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={inviteData.lastName}
                  onChange={(e) =>
                    setInviteData({ ...inviteData, lastName: e.target.value })
                  }
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="client@example.com"
              />
            </div>
            <div>
              <Label>Personal Message (Optional)</Label>
              <Textarea
                value={inviteData.personalMessage}
                onChange={(e) =>
                  setInviteData({ ...inviteData, personalMessage: e.target.value })
                }
                placeholder="Add a personal message to the invitation..."
                rows={3}
              />
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                The client will be invited as an <strong>Applicant</strong> and will have access
                to their cases through the portal.
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleInvite} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
