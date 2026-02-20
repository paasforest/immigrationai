import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Globe, Zap, ArrowRight, Shield, Clock, Target, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Visa Eligibility Checker - AI-Powered Visa Screening | Immigration AI',
  description: 'Check your visa eligibility for UK, USA, Canada, and other countries in minutes. AI-powered visa eligibility checker provides instant feedback and document requirements.',
  keywords: [
    'visa eligibility checker',
    'check visa eligibility',
    'visa eligibility check',
    'UK visa eligibility',
    'Canada visa eligibility',
    'USA visa eligibility',
    'visa screening',
    'visa eligibility test',
    'visa requirements checker',
    'immigration eligibility check',
  ],
  openGraph: {
    title: 'Visa Eligibility Checker - AI-Powered Visa Screening',
    description: 'Check your visa eligibility in minutes. AI-powered screening for UK, USA, Canada, and more.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-eligibility-checker',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-eligibility-checker',
  },
};

export default function VisaEligibilityCheckerLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Visa Eligibility Checker - AI-Powered Visa Screening
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Check your visa eligibility for UK, USA, Canada, Ireland, Germany, and other countries in minutes. 
            Our AI-powered visa eligibility checker provides instant feedback and tells you exactly what you need to apply.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/documents/visa-checker">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg">
                Check Your Visa Eligibility
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
            Why Use Our Visa Eligibility Checker?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-green-600 mb-4" />
                <CardTitle>Instant Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get immediate feedback on your visa eligibility. No waiting days or weeks for manual reviews.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Target className="w-10 h-10 text-green-600 mb-4" />
                <CardTitle>AI-Powered Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our advanced AI analyzes your profile against visa requirements and provides detailed eligibility assessment.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Globe className="w-10 h-10 text-green-600 mb-4" />
                <CardTitle>Multiple Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Check eligibility for UK, USA, Canada, Ireland, Germany, Schengen, Australia, and more.
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
            How Our Visa Eligibility Checker Works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Country & Visa Type</h3>
                <p className="text-gray-600">
                  Choose your destination country and the type of visa you're applying for (student, work, family, etc.).
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Answer Eligibility Questions</h3>
                <p className="text-gray-600">
                  Provide information about your background, education, work experience, finances, and travel history.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Instant Results</h3>
                <p className="text-gray-600">
                  Receive detailed eligibility assessment, required documents checklist, and personalized recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Benefits of Checking Your Visa Eligibility First
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Shield className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Save Time & Money</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Know your chances before spending time and money on application fees. Our visa eligibility checker 
                  helps you make informed decisions.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Identify Weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Discover areas where you need to improve before applying. Get specific recommendations on how to 
                  strengthen your application.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Plan Ahead</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Understand what documents and requirements you need. Plan your application timeline based on 
                  your eligibility assessment.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <AlertCircle className="w-8 h-8 text-green-600 mb-2" />
                <CardTitle>Avoid Rejections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Reduce the risk of visa rejection by understanding your eligibility and addressing potential issues 
                  before applying.
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
            Frequently Asked Questions About Visa Eligibility Checker
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What is a visa eligibility checker?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  A visa eligibility checker is an AI-powered tool that analyzes your profile against visa requirements 
                  to determine your chances of approval. It helps you understand if you meet the basic criteria before 
                  investing time and money in the application process.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>How accurate is the visa eligibility checker?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI-powered visa eligibility checker analyzes your profile against official visa requirements and 
                  provides a comprehensive assessment. While it's highly accurate, final decisions are always made by 
                  immigration authorities. Our tool helps you understand your chances and prepare better.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Which countries can I check eligibility for?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can check visa eligibility for UK, USA, Canada, Ireland, Germany, Schengen countries, 
                  Australia, New Zealand, UAE, Singapore, and more. We continuously add support for new countries.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>What information do I need to provide?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You'll need to provide basic information about your education, work experience, financial situation, 
                  travel history, and visa goals. All information is kept confidential and secure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Check Your Visa Eligibility Now
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Get instant feedback on your visa eligibility and know your chances before applying.
          </p>
          <Link href="/documents/visa-checker">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg">
              Start Eligibility Check
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Related Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Complete Your Visa Application with These Tools
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
            <Link href="/documents/cover-letter">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Cover Letter Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Create professional cover letters for your visa application.
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
