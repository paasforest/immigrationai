'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { initializeTracking, captureUTMParameters } from '@/lib/utm-tracker';
import GoogleAnalytics, { trackUTMCampaign } from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeTracking();
    const utmParams = captureUTMParameters();
    if (Object.keys(utmParams).length > 0) {
      trackUTMCampaign(utmParams);
    }
  }, []);

  return (
    <div className={inter.className}>
      <GoogleAnalytics />
      <AuthProvider>
        <OrganizationProvider>
          <SubscriptionProvider>
            {children}
          </SubscriptionProvider>
        </OrganizationProvider>
      </AuthProvider>
    </div>
  );
}
