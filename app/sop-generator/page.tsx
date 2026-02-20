import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileText, Zap, ArrowRight, Star, Clock, Shield, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SOP Generator - AI-Powered Statement of Purpose Writer | Immigration AI',
  description: 'Generate professional Statements of Purpose (SOP) for UK, USA, Canada, and other visa applications in minutes. AI-powered SOP generator trusted by thousands of successful applicants.',
  keywords: [
    'SOP generator',
    'Statement of Purpose generator',
    'SOP writer',
    'SOP for UK visa',
    'SOP for Canada visa',
    'SOP for USA visa',
    'AI SOP generator',
    'visa SOP generator',
    'how to write SOP',
    'SOP writing help',
  ],
  openGraph: {
    title: 'SOP Generator - AI-Powered Statement of Purpose Writer',
    description: 'Generate professional Statements of Purpose for visa applications in minutes. AI-powered tool trusted by thousands.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/sop-generator',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/sop-generator',
  },
};

export default function SOPGeneratorLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SOP Generator - AI-Powered Statement of Purpose Writer
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Generate professional, compelling Statements of Purpose for UK, USA, Canada, and other visa applications in minutes. 
            Our AI-powered SOP generator helps you create winning documents that stand out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/documents/sop">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                Generate Your SOP Now
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
            Why Use Our SOP Generator?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-blue-600 mb-4" />
                <CardTitle>AI-Powered Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our advanced AI understands visa requirements and creates personalized SOPs tailored to your destination country and visa type.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="w-10 h-10 text-blue-600 mb-4" />
                <CardTitle>Generate in Minutes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No more spending days writing and rewriting. Get a professional SOP ready in minutes, not hours or days.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-blue-600 mb-4" />
                <CardTitle>Country-Specific</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Optimized for UK, USA, Canada, Ireland, Germany, Schengen, and more. Each SOP follows country-specific requirements.
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
            How Our SOP Generator Works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter Your Details</h3>
                <p className="text-gray-600">
                  Provide basic information about your background, education, work experience, and visa goals.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Generates Your SOP</h3>
                <p className="text-gray-600">
                  Our AI analyzes your information and creates a compelling, well-structured Statement of Purpose.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Download</h3>
                <p className="text-gray-600">
                  Review your generated SOP, make any edits you need, and download it in PDF format ready for submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions About SOP Generator
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What is a Statement of Purpose (SOP)?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  A Statement of Purpose is a crucial document required for visa applications, especially for student and work visas. 
                  It explains your reasons for applying, your background, and your future goals. Our SOP generator helps you create 
                  a compelling SOP that increases your chances of approval.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Which countries does your SOP generator support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our SOP generator supports all major visa destinations including UK, USA, Canada, Ireland, Germany, 
                  Schengen countries, Australia, New Zealand, and more. Each SOP is tailored to the specific requirements 
                  of your chosen destination.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>How long does it take to generate an SOP?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  With our AI-powered SOP generator, you can create a professional Statement of Purpose in just a few minutes. 
                  Simply enter your details, and our AI will generate a complete, well-structured SOP ready for review.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Can I edit the generated SOP?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! After generation, you can review and edit your SOP to add personal touches or make any adjustments 
                  you need. You have full control over the final document.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Generate Your Winning SOP?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful applicants who used our SOP generator to create compelling visa applications.
          </p>
          <Link href="/documents/sop">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg">
              Start Generating Your SOP
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Related Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Related Tools to Help Your Visa Application
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/documents/review">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>SOP Reviewer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Get AI feedback and quality scores on your existing SOP before submission.
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
                    Check your visa eligibility with AI-powered screening before applying.
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
                    Get a comprehensive checklist of all documents needed for your visa application.
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
