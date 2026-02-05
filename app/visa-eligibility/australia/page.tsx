import { Metadata } from 'next';
import AustraliaVisaEligibilityPage from './AustraliaVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'Australia Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your Australia visa eligibility in minutes. AI-powered screening for Skilled Migration (189/190/491), Student Visa, Partner Visa, and Work Visa. Get instant feedback and document checklist.',
  keywords: 'Australia visa eligibility, Australia skilled migration, Australia 189 visa, Australia 190 visa, Australia 491 visa, Australia student visa, Australia visa for Africans',
  openGraph: {
    title: 'Australia Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your Australia visa eligibility in minutes. AI-powered screening for Skilled Migration, Student Visa, and Work Visa.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/australia',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/australia',
  },
};

export default function AustraliaVisaEligibility() {
  return <AustraliaVisaEligibilityPage />;
}
