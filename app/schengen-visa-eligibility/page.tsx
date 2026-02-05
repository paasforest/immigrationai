import { Metadata } from 'next';
import SchengenVisaEligibilityClient from './SchengenVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'Schengen Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your Schengen visa eligibility in minutes. AI-powered screening for Tourist, Business, Student, and Family Reunion visas for France, Netherlands, Italy, and other Schengen countries.',
  keywords: 'Schengen visa eligibility, Schengen visa for Africans, France visa, Netherlands visa, Italy visa, Schengen visa check',
  openGraph: {
    title: 'Schengen Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your Schengen visa eligibility in minutes. AI-powered screening for Tourist, Business, Student, and Family visas.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/schengen-visa-eligibility',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/schengen-visa-eligibility',
  },
};

export default function SchengenVisaEligibility() {
  return <SchengenVisaEligibilityClient />;
}
