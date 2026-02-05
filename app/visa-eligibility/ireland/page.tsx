import { Metadata } from 'next';
import Link from 'next/link';
import { Globe } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-green-100">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Immigration AI
            </span>
          </Link>
        </nav>
      </header>
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Ireland Visa Eligibility Check
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Check your Ireland visa eligibility for Critical Skills Employment Permit, Student Visa, and more.
          </p>
          <Link href="/" className="bg-gradient-to-r from-green-600 to-green-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all inline-flex items-center space-x-2">
            <span>Check Eligibility</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
