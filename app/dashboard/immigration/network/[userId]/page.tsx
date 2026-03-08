'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Globe, CheckCircle2 } from 'lucide-react';
import { getCountryFlag } from '@/lib/utils/countryFlags';
import ReferLeadOrCaseModal from '@/components/immigration/referrals/ReferLeadOrCaseModal';

export default function NetworkProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [referModalOpen, setReferModalOpen] = useState(false);

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await immigrationApi.getNetworkProfile(userId);
      if (res.success && res.data) setProfile(res.data);
      else router.push('/dashboard/immigration/network');
    } catch (e) {
      console.error(e);
      router.push('/dashboard/immigration/network');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/immigration/network"
        className="text-[#0F2557] text-sm inline-flex items-center hover:underline"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Network
      </Link>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-20 h-20 rounded-full bg-[#0F2557] text-white flex items-center justify-center text-2xl font-semibold shrink-0">
              {(profile.displayName || profile.userId).slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                {profile.isVerified && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {profile.professionalType && (
                  <Badge variant="outline" className="capitalize">
                    {profile.professionalType}
                  </Badge>
                )}
              </div>
              {profile.title && (
                <p className="text-gray-600 mt-1">{profile.title}</p>
              )}
              {profile.organization?.name && (
                <p className="text-sm text-gray-500 mt-1">{profile.organization.name}</p>
              )}
              {(profile.locationCity || profile.locationCountry) && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {[profile.locationCity, profile.locationCountry].filter(Boolean).join(', ')}
                </p>
              )}
              {profile.websiteUrl && (
                <a
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#0F2557] hover:underline flex items-center gap-1 mt-1"
                >
                  <Globe className="w-4 h-4" />
                  Website
                </a>
              )}
              <Button className="mt-4" onClick={() => setReferModalOpen(true)}>
                Refer lead or case
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Specialisations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile.destinationCountries?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Destination countries</p>
              <div className="flex flex-wrap gap-2">
                {profile.destinationCountries.map((c: string) => (
                  <span key={c} className="flex items-center gap-1">
                    {getCountryFlag(c)} {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.visaTypes?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Visa types</p>
              <p className="text-gray-700">{profile.visaTypes.join(', ')}</p>
            </div>
          )}
          {profile.languages?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Languages</p>
              <p className="text-gray-700">{profile.languages.join(', ')}</p>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            {profile.availableForReferrals && (
              <Badge className="bg-blue-100 text-blue-800">Available for referrals</Badge>
            )}
            {profile.availableForCoCounsel && (
              <Badge className="bg-green-100 text-green-800">Available for co-counsel</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <ReferLeadOrCaseModal
        open={referModalOpen}
        onClose={() => setReferModalOpen(false)}
        recipientUserId={profile.userId}
        recipientName={profile.displayName}
        onSuccess={() => setReferModalOpen(false)}
      />
    </div>
  );
}
