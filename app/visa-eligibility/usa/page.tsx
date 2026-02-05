import { Metadata } from 'next';
import USAVisaEligibilityPage from './USAVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'USA Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your USA visa eligibility in minutes. AI-powered screening for H-1B, F-1 Student, B1/B2 Visitor, K-1 Fiancé, and Family Green Card visas. Get instant feedback.',
  keywords: 'USA visa eligibility, H1B visa, F1 visa, USA visa for Africans, B1 B2 visa, USA green card, USA visa check',
  openGraph: {
    title: 'USA Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your USA visa eligibility in minutes. AI-powered screening for H-1B, F-1, B1/B2, and more.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/usa',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/usa',
  },
};

export default function USAVisaEligibility() {
  return <USAVisaEligibilityPage />;
}
