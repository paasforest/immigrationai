import { Metadata } from 'next';

export const homepageMetadata: Metadata = {
  title: {
    default: 'Immigration AI - AI-Powered Visa Document Assistant for African Applicants',
    template: '%s | Immigration AI',
  },
  description: 'Generate professional SOPs, cover letters, and visa documents in minutes. AI-powered tools for UK, USA, Canada, Ireland, Germany, and Schengen visa applications. Trusted by thousands of successful applicants.',
  keywords: [
    'immigration AI',
    'visa documents',
    'SOP generator',
    'cover letter writer',
    'UK visa',
    'Canada visa',
    'USA visa',
    'visa application help',
    'African applicants',
    'visa eligibility check',
    'visa document generator',
    'statement of purpose',
    'visa interview practice',
    'immigration assistance',
    'visa application software',
  ],
  authors: [{ name: 'Immigration AI' }],
  creator: 'Immigration AI',
  publisher: 'Immigration AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.immigrationai.co.za'),
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://www.immigrationai.co.za',
    siteName: 'Immigration AI',
    title: 'Immigration AI - AI-Powered Visa Document Assistant for African Applicants',
    description: 'Generate professional SOPs, cover letters, and visa documents in minutes. AI-powered tools for UK, USA, Canada, Ireland, Germany, and Schengen visa applications.',
    images: [
      {
        url: '/og-image.jpg', // You should add this image
        width: 1200,
        height: 630,
        alt: 'Immigration AI - AI-Powered Visa Document Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immigration AI - AI-Powered Visa Document Assistant',
    description: 'Generate professional SOPs, cover letters, and visa documents in minutes. AI-powered tools for visa applications.',
    images: ['/og-image.jpg'],
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
  verification: {
    // Add your Google Search Console verification code here
    // google: 'your-verification-code',
  },
  category: 'Travel & Immigration',
};
