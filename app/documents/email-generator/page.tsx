'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Mail, Loader, Copy, Download } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';
import PDFDownload from '@/components/PDFDownload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function EmailGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  
  const [formData, setFormData] = useState({
    emailType: 'follow-up',
    recipientName: '',
    recipientTitle: 'Sir/Madam',
    embassy: '',
    country: '',
    applicationRef: '',
    submissionDate: '',
    specificQuery: '',
    senderName: '',
    senderEmail: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.senderName || !formData.emailType) {
      alert('Please fill in required fields: Your Name and Email Type');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedEmail(data.data.email);
      } else {
        alert(data.message || 'Failed to generate email');
      }
    } catch (error) {
      console.error('Error generating email:', error);
      alert('Failed to generate email. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    alert('Email copied to clipboard!');
  };

  const downloadEmail = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedEmail], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `email_${formData.emailType}_${Date.now()}.txt`;
    element.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
            <Mail className="w-8 h-8 text-blue-600" />
            <span>Email Template Generator</span>
          </h1>
          <p className="text-gray-600">Generate professional emails for embassies and consulates</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Email Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Type *</label>
                <select
                  name="emailType"
                  value={formData.emailType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="follow-up">Follow-up on Application Status</option>
                  <option value="inquiry">General Inquiry</option>
                  <option value="request">Document Request</option>
                  <option value="thank-you">Thank You Letter</option>
                  <option value="appointment">Appointment Request</option>
                  <option value="clarification">Clarification Request</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <Input
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                  <Input
                    name="senderEmail"
                    value={formData.senderEmail}
                    onChange={handleInputChange}
                    placeholder="john@email.com"
                    type="email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Embassy/Consulate</label>
                  <Input
                    name="embassy"
                    value={formData.embassy}
                    onChange={handleInputChange}
                    placeholder="US Embassy in London"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="USA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name</label>
                  <Input
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    placeholder="Visa Officer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Title</label>
                  <Input
                    name="recipientTitle"
                    value={formData.recipientTitle}
                    onChange={handleInputChange}
                    placeholder="Sir/Madam"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Reference</label>
                  <Input
                    name="applicationRef"
                    value={formData.applicationRef}
                    onChange={handleInputChange}
                    placeholder="REF-123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submission Date</label>
                  <Input
                    name="submissionDate"
                    value={formData.submissionDate}
                    onChange={handleInputChange}
                    placeholder="December 1, 2025"
                    type="date"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specific Query/Request</label>
                <Textarea
                  name="specificQuery"
                  value={formData.specificQuery}
                  onChange={handleInputChange}
                  placeholder="e.g., 'Request status update on my visa application' or 'Clarification on required documents'"
                  rows={3}
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
                    Generating Email...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5 mr-2" />
                    Generate Professional Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Email */}
          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Email</CardTitle>
                {generatedEmail && (
                  <div className="flex space-x-2">
                    <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg" title="Copy">
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={downloadEmail} className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedEmail ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto border border-gray-200">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
                      {generatedEmail}
                    </pre>
                  </div>
                  
                  {/* Download Options */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <PDFDownload
                      content={generatedEmail}
                      filename={`${formData.emailType}_email_${formData.country || 'general'}_${new Date().toISOString().split('T')[0]}.pdf`}
                      title="Professional Email"
                      className="flex-1"
                    />
                    <Button
                      onClick={downloadEmail}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download TXT
                    </Button>
                  </div>
                  
                  {/* Feedback Widget */}
                  <FeedbackWidget
                    documentId={`email_${Date.now()}`}
                    documentType="email"
                    country={formData.country}
                    visaType={formData.emailType}
                  />
                  
                  {/* Success Tracker */}
                  <SuccessTracker
                    documentId={`email_${Date.now()}`}
                    country={formData.country || 'general'}
                    visaType={formData.emailType}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Email Generated Yet</h4>
                  <p className="text-gray-600 text-sm">Fill the form and click "Generate Professional Email"</p>
                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Tip:</strong> Provide as many details as possible for a more personalized and effective email.
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


