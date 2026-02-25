import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Zap, ArrowRight, Globe, Clock, Shield, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cover Letter Generator for Visa - AI-Powered Embassy Letters | Immigration AI',
  description: 'Generate professional cover letters for visa applications to UK, USA, Canada, and other embassies. AI-powered cover letter generator creates embassy-ready letters in minutes.',
  keywords: [
    'cover letter for visa',
    'visa cover letter generator',
    'embassy cover letter',
    'visa application cover letter',
    'cover letter generator visa',
    'UK visa cover letter',
    'Canada visa cover letter',
    'USA visa cover letter',
    'professional cover letter visa',
    'visa letter generator',
  ],
  openGraph: {
    title: 'Cover Letter Generator for Visa - AI-Powered Embassy Letters',
    description: 'Generate professional cover letters for visa applications. AI-powered tool creates embassy-ready letters in minutes.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/cover-letter-generator',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/cover-letter-generator',
  },
};

export default function CoverLetterGeneratorLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Cover Letter Generator for Visa Applications
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Generate professional, embassy-ready cover letters for UK, USA, Canada, and other visa applications 
            in minutes. Our AI-powered cover letter generator creates compelling letters that highlight your 
            qualifications and strengthen your application.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/documents/cover-letter">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg">
                Generate Cover Letter
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Use Our Cover Letter Generator?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-indigo-600 mb-4" />
                <CardTitle>AI-Powered Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our advanced AI creates professional cover letters tailored to your visa type, destination 
                  country, and personal background.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Globe className="w-10 h-10 text-indigo-600 mb-4" />
                <CardTitle>Country-Specific Format</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Each cover letter follows the preferred format and style for your destination country&apos;s 
                  embassy or consulate.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="w-10 h-10 text-indigo-600 mb-4" />
                <CardTitle>Generate in Minutes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No more struggling with what to write. Get a complete, professional cover letter ready 
                  in just a few minutes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How Our Cover Letter Generator Works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter Your Information</h3>
                <p className="text-gray-600">
                  Provide details about your visa type, destination country, purpose of visit, background, 
                  and key qualifications.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Generates Your Letter</h3>
                <p className="text-gray-600">
                  Our AI analyzes your information and creates a professional, well-structured cover letter 
                  that highlights your strengths and addresses visa requirements.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Customize</h3>
                <p className="text-gray-600">
                  Review your generated cover letter, make any personal edits, and download it in PDF format 
                  ready for submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Your Cover Letter Includes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CheckCircle className="w-8 h-8 text-indigo-600 mb-2" />
                <CardTitle>Clear Purpose Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  A compelling explanation of your visit purpose that clearly communicates your intentions 
                  to the visa officer.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle className="w-8 h-8 text-indigo-600 mb-2" />
                <CardTitle>Qualification Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your education, work experience, and skills are presented in a way that strengthens your 
                  application.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle className="w-8 h-8 text-indigo-600 mb-2" />
                <CardTitle>Financial Assurance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Clear statements about your financial capacity and ability to fund your trip without 
                  burdening the destination country.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle className="w-8 h-8 text-indigo-600 mb-2" />
                <CardTitle>Ties to Home Country</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Demonstrates your strong connections to your home country, reducing concerns about 
                  overstaying or illegal immigration.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle className="w-8 h-8 text-indigo-600 mb-2" />
                <CardTitle>Travel History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Highlights your previous travel experiences and compliance with visa regulations, 
                  building trust with visa officers.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle className="w-8 h-8 text-indigo-600 mb-2" />
                <CardTitle>Professional Formatting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Embassy-ready formatting that follows professional standards and country-specific 
                  preferences.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions About Cover Letter Generator
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What is a visa cover letter?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  A visa cover letter is a document that accompanies your visa application. It introduces 
                  you to the visa officer, explains your purpose of visit, highlights your qualifications, 
                  and provides context for your application. A well-written cover letter can significantly 
                  strengthen your visa application.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Which countries require cover letters?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  While not always mandatory, cover letters are highly recommended for UK, USA, Canada, 
                  Schengen, and many other visa applications. They help explain your case and can make 
                  a significant difference in approval rates.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>How long should a visa cover letter be?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  A good visa cover letter is typically 1-2 pages long. It should be concise yet comprehensive, 
                  covering all important points without being too lengthy. Our generator creates letters of 
                  appropriate length.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Can I edit the generated cover letter?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! After generation, you can review and edit your cover letter to add personal touches, 
                  include specific details, or adjust the tone. You have full control over the final document.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Generate Your Professional Cover Letter
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Create an embassy-ready cover letter that strengthens your visa application in minutes.
          </p>
          <Link href="/documents/cover-letter">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-6 text-lg">
              Start Generating Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Related Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Complete Your Visa Application Documents
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/documents/sop">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>SOP Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Generate professional Statements of Purpose for your visa application.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/documents/visa-checker">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Visa Eligibility Checker</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Check your visa eligibility before preparing your documents.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/documents/checklist">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Document Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Get a comprehensive checklist of all required documents for your visa.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
