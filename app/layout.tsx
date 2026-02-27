import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.immigrationai.co.za'),
  title: {
    default: 'ImmigrationAI — South Africa\'s AI-Powered Immigration Platform',
    template: '%s | ImmigrationAI South Africa',
  },
  description:
    'Visa rejected in South Africa? Connect with verified immigration consultants and lawyers, or manage cases with AI tools built for SA immigration law. Critical Skills Visa, Work Permits, Spousal Visas & more.',
  keywords: [
    'visa rejected south africa',
    'how to appeal visa rejection south africa',
    'immigration consultant south africa',
    'immigration lawyer johannesburg',
    'immigration lawyer cape town',
    'immigration lawyer pretoria',
    'critical skills visa south africa requirements',
    'work permit south africa',
    'general work permit south africa',
    'spousal visa south africa',
    'study visa south africa',
    'business visa south africa',
    'retired person visa south africa',
    'corporate permit south africa',
    'DHA visa application south africa',
    'VFS global south africa',
    'how long does visa take south africa',
    'visa application requirements south africa',
    'find immigration professional south africa',
    'south africa immigration help',
    'immigration case management software',
    'zimbabwe exemption permit',
    'SADC permit south africa',
    'intra company transfer south africa',
    'visa reapplication after rejection south africa',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://www.immigrationai.co.za',
    siteName: 'ImmigrationAI',
    title: 'ImmigrationAI — South Africa\'s AI-Powered Immigration Platform',
    description:
      'Visa rejected? Find verified SA immigration professionals or manage cases with AI. Covering Critical Skills Visa, Work Permits, Spousal Visas and every SA visa type.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ImmigrationAI — South Africa Immigration Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ImmigrationAI — South Africa\'s AI-Powered Immigration Platform',
    description:
      'Visa rejected? Find verified SA immigration professionals or manage cases with AI tools built for South African immigration law.',
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
    <html lang="en-ZA">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
