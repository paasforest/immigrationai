'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, CheckCircle2, Minus, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface University {
  university: string;
  country: string;
  ukStatus: string;
  canadaStatus: string;
  usaStatus: string;
  notes: string | null;
}

const countryFlags: Record<string, string> = {
  Nigeria: '🇳🇬',
  Ghana: '🇬🇭',
  Kenya: '🇰🇪',
  'South Africa': '🇿🇦',
  Ethiopia: '🇪🇹',
  Uganda: '🇺🇬',
  Tanzania: '🇹🇿',
  Zimbabwe: '🇿🇼',
};

function getStatusBadge(status: string) {
  if (status === 'recognised') {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-300">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Recognised
      </Badge>
    );
  } else if (status === 'partial') {
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-300">
        <Minus className="w-3 h-3 mr-1" />
        Partial
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-red-100 text-red-800 border-red-300">
        <XCircle className="w-3 h-3 mr-1" />
        Not Recognised
      </Badge>
    );
  }
}

export default function UniversityLookup() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [results, setResults] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search when debounced term changes
  useEffect(() => {
    if (debouncedSearch.trim().length >= 2) {
      searchUniversities();
    } else {
      setResults([]);
    }
  }, [debouncedSearch]);

  const searchUniversities = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.checkUniversityRecognition(debouncedSearch);
      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setResults([]);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error('Failed to search universities');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search your university..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && debouncedSearch.length < 2 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <GraduationCap className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-600">Search for your university above</p>
        </div>
      )}

      {!isLoading && debouncedSearch.length >= 2 && results.length === 0 && (
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">
              University not found in our database
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-md">
              <p className="text-sm text-amber-800">
                Use the AI Guide tab for personalised advice on getting your qualifications evaluated
              </p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((uni, idx) => (
            <Card key={idx} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <span className="text-2xl">{countryFlags[uni.country] || '🌍'}</span>
                      {uni.university}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{uni.country}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">UK:</span>
                    {getStatusBadge(uni.ukStatus)}
                    <span className="text-xs text-gray-500 ml-2">Canada:</span>
                    {getStatusBadge(uni.canadaStatus)}
                    <span className="text-xs text-gray-500 ml-2">USA:</span>
                    {getStatusBadge(uni.usaStatus)}
                  </div>

                  {uni.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">{uni.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
