'use client';

import Link from 'next/link';
import { getCountryFlag } from '@/lib/utils/countryFlags';
import { ShieldCheck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProfessionalCardProps {
  profile: {
    id: string;
    userId: string;
    displayName: string;
    title?: string;
    avatarUrl?: string;
    languages: string[];
    isVerified: boolean;
    isAcceptingLeads: boolean;
    locationCity?: string;
    locationCountry?: string;
    services: string[];
    corridors: string[];
  };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfessionalCard({ profile }: ProfessionalCardProps) {
  return (
    <Link href={`/find-a-specialist/${profile.userId}`}>
      <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col relative">
        {/* Verified Badge */}
        {profile.isVerified && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </Badge>
          </div>
        )}

        {/* Top Row: Avatar and Name */}
        <div className="flex items-start gap-4 mb-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#0F2557] text-white flex items-center justify-center text-xl font-bold">
              {getInitials(profile.displayName)}
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{profile.displayName}</h3>
            {profile.title && <p className="text-gray-600 text-sm mt-1">{profile.title}</p>}
            {(profile.locationCity || profile.locationCountry) && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                <MapPin className="w-3 h-3" />
                {[profile.locationCity, profile.locationCountry].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2">Specializes in</p>
          <div className="flex flex-wrap gap-2">
            {profile.services.slice(0, 3).map((service, idx) => (
              <span
                key={idx}
                className="bg-blue-50 text-[#0F2557] text-xs rounded-full px-2 py-1"
              >
                {service}
              </span>
            ))}
            {profile.services.length > 3 && (
              <span className="text-xs text-gray-500">+{profile.services.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Corridors */}
        {profile.corridors.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-600 mb-2">Destinations covered</p>
            <div className="flex flex-wrap gap-2">
              {profile.corridors.slice(0, 3).map((corridor, idx) => (
                <span key={idx} className="text-xs text-gray-700">
                  {getCountryFlag(corridor)} {corridor}
                </span>
              ))}
              {profile.corridors.length > 3 && (
                <span className="text-xs text-gray-500">+{profile.corridors.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Accepting Leads */}
        <div className="mt-3 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              profile.isAcceptingLeads
                ? 'bg-green-500 animate-pulse'
                : 'bg-gray-400'
            }`}
          />
          <span className="text-xs text-gray-600">
            {profile.isAcceptingLeads ? 'Accepting new clients' : 'Currently unavailable'}
          </span>
        </div>

        {/* Bottom */}
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          {profile.languages.length > 0 && (
            <p className="text-xs text-gray-500">
              Speaks: {profile.languages.slice(0, 2).join(', ')}
            </p>
          )}
          <span className="text-[#0F2557] font-medium text-sm">View Profile →</span>
        </div>
      </div>
    </Link>
  );
}
