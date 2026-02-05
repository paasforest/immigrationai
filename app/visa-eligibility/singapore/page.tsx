import { Metadata } from 'next';
import SingaporeVisaEligibilityClient from './SingaporeVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'Singapore Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your Singapore visa eligibility in minutes. AI-powered screening for Employment Pass, S Pass, Student Pass, Dependent Pass, and Entrepreneur Pass. Get instant feedback.',
  keywords: 'Singapore visa eligibility, Singapore Employment Pass, Singapore S Pass, Singapore visa for Africans, Singapore work visa',
  openGraph: {
    title: 'Singapore Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your Singapore visa eligibility in minutes. AI-powered screening for Employment Pass, S Pass, Student Pass, and Dependent Pass.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/singapore',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/singapore',
  },
};

export default function SingaporeVisaEligibility() {
  return <SingaporeVisaEligibilityClient />;
}
