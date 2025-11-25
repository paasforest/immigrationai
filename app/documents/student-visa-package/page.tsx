'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, GraduationCap, Loader, Copy, Download } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function StudentVisaPackagePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [packageData, setPackageData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    applicantName: '',
    homeCountry: '',
    targetCountry: '',
    currentEducation: '',
    institution: '',
    program: '',
    programDuration: '',
    tuitionFees: '',
    startDate: '',
    availableFunds: '',
    sourceOfFunds: '',
    sponsorDetails: '',
    previousDegrees: '',
    academicAchievements: '',
    englishTest: '',
    testScores: '',
    careerGoals: '',
    whyThisProgram: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.applicantName || !formData.homeCountry || !formData.targetCountry) {
      alert('Please fill in applicant name, home country, and target country.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/student-visa-package`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setPackageData(data.data.package);
      } else {
        alert(data.message || 'Failed to generate package');
      }
    } catch (error) {
      console.error('Package generation error:', error);
      alert('Failed to generate package. Please check backend connection.');
    } finally {
      setIsLoading(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <span>Student Visa Package Generator</span>
          </h1>
          <p className="text-gray-600">Generate complete student visa document package</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input name="applicantName" value={formData.applicantName} onChange={handleInputChange} placeholder="Applicant Name *" />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="homeCountry" value={formData.homeCountry} onChange={handleInputChange} placeholder="Home Country *" />
                  <Input name="targetCountry" value={formData.targetCountry} onChange={handleInputChange} placeholder="Target Country *" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Education Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input name="institution" value={formData.institution} onChange={handleInputChange} placeholder="Institution Name" />
                <Input name="program" value={formData.program} onChange={handleInputChange} placeholder="Program/Course" />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="programDuration" value={formData.programDuration} onChange={handleInputChange} placeholder="Duration" />
                  <Input name="startDate" value={formData.startDate} onChange={handleInputChange} placeholder="Start Date" />
                </div>
                <Input name="tuitionFees" value={formData.tuitionFees} onChange={handleInputChange} placeholder="Tuition Fees" />
                <Textarea name="currentEducation" value={formData.currentEducation} onChange={handleInputChange} placeholder="Current Education Level" rows={2} />
                <Textarea name="previousDegrees" value={formData.previousDegrees} onChange={handleInputChange} placeholder="Previous Degrees" rows={2} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input name="availableFunds" value={formData.availableFunds} onChange={handleInputChange} placeholder="Available Funds" />
                <Input name="sourceOfFunds" value={formData.sourceOfFunds} onChange={handleInputChange} placeholder="Source of Funds" />
                <Textarea name="sponsorDetails" value={formData.sponsorDetails} onChange={handleInputChange} placeholder="Sponsor Details (if applicable)" rows={2} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic & Career</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea name="academicAchievements" value={formData.academicAchievements} onChange={handleInputChange} placeholder="Academic Achievements" rows={2} />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="englishTest" value={formData.englishTest} onChange={handleInputChange} placeholder="English Test (IELTS/TOEFL)" />
                  <Input name="testScores" value={formData.testScores} onChange={handleInputChange} placeholder="Test Scores" />
                </div>
                <Textarea name="careerGoals" value={formData.careerGoals} onChange={handleInputChange} placeholder="Career Goals" rows={2} />
                <Textarea name="whyThisProgram" value={formData.whyThisProgram} onChange={handleInputChange} placeholder="Why This Program" rows={2} />
              </CardContent>
            </Card>

            <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
              {isLoading ? <><Loader className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><GraduationCap className="w-5 h-5 mr-2" /> Generate Package</>}
            </Button>
          </div>

          <Card className="lg:sticky lg:top-8 h-fit">
            <CardHeader>
              <CardTitle>Generated Package</CardTitle>
            </CardHeader>
            <CardContent>
              {packageData ? (
                <div className="space-y-4 max-h-[800px] overflow-y-auto">
                  {packageData.sop && (
                    <div>
                      <h4 className="font-semibold mb-2">Statement of Purpose</h4>
                      <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">{packageData.sop}</div>
                    </div>
                  )}
                  {packageData.financialLetter && (
                    <div>
                      <h4 className="font-semibold mb-2">Financial Letter</h4>
                      <div className="bg-gray-50 p-4 rounded text-sm whitespace-pre-wrap">{packageData.financialLetter}</div>
                    </div>
                  )}
                  {packageData.checklist && (
                    <div>
                      <h4 className="font-semibold mb-2">Document Checklist</h4>
                      <ul className="text-sm space-y-1">
                        {packageData.checklist.requiredDocuments?.map((item: string, idx: number) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {packageData.summary && <p className="text-sm text-gray-700">{packageData.summary}</p>}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">Fill in the form and generate your student visa package.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
