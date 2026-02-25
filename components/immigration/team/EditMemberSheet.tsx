'use client';

import React, { useState } from 'react';
import { OrgUser } from '@/types/immigration';
import { immigrationApi } from '@/lib/api/immigration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditMemberSheetProps {
  member: OrgUser;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditMemberSheet({
  member,
  isOpen,
  onClose,
  onSuccess,
}: EditMemberSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: member.fullName || '',
    role: member.role,
    isActive: member.isActive,
  });

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const response = await immigrationApi.updateOrgUser(member.id, {
        fullName: formData.fullName || undefined,
        role: formData.role as 'org_admin' | 'professional' | 'applicant',
        isActive: formData.isActive,
      });

      if (response.success) {
        toast.success('Member updated successfully');
        onSuccess();
      } else {
        toast.error(response.error || 'Failed to update member');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Team Member</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div>
            <Label>Email</Label>
            <Input value={member.email} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="org_admin">Administrator</SelectItem>
                <SelectItem value="applicant">Applicant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Active Status</Label>
              <p className="text-sm text-gray-500">Enable or disable member access</p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
