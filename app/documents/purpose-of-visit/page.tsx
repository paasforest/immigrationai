'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Target, Loader, Copy, Download } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';
import PDFDownload from '@/components/PDFDownload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function PurposeOfVisitPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedExplanation, setGeneratedExplanation] = useState('');
  
  const [formData, setFormData] = useState({
    applicantName: '',
    targetCountry: '',
    visaType: 'visitor',
    visitPurpose: 'tourism',
    duration: '',
    itinerary: '',
    tiesToHomeCountry: '',
    returnPlan: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.applicantName || !formData.targetCountry || !formData.duration) {
      alert('Please fill required fields: Name, Country, and Duration');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-purpose-of-visit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedExplanation(data.data.explanation);
      } else {
        alert(data.message || 'Failed to generate explanation');
      }
    } catch (error) {
      console.error('Error generating explanation:', error);
      alert('Failed to generate explanation. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedExplanation);
    alert('Explanation copied!');
  };

  const downloadExplanation = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedExplanation], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `purpose_of_visit_${Date.now()}.txt`;
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
            <Target className="w-8 h-8 text-blue-600" />
            <span>Purpose of Visit Explanation</span>
          </h1>
          <p className="text-gray-600">Create a compelling explanation for your visa application</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleInputChange}
                  placeholder="Your Full Name *"
                />
                <Input
                  name="targetCountry"
                  value={formData.targetCountry}
                  onChange={handleInputChange}
                  placeholder="Target Country *"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visa Type</label>
                  <select
                    name="visaType"
                    value={formData.visaType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="visitor">Visitor/Tourist</option>
                    <option value="business">Business</option>
                    <option value="medical">Medical Treatment</option>
                    <option value="family">Family Visit</option>
                    <option value="conference">Conference/Event</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visit Purpose</label>
                  <select
                    name="visitPurpose"
                    value={formData.visitPurpose}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tourism">Tourism/Sightseeing</option>
                    <option value="business">Business Meeting</option>
                    <option value="medical">Medical Treatment</option>
                    <option value="family">Visit Family</option>
                    <option value="conference">Attend Conference</option>
                    <option value="interview">Job Interview</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration *</label>
                <Input
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Itinerary</label>
                <Textarea
                  name="itinerary"
                  value={formData.itinerary}
                  onChange={handleInputChange}
                  placeholder="Describe your planned activities, places to visit, people to meet..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ties to Home Country</label>
                <Textarea
                  name="tiesToHomeCountry"
                  value={formData.tiesToHomeCountry}
                  onChange={handleInputChange}
                  placeholder="e.g., Job position, property ownership, family responsibilities..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Important: Visa officers want to ensure you'll return home
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return Plan</label>
                <Textarea
                  name="returnPlan"
                  value={formData.returnPlan}
                  onChange={handleInputChange}
                  placeholder="What will you do after returning? Job, studies, family..."
                  rows={2}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generating Explanation...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Generate Purpose of Visit
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Explanation</CardTitle>
                {generatedExplanation && (
                  <div className="flex space-x-2">
                    <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg" title="Copy">
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={downloadExplanation} className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedExplanation ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto border border-gray-200">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
                      {generatedExplanation}
                    </pre>
                  </div>
                  
                  {/* Download Options */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <PDFDownload
                      content={generatedExplanation}
                      filename={`Purpose_of_Visit_${formData.targetCountry || 'general'}_${formData.visaType || 'visa'}_${new Date().toISOString().split('T')[0]}.pdf`}
                      title="Purpose of Visit Explanation"
                      className="flex-1"
                    />
                    <Button
                      onClick={downloadExplanation}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download TXT
                    </Button>
                  </div>
                  
                  {/* Feedback Widget */}
                  <FeedbackWidget
                    documentId={`purpose_of_visit_${Date.now()}`}
                    documentType="purpose_of_visit"
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                  
                  {/* Success Tracker */}
                  <SuccessTracker
                    documentId={`purpose_of_visit_${Date.now()}`}
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Explanation Generated Yet</h4>
                  <p className="text-gray-600 text-sm mb-4">Fill in your visit details</p>
                  <div className="bg-yellow-50 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-yellow-900">
                      <strong>Important:</strong> A strong purpose of visit statement addresses visa officer concerns about your intent to return home.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


