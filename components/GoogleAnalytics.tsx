'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId?: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  // Use environment variable or provided ID
  const GA_MEASUREMENT_ID = measurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      console.log('📊 Google Analytics initialized:', GA_MEASUREMENT_ID);
    }
  }, [GA_MEASUREMENT_ID]);

  // Don't render if no measurement ID is provided
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Google Analytics gtag.js */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}

// Helper function to track custom events
export function trackGAEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
    console.log('📈 GA Event tracked:', eventName, eventParams);
  }
}

// Helper function to track page views
export function trackGAPageView(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
    console.log('📄 GA Page view tracked:', url);
  }
}

// Helper function to track conversions (signups, purchases, etc.)
export function trackGAConversion(
  conversionType: string,
  value?: number,
  currency: string = 'ZAR'
) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      send_to: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      value: value,
      currency: currency,
      transaction_id: `${conversionType}_${Date.now()}`,
    });
    console.log('💰 GA Conversion tracked:', conversionType, value);
  }
}

// Helper to track UTM campaigns in GA
export function trackUTMCampaign(utmParams: {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'campaign_attribution', {
      campaign_source: utmParams.utm_source,
      campaign_medium: utmParams.utm_medium,
      campaign_name: utmParams.utm_campaign,
      campaign_content: utmParams.utm_content,
      campaign_term: utmParams.utm_term,
    });
    console.log('🎯 GA UTM Campaign tracked:', utmParams);
  }
}



