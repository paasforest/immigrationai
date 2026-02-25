'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import VerificationCard from './VerificationCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function VerificationQueue() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getPendingVerifications();
      if (response.success && response.data) {
        setProfiles(response.data.profiles || []);
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pending Verifications</h2>
        {profiles.length > 0 && (
          <Badge className="bg-amber-100 text-amber-800">{profiles.length}</Badge>
        )}
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">No pending verifications</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profiles.map((profile) => (
            <VerificationCard key={profile.id} profile={profile} onUpdate={fetchProfiles} />
          ))}
        </div>
      )}
    </div>
  );
}
