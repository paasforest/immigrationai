'use client';

import { useState } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

const africanCountries = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Ethiopia',
  'Zimbabwe',
  'Uganda',
  'Tanzania',
];

const destinations = [
  { value: 'UK', label: '🇬🇧 UK', flag: '🇬🇧' },
  { value: 'Canada', label: '🇨🇦 Canada', flag: '🇨🇦' },
  { value: 'USA', label: '🇺🇸 USA', flag: '🇺🇸' },
  { value: 'Germany', label: '🇩🇪 Germany', flag: '🇩🇪' },
  { value: 'UAE', label: '🇦🇪 UAE', flag: '🇦🇪' },
];

const providerColors: Record<string, string> = {
  'VFS Global': 'bg-blue-100 text-blue-800 border-blue-300',
  'US Embassy': 'bg-[#0F2557] text-white border-[#0F2557]',
  'US Consulate': 'bg-[#0F2557] text-white border-[#0F2557]',
  'CGI': 'bg-green-100 text-green-800 border-green-300',
  'IOM': 'bg-gray-100 text-gray-800 border-gray-300',
};

function getWaitTimeColor(days: number): string {
  if (days <= 14) return 'bg-green-50 text-green-700 border-green-200';
  if (days <= 30) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

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
}

export default function VACTracker() {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [centres, setCentres] = useState<VACCentre[]>([]);
  const [waitTimes, setWaitTimes] = useState<any>(null);
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!selectedCountry || !selectedDestination) {
      toast.error('Please select both country and destination');
      return;
    }

    try {
      setIsLoading(true);
      setHasSearched(true);

      // Fetch centres
      const centresResponse = await immigrationApi.getVACCentres(
        selectedCountry,
        selectedDestination
      );
      if (centresResponse.success && centresResponse.data) {
        setCentres(centresResponse.data);
      }

      // Fetch wait times and tips
      const city = centresResponse.data?.[0]?.city || selectedCountry;
      const waitResponse = await immigrationApi.getWaitTimes(city, selectedDestination);
      if (waitResponse.success && waitResponse.data) {
        setWaitTimes(waitResponse.data);
        setTips(waitResponse.data.tips || []);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Failed to fetch VAC information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Country</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {africanCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Destination Visa</label>
              <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((dest) => (
                    <SelectItem key={dest.value} value={dest.value}>
                      {dest.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-[#0F2557] hover:bg-[#0F2557]/90"
              >
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && !isLoading && (
        <>
          {centres.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">
                VAC Centres in {selectedCountry} for {selectedDestination} visas
              </h2>
              <p className="text-sm text-gray-600 mb-4">{centres.length} centres found</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centres.map((centre) => {
                  const waitDays = centre.averageWaitDays[selectedDestination] || 0;
                  return (
                    <Card key={centre.id} className="border border-gray-200 shadow-sm">
                      <CardContent className="p-5 space-y-4">
                        {/* Top Row */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={providerColors[centre.provider] || 'bg-gray-100'}>
                              {centre.provider}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <h3 className="font-bold text-lg">{centre.city}</h3>
                            <p className="text-sm text-gray-600">{centre.country}</p>
                          </div>
                        </div>

                        {/* Middle */}
                        <div className="space-y-2 text-sm">
                          {centre.address && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{centre.address}</span>
                            </div>
                          )}
                          {centre.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{centre.phone}</span>
                            </div>
                          )}
                          {centre.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{centre.email}</span>
                            </div>
                          )}
                          {centre.openingHours && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{centre.openingHours}</span>
                            </div>
                          )}
                        </div>

                        {/* Wait Time */}
                        {waitDays > 0 && (
                          <div className={`rounded-lg p-3 border ${getWaitTimeColor(waitDays)}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Estimated Wait</span>
                              <span className="text-2xl font-bold">{waitDays}</span>
                            </div>
                            <p className="text-xs mt-1 opacity-75">
                              Estimates only — check official portal
                            </p>
                          </div>
                        )}

                        {/* Notes */}
                        {centre.notes && (
                          <p className="text-xs text-gray-600 italic">{centre.notes}</p>
                        )}

                        {/* Book Button */}
                        <Button
                          className="w-full"
                          onClick={() => window.open(centre.bookingUrl, '_blank')}
                        >
                          Book Appointment
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tips Section */}
          {tips.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-600" />
                  Tips for {selectedDestination} visa appointments
                </h3>
                <div className="space-y-2">
                  {tips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 pl-4 border-l-4 border-amber-300"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-900">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Default State */}
      {!hasSearched && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Search above for detailed information</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {['Lagos', 'Abuja', 'Accra', 'Nairobi', 'Johannesburg', 'Cape Town', 'Addis Ababa', 'Kampala'].map(
                (city) => (
                  <div
                    key={city}
                    className="border border-gray-200 rounded-lg p-3 text-sm hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="font-medium">{city}</p>
                    <p className="text-xs text-gray-500 mt-1">Click to search</p>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">Important Disclaimer</h4>
              <p className="text-sm text-red-800 mb-3">
                Wait times are approximate estimates based on historical data and may not reflect
                current availability. Appointment slots change daily. Always visit the official
                booking portal to check real-time availability.
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <a
                  href="https://www.vfsglobal.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-700 hover:underline"
                >
                  VFS Global
                </a>
                <span className="text-red-600">•</span>
                <a
                  href="https://www.vfsglobal.com/canada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-700 hover:underline"
                >
                  IRCC
                </a>
                <span className="text-red-600">•</span>
                <a
                  href="https://ais.usvisa-info.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-700 hover:underline"
                >
                  US Visa Info
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
