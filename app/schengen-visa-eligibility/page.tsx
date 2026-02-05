import { Metadata } from 'next';
import Link from 'next/link';
import { Globe } from 'lucide-react';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-purple-100">
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
            Schengen Visa Eligibility Check
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Check your Schengen visa eligibility for France, Netherlands, Italy, and other Schengen countries.
          </p>
          <Link href="/" className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all inline-flex items-center space-x-2">
            <span>Check Eligibility</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
