'use client';

import React from 'react';
import { OrgUser } from '@/types/immigration';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCog, Mail, Shield, UserCheck, User } from 'lucide-react';
import { immigrationApi } from '@/lib/api/immigration';
import { toast } from 'sonner';

interface TeamMemberCardProps {
  member: OrgUser & { isActive?: boolean };
  onEdit: () => void;
  onToggleStatus: () => void;
}

const roleIcons = {
  org_admin: Shield,
  professional: UserCheck,
  applicant: User,
};

const roleColors = {
  org_admin: 'bg-blue-100 text-blue-800',
  professional: 'bg-green-100 text-green-800',
  applicant: 'bg-amber-100 text-amber-800',
};

function getInitials(name: string | null): string {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function TeamMemberCard({
  member,
  onEdit,
  onToggleStatus,
}: TeamMemberCardProps) {
  const isActive = member.isActive !== false; // Default to true if not specified

  const handleToggleStatus = async (checked: boolean) => {
    try {
      const response = await immigrationApi.updateOrgUser(member.id, {
        isActive: checked,
      });
      if (response.success) {
        toast.success(`Member ${checked ? 'activated' : 'deactivated'}`);
        onToggleStatus();
      } else {
        toast.error(response.error || 'Failed to update member');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update member');
    }
  };

  const RoleIcon = roleIcons[member.organizationRole as keyof typeof roleIcons] || User;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-[#0F2557] text-white">
                  {getInitials(member.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{member.fullName || 'No name'}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {member.email}
                </p>
              </div>
            </div>
            <RoleIcon className="w-5 h-5 text-gray-400" />
          </div>

          {/* Role Badge */}
          <div>
            <Badge className={roleColors[member.organizationRole as keyof typeof roleColors] || ''}>
              {member.organizationRole === 'org_admin'
                ? 'Administrator'
                : member.organizationRole === 'professional'
                ? 'Professional'
                : 'Applicant'}
            </Badge>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className={`text-xs ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleStatus}
              disabled={member.organizationRole === 'org_admin'} // Can't deactivate yourself if admin
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onEdit}
              className="flex-1"
              size="sm"
            >
              <UserCog className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
