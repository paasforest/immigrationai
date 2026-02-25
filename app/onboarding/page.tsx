'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { immigrationApi } from '@/lib/api/immigration';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { Skeleton } from '@/components/ui/skeleton';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (loading) return;

      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await immigrationApi.checkOnboardingStatus();
        if (response.success && response.data) {
          if (!response.data.needsOnboarding) {
            // User is already onboarded, redirect to dashboard
            if (user.role === 'applicant') {
              router.push('/portal');
            } else {
              router.push('/dashboard');
            }
            return;
          }
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      } finally {
        setChecking(false);
      }
    };

    checkOnboarding();
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <OnboardingWizard />;
}
