import { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About Immigration AI - AI-Powered Visa Document Assistant',
  description: 'Learn about Immigration AI - the AI-powered platform helping African applicants succeed with UK, USA, Canada, and other visa applications through professional document generation and eligibility checking.',
  keywords: 'about Immigration AI, visa document service, immigration assistance, AI visa tools',
  openGraph: {
    title: 'About Immigration AI - AI-Powered Visa Document Assistant',
    description: 'Learn about Immigration AI - helping African applicants succeed with visa applications.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/about',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/about',
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}


