'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Upload, Camera, CheckCircle, Package, Users, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProofKitPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [userPlan, setUserPlan] = useState('entry'); // This would come from user data

  const visaTypes = [
    { id: 'ireland_type_d_marriage', name: 'Ireland Type D Marriage', country: 'Ireland' },
    { id: 'ireland_type_d_de_facto', name: 'Ireland Type D De Facto', country: 'Ireland' },
    { id: 'canada_family_sponsorship', name: 'Canada Family Sponsorship', country: 'Canada' },
    { id: 'uk_family_visa', name: 'UK Family Visa', country: 'UK' },
    { id: 'australia_partner_visa', name: 'Australia Partner Visa', country: 'Australia' },
    { id: 'schengen_type_c_family', name: 'Schengen Type C Family Visit', country: 'Schengen' }
  ];

  const steps = [
    { id: 1, name: 'Select Visa Type', icon: <FileText className="w-5 h-5" /> },
    { id: 2, name: 'Document Checklist', icon: <CheckCircle className="w-5 h-5" /> },
    { id: 3, name: 'Upload Documents', icon: <Upload className="w-5 h-5" /> },
    { id: 4, name: 'Photo Analysis', icon: <Camera className="w-5 h-5" /> },
    { id: 5, name: 'Quality Check', icon: <CheckCircle className="w-5 h-5" /> },
    { id: 6, name: 'Narrative Builder', icon: <Users className="w-5 h-5" /> },
    { id: 7, name: 'Generate Package', icon: <Package className="w-5 h-5" /> }
  ];

  const handleVisaTypeSelect = (visaType: string) => {
    setSelectedVisaType(visaType);
    setCurrentStep(2);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎯 Relationship Proof Kit
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Organize your relationship evidence professionally for immigration applications
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visaTypes.map((visa) => (
                <Card 
                  key={visa.id}
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-blue-500"
                  onClick={() => handleVisaTypeSelect(visa.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {visa.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {visa.country} • Marriage/Family Visa
                    </p>
                    <Button className="w-full">
                      Start Proof Kit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {userPlan === 'entry' && (
              <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  ⚠️ Upgrade Required for Full Features
                </h3>
                <p className="text-yellow-700 mb-4">
                  The Relationship Proof Kit requires a Professional Plan (R700/month) for full access to:
                </p>
                <ul className="list-disc list-inside text-yellow-700 space-y-1 mb-4">
                  <li>AI Photo Quality Checker</li>
                  <li>Document Quality Verification</li>
                  <li>Narrative Builder</li>
                  <li>Submission Package Generator</li>
                </ul>
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  Upgrade to Professional Plan
                </Button>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                📋 Document Checklist
              </h2>
              <p className="text-xl text-gray-600">
                Here's exactly what you need for {visaTypes.find(v => v.id === selectedVisaType)?.name}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center">
                    🚨 Critical Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      <span className="text-sm">Marriage Certificate (Original + Certified Copy)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      <span className="text-sm">6 Months Joint Bank Statements</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      <span className="text-sm">3 Recent Utility Bills (Both Names)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      <span className="text-sm">Lease Agreement or Mortgage Documents</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      <span className="text-sm">Passport Pages with Stamps</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center">
                    💡 Recommended
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">30-50 Photos Together</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">6 Months Communication History</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">Travel/Accommodation Receipts</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">Social Media Evidence</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center">
                    ✨ Nice-to-Have
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Letters from Family/Friends</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Joint Insurance Policies</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Shared Memberships</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => setCurrentStep(3)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 text-lg"
              >
                Start Uploading Documents
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Coming Soon!
            </h2>
            <p className="text-gray-600 mb-6">
              This step is under development. Check back soon for the complete ProofKit experience.
            </p>
            <Button onClick={() => setCurrentStep(1)}>
              Back to Visa Selection
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {step.icon}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden md:block w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}



