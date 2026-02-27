'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { type ProfessionalProfile } from '@/types/immigration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Shield, Upload, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const languages = [
  'English',
  'French',
  'Arabic',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Swahili',
  'Zulu',
  'Amharic',
  'Portuguese',
  'Afrikaans',
];

export default function PublicProfileForm() {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verificationUploading, setVerificationUploading] = useState(false);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    title: '',
    bio: '',
    avatarUrl: '',
    languages: [] as string[],
    isPublic: false,
    locationCity: '',
    locationCountry: '',
    linkedinUrl: '',
    websiteUrl: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getMyProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        setFormData({
          displayName: response.data.displayName || '',
          title: response.data.title || '',
          bio: response.data.bio || '',
          avatarUrl: response.data.avatarUrl || '',
          languages: response.data.languages || [],
          isPublic: response.data.isPublic || false,
          locationCity: response.data.locationCity || '',
          locationCountry: response.data.locationCountry || '',
          linkedinUrl: response.data.linkedinUrl || '',
          websiteUrl: response.data.websiteUrl || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.displayName || formData.displayName.trim().length < 2) {
      toast.error('Display name is required (minimum 2 characters)');
      return;
    }

    try {
      setIsSaving(true);
      const response = await immigrationApi.upsertPublicProfile(formData);
      if (response.success) {
        toast.success('Profile saved successfully');
        await fetchProfile();
      } else {
        toast.error('Failed to save profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2557] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      {/* Basic Info */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Basic Information</h3>
          <div>
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="How you want to be displayed"
              required
            />
          </div>
          <div>
            <Label htmlFor="title">Professional Title (optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Immigration Lawyer, Visa Consultant"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio (optional but recommended)</Label>
            <Textarea
              id="bio"
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell clients about your experience and expertise..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Location and Languages */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Location and Languages</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="locationCity">City</Label>
              <Input
                id="locationCity"
                value={formData.locationCity}
                onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                placeholder="e.g., Lagos"
              />
            </div>
            <div>
              <Label htmlFor="locationCountry">Country</Label>
              <Input
                id="locationCountry"
                value={formData.locationCountry}
                onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                placeholder="e.g., Nigeria"
              />
            </div>
          </div>
          <div>
            <Label className="mb-3 block">Languages spoken</Label>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((lang) => (
                <div key={lang} className="flex items-center gap-2">
                  <Checkbox
                    id={`lang-${lang}`}
                    checked={formData.languages.includes(lang)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          languages: [...formData.languages, lang],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          languages: formData.languages.filter((l) => l !== lang),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`lang-${lang}`} className="cursor-pointer text-sm">
                    {lang}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Online Presence */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Online Presence</h3>
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL (optional)</Label>
            <Input
              id="linkedinUrl"
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <div>
            <Label htmlFor="websiteUrl">Website URL (optional)</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Visibility</h3>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isPublic" className="cursor-pointer">
                Make my profile public
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                {formData.isPublic
                  ? 'Your profile is visible in our directory'
                  : 'You receive leads but no public profile page'}
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Verification */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">Verification</h3>
          {profile?.isVerified ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-900">Verified Professional</p>
                  <p className="text-sm text-green-800 mt-1">
                    Your credentials have been verified
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Get Verified</p>
                  <p className="text-sm text-amber-800 mt-1">
                    Upload your practicing certificate to receive a verified badge. Verified
                    professionals receive significantly more leads.
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="verificationDoc" className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#0F2557] transition-colors">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {verificationFile ? verificationFile.name : 'Upload PDF (max 5MB)'}
                    </p>
                  </div>
                </Label>
                <Input
                  id="verificationDoc"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error('File size must be less than 5MB');
                        return;
                      }
                      setVerificationFile(file);
                    }
                  }}
                />
                {verificationFile && !verificationSubmitted && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full border-[#0F2557] text-[#0F2557]"
                    disabled={verificationUploading}
                    onClick={async () => {
                      setVerificationUploading(true);
                      try {
                        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                        const formData = new FormData();
                        formData.append('verificationDoc', verificationFile);
                        const res = await fetch(`${API_BASE}/api/intake/profile/upload-verification`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
                          body: formData,
                        });
                        const json = await res.json();
                        if (json.success) {
                          setVerificationSubmitted(true);
                          toast.success('Document submitted! We\'ll review and respond within 2 business days.');
                        } else {
                          toast.error(json.message || 'Upload failed');
                        }
                      } catch (err: any) {
                        toast.error(err.message || 'Upload failed');
                      } finally {
                        setVerificationUploading(false);
                      }
                    }}
                  >
                    {verificationUploading
                      ? <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Uploading...</>
                      : <><Upload className="w-3 h-3 mr-2" /> Submit for Verification</>}
                  </Button>
                )}
                {verificationSubmitted && (
                  <div className="mt-2 flex items-center gap-2 text-green-700 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Submitted — under review
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        type="submit"
        className="w-full bg-[#0F2557] text-white py-3 rounded-xl"
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Profile'
        )}
      </Button>
    </form>
  );
}
