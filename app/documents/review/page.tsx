'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Brain, Loader, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SOPReviewerPage() {
  const [sopText, setSOPText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!sopText.trim() || sopText.length < 100) {
      alert('Please paste your SOP (minimum 100 characters)');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-sop`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ text: sopText }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.data.analysis);
      } else {
        alert(data.message || 'Failed to analyze SOP');
      }
    } catch (error) {
      console.error('Error analyzing SOP:', error);
      alert('Failed to analyze SOP. Please check your OpenAI API key in backend .env');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'from-green-50 to-emerald-50 border-green-200';
    if (score >= 70) return 'from-yellow-50 to-amber-50 border-yellow-200';
    return 'from-red-50 to-rose-50 border-red-200';
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
            <Brain className="w-8 h-8 text-blue-600" />
            <span>AI SOP Reviewer</span>
          </h1>
          <p className="text-gray-600">Get AI-powered feedback and improvement suggestions</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle>Your Statement of Purpose</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sopText}
                onChange={(e) => setSOPText(e.target.value)}
                placeholder="Paste your SOP here for AI analysis..."
                rows={20}
                className="w-full"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {sopText.length} characters
                </span>
                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading || !sopText.trim()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5 mr-2" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className={`p-6 rounded-xl border bg-gradient-to-r ${getScoreBg(analysis.score.overall)}`}>
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreColor(analysis.score.overall)} mb-2`}>
                        {analysis.score.overall}/100
                      </div>
                      <div className="text-sm text-gray-700 font-medium">Overall Quality Score</div>
                    </div>
                  </div>

                  {/* Detailed Scores */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span>Detailed Scores</span>
                    </h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm font-medium">Clarity</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${analysis.score.clarity}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(analysis.score.clarity)}`}>
                            {analysis.score.clarity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm font-medium">Structure</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${analysis.score.structure}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(analysis.score.structure)}`}>
                            {analysis.score.structure}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <span className="text-sm font-medium">Persuasiveness</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${analysis.score.persuasiveness}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${getScoreColor(analysis.score.persuasiveness)}`}>
                            {analysis.score.persuasiveness}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {analysis.suggestions && analysis.suggestions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        <span>AI Suggestions</span>
                      </h3>
                      <div className="space-y-2">
                        {analysis.suggestions.map((suggestion: string, idx: number) => (
                          <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-blue-900">{suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Feedback Widget */}
                  <FeedbackWidget
                    documentId={`sop_review_${Date.now()}`}
                    documentType="sop_review"
                    country="general"
                    visaType="sop_analysis"
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Yet</h4>
                  <p className="text-gray-600 text-sm">Paste your SOP and click &quot;Analyze with AI&quot;</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


