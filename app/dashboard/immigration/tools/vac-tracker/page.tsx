'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { immigrationApi } from '@/lib/api/immigration';
import {
  MapPin,
  Clock,
  ExternalLink,
  Phone,
  Mail,
  AlertCircle,
  Search,
  Globe,
  Info,
} from 'lucide-react';

const DESTINATION_COUNTRIES = [
  'UK', 'Canada', 'USA', 'Australia', 'Germany', 'France',
  'Netherlands', 'UAE', 'South Africa', 'New Zealand',
];

const ORIGIN_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Zimbabwe',
  'Ethiopia', 'Egypt', 'Morocco', 'India', 'Pakistan',
  'Philippines', 'China', 'Brazil', 'Mexico',
];

interface VACCentre {
  id: string;
  city: string;
  country: string;
  servesDestinations: string[];
  provider: string;
  address: string;
  phone?: string;
  email?: string;
  bookingUrl: string;
  openingHours: string;
  averageWaitDays: Record<string, number>;
  notes?: string;
  lastUpdated: string;
}

interface WaitTimeResult {
  waitTime: number | null;
  centres: VACCentre[];
  tips: string[];
  disclaimer: string;
}

export default function VACTrackerPage() {
  const [originCountry, setOriginCountry] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [destination, setDestination] = useState('');
  const [centres, setCentres] = useState<VACCentre[]>([]);
  const [waitResult, setWaitResult] = useState<WaitTimeResult | null>(null);
  const [bookingLinks, setBookingLinks] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!originCountry || !destination) return;
    setIsLoading(true);
    setSearched(true);

    try {
      const [centresRes, waitRes, linksRes] = await Promise.all([
        immigrationApi.getVACCentres(originCountry, destination),
        originCity
          ? immigrationApi.getWaitTimes(originCity, destination)
          : Promise.resolve(null),
        immigrationApi.getBookingLinks(destination),
      ]);

      if (centresRes.success) setCentres(centresRes.data || []);
      if (waitRes?.success) setWaitResult(waitRes.data);
      if (linksRes.success) {
        const links = linksRes.data;
        setBookingLinks(
          typeof links === 'object' && links !== null ? links : {}
        );
      }
    } catch (error) {
      console.error('VAC search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWaitBadgeColor = (days: number | null) => {
    if (!days) return 'secondary';
    if (days <= 14) return 'default';
    if (days <= 45) return 'secondary';
    return 'destructive';
  };

  const getWaitLabel = (days: number | null) => {
    if (!days) return 'Unknown';
    if (days <= 14) return `~${days} days (fast)`;
    if (days <= 45) return `~${days} days (moderate)`;
    return `~${days} days (slow)`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">VAC Tracker</h1>
        <p className="text-gray-600 mt-1">
          Find Visa Application Centres, check wait times, and get booking links for any destination.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Wait times shown are <strong>estimates</strong> based on community reports and historical data.
          Always check the official booking portal for real-time availability. Data updated periodically.
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find a VAC Centre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Origin Country *</Label>
              <Select value={originCountry} onValueChange={setOriginCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {ORIGIN_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Origin City (for wait times)</Label>
              <Input
                placeholder="e.g. Lagos, Nairobi"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Destination Country *</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {DESTINATION_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="mt-4 bg-[#0F2557] hover:bg-[#0a1a3d]"
            onClick={handleSearch}
            disabled={isLoading || !originCountry || !destination}
          >
            {isLoading ? 'Searching...' : 'Search VAC Centres'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {searched && (
        <>
          {/* Wait Time Summary */}
          {waitResult && originCity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Wait Time in {originCity}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-[#0F2557]">
                      {waitResult.waitTime ?? '?'}
                    </div>
                    <div className="text-sm text-gray-500">estimated days</div>
                  </div>
                  <div className="flex-1">
                    <Badge
                      variant={getWaitBadgeColor(waitResult.waitTime) as any}
                      className="mb-2"
                    >
                      {getWaitLabel(waitResult.waitTime)}
                    </Badge>
                    <p className="text-xs text-gray-500">{waitResult.disclaimer}</p>
                  </div>
                </div>

                {waitResult.tips && waitResult.tips.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Info className="w-4 h-4" /> Tips for {destination} applications
                    </p>
                    <ul className="space-y-1">
                      {waitResult.tips.map((tip, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Centres */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              VAC Centres in {originCountry}{destination ? ` for ${destination} applications` : ''}
              <span className="text-sm font-normal text-gray-500 ml-2">({centres.length} found)</span>
            </h2>

            {centres.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 font-medium">No VAC centres found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Try a different country/destination combination, or check the official provider websites below.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centres.map((centre) => (
                  <Card key={centre.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{centre.city}</h3>
                          <p className="text-sm text-gray-500">{centre.provider}</p>
                        </div>
                        <Badge variant="outline">{centre.country}</Badge>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span>{centre.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{centre.openingHours}</span>
                        </div>
                        {centre.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{centre.phone}</span>
                          </div>
                        )}
                        {centre.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{centre.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Wait times for this centre */}
                      {Object.keys(centre.averageWaitDays).length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-gray-500 mb-1">Estimated wait times:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(centre.averageWaitDays).map(([dest, days]) => (
                              <Badge
                                key={dest}
                                variant={getWaitBadgeColor(days) as any}
                                className="text-xs"
                              >
                                {dest}: ~{days}d
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {centre.notes && (
                        <p className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded">
                          ℹ️ {centre.notes}
                        </p>
                      )}

                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          className="bg-[#0F2557] hover:bg-[#0a1a3d]"
                          onClick={() => window.open(centre.bookingUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Book Appointment
                        </Button>
                      </div>

                      <p className="text-xs text-gray-400 mt-2">
                        Data updated: {centre.lastUpdated}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Booking Links */}
          {Object.keys(bookingLinks).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Official Booking Portals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(bookingLinks).map(([dest, url]) => (
                    <a
                      key={dest}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <ExternalLink className="w-4 h-4 text-[#0F2557] group-hover:text-amber-500 transition-colors" />
                      <span className="text-sm font-medium text-gray-700">{dest} Portal</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Info Cards */}
      {!searched && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: MapPin,
              title: 'Find Your VAC',
              body: 'Locate the nearest Visa Application Centre for your destination country from anywhere in the world.',
            },
            {
              icon: Clock,
              title: 'Check Wait Times',
              body: 'Get current estimated appointment wait times to help clients plan their application timeline.',
            },
            {
              icon: ExternalLink,
              title: 'Direct Booking',
              body: 'Access official booking portals for VFS Global, TLScontact, BLS International, and embassy portals.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title} className="bg-gradient-to-br from-[#0F2557]/5 to-transparent">
              <CardContent className="p-5">
                <div className="w-10 h-10 bg-[#0F2557]/10 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#0F2557]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
