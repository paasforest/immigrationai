'use client';

import { useState, useEffect } from 'react';
import { getServices, type Service } from '@/lib/api/publicIntake';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DirectoryFiltersProps {
  onFiltersChange: (filters: {
    service?: string;
    originCountry?: string;
    destinationCountry?: string;
  }) => void;
}

const originCountries = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Ethiopia',
  'Zimbabwe',
  'Uganda',
  'Tanzania',
  'Cameroon',
  'Senegal',
];

const destinationCountries = [
  'United Kingdom',
  'Canada',
  'United States',
  'Germany',
  'UAE',
  'Australia',
];

export default function DirectoryFilters({ onFiltersChange }: DirectoryFiltersProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [originFilter, setOriginFilter] = useState<string>('all');
  const [destinationFilter, setDestinationFilter] = useState<string>('all');

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    onFiltersChange({
      service: serviceFilter === 'all' ? undefined : serviceFilter,
      originCountry: originFilter === 'all' ? undefined : originFilter,
      destinationCountry: destinationFilter === 'all' ? undefined : destinationFilter,
    });
  }, [serviceFilter, originFilter, destinationFilter, onFiltersChange]);

  const fetchServices = async () => {
    try {
      const data = await getServices();
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const hasActiveFilters = serviceFilter !== 'all' || originFilter !== 'all' || destinationFilter !== 'all';

  const clearFilters = () => {
    setServiceFilter('all');
    setOriginFilter('all');
    setDestinationFilter('all');
  };

  return (
    <div className="bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Service Type</label>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="rounded-lg border px-4 py-2 text-sm">
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.caseType}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Origin Country</label>
            <Select value={originFilter} onValueChange={setOriginFilter}>
              <SelectTrigger className="rounded-lg border px-4 py-2 text-sm">
                <SelectValue placeholder="Any Origin Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Origin Country</SelectItem>
                {originCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Destination Country</label>
            <Select value={destinationFilter} onValueChange={setDestinationFilter}>
              <SelectTrigger className="rounded-lg border px-4 py-2 text-sm">
                <SelectValue placeholder="Any Destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Destination</SelectItem>
                {destinationCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
