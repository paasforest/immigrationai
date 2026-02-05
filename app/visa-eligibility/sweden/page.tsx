import { Metadata } from 'next';
import SwedenVisaEligibilityClient from './SwedenVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'Sweden Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your Sweden visa eligibility in minutes. AI-powered screening for Work Permit, Student Visa, Partner Visa, and EU Blue Card. Get instant feedback.',
  keywords: 'Sweden visa eligibility, Sweden work permit, Sweden student visa, Sweden visa for Africans, EU Blue Card Sweden',
  openGraph: {
    title: 'Sweden Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your Sweden visa eligibility in minutes. AI-powered screening for Work Permit, Student, and Partner visas.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/sweden',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/sweden',
  },
};

export default function SwedenVisaEligibility() {
  return <SwedenVisaEligibilityClient />;
}
