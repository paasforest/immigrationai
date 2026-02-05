import { Metadata } from 'next';
import CanadaVisaEligibilityPage from './CanadaVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'Canada Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your Canada visa eligibility in minutes. AI-powered screening for Express Entry, Study Permit, Work Permit, and Spousal Sponsorship. Get instant feedback and document requirements.',
  keywords: 'Canada visa eligibility, Canada Express Entry, Canada study permit, Canada work permit, Canada PR, Canada visa for Africans',
  openGraph: {
    title: 'Canada Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your Canada visa eligibility in minutes. AI-powered screening for Express Entry, Study Permit, and more.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/canada',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/canada',
  },
};

export default function CanadaVisaEligibility() {
  return <CanadaVisaEligibilityPage />;
}
