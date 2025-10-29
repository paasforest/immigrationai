'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Mail, 
  Shield, 
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Crown,
  User,
  UserCheck,
  AlertCircle
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  lastActive: string;
  documentsProcessed: number;
  joinDate: string;
  permissions: string[];
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvites: number;
  documentsThisMonth: number;
  avgDocumentsPerUser: number;
}

export default function TeamManagement() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'agent' | 'viewer'>('agent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch team data
    const fetchTeamData = async () => {
      setLoading(true);
      
      // Mock data
      const mockMembers: TeamMember[] = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john@company.com',
          role: 'admin',
          status: 'active',
          lastActive: '2 hours ago',
          documentsProcessed: 234,
          joinDate: '2024-01-15',
          permissions: ['All permissions', 'Manage team', 'View analytics']
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@company.com',
          role: 'manager',
          status: 'active',
          lastActive: '1 hour ago',
          documentsProcessed: 189,
          joinDate: '2024-02-20',
          permissions: ['Manage documents', 'View analytics', 'Invite users']
        },
        {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike@company.com',
          role: 'agent',
          status: 'active',
          lastActive: '30 minutes ago',
          documentsProcessed: 156,
          joinDate: '2024-03-10',
          permissions: ['Process documents', 'View reports']
        },
        {
          id: '4',
          name: 'Lisa Brown',
          email: 'lisa@company.com',
          role: 'agent',
          status: 'pending',
          lastActive: 'Never',
          documentsProcessed: 0,
          joinDate: '2024-10-15',
          permissions: ['Process documents', 'View reports']
        },
        {
          id: '5',
          name: 'David Lee',
          email: 'david@company.com',
          role: 'viewer',
          status: 'active',
          lastActive: '3 hours ago',
          documentsProcessed: 45,
          joinDate: '2024-04-05',
          permissions: ['View documents', 'View reports']
        }
      ];

      const mockStats: TeamStats = {
        totalMembers: 5,
        activeMembers: 4,
        pendingInvites: 1,
        documentsThisMonth: 624,
        avgDocumentsPerUser: 124.8
      };

      setTimeout(() => {
        setTeamMembers(mockMembers);
        setTeamStats(mockStats);
        setLoading(false);
      }, 1000);
    };

    fetchTeamData();
  }, []);

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRole) return;

    // Simulate API call
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      lastActive: 'Never',
      documentsProcessed: 0,
      joinDate: new Date().toISOString().split('T')[0],
      permissions: inviteRole === 'manager' 
        ? ['Manage documents', 'View analytics', 'Invite users']
        : inviteRole === 'agent'
        ? ['Process documents', 'View reports']
        : ['View documents', 'View reports']
    };

    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail('');
    setInviteRole('agent');
    setShowInviteModal(false);
  };

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter(member => member.id !== memberId));
  };

  const handleChangeRole = (memberId: string, newRole: TeamMember['role']) => {
    setTeamMembers(teamMembers.map(member => 
      member.id === memberId 
        ? { ...member, role: newRole, permissions: getPermissionsForRole(newRole) }
        : member
    ));
  };

  const getPermissionsForRole = (role: TeamMember['role']): string[] => {
    switch (role) {
      case 'admin':
        return ['All permissions', 'Manage team', 'View analytics'];
      case 'manager':
        return ['Manage documents', 'View analytics', 'Invite users'];
      case 'agent':
        return ['Process documents', 'View reports'];
      case 'viewer':
        return ['View documents', 'View reports'];
      default:
        return [];
    }
  };

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'manager':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'agent':
        return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'viewer':
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">Manage your team members and their permissions</p>
          </div>
          <Button 
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Stats Cards */}
        {teamStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-blue-600">{teamStats.totalMembers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold text-green-600">{teamStats.activeMembers}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                    <p className="text-2xl font-bold text-yellow-600">{teamStats.pendingInvites}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Documents This Month</p>
                    <p className="text-2xl font-bold text-purple-600">{teamStats.documentsThisMonth}</p>
                  </div>
                  <Settings className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Team Members Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Member</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Documents</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Last Active</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(member.role)}
                          <span className="capitalize font-medium">{member.role}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(member.status)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium">{member.documentsProcessed}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{member.lastActive}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <select
                            value={member.role}
                            onChange={(e) => handleChangeRole(member.id, e.target.value as TeamMember['role'])}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="agent">Agent</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Invite Team Member</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="manager">Manager - Can manage documents and invite users</option>
                    <option value="agent">Agent - Can process documents and view reports</option>
                    <option value="viewer">Viewer - Can view documents and reports only</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={handleInviteUser}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={!inviteEmail}
                  >
                    Send Invite
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


