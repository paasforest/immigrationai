import { Metadata } from 'next';
import PortugalVisaEligibilityClient from './PortugalVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'Portugal Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your Portugal visa eligibility in minutes. AI-powered screening for Golden Visa, D7 Passive Income Visa, D2 Entrepreneur Visa, Student Visa, and Work Visa. Get instant feedback.',
  keywords: 'Portugal visa eligibility, Portugal Golden Visa, Portugal D7 visa, Portugal D2 visa, Portugal student visa, Portugal visa for Africans',
  openGraph: {
    title: 'Portugal Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your Portugal visa eligibility in minutes. AI-powered screening for Golden Visa, D7 Passive Income, D2 Entrepreneur, and Student visas.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/portugal',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/portugal',
  },
};

export default function PortugalVisaEligibility() {
  return <PortugalVisaEligibilityClient />;
}
