import { Metadata } from 'next';
import GermanyVisaEligibilityClient from './GermanyVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'Germany Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your Germany visa eligibility in minutes. AI-powered screening for EU Blue Card, Job Seeker Visa, Student Visa, and Family Reunion visas.',
  keywords: 'Germany visa eligibility, EU Blue Card, Germany job seeker visa, Germany student visa, Germany visa for Africans',
  openGraph: {
    title: 'Germany Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your Germany visa eligibility in minutes. AI-powered screening for EU Blue Card, Job Seeker, and Student visas.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/germany',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/germany',
  },
};

export default function GermanyVisaEligibility() {
  return <GermanyVisaEligibilityClient />;
}
