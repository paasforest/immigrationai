'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Loader, Copy, Download } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';
import PDFDownload from '@/components/PDFDownload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SupportLetterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  
  const [formData, setFormData] = useState({
    letterType: 'invitation',
    hostName: '',
    hostAddress: '',
    hostPhone: '',
    visitorName: '',
    visitorPassport: '',
    visitorNationality: '',
    visitPurpose: '',
    visitDuration: '',
    visitDates: '',
    relationship: '',
    financialSupport: '',
    companyName: '',
    jobTitle: '',
    salary: '',
    employmentDuration: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.visitorName) {
      alert('Please enter visitor/applicant name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-support-letter`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedLetter(data.data.letter);
      } else {
        alert(data.message || 'Failed to generate letter');
      }
    } catch (error) {
      console.error('Error generating letter:', error);
      alert('Failed to generate letter. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    alert('Letter copied to clipboard!');
  };

  const downloadLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.letterType}_letter_${Date.now()}.txt`;
    element.click();
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
            <FileText className="w-8 h-8 text-blue-600" />
            <span>Support Letter Generator</span>
          </h1>
          <p className="text-gray-600">Generate invitation, sponsorship, employment, and accommodation letters</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Letter Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Letter Type *</label>
                <select
                  name="letterType"
                  value={formData.letterType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="invitation">Invitation Letter</option>
                  <option value="sponsorship">Financial Sponsorship Letter</option>
                  <option value="employment">Employment Verification Letter</option>
                  <option value="accommodation">Accommodation Confirmation</option>
                </select>
              </div>

              {/* Visitor Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Visitor/Applicant Details</h3>
                <div className="space-y-3">
                  <Input
                    name="visitorName"
                    value={formData.visitorName}
                    onChange={handleInputChange}
                    placeholder="Visitor Full Name *"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      name="visitorPassport"
                      value={formData.visitorPassport}
                      onChange={handleInputChange}
                      placeholder="Passport Number"
                    />
                    <Input
                      name="visitorNationality"
                      value={formData.visitorNationality}
                      onChange={handleInputChange}
                      placeholder="Nationality"
                    />
                  </div>
                </div>
              </div>

              {/* Host/Sponsor Details */}
              {(formData.letterType === 'invitation' || formData.letterType === 'sponsorship' || formData.letterType === 'accommodation') && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Host/Sponsor Details</h3>
                  <div className="space-y-3">
                    <Input
                      name="hostName"
                      value={formData.hostName}
                      onChange={handleInputChange}
                      placeholder="Host/Sponsor Name"
                    />
                    <Textarea
                      name="hostAddress"
                      value={formData.hostAddress}
                      onChange={handleInputChange}
                      placeholder="Full Address"
                      rows={2}
                    />
                    <Input
                      name="hostPhone"
                      value={formData.hostPhone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                    />
                    <Input
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleInputChange}
                      placeholder="Relationship to Visitor"
                    />
                  </div>
                </div>
              )}

              {/* Employment Details */}
              {formData.letterType === 'employment' && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Employment Details</h3>
                  <div className="space-y-3">
                    <Input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Company Name"
                    />
                    <Input
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="Job Title"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        placeholder="Annual Salary"
                      />
                      <Input
                        name="employmentDuration"
                        value={formData.employmentDuration}
                        onChange={handleInputChange}
                        placeholder="e.g., 3 years"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Visit Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Visit Details</h3>
                <div className="space-y-3">
                  <Input
                    name="visitPurpose"
                    value={formData.visitPurpose}
                    onChange={handleInputChange}
                    placeholder="Purpose of Visit"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      name="visitDuration"
                      value={formData.visitDuration}
                      onChange={handleInputChange}
                      placeholder="Duration (e.g., 2 weeks)"
                    />
                    <Input
                      name="visitDates"
                      value={formData.visitDates}
                      onChange={handleInputChange}
                      placeholder="Visit Dates"
                    />
                  </div>
                  {formData.letterType === 'sponsorship' && (
                    <Input
                      name="financialSupport"
                      value={formData.financialSupport}
                      onChange={handleInputChange}
                      placeholder="Amount Being Sponsored"
                    />
                  )}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generating Letter...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generate {formData.letterType.charAt(0).toUpperCase() + formData.letterType.slice(1)} Letter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Letter */}
          <Card className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Letter</CardTitle>
                {generatedLetter && (
                  <div className="flex space-x-2">
                    <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg" title="Copy">
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={downloadLetter} className="p-2 hover:bg-gray-100 rounded-lg" title="Download TXT">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedLetter ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 max-h-[700px] overflow-y-auto border border-gray-200">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
                      {generatedLetter}
                    </pre>
                  </div>
                  
                  {/* Download Options */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <PDFDownload
                      content={generatedLetter}
                      filename={`${formData.letterType}_letter_${formData.visitorName || 'document'}_${new Date().toISOString().split('T')[0]}.pdf`}
                      title={`${formData.letterType.charAt(0).toUpperCase() + formData.letterType.slice(1)} Letter`}
                      className="flex-1"
                    />
                    <Button
                      onClick={downloadLetter}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download TXT
                    </Button>
                  </div>
                  
                  {/* Feedback Widget */}
                  <FeedbackWidget
                    documentId={`support_letter_${Date.now()}`}
                    documentType="support_letter"
                    country={formData.visitorNationality}
                    visaType={formData.letterType}
                  />
                  
                  {/* Success Tracker */}
                  <SuccessTracker
                    documentId={`support_letter_${Date.now()}`}
                    country={formData.visitorNationality || 'general'}
                    visaType={formData.letterType}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Letter Generated Yet</h4>
                  <p className="text-gray-600 text-sm">Fill in the details and generate your support letter</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


