'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightbulb, Target, AlertTriangle, CheckCircle, Star, BookOpen, Zap, Users, FileText, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getQuestionsByVisaType, type InterviewQuestion } from '@/lib/interview-coach/questions-database';
// Removed direct OpenAI import - will use backend API instead

interface ResponseBuilder {
  question: InterviewQuestion;
  userProfile: {
    nationality: string;
    age: string;
    education: string;
    workExperience: string;
    familySituation: string;
    financialSituation: string;
    travelHistory: string;
    futurePlans: string;
  };
  generatedResponse: string;
  starMethod: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  keyPoints: string[];
  redFlagsToAvoid: string[];
  confidenceTips: string[];
}

export default function InterviewResponseBuilder() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [selectedVisaType, setSelectedVisaType] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [userProfile, setUserProfile] = useState({
    nationality: '',
    age: '',
    education: '',
    workExperience: '',
    familySituation: '',
    financialSituation: '',
    travelHistory: '',
    futurePlans: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [responseBuilder, setResponseBuilder] = useState<ResponseBuilder | null>(null);

  const visaTypes = [
    { value: 'us_f1', label: '🇺🇸 US F1 Student Visa' },
    { value: 'canada_study', label: '🇨🇦 Canada Study Permit' },
    { value: 'australia_student', label: '🇦🇺 Australia Student Visa' },
    { value: 'uk_student', label: '🇬🇧 UK Student Visa' },
    { value: 'uk_family', label: '🇬🇧 UK Family Visa' },
    { value: 'b1_b2_visitor', label: '🇺🇸 US B1/B2 Visitor Visa' },
    { value: 'schengen_c_tourism', label: '🇪🇺 Schengen C Tourism Visa' }
  ];

  const questions = selectedVisaType ? getQuestionsByVisaType(selectedVisaType) : {};

  const generateResponse = async () => {
    if (!selectedQuestion) {
      alert('Please select a question first');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate a personalized response using backend API
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/interview-coach/analyze-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'anonymous'
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          userAnswer: `I am a ${userProfile.nationality} citizen, ${userProfile.age} years old. My education background is ${userProfile.education}. I have ${userProfile.workExperience} work experience. My family situation is ${userProfile.familySituation}. My financial situation is ${userProfile.financialSituation}. I have traveled to ${userProfile.travelHistory}. My future plans are ${userProfile.futurePlans}.`,
          visaType: selectedVisaType,
          durationSeconds: 0
        })
      });

      if (!apiResponse.ok) {
        throw new Error('Failed to get AI feedback');
      }

      const response = await apiResponse.json();

      // Generate STAR method breakdown
      const starMethod = {
        situation: `I am a ${userProfile.nationality} citizen with ${userProfile.education} education background.`,
        task: `I need to demonstrate my genuine intent for this ${selectedVisaType} visa.`,
        action: `I will explain my specific reasons and provide concrete examples.`,
        result: `This will show the officer that I am a genuine applicant with clear intentions.`
      };

      // Generate key points based on the question
      const keyPoints = selectedQuestion.ideal_elements.slice(0, 4);

      // Generate confidence tips
      const confidenceTips = [
        'Speak clearly and confidently',
        'Make eye contact with the officer',
        'Use specific examples and details',
        'Show enthusiasm for your plans',
        'Be honest and authentic'
      ];

      const builder: ResponseBuilder = {
        question: selectedQuestion,
        userProfile,
        generatedResponse: response.suggestions?.join(' ') || 'Based on your profile, here are some key points to include in your answer...',
        starMethod,
        keyPoints,
        redFlagsToAvoid: selectedQuestion.red_flags,
        confidenceTips
      };

      setResponseBuilder(builder);
    } catch (error) {
      console.error('Error generating response:', error);
      alert('Error generating response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              🔐 Authentication Required
            </CardTitle>
            <p className="text-gray-600">
              Please sign in to access the Interview Response Builder
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push('/auth/login')}
              className="w-full"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => router.push('/auth/signup')}
              variant="outline"
              className="w-full"
            >
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🎯 Interview Response Builder
                </h1>
                <p className="text-sm text-gray-600">
                  Craft perfect answers for your visa interview
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!responseBuilder ? (
          <div className="space-y-8">
            {/* Step 1: Select Visa Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <span>Step 1: Select Your Visa Type</span>
                </CardTitle>
                <p className="text-gray-600">
                  Choose the visa type you're applying for to get relevant questions
                </p>
              </CardHeader>
              <CardContent>
                <Select value={selectedVisaType} onValueChange={setSelectedVisaType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a visa type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {visaTypes.map((visa) => (
                      <SelectItem key={visa.value} value={visa.value}>
                        {visa.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Step 2: Select Question */}
            {selectedVisaType && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span>Step 2: Choose a Question to Practice</span>
                  </CardTitle>
                  <p className="text-gray-600">
                    Select a question you want to build a response for
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {Object.entries(questions).map(([category, categoryQuestions]) => (
                      <div key={category}>
                        <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                          {category.replace('_', ' ')} Questions
                        </h4>
                        <div className="space-y-2">
                          {categoryQuestions.slice(0, 3).map((question) => (
                            <div
                              key={question.id}
                              className={`p-4 border rounded-lg cursor-pointer transition ${
                                selectedQuestion?.id === question.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => setSelectedQuestion(question)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {question.question}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge 
                                      variant={question.difficulty === 'easy' ? 'default' : 
                                              question.difficulty === 'medium' ? 'secondary' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {question.difficulty}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {question.category}
                                    </span>
                                  </div>
                                </div>
                                {selectedQuestion?.id === question.id && (
                                  <CheckCircle className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: User Profile */}
            {selectedQuestion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Step 3: Tell Us About Yourself</span>
                  </CardTitle>
                  <p className="text-gray-600">
                    Provide your background information for personalized responses
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality
                      </label>
                      <Input
                        placeholder="e.g., South African"
                        value={userProfile.nationality}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, nationality: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <Input
                        placeholder="e.g., 25"
                        value={userProfile.age}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, age: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Education
                      </label>
                      <Input
                        placeholder="e.g., Bachelor's in Computer Science"
                        value={userProfile.education}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, education: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Work Experience
                      </label>
                      <Input
                        placeholder="e.g., 3 years as Software Developer"
                        value={userProfile.workExperience}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, workExperience: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Family Situation
                      </label>
                      <Input
                        placeholder="e.g., Married with 2 children"
                        value={userProfile.familySituation}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, familySituation: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Financial Situation
                      </label>
                      <Input
                        placeholder="e.g., Stable income, savings available"
                        value={userProfile.financialSituation}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, financialSituation: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Travel History
                      </label>
                      <Input
                        placeholder="e.g., Visited UK, France, Germany"
                        value={userProfile.travelHistory}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, travelHistory: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Future Plans
                      </label>
                      <Input
                        placeholder="e.g., Return to South Africa after studies"
                        value={userProfile.futurePlans}
                        onChange={(e) => setUserProfile(prev => ({ ...prev, futurePlans: e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Button */}
            {selectedQuestion && userProfile.nationality && (
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={generateResponse}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Response...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate My Response
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Response Builder Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Your Personalized Response</span>
                </CardTitle>
                <p className="text-gray-600">
                  Here's your AI-generated response for the interview question
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Question:</h4>
                  <p className="text-gray-700 mb-4">{responseBuilder.question.question}</p>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">Your Response:</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {responseBuilder.generatedResponse}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* STAR Method Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span>STAR Method Breakdown</span>
                </CardTitle>
                <p className="text-gray-600">
                  Structure your answer using the STAR method for maximum impact
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">S - Situation</h4>
                      <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                        {responseBuilder.starMethod.situation}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">T - Task</h4>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">
                        {responseBuilder.starMethod.task}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2">A - Action</h4>
                      <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded">
                        {responseBuilder.starMethod.action}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">R - Result</h4>
                      <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded">
                        {responseBuilder.starMethod.result}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Points and Tips */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <span>Key Points to Include</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {responseBuilder.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span>Red Flags to Avoid</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {responseBuilder.redFlagsToAvoid.slice(0, 4).map((flag, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Confidence Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Confidence Tips</span>
                </CardTitle>
                <p className="text-gray-600">
                  Boost your confidence during the actual interview
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {responseBuilder.confidenceTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button 
                onClick={() => setResponseBuilder(null)}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Build Another Response
              </Button>
              <Button 
                onClick={() => router.push('/documents/mock-interview')}
                className="flex-1"
              >
                <Zap className="w-4 h-4 mr-2" />
                Practice with Mock Interview
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




