import { Metadata } from 'next';

export const homepageMetadata: Metadata = {
  title: 'Immigration AI - AI-Powered Visa Document Assistant for African Applicants',
  description: 'Generate professional SOPs, cover letters, and visa documents in minutes. AI-powered tools for UK, USA, Canada, Ireland, Germany, and Schengen visa applications. Trusted by thousands of successful applicants.',
  keywords: 'immigration AI, visa documents, SOP generator, cover letter writer, UK visa, Canada visa, USA visa, visa application help, African applicants',
  openGraph: {
    title: 'Immigration AI - AI-Powered Visa Document Assistant',
    description: 'Generate professional SOPs, cover letters, and visa documents in minutes. AI-powered tools for visa applications.',
    type: 'website',
    url: 'https://www.immigrationai.co.za',
    siteName: 'Immigration AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immigration AI - AI-Powered Visa Document Assistant',
    description: 'Generate professional SOPs, cover letters, and visa documents in minutes.',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za',
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
};
