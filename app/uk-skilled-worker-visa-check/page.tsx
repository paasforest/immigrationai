import { Metadata } from 'next';
import Link from 'next/link';
import { Globe, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'UK Skilled Worker Visa Check for Africans | Immigration AI',
  description: 'Check your UK Skilled Worker Visa eligibility in minutes. AI-powered screening for Health & Care Worker Visa, Skilled Worker Visa, and Tier 2 visas. Get instant feedback and document checklist.',
  keywords: 'UK skilled worker visa, UK health care worker visa, UK tier 2 visa, UK work visa for Africans, UK skilled worker visa eligibility',
  openGraph: {
    title: 'UK Skilled Worker Visa Check for Africans | Immigration AI',
    description: 'Check your UK Skilled Worker Visa eligibility in minutes. AI-powered screening for Health & Care Worker and Skilled Worker visas.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/uk-skilled-worker-visa-check',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/uk-skilled-worker-visa-check',
  },
};

export default function UKSkilledWorkerVisaCheck() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
      <section className="pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-medium">UK Skilled Worker Visa Check</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            UK Skilled Worker Visa Eligibility Check
            <span className="block mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              For African Applicants
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Check your eligibility for UK Skilled Worker Visa and Health & Care Worker Visa. Get instant AI-powered feedback based on actual UK visa requirements.
          </p>
        </div>
      </section>
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">What We Check</h2>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Job offer and Certificate of Sponsorship (CoS)</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Skill level and occupation eligibility</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700">English language requirements (CEFR B1 level)</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Salary threshold (£25,600+ or going rate)</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-gray-700">Maintenance funds (£1,270+ for 28 days)</span>
              </li>
            </ul>
          </div>
          <div className="text-center">
            <Link href="/visa-eligibility/uk" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all inline-flex items-center space-x-2">
              <span>Check UK Skilled Worker Visa Eligibility</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'UK Skilled Worker Visa Eligibility Checker',
            applicationCategory: 'TravelApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'ZAR',
            },
          }),
        }}
      />
    </div>
  );
}
