'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Users, MapPin, Filter } from 'lucide-react';
import { getCountryFlag } from '@/lib/utils/countryFlags';

const PROFESSIONAL_TYPES = [
  { value: '', label: 'Any type' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'paralegal', label: 'Paralegal' },
  { value: 'notary', label: 'Notary' },
];

export default function NetworkPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [professionalType, setProfessionalType] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [availableForReferrals, setAvailableForReferrals] = useState(false);
  const [availableForCoCounsel, setAvailableForCoCounsel] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, [page, professionalType, destinationCountry, availableForReferrals, availableForCoCounsel]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await immigrationApi.getNetworkDirectory({
        search: search || undefined,
        professionalType: professionalType || undefined,
        destinationCountry: destinationCountry || undefined,
        availableForReferrals: availableForReferrals || undefined,
        availableForCoCounsel: availableForCoCounsel || undefined,
        page,
        limit: 24,
      });
      if (res.success && res.data) {
        setProfiles(res.data.profiles);
        setTotal(res.data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProfiles();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Professional Network</h1>
        <p className="text-gray-600 mt-1">
          Find lawyers, consultants, and specialists to collaborate with or refer cases to.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search and filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name or practice</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or practice..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={professionalType}
                onChange={(e) => setProfessionalType(e.target.value)}
              >
                {PROFESSIONAL_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={availableForReferrals}
                  onChange={(e) => setAvailableForReferrals(e.target.checked)}
                />
                Available for referrals
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={availableForCoCounsel}
                  onChange={(e) => setAvailableForCoCounsel(e.target.checked)}
                />
                Available for co-counsel
              </label>
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded mt-3 w-2/3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded mt-2 w-1/2 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No professionals found. Try adjusting your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-gray-600">{total} professional(s) found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((p) => (
              <Card key={p.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0F2557] text-white flex items-center justify-center text-lg font-semibold shrink-0">
                      {(p.displayName || p.userId).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 truncate">{p.displayName}</span>
                        {p.isVerified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                        {p.professionalType && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {p.professionalType}
                          </Badge>
                        )}
                      </div>
                      {p.title && (
                        <p className="text-sm text-gray-600 mt-0.5">{p.title}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(p.destinationCountries || []).slice(0, 5).map((c: string) => (
                          <span key={c} title={c}>{getCountryFlag(c)}</span>
                        ))}
                      </div>
                      {(p.availableForReferrals || p.availableForCoCounsel) && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {p.availableForReferrals && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">Referrals</Badge>
                          )}
                          {p.availableForCoCounsel && (
                            <Badge className="bg-green-100 text-green-800 text-xs">Co-counsel</Badge>
                          )}
                        </div>
                      )}
                      {(p.locationCity || p.locationCountry) && (
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {[p.locationCity, p.locationCountry].filter(Boolean).join(', ')}
                        </p>
                      )}
                      <Button asChild size="sm" className="mt-3 w-full">
                        <Link href={`/dashboard/immigration/network/${p.userId}`}>
                          View profile
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
