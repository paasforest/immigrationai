'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { immigrationApi } from '@/lib/api/immigration';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Upload, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { organization, refreshOrganization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be smaller than 2MB');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].includes(file.type)) {
      toast.error('Logo must be a JPG, PNG, SVG, or WebP image');
      return;
    }

    try {
      setIsUploadingLogo(true);
      const formDataUpload = new FormData();
      formDataUpload.append('logo', file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const token = apiClient.getToken();

      const response = await fetch(`${API_URL}/api/organizations/me/logo`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formDataUpload,
      });

      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Logo updated successfully');
        await refreshOrganization();
      } else {
        toast.error(data.error || 'Failed to upload logo');
      }
    } catch {
      toast.error('Failed to upload logo. Please try again.');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);

      // Fetch cases and build CSV
      const [casesRes, usersRes] = await Promise.all([
        immigrationApi.getCases(undefined, 1, 500),
        immigrationApi.getOrgUsers(),
      ]);

      const cases = casesRes.data?.data || [];
      const users = usersRes.data || [];

      // Build CSV rows
      const csvRows = [
        // Header
        ['Reference', 'Title', 'Status', 'Visa Type', 'Origin', 'Destination', 'Priority', 'Applicant', 'Professional', 'Created'].join(','),
        // Data rows
        ...cases.map((c: any) =>
          [
            `"${c.referenceNumber}"`,
            `"${c.title.replace(/"/g, '""')}"`,
            c.status,
            c.visaType || '',
            c.originCountry || '',
            c.destinationCountry || '',
            c.priority,
            `"${c.applicant?.fullName || c.applicant?.email || ''}"`,
            `"${c.assignedProfessional?.fullName || ''}"`,
            new Date(c.createdAt).toLocaleDateString(),
          ].join(',')
        ),
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${organization?.name || 'organization'}-cases-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Exported ${cases.length} cases to CSV`);
    } catch (error: any) {
      toast.error(error.message || 'Export failed. Please try again.');
    } finally {
      setIsExporting(false);
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
            <Label>Organisation Logo</Label>
            <div className="mt-2 flex items-center gap-4">
              {organization.logoUrl ? (
                <img
                  src={organization.logoUrl}
                  alt="Organisation logo"
                  className="w-20 h-20 object-contain border rounded bg-white p-1"
                />
              ) : (
                <div className="w-20 h-20 border-2 border-dashed rounded flex items-center justify-center text-gray-400">
                  <Upload className="w-6 h-6" />
                </div>
              )}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {organization.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, SVG, WebP — max 2MB</p>
              </div>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/svg+xml,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
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
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export All Cases to CSV
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500">
              Downloads all cases with client details, status, and dates as a CSV file.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
