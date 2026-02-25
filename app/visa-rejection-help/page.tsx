import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Zap, ArrowRight, FileText, Target, Clock, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Visa Rejection Help - Analyze Rejection & Reapplication Strategy | Immigration AI',
  description: 'Got your visa rejected? Get help analyzing your refusal letter, understand reasons, and create a winning reapplication strategy. AI-powered visa rejection analyzer and reapplication guide.',
  keywords: [
    'visa rejection help',
    'visa refusal help',
    'visa rejection appeal',
    'visa rejection analyzer',
    'visa refusal letter analysis',
    'what to do if visa rejected',
    'visa reapplication strategy',
    'visa rejection reasons',
    'how to appeal visa rejection',
    'visa rejection assistance',
  ],
  openGraph: {
    title: 'Visa Rejection Help - Analyze Rejection & Reapplication Strategy',
    description: 'Got your visa rejected? Get help analyzing your refusal letter and create a winning reapplication strategy.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-rejection-help',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-rejection-help',
  },
};

export default function VisaRejectionHelpLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Visa Rejection Help - Analyze & Create Winning Reapplication Strategy
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Got your visa rejected? Don&apos;t give up! Our AI-powered visa rejection analyzer helps you understand 
            the reasons, decode your refusal letter, and create a winning reapplication strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/documents/visa-rejection">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg">
                Analyze Your Rejection
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
            How We Help with Visa Rejections
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <FileText className="w-10 h-10 text-red-600 mb-4" />
                <CardTitle>Analyze Rejection Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Upload your visa refusal letter and our AI will decode it, identify the specific reasons for 
                  rejection, and explain what they mean.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Target className="w-10 h-10 text-red-600 mb-4" />
                <CardTitle>Identify Weaknesses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Understand exactly what went wrong. Our analysis pinpoints the specific issues that led to 
                  your rejection.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-red-600 mb-4" />
                <CardTitle>Create Reapplication Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get a step-by-step reapplication plan that addresses all rejection reasons and strengthens 
                  your application.
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
            How Our Visa Rejection Help Works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Rejection Letter</h3>
                <p className="text-gray-600">
                  Upload your visa refusal letter or paste the rejection reasons. Our AI will analyze the 
                  document and extract key information.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Detailed Analysis</h3>
                <p className="text-gray-600">
                  Receive a comprehensive breakdown of rejection reasons, what they mean, and why they led 
                  to your visa being refused.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Reapplication Plan</h3>
                <p className="text-gray-600">
                  Get a personalized reapplication strategy that addresses each rejection reason with specific 
                  actions and document improvements.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Implement & Reapply</h3>
                <p className="text-gray-600">
                  Follow the step-by-step plan to strengthen your application. Use our tools to create better 
                  documents and reapply with confidence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Common Rejection Reasons */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Common Visa Rejection Reasons We Help With
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                <CardTitle>Insufficient Funds</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  If your visa was rejected due to insufficient financial proof, we help you calculate the 
                  exact amount needed and create stronger financial documents.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                <CardTitle>Weak Ties to Home Country</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Demonstrate stronger connections to your home country with our ties-to-home-country document 
                  generator and proof kit.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                <CardTitle>Incomplete Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Missing or incomplete documents? Get a comprehensive checklist and generate all required 
                  documents with our tools.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                <CardTitle>Weak Purpose of Visit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Improve your purpose of visit statement with our AI-powered generator that creates compelling, 
                  clear explanations.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                <CardTitle>Inconsistent Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our document consistency checker helps ensure all your documents align and don&apos;t contradict 
                  each other.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                <CardTitle>Weak SOP or Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create stronger Statements of Purpose and cover letters with our AI-powered generators that 
                  address rejection concerns.
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
            Frequently Asked Questions About Visa Rejection Help
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What should I do if my visa is rejected?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  First, don&apos;t panic. Use our visa rejection analyzer to understand the specific reasons. Then 
                  create a reapplication strategy that addresses each issue. Many applicants succeed on their 
                  second attempt with proper preparation.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Can I appeal a visa rejection?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Appeal options vary by country. Some countries allow appeals, while others require a fresh 
                  application. Our tool helps you understand your options and create the best strategy for 
                  your situation.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>How long should I wait before reapplying?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  It depends on the rejection reasons. If it was due to missing documents, you can reapply 
                  immediately after addressing the issues. For more complex reasons, wait until you&apos;ve 
                  strengthened your application. Our reapplication strategy provides timeline recommendations.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Will my previous rejection affect my new application?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Previous rejections are noted, but they don&apos;t automatically mean your new application will 
                  be rejected. The key is addressing the previous rejection reasons and submitting a stronger 
                  application. Our tools help you do exactly that.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don&apos;t Give Up - Get Help with Your Visa Rejection
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Many applicants succeed on their second attempt. Get the help you need to create a winning 
            reapplication.
          </p>
          <Link href="/documents/visa-rejection">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-lg">
              Analyze Your Rejection Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Related Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tools to Strengthen Your Reapplication
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/documents/reapplication-strategy">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Reapplication Strategy Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Create a phased execution plan after a visa refusal with specific actions and timelines.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/documents/sop">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>SOP Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Create a stronger Statement of Purpose that addresses previous rejection concerns.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/documents/document-consistency">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Document Consistency Checker</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Ensure all your documents are consistent and don&apos;t contradict each other.
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
