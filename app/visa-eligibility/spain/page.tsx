import { Metadata } from 'next';
import SpainVisaEligibilityClient from './SpainVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'Spain Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your Spain visa eligibility in minutes. AI-powered screening for Golden Visa, Non-Lucrative Visa, Student Visa, Work Visa, and Entrepreneur Visa. Get instant feedback.',
  keywords: 'Spain visa eligibility, Spain Golden Visa, Spain non-lucrative visa, Spain student visa, Spain visa for Africans',
  openGraph: {
    title: 'Spain Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your Spain visa eligibility in minutes. AI-powered screening for Golden Visa, Non-Lucrative, Student, and Work visas.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/spain',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/spain',
  },
};

export default function SpainVisaEligibility() {
  return <SpainVisaEligibilityClient />;
}
