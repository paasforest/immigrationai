import { Metadata } from 'next';
import NewZealandVisaEligibilityClient from './NewZealandVisaEligibilityClient';

export const metadata: Metadata = {
  title: 'New Zealand Visa Eligibility Check for Africans | Immigration AI',
  description: 'Check your New Zealand visa eligibility in minutes. AI-powered screening for Skilled Migrant Category (SMC), Student Visa, Partner Visa, and Work Visa. Get instant feedback.',
  keywords: 'New Zealand visa eligibility, NZ skilled migrant, NZ SMC visa, New Zealand student visa, NZ visa for Africans',
  openGraph: {
    title: 'New Zealand Visa Eligibility Check for Africans | Immigration AI',
    description: 'Check your New Zealand visa eligibility in minutes. AI-powered screening for Skilled Migrant Category, Student, and Work visas.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility/new-zealand',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility/new-zealand',
  },
};

export default function NewZealandVisaEligibility() {
  return <NewZealandVisaEligibilityClient />;
}
