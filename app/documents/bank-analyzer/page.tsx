'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Loader, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function BankAnalyzerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    applicantName: '',
    targetCountry: '',
    visaType: 'study',
    statementText: '',
    accountBalance: '',
    averageBalance: '',
    minimumBalance: '',
    accountType: 'savings',
    currency: 'USD',
    statementPeriod: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    largeDeposits: '',
    sourceOfFunds: 'savings',
    homeCountry: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async () => {
    if (!formData.applicantName || !formData.targetCountry || !formData.visaType) {
      alert('Please fill required fields: Name, Target Country, and Visa Type');
      return;
    }

    if (!formData.statementText && !formData.accountBalance) {
      alert('Please provide either bank statement text or account balance');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/analyze-bank-statement`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.data.analysis);
      } else {
        alert(data.message || 'Failed to analyze bank statement');
      }
    } catch (error) {
      console.error('Error analyzing bank statement:', error);
      alert('Failed to analyze. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'excellent':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'excellent':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'good':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      case 'fair':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'poor':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-600" />;
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
            <FileText className="w-8 h-8 text-blue-600" />
            <span>Bank Statement Analyzer</span>
          </h1>
          <p className="text-gray-600">Analyze your bank statements for visa compliance and detect potential red flags</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleInputChange}
                  placeholder="Your Full Name *"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="targetCountry"
                    value={formData.targetCountry}
                    onChange={handleInputChange}
                    placeholder="Target Country *"
                  />
                  <select
                    name="visaType"
                    value={formData.visaType}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="study">Study Visa</option>
                    <option value="work">Work Visa</option>
                    <option value="visitor">Visitor Visa</option>
                    <option value="business">Business Visa</option>
                    <option value="family">Family Visa</option>
                    <option value="permanent">Permanent Residency</option>
                  </select>
                </div>
                <Input
                  name="homeCountry"
                  value={formData.homeCountry}
                  onChange={handleInputChange}
                  placeholder="Home Country"
                />
              </CardContent>
            </Card>

            {/* Bank Statement Data */}
            <Card>
              <CardHeader>
                <CardTitle>Bank Statement Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Statement Text (Paste statement content here)
                  </label>
                  <Textarea
                    name="statementText"
                    value={formData.statementText}
                    onChange={handleInputChange}
                    placeholder="Paste your bank statement text here, or fill in the fields below..."
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="accountBalance"
                    value={formData.accountBalance}
                    onChange={handleInputChange}
                    placeholder="Current Balance *"
                  />
                  <Input
                    name="averageBalance"
                    value={formData.averageBalance}
                    onChange={handleInputChange}
                    placeholder="Average Balance (3-6 months)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="minimumBalance"
                    value={formData.minimumBalance}
                    onChange={handleInputChange}
                    placeholder="Minimum Balance"
                  />
                  <Input
                    name="statementPeriod"
                    value={formData.statementPeriod}
                    onChange={handleInputChange}
                    placeholder="Statement Period (e.g., 6 months)"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                    <select
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="savings">Savings</option>
                      <option value="checking">Checking</option>
                      <option value="current">Current</option>
                      <option value="fixed">Fixed Deposit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                      <option value="AUD">AUD</option>
                      <option value="ZAR">ZAR</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    placeholder="Monthly Income"
                  />
                  <Input
                    name="monthlyExpenses"
                    value={formData.monthlyExpenses}
                    onChange={handleInputChange}
                    placeholder="Monthly Expenses"
                  />
                </div>
                <Textarea
                  name="largeDeposits"
                  value={formData.largeDeposits}
                  onChange={handleInputChange}
                  placeholder="Large Deposits (>$1000) - Describe any large deposits and their source"
                  rows={3}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source of Funds</label>
                  <select
                    name="sourceOfFunds"
                    value={formData.sourceOfFunds}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="savings">Personal Savings</option>
                    <option value="salary">Employment Salary</option>
                    <option value="loan">Loan</option>
                    <option value="sponsor">Family Sponsor</option>
                    <option value="business">Business Income</option>
                    <option value="investment">Investment Returns</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Analyze Bank Statement
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          <Card className="lg:sticky lg:top-8 h-fit">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="space-y-6">
                  {/* Compliance Status */}
                  <div className={`p-4 rounded-lg border-2 flex items-center space-x-3 ${getStatusColor(analysis.complianceStatus)}`}>
                    {getStatusIcon(analysis.complianceStatus)}
                    <div>
                      <div className="font-bold text-lg">
                        Compliance: {analysis.complianceStatus?.charAt(0).toUpperCase() + analysis.complianceStatus?.slice(1) || 'Unknown'}
                      </div>
                      <div className="text-sm">Score: {analysis.complianceScore}%</div>
                    </div>
                  </div>

                  {/* Account Analysis */}
                  {analysis.accountAnalysis && Object.keys(analysis.accountAnalysis).length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Account Analysis</h3>
                      <div className="space-y-2 text-sm">
                        {analysis.accountAnalysis.currentBalance && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Current Balance:</span>
                            <span className="font-bold">
                              {analysis.accountAnalysis.currency || 'USD'} {analysis.accountAnalysis.currentBalance?.toLocaleString() || '0'}
                            </span>
                          </div>
                        )}
                        {analysis.accountAnalysis.averageBalance && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Average Balance:</span>
                            <span className="font-bold">
                              {analysis.accountAnalysis.currency || 'USD'} {analysis.accountAnalysis.averageBalance?.toLocaleString() || '0'}
                            </span>
                          </div>
                        )}
                        {analysis.accountAnalysis.minimumBalance && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Minimum Balance:</span>
                            <span className="font-bold">
                              {analysis.accountAnalysis.currency || 'USD'} {analysis.accountAnalysis.minimumBalance?.toLocaleString() || '0'}
                            </span>
                          </div>
                        )}
                        {analysis.accountAnalysis.statementPeriod && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Statement Period:</span>
                            <span className="font-bold">{analysis.accountAnalysis.statementPeriod}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Red Flags */}
                  {analysis.redFlags && analysis.redFlags.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                        Red Flags Detected
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {analysis.redFlags.map((flag: string, idx: number) => (
                          <li key={idx} className="flex items-start text-red-700">
                            <span className="mr-2">⚠️</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths */}
                  {analysis.strengths && analysis.strengths.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        Strengths
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {analysis.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="flex items-start text-green-700">
                            <span className="mr-2">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {analysis.weaknesses && analysis.weaknesses.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Areas for Improvement</h3>
                      <ul className="space-y-2 text-sm">
                        {analysis.weaknesses.map((weakness: string, idx: number) => (
                          <li key={idx} className="flex items-start text-yellow-700">
                            <span className="mr-2">•</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-amber-600" />
                        Recommendations
                      </h3>
                      <ul className="space-y-2 text-sm">
                        {analysis.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Country Requirements */}
                  {analysis.countryRequirements && Object.keys(analysis.countryRequirements).length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Country-Specific Requirements</h3>
                      <div className="space-y-2 text-sm">
                        {analysis.countryRequirements.minimumBalance && (
                          <div className="flex justify-between">
                            <span>Minimum Balance:</span>
                            <span className="font-bold">
                              {analysis.countryRequirements.currencyAccepted?.[0] || 'USD'} {analysis.countryRequirements.minimumBalance?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {analysis.countryRequirements.requiredPeriod && (
                          <div>Required Period: {analysis.countryRequirements.requiredPeriod}</div>
                        )}
                        {analysis.countryRequirements.statementFormat && (
                          <div>Format: {analysis.countryRequirements.statementFormat}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  {analysis.nextSteps && analysis.nextSteps.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
                      <ul className="space-y-2 text-sm">
                        {analysis.nextSteps.map((step: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">✓</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Summary */}
                  {analysis.summary && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                      <p className="text-sm text-gray-700">{analysis.summary}</p>
                    </div>
                  )}

                  {/* Feedback Widget */}
                  <FeedbackWidget
                    documentId={`bank_analyzer_${Date.now()}`}
                    documentType="bank_analyzer"
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                  
                  {/* Success Tracker */}
                  <SuccessTracker
                    documentId={`bank_analyzer_${Date.now()}`}
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Yet</h4>
                  <p className="text-gray-600 text-sm">Provide your bank statement information and analyze for compliance</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

