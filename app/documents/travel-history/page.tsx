'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plane, Loader, Copy, Download } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';
import PDFDownload from '@/components/PDFDownload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function TravelHistoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formattedHistory, setFormattedHistory] = useState('');
  const [rawHistory, setRawHistory] = useState('');
  const [format, setFormat] = useState('table');

  const handleFormat = async () => {
    if (!rawHistory.trim()) {
      alert('Please enter your travel history');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/format-travel-history`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ travelHistory: rawHistory, format }),
      });

      const data = await response.json();
      
      if (data.success) {
        setFormattedHistory(data.data.formatted);
      } else {
        alert(data.message || 'Failed to format travel history');
      }
    } catch (error) {
      console.error('Error formatting history:', error);
      alert('Failed to format travel history. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedHistory);
    alert('Travel history copied to clipboard!');
  };

  const downloadHistory = () => {
    const element = document.createElement('a');
    const file = new Blob([formattedHistory], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `travel_history_${Date.now()}.txt`;
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
            <Plane className="w-8 h-8 text-blue-600" />
            <span>Travel History Formatter</span>
          </h1>
          <p className="text-gray-600">Convert messy travel records into professional format for visa applications</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Travel History (Raw)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={rawHistory}
                onChange={(e) => setRawHistory(e.target.value)}
                placeholder="Enter your travel history in any format, e.g.:&#10;&#10;- Went to USA from Jan 15 2019 to Jan 30 2019 for business&#10;- Dubai trip in March 2019, stayed 10 days&#10;- UK visit July 5-25, 2019 for tourism&#10;- Canada 2020 February, 2 weeks studying&#10;&#10;AI will extract and organize all information!"
                rows={15}
                className="w-full font-mono text-sm"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="table">Table Format (Recommended)</option>
                  <option value="list">Numbered List</option>
                  <option value="paragraph">Paragraph Format</option>
                </select>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Tips:</strong> Just paste your travel info in any format. The AI will extract dates, countries, and organize everything professionally!
                </p>
              </div>

              <Button
                onClick={handleFormat}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Formatting...
                  </>
                ) : (
                  <>
                    <Plane className="w-5 h-5 mr-2" />
                    Format Travel History
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Formatted Travel History</CardTitle>
                {formattedHistory && (
                  <div className="flex space-x-2">
                    <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg" title="Copy">
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={downloadHistory} className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {formattedHistory ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto border border-gray-200">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
                      {formattedHistory}
                    </pre>
                  </div>
                  
                  {/* Download Options */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <PDFDownload
                      content={formattedHistory}
                      filename={`Travel_History_${format}_${new Date().toISOString().split('T')[0]}.pdf`}
                      title="Travel History"
                      className="flex-1"
                    />
                    <Button
                      onClick={downloadHistory}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download TXT
                    </Button>
                  </div>
                  
                  {/* Feedback Widget */}
                  <FeedbackWidget
                    documentId={`travel_history_${Date.now()}`}
                    documentType="travel_history"
                    country="general"
                    visaType="formatted"
                  />
                  
                  {/* Success Tracker */}
                  <SuccessTracker
                    documentId={`travel_history_${Date.now()}`}
                    country="general"
                    visaType="travel_history"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No History Formatted Yet</h4>
                  <p className="text-gray-600 text-sm mb-4">Enter your travel history and click &quot;Format&quot;</p>
                  <div className="bg-green-50 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-green-900">
                      <strong>What you&apos;ll get:</strong> Professional table with dates, countries, durations, and a summary - ready for your visa application!
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


