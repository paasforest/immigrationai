import { Metadata } from 'next';
import UAEVisaEligibilityClient from './UAEVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'UAE Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your UAE visa eligibility in minutes. AI-powered screening for Employment Residence, Golden Visa, Family Residence, Investor Visa, and Student Visa. Get instant feedback.',
  keywords: 'UAE visa eligibility, UAE Golden Visa, UAE employment visa, UAE visa for Africans, Dubai visa, Abu Dhabi visa',
  openGraph: {
    title: 'UAE Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your UAE visa eligibility in minutes. AI-powered screening for Employment Residence, Golden Visa, and Family Residence.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/uae',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/uae',
  },
};

export default function UAEVisaEligibility() {
  return <UAEVisaEligibilityClient />;
}
