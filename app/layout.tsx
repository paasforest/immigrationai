import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.immigrationai.co.za'),
  title: {
    default: 'ImmigrationAI — AI-Powered Immigration Case Management for Professionals',
    template: '%s | ImmigrationAI',
  },
  description:
    'The AI-powered immigration case management platform for agencies, consultants, and lawyers worldwide. Manage cases to UK, Canada, USA, Australia, South Africa, Germany, UAE and any country. Prevent visa rejections with AI, client portals, and live regulation monitoring.',
  keywords: [
    // For practitioners
    'immigration case management software',
    'immigration agency software',
    'immigration consultant software',
    'visa application management system',
    'immigration practice management',
    'ai immigration tools',
    // For applicants
    'visa rejected what to do',
    'visa rejection appeal help',
    'immigration consultant near me',
    'immigration lawyer',
    'find immigration professional',
    // Destination countries
    'uk visa application help',
    'canada immigration consultant',
    'australia visa help',
    'germany immigration',
    'south africa immigration consultant',
    'uae visa help',
    'new zealand immigration',
    'schengen visa help',
    // SA market (primary)
    'immigration consultant south africa',
    'immigration lawyer johannesburg',
    'immigration lawyer cape town',
    'immigration lawyer pretoria',
    'critical skills visa south africa',
    'work permit south africa',
    'spousal visa south africa',
    'visa rejected south africa',
    // Visa types
    'skilled worker visa',
    'work permit application',
    'spousal visa application',
    'study visa help',
    'business visa',
    'intra company transfer visa',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://www.immigrationai.co.za',
    siteName: 'ImmigrationAI',
    title: 'ImmigrationAI — AI Immigration Case Management for Professionals Worldwide',
    description:
      'Manage immigration cases to any country with AI tools that prevent rejections. Built for agencies, consultants, and lawyers. UK · Canada · USA · Australia · South Africa · UAE and beyond.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ImmigrationAI — Immigration Case Management Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ImmigrationAI — AI Immigration Case Management for Professionals',
    description:
      'The AI-powered platform for immigration agencies and consultants worldwide. Manage cases to any country — UK, Canada, Australia, South Africa, UAE and more.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za',
  },
  authors: [{ name: 'ImmigrationAI', url: 'https://www.immigrationai.co.za' }],
  creator: 'ImmigrationAI',
  publisher: 'ImmigrationAI',
  category: 'Technology',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
