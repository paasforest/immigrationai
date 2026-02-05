import { Metadata } from 'next';
import Link from 'next/link';
import UKVisaEligibilityPage from './UKVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'UK Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check if you qualify for a UK visa in minutes. AI-powered eligibility screening for African applicants applying for Skilled Worker, Health & Care, Student, and visit visas. Get instant feedback and document checklist.',
  keywords: 'UK visa eligibility, UK visa check, UK skilled worker visa, UK student visa, UK visa for Africans, UK visa requirements, UK visa application',
  openGraph: {
    title: 'UK Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check if you qualify for a UK visa in minutes. AI-powered eligibility screening for African applicants.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/uk',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/uk',
  },
};

export default function UKVisaEligibility() {
  return <UKVisaEligibilityPage />;
}
