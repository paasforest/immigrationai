'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MapPin, Globe, CheckCircle, Linkedin, ExternalLink,
  ArrowLeft, MessageSquare, Languages, Briefcase,
  Star, Users, Calendar,
} from 'lucide-react';
import { immigrationApi } from '@/lib/api/immigration';

function AvatarFallback({ name, size = 80 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const colors = ['#0F2557', '#1a3570', '#2563eb', '#7c3aed', '#059669', '#dc2626'];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
      style={{ width: size, height: size, background: colors[idx], fontSize: size * 0.35 }}
    >
      {initials || '?'}
    </div>
  );
}

export default function SpecialistProfilePage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    immigrationApi.getPublicProfile(userId).then((res) => {
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        setError('Specialist not found or profile is not public.');
      }
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#0F2557] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Users className="w-12 h-12 text-gray-300" />
        <h1 className="text-xl font-semibold text-gray-700">{error || 'Profile not found'}</h1>
        <Link href="/find-a-specialist" className="text-[#0F2557] font-medium hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0F2557] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">IA</span>
            </div>
            <span className="font-bold text-gray-900">ImmigrationAI</span>
          </Link>
          <Link
            href="/find-a-specialist"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0F2557] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>
        </div>
      </nav>

      {/* Hero strip */}
      <div className="bg-[#0F2557] h-32" />

      {/* Profile card */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
              />
            ) : (
              <div className="border-4 border-white shadow-md rounded-full flex-shrink-0">
                <AvatarFallback name={profile.displayName} size={96} />
              </div>
            )}

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-extrabold text-gray-900">{profile.displayName}</h1>
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
                {profile.isAcceptingLeads && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                    Accepting clients
                  </span>
                )}
              </div>
              {profile.title && <p className="text-gray-500 text-base mb-2">{profile.title}</p>}
              {(profile.locationCity || profile.locationCountry) && (
                <p className="text-sm text-gray-400 flex items-center gap-1 mb-3">
                  <MapPin className="w-4 h-4" />
                  {[profile.locationCity, profile.locationCountry].filter(Boolean).join(', ')}
                </p>
              )}
              {/* Social links */}
              <div className="flex items-center gap-4">
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                    <Linkedin className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                {profile.websiteUrl && (
                  <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-gray-600 hover:text-[#0F2557] text-sm font-medium transition-colors">
                    <ExternalLink className="w-4 h-4" /> Website
                  </a>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 md:items-end w-full md:w-auto mt-4 md:mt-0">
              {profile.isAcceptingLeads ? (
                <Link
                  href={`/intake?specialist=${profile.userId}`}
                  className="inline-flex items-center gap-2 bg-[#0F2557] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#1a3570] transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Request Consultation
                </Link>
              ) : (
                <span className="text-xs text-gray-400 italic">Not currently accepting new clients</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Bio + specializations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">About</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Specializations */}
            {profile.specializations && profile.specializations.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-[#0F2557]" />
                  Immigration Specialisations
                </h2>
                <div className="space-y-5">
                  {profile.specializations.map((spec: any) => (
                    <div key={spec.id} className="border-l-4 border-[#0F2557]/20 pl-4">
                      <h3 className="font-semibold text-gray-900 text-sm">{spec.service?.name}</h3>
                      {spec.service?.description && (
                        <p className="text-xs text-gray-500 mt-0.5 mb-2">{spec.service.description}</p>
                      )}
                      {spec.bio && <p className="text-sm text-gray-600 mb-2">{spec.bio}</p>}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        {spec.yearsExperience && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {spec.yearsExperience}+ years experience
                          </span>
                        )}
                        {spec.originCorridors?.length > 0 && (
                          <span>From: {spec.originCorridors.join(', ')}</span>
                        )}
                        {spec.destinationCorridors?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5" />
                            To: {spec.destinationCorridors.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-5">
            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Languages className="w-4 h-4 text-[#0F2557]" /> Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang: string) => (
                    <span key={lang} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-[#0F2557] rounded-2xl p-5 text-white">
              <h3 className="text-sm font-bold mb-4">Quick Facts</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Verified</span>
                  <span className={`font-semibold ${profile.isVerified ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {profile.isVerified ? '✓ Yes' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Accepting clients</span>
                  <span className={`font-semibold ${profile.isAcceptingLeads ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {profile.isAcceptingLeads ? '✓ Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Services</span>
                  <span className="font-semibold">{profile.specializations?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Also on platform */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Are you a specialist?</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Create your verified profile and receive qualified client leads.
              </p>
              <Link
                href="/auth/signup"
                className="block text-center bg-[#0F2557] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#1a3570] transition-colors"
              >
                Join the Platform
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
