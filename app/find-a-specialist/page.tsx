'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getDirectory } from '@/lib/api/publicIntake';
import DirectoryFilters from '@/components/intake/DirectoryFilters';
import ProfessionalCard from '@/components/intake/ProfessionalCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Search, UserX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FindSpecialistPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<{
    service?: string;
    originCountry?: string;
    destinationCountry?: string;
  }>({});

  useEffect(() => {
    fetchProfiles();
  }, [filters, page]);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const result = await getDirectory({ ...filters, page });
      setProfiles(result.profiles);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const acceptingCount = profiles.filter((p) => p.isAcceptingLeads).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find an Immigration Specialist
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Browse verified professionals who specialize in African immigration corridors
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-3xl mx-auto">
            <Card className="bg-[#0F2557] text-white border-0">
              <CardContent className="p-6">
                <Sparkles className="w-8 h-8 mb-4 mx-auto" />
                <h3 className="font-bold text-lg mb-2">Get Matched Automatically</h3>
                <p className="text-sm text-blue-100 mb-4">
                  Tell us your situation and we find the best specialist
                </p>
                <Button asChild className="bg-[#F59E0B] text-white hover:bg-[#D97706]">
                  <Link href="/get-help">Get Matched</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-[#0F2557]">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Search className="w-8 h-8 text-[#0F2557]" />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#0F2557]">Browse Specialists</h3>
                <p className="text-sm text-gray-600 mb-1">Find and contact a specialist directly</p>
                <p className="text-xs text-amber-600">You are here</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters */}
      <DirectoryFilters onFiltersChange={handleFiltersChange} />

      {/* Results */}
      <div className="py-8 px-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {total} specialist{total !== 1 ? 's' : ''} found
          </h2>
          {acceptingCount > 0 && (
            <p className="text-green-600 text-sm mt-1">
              {acceptingCount} currently accepting new clients
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <UserX className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No specialists found for your filters
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or get automatically matched
              </p>
              <Button asChild className="bg-[#0F2557] text-white">
                <Link href="/get-help">Get Matched</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <ProfessionalCard key={profile.userId} profile={profile} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
