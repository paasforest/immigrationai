'use client';

import React, { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { OrgUser } from '@/types/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, UserCog, Mail, Phone, Shield, User, UserCheck, UserX, Users } from 'lucide-react';
import TeamMemberCard from '@/components/immigration/team/TeamMemberCard';
import InviteUserDialog from '@/components/immigration/team/InviteUserDialog';
import EditMemberSheet from '@/components/immigration/team/EditMemberSheet';

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<OrgUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<OrgUser | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getOrgUsers();
      if (response.success && response.data) {
        setTeamMembers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSuccess = () => {
    setIsInviteDialogOpen(false);
    fetchTeamMembers();
  };

  const handleEditSuccess = () => {
    setEditingMember(null);
    fetchTeamMembers();
  };

  // Group members by role
  const admins = teamMembers.filter((m) => m.organizationRole === 'org_admin');
  const professionals = teamMembers.filter((m) => m.organizationRole === 'professional');
  const applicants = teamMembers.filter((m) => m.organizationRole === 'applicant');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage your organization members</p>
        </div>
        <Button
          onClick={() => setIsInviteDialogOpen(true)}
          className="bg-[#0F2557] hover:bg-[#0a1d42]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administrators</p>
                <p className="text-2xl font-bold">{admins.length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Professionals</p>
                <p className="text-2xl font-bold">{professionals.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Applicants</p>
                <p className="text-2xl font-bold">{applicants.length}</p>
              </div>
              <User className="w-8 h-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teamMembers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCog className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No team members yet</h3>
            <p className="text-gray-600 mb-4">
              Invite your first team member to get started
            </p>
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Administrators */}
          {admins.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Administrators
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {admins.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onEdit={() => setEditingMember(member)}
                    onToggleStatus={fetchTeamMembers}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Professionals */}
          {professionals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Professionals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {professionals.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onEdit={() => setEditingMember(member)}
                    onToggleStatus={fetchTeamMembers}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Applicants */}
          {applicants.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                Applicants
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applicants.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    onEdit={() => setEditingMember(member)}
                    onToggleStatus={fetchTeamMembers}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invite Dialog */}
      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
        onSuccess={handleInviteSuccess}
      />

      {/* Edit Sheet */}
      {editingMember && (
        <EditMemberSheet
          member={editingMember}
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
