'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicProfile } from '@/lib/api/publicIntake';
import { getCountryFlag } from '@/lib/utils/countryFlags';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, ShieldCheck, Linkedin, Globe, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfessionalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const data = await getPublicProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      router.push('/find-a-specialist');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const handleRequestSpecialist = () => {
    router.push(`/get-help?preferredSpecialist=${userId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/find-a-specialist"
          className="text-[#0F2557] text-sm inline-flex items-center hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Find a Specialist
        </Link>

        {/* Top Section */}
        <Card className="bg-white rounded-2xl shadow p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#0F2557] text-white flex items-center justify-center text-3xl font-bold">
                {getInitials(profile.displayName)}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.displayName}</h1>
              {profile.title && <p className="text-xl text-gray-600 mb-4">{profile.title}</p>}
              {(profile.locationCity || profile.locationCountry) && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  {[profile.locationCity, profile.locationCountry].filter(Boolean).join(', ')}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {profile.isVerified && (
                  <Badge className="bg-green-50 text-green-700">
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {profile.isAcceptingLeads && (
                  <Badge className="bg-green-50 text-green-700">Accepting Clients</Badge>
                )}
              </div>

              {profile.languages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.languages.map((lang: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-4">
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#0F2557]"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#0F2557]"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Bio */}
        <Card className="bg-white rounded-2xl shadow p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
          {profile.bio ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
          ) : (
            <p className="text-gray-500 italic">No bio provided yet</p>
          )}
        </Card>

        {/* Specializations */}
        {profile.specializations && profile.specializations.length > 0 && (
          <Card className="bg-white rounded-2xl shadow p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Areas of Expertise</h2>
            <div className="space-y-4">
              {profile.specializations.map((spec: any) => (
                <div key={spec.id} className="bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-lg mb-2">{spec.service.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{spec.service.description}</p>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">From: </span>
                      {spec.originCorridors.length > 0 ? (
                        <span>
                          {spec.originCorridors.map((country: string, idx: number) => (
                            <span key={idx}>
                              {getCountryFlag(country)} {country}
                              {idx < spec.originCorridors.length - 1 && ', '}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-gray-500">All countries</span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">To: </span>
                      {spec.destinationCorridors.length > 0 ? (
                        <span>
                          {spec.destinationCorridors.map((country: string, idx: number) => (
                            <span key={idx}>
                              {getCountryFlag(country)} {country}
                              {idx < spec.destinationCorridors.length - 1 && ', '}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-gray-500">All destinations</span>
                      )}
                    </div>
                    {spec.yearsExperience && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{spec.yearsExperience} years experience</span>
                      </div>
                    )}
                    {spec.bio && (
                      <p className="text-sm text-gray-600 italic mt-2">{spec.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CTA */}
        <Card className="bg-[#0F2557] rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Work with {profile.displayName}</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Submit your case details and we will match you with this specialist if they are
            available for your situation.
          </p>
          <Button
            onClick={handleRequestSpecialist}
            className="bg-[#F59E0B] text-white px-8 py-4 rounded-xl hover:bg-[#D97706]"
          >
            Request This Specialist
          </Button>
          <p className="text-xs text-blue-200 mt-4">
            Final matching depends on availability and case fit
          </p>
        </Card>
      </div>
    </div>
  );
}
