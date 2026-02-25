'use client';

import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { initializeTracking, captureUTMParameters } from '@/lib/utm-tracker';
import GoogleAnalytics, { trackUTMCampaign } from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize UTM tracking and Google Analytics on app load
  useEffect(() => {
    // Initialize UTM tracking
    initializeTracking();
    
    // Track UTM parameters in Google Analytics
    const utmParams = captureUTMParameters();
    if (Object.keys(utmParams).length > 0) {
      trackUTMCampaign(utmParams);
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <OrganizationProvider>
            <SubscriptionProvider>
              {children}
            </SubscriptionProvider>
          </OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
