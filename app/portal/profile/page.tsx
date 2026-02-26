'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function PortalProfilePage() {
  const { user, refreshUser } = useAuth();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSaveProfile = async () => {
    if (!profileForm.fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setIsSavingProfile(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = apiClient.getToken();

      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ fullName: profileForm.fullName.trim() }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Profile updated successfully');
        await refreshUser();
      } else {
        toast.error(data.error || data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setIsSavingPassword(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = apiClient.getToken();

      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Password changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(data.error || data.message || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('Failed to change password. Please try again.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account details and password</p>
      </div>

      {/* Avatar & Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#0F2557] text-white flex items-center justify-center text-2xl font-bold">
              {getInitials(user?.fullName)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.fullName || 'No name set'}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <Badge variant="outline" className="mt-1 capitalize text-xs">
                Applicant
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={profileForm.fullName}
              onChange={(e) => setProfileForm({ fullName: e.target.value })}
              placeholder="Your full name"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Email Address</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input value={user?.email || ''} disabled className="bg-gray-50" />
              <Badge variant="outline" className="text-xs flex-shrink-0">
                <Mail className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              To change your email, contact your consultant.
            </p>
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="bg-[#0F2557] hover:bg-[#0a1d42] w-full sm:w-auto"
          >
            {isSavingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="w-4 h-4" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {passwordError && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              placeholder="Enter current password"
              className="mt-1"
            />
          </div>

          <Separator />

          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              placeholder="Minimum 8 characters"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              placeholder="Repeat new password"
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={isSavingPassword}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {isSavingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-800">Your data is secure</p>
              <p className="mt-0.5">
                All communications and documents are encrypted and accessible only to you and
                your immigration consultant.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
