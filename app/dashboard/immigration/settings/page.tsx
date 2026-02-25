'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { organization, refreshOrganization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    phone: '',
    billingEmail: '',
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        country: organization.country || '',
        phone: organization.phone || '',
        billingEmail: organization.billingEmail || '',
      });
    }
  }, [organization]);

  // Check if user is org_admin
  useEffect(() => {
    if (user && user.role !== 'org_admin') {
      router.push('/dashboard/immigration');
    }
  }, [user, router]);

  if (user && user.role !== 'org_admin') {
    return null;
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await immigrationApi.updateOrganization({
        name: formData.name,
        country: formData.country,
        phone: formData.phone,
        billingEmail: formData.billingEmail,
      });

      if (response.success) {
        toast.success('Organization settings updated');
        await refreshOrganization();
      } else {
        toast.error(response.error || 'Failed to update settings');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!organization) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-gray-600 mt-1">Manage your organization profile and preferences</p>
      </div>

      {/* Organization Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your organization name"
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="Country"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+27 12 345 6789"
            />
          </div>

          <div>
            <Label htmlFor="billingEmail">Billing Email</Label>
            <Input
              id="billingEmail"
              type="email"
              value={formData.billingEmail}
              onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
              placeholder="billing@example.com"
            />
          </div>

          <div>
            <Label>Logo</Label>
            <div className="mt-2 flex items-center gap-4">
              {organization.logoUrl && (
                <img
                  src={organization.logoUrl}
                  alt="Organization logo"
                  className="w-20 h-20 object-contain border rounded"
                />
              )}
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Logo upload coming soon</p>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              These actions are irreversible. Please proceed with caution.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => toast.info('Export feature coming soon')}
              className="w-full"
            >
              Export All Data
            </Button>
            <p className="text-xs text-gray-500">
              Download all your organization data in JSON format
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
