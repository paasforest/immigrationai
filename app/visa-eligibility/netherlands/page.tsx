import { Metadata } from 'next';
import NetherlandsVisaEligibilityClient from './NetherlandsVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'Netherlands Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your Netherlands visa eligibility in minutes. AI-powered screening for Highly Skilled Migrant Permit, Student Visa, Partner Visa, and EU Blue Card. Get instant feedback.',
  keywords: 'Netherlands visa eligibility, Netherlands HSM permit, Netherlands student visa, Netherlands visa for Africans, EU Blue Card Netherlands',
  openGraph: {
    title: 'Netherlands Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your Netherlands visa eligibility in minutes. AI-powered screening for Highly Skilled Migrant Permit, Student, and Partner visas.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/netherlands',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/netherlands',
  },
};

export default function NetherlandsVisaEligibility() {
  return <NetherlandsVisaEligibilityClient />;
}
