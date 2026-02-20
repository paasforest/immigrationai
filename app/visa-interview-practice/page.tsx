import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, CheckCircle, Zap, ArrowRight, Target, Clock, Users, Star } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Visa Interview Practice - Mock Interview Preparation | Immigration AI',
  description: 'Practice for your visa interview with AI-powered mock interviews. Get real consulate questions, AI feedback, and improve your answers. Prepare for UK, USA, Canada visa interviews.',
  keywords: [
    'visa interview practice',
    'visa interview preparation',
    'mock visa interview',
    'visa interview questions',
    'visa interview practice online',
    'UK visa interview practice',
    'USA visa interview practice',
    'Canada visa interview practice',
    'visa interview coach',
    'interview preparation visa',
  ],
  openGraph: {
    title: 'Visa Interview Practice - Mock Interview Preparation',
    description: 'Practice for your visa interview with AI-powered mock interviews. Get real questions and AI feedback.',
    type: 'website',
    url: 'https://www.immigrationai.co.za/visa-interview-practice',
  },
  alternates: {
    canonical: 'https://www.immigrationai.co.za/visa-interview-practice',
  },
};

export default function VisaInterviewPracticeLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Visa Interview Practice - Mock Interview Preparation
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Practice for your visa interview with AI-powered mock interviews. Get real consulate questions, 
            receive AI feedback on your answers, and build confidence before your actual interview.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/documents/mock-interview">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                Start Practice Interview
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
            Why Practice Visa Interviews?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Mic className="w-10 h-10 text-purple-600 mb-4" />
                <CardTitle>Real Interview Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Practice with actual questions asked by consulate officers. Our database includes 500+ real 
                  visa interview questions by visa type and category.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-purple-600 mb-4" />
                <CardTitle>AI-Powered Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get instant AI feedback on your answers. Learn what to improve, what to emphasize, and how to 
                  structure better responses.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Target className="w-10 h-10 text-purple-600 mb-4" />
                <CardTitle>Build Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Practice makes perfect. Build confidence by practicing multiple times before your actual 
                  visa interview.
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
            How Our Visa Interview Practice Works
          </h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Visa Type & Country</h3>
                <p className="text-gray-600">
                  Choose your destination country and visa type. We'll provide questions specific to your visa category.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Answer Interview Questions</h3>
                <p className="text-gray-600">
                  Practice answering real consulate questions. You can type your answers or practice speaking out loud.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get AI Feedback</h3>
                <p className="text-gray-600">
                  Receive detailed feedback on your answers. Learn what works, what doesn't, and how to improve 
                  your responses using the STAR method.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Your Progress</h3>
                <p className="text-gray-600">
                  Monitor your improvement over time. See which areas you've mastered and which need more practice.
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
            Benefits of Visa Interview Practice
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Reduce Anxiety</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Familiarize yourself with the interview process and common questions. Reduce anxiety by knowing 
                  what to expect.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Star className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Improve Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Learn how to structure better answers using proven methods. Get feedback on clarity, completeness, 
                  and persuasiveness.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Clock className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Practice Anytime</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Practice as many times as you need, whenever you want. No scheduling appointments or waiting 
                  for availability.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-purple-600 mb-2" />
                <CardTitle>Country-Specific Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get questions specific to your destination country. UK, USA, Canada, and other countries have 
                  different interview styles and questions.
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
            Frequently Asked Questions About Visa Interview Practice
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What types of visa interviews can I practice for?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  You can practice for student visas, work visas, family visas, visitor visas, and more. We cover 
                  interviews for UK, USA, Canada, Ireland, Germany, Schengen, and other major destinations.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>How many questions are in the practice database?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our database includes 500+ real visa interview questions organized by visa type, difficulty level, 
                  and category. Questions are based on actual consulate interviews.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Can I practice speaking out loud?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can practice speaking your answers out loud to simulate a real interview experience. 
                  This helps build confidence and improve your delivery.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>How does the AI feedback work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI analyzes your answers for clarity, completeness, relevance, and persuasiveness. It provides 
                  specific suggestions on how to improve and what to emphasize in your responses.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Practicing for Your Visa Interview
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Build confidence and improve your answers with AI-powered mock interviews.
          </p>
          <Link href="/documents/mock-interview">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg">
              Begin Practice Session
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Related Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Complete Your Visa Preparation
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/documents/interview-response-builder">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Interview Response Builder</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Craft perfect answers using AI and the STAR method for your visa interview.
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/documents/interview-questions">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>Interview Questions Database</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Browse 500+ real visa interview questions by visa type, difficulty, and category.
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
                    Check your visa eligibility before preparing for your interview.
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
