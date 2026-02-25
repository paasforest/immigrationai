'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import VerificationQueue from '@/components/admin/VerificationQueue';

export default function VerificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Check if user is admin - you may need to check user.role === 'admin'
      // For now, this is a placeholder - adjust based on your auth system
    }
  }, [user, loading, router]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Professional Verifications</h1>
        <p className="text-gray-600 mt-1">Review and verify professional credentials</p>
      </div>
      <VerificationQueue />
    </div>
  );
}
