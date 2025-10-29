'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, DollarSign, Loader, Copy, Download } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';
import PDFDownload from '@/components/PDFDownload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function FinancialLetterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState('');
  
  const [formData, setFormData] = useState({
    applicantName: '',
    targetCountry: '',
    visaType: 'study',
    availableFunds: '',
    sourceOfFunds: 'savings',
    monthlyIncome: '',
    occupation: '',
    sponsorName: '',
    sponsorRelationship: '',
    specificAmount: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.applicantName || !formData.targetCountry || !formData.availableFunds) {
      alert('Please fill required fields: Name, Country, and Available Funds');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-financial-letter`, {
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
    alert('Letter copied!');
  };

  const downloadLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `financial_justification_${Date.now()}.txt`;
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
            <DollarSign className="w-8 h-8 text-blue-600" />
            <span>Financial Justification Letter</span>
          </h1>
          <p className="text-gray-600">Explain your financial situation clearly for visa applications</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visa Type</label>
                <select
                  name="visaType"
                  value={formData.visaType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="study">Study Visa</option>
                  <option value="work">Work Visa</option>
                  <option value="visitor">Visitor Visa</option>
                  <option value="business">Business Visa</option>
                  <option value="family">Family Visa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Funds *</label>
                <Input
                  name="availableFunds"
                  value={formData.availableFunds}
                  onChange={handleInputChange}
                  placeholder="e.g., $25,000 USD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source of Funds *</label>
                <select
                  name="sourceOfFunds"
                  value={formData.sourceOfFunds}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="savings">Personal Savings</option>
                  <option value="salary">Employment Salary</option>
                  <option value="loan">Education Loan</option>
                  <option value="sponsor">Family Sponsor</option>
                  <option value="mixed">Mixed Sources</option>
                  <option value="business">Business Income</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleInputChange}
                  placeholder="Monthly Income"
                />
                <Input
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  placeholder="Occupation"
                />
              </div>

              {formData.sourceOfFunds === 'sponsor' && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Sponsor Details</h3>
                  <div className="space-y-3">
                    <Input
                      name="sponsorName"
                      value={formData.sponsorName}
                      onChange={handleInputChange}
                      placeholder="Sponsor Name"
                    />
                    <Input
                      name="sponsorRelationship"
                      value={formData.sponsorRelationship}
                      onChange={handleInputChange}
                      placeholder="Relationship (e.g., Father, Spouse)"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specific Amount for This Trip</label>
                <Input
                  name="specificAmount"
                  value={formData.specificAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., $20,000 for tuition + living"
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
                    Generating Letter...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-5 h-5 mr-2" />
                    Generate Financial Letter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Letter</CardTitle>
                {generatedLetter && (
                  <div className="flex space-x-2">
                    <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg" title="Copy">
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={downloadLetter} className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedLetter ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto border border-gray-200">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
                      {generatedLetter}
                    </pre>
                  </div>
                  
                  {/* Download Options */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <PDFDownload
                      content={generatedLetter}
                      filename={`Financial_Letter_${formData.targetCountry || 'general'}_${formData.visaType || 'visa'}_${new Date().toISOString().split('T')[0]}.pdf`}
                      title="Financial Support Letter"
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
                    documentId={`financial_letter_${Date.now()}`}
                    documentType="financial_letter"
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                  
                  {/* Success Tracker */}
                  <SuccessTracker
                    documentId={`financial_letter_${Date.now()}`}
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Letter Generated Yet</h4>
                  <p className="text-gray-600 text-sm">Fill in your financial details and generate the letter</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


