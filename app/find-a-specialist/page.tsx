'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, MapPin, Globe, Star, CheckCircle, Users,
  Briefcase, ArrowRight, Filter, X, ChevronLeft,
  ChevronRight, ExternalLink, Linkedin, Menu,
} from 'lucide-react';
import { immigrationApi } from '@/lib/api/immigration';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface Professional {
  id: string;
  userId: string;
  displayName: string;
  title: string | null;
  bio: string | null;
  avatarUrl: string | null;
  languages: string[];
  isVerified: boolean;
  isAcceptingLeads: boolean;
  locationCity: string | null;
  locationCountry: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  services: string[];
  corridors: string[];
  organization: { name: string; country: string | null } | null;
}

// ──────────────────────────────────────────────
// Avatar initials
// ──────────────────────────────────────────────
function AvatarFallback({ name, size = 56 }: { name: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
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

// ──────────────────────────────────────────────
// Professional card
// ──────────────────────────────────────────────
function ProfessionalCard({ pro }: { pro: Professional }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        {pro.avatarUrl ? (
          <img
            src={pro.avatarUrl}
            alt={pro.displayName}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <AvatarFallback name={pro.displayName} size={56} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-base truncate">{pro.displayName}</h3>
            {pro.isVerified && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            )}
            {pro.isAcceptingLeads && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-200">
                Accepting clients
              </span>
            )}
          </div>
          {pro.title && <p className="text-sm text-gray-500 mt-0.5">{pro.title}</p>}
          {(pro.locationCity || pro.locationCountry) && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {[pro.locationCity, pro.locationCountry].filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      {pro.bio && (
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{pro.bio}</p>
      )}

      {/* Services */}
      {pro.services.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Specialisations</p>
          <div className="flex flex-wrap gap-1.5">
            {pro.services.slice(0, 5).map((s) => (
              <span key={s} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full">
                {s}
              </span>
            ))}
            {pro.services.length > 5 && (
              <span className="bg-slate-100 text-slate-500 text-xs px-2.5 py-1 rounded-full">
                +{pro.services.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Corridors */}
      {pro.corridors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Destination Countries
          </p>
          <div className="flex flex-wrap gap-1.5">
            {pro.corridors.slice(0, 6).map((c) => (
              <span key={c} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                {c}
              </span>
            ))}
            {pro.corridors.length > 6 && (
              <span className="bg-blue-50 text-blue-500 text-xs px-2.5 py-1 rounded-full">
                +{pro.corridors.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Languages */}
      {pro.languages.length > 0 && (
        <p className="text-xs text-gray-400">
          🗣 {pro.languages.join(', ')}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
        <div className="flex items-center gap-3">
          {pro.linkedinUrl && (
            <a
              href={pro.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {pro.websiteUrl && (
            <a
              href={pro.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#0F2557] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {pro.organization && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />{pro.organization.name}
            </span>
          )}
        </div>
        <Link
          href={`/find-a-specialist/${pro.userId}`}
          className="text-sm font-semibold text-[#0F2557] hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          View Profile <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────
export default function FindASpecialistPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<{ id: string; name: string; caseType: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  // ── Load services for filter dropdown ──
  useEffect(() => {
    immigrationApi.getPublicServices().then((res) => {
      if (res.success && res.data) setServices(res.data);
    });
  }, []);

  // ── Fetch directory ──
  const fetchDirectory = useCallback(async (pg: number = 1) => {
    setLoading(true);
    try {
      const res = await immigrationApi.getPublicDirectory({
        service: selectedService || undefined,
        destinationCountry: destinationCountry || undefined,
        page: pg,
        limit: 12,
      });
      if (res.success && res.data) {
        // Client-side filter for search text, verified, accepting
        let profiles: Professional[] = res.data.profiles || [];
        if (search.trim()) {
          const q = search.toLowerCase();
          profiles = profiles.filter(
            (p) =>
              p.displayName.toLowerCase().includes(q) ||
              (p.bio || '').toLowerCase().includes(q) ||
              (p.title || '').toLowerCase().includes(q) ||
              p.services.some((s) => s.toLowerCase().includes(q)) ||
              (p.locationCountry || '').toLowerCase().includes(q) ||
              (p.locationCity || '').toLowerCase().includes(q)
          );
        }
        if (verifiedOnly) profiles = profiles.filter((p) => p.isVerified);
        if (acceptingOnly) profiles = profiles.filter((p) => p.isAcceptingLeads);
        setProfessionals(profiles);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setPage(pg);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedService, destinationCountry, search, verifiedOnly, acceptingOnly]);

  useEffect(() => {
    fetchDirectory(1);
  }, [fetchDirectory]);

  const clearFilters = () => {
    setSelectedService('');
    setDestinationCountry('');
    setVerifiedOnly(false);
    setAcceptingOnly(false);
    setSearch('');
  };

  const hasFilters = selectedService || destinationCountry || verifiedOnly || acceptingOnly || search;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Nav ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0F2557] rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">IA</span>
              </div>
              <span className="font-bold text-gray-900">ImmigrationAI</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium">Home</Link>
              <Link href="/find-a-specialist" className="text-sm text-[#0F2557] font-semibold border-b-2 border-[#0F2557]">Find a Specialist</Link>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-[#0F2557] font-medium">Log In</Link>
              <Link
                href="/auth/signup"
                className="bg-[#0F2557] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3570] transition-colors"
              >
                Get Started
              </Link>
            </div>
            <button
              className="md:hidden p-2 rounded-lg text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
              <Link href="/" className="block text-sm text-gray-700 font-medium px-2">Home</Link>
              <Link href="/auth/login" className="block text-sm text-gray-700 font-medium px-2">Log In</Link>
              <Link href="/auth/signup" className="block bg-[#0F2557] text-white px-4 py-2 rounded-lg text-sm font-semibold text-center">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-[#0F2557] text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
            <Users className="w-3.5 h-3.5" />
            Global Directory of Verified Immigration Professionals
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
            Find a Trusted<br />Immigration Specialist
          </h1>
          <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
            Connect with verified consultants, lawyers, and agencies who handle immigration
            to any country worldwide. Every profile is reviewed by our team.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-2 flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by name, country, visa type…"
                className="flex-1 text-gray-900 text-sm outline-none bg-transparent placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => fetchDirectory(1)}
              className="bg-[#0F2557] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1a3570] transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <div className="bg-blue-50 border-b border-blue-100 py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6 text-sm text-blue-800">
          <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-600" /> Admin-verified credentials</span>
          <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-blue-600" /> All destination countries</span>
          <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-500" /> Rated by real clients</span>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-gray-500">
              {loading ? 'Loading…' : `${total} specialist${total !== 1 ? 's' : ''} found`}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-full transition-colors"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
              showFilters ? 'bg-[#0F2557] text-white border-[#0F2557]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#0F2557]'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters {hasFilters ? '•' : ''}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Service */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Immigration Service
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0F2557]/20 focus:border-[#0F2557] bg-white"
                >
                  <option value="">All services</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.caseType}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Destination Country */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Destination Country
                </label>
                <input
                  type="text"
                  placeholder="e.g. Canada, UK, Germany"
                  value={destinationCountry}
                  onChange={(e) => setDestinationCountry(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0F2557]/20 focus:border-[#0F2557]"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-3 justify-end">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#0F2557]"
                  />
                  <span className="text-sm text-gray-700">Verified only</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptingOnly}
                    onChange={(e) => setAcceptingOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#0F2557]"
                  />
                  <span className="text-sm text-gray-700">Accepting clients</span>
                </label>
              </div>

              {/* Apply */}
              <div className="flex items-end">
                <button
                  onClick={() => fetchDirectory(1)}
                  className="w-full bg-[#0F2557] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a3570] transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : professionals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No specialists found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {hasFilters
                ? 'Try adjusting your filters or clearing them to see all specialists.'
                : 'No verified specialists are currently listed. Check back soon as new professionals join the platform.'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="bg-[#0F2557] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a3570] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((pro) => (
              <ProfessionalCard key={pro.id} pro={pro} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => fetchDirectory(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-[#0F2557] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button
              onClick={() => fetchDirectory(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-[#0F2557] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#0F2557] to-[#1a3570] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Are you an immigration professional?</h2>
          <p className="text-blue-200 mb-6 max-w-xl mx-auto">
            List your profile, receive verified client leads, and manage all your immigration cases with AI tools — in one platform.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-amber-400 text-[#0F2557] px-8 py-3 rounded-xl font-bold text-sm hover:bg-amber-300 transition-colors"
          >
            Create Your Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16 py-8 text-center text-xs text-gray-400">
        <p>© {new Date().getFullYear()} ImmigrationAI · <Link href="/" className="hover:text-[#0F2557]">Home</Link> · <Link href="/auth/signup" className="hover:text-[#0F2557]">Sign Up</Link></p>
      </footer>
    </div>
  );
}
