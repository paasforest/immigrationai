import { Metadata } from 'next';
import IrelandVisaEligibilityClient from './IrelandVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'Ireland Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your Ireland visa eligibility in minutes. AI-powered screening for Critical Skills Employment Permit, Student Visa, Spousal Sponsorship, and Business visas.',
  keywords: 'Ireland visa eligibility, Ireland work permit, Ireland critical skills, Ireland student visa, Ireland visa for Africans',
  openGraph: {
    title: 'Ireland Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your Ireland visa eligibility in minutes. AI-powered screening for Critical Skills, Student, and Spousal visas.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/ireland',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/ireland',
  },
};

export default function IrelandVisaEligibility() {
  return <IrelandVisaEligibilityClient />;
}
