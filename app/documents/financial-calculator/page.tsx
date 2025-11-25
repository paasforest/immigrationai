'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calculator, Loader, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function FinancialCalculatorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [calculation, setCalculation] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    applicantName: '',
    targetCountry: '',
    visaType: 'study',
    availableFunds: '',
    monthlyIncome: '',
    annualIncome: '',
    sourceOfFunds: 'savings',
    durationOfStay: '',
    homeCountry: '',
    tuitionFees: '',
    livingCosts: '',
    accommodationCosts: '',
    otherExpenses: '',
    sponsorName: '',
    sponsorRelationship: '',
    sponsorIncome: '',
    dependents: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCalculate = async () => {
    if (!formData.applicantName || !formData.targetCountry || !formData.visaType) {
      alert('Please fill required fields: Name, Target Country, and Visa Type');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/calculate-financial-capacity`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setCalculation(data.data.calculation);
      } else {
        alert(data.message || 'Failed to calculate financial capacity');
      }
    } catch (error) {
      console.error('Error calculating financial capacity:', error);
      alert('Failed to calculate. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sufficient':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'mostly_sufficient':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'partially_sufficient':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'insufficient':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sufficient':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'mostly_sufficient':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'partially_sufficient':
        return <AlertCircle className="w-6 h-6 text-orange-600" />;
      case 'insufficient':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
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
            <Calculator className="w-8 h-8 text-blue-600" />
            <span>Financial Capacity Calculator</span>
          </h1>
          <p className="text-gray-600">Calculate minimum funds required and assess your financial capacity for visa applications</p>
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
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="homeCountry"
                    value={formData.homeCountry}
                    onChange={handleInputChange}
                    placeholder="Home Country"
                  />
                  <Input
                    name="durationOfStay"
                    value={formData.durationOfStay}
                    onChange={handleInputChange}
                    placeholder="Duration (e.g., 1 year, 2 years)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Funds *</label>
                  <Input
                    name="availableFunds"
                    value={formData.availableFunds}
                    onChange={handleInputChange}
                    placeholder="e.g., $25,000 USD"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleInputChange}
                    placeholder="Monthly Income"
                  />
                  <Input
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleInputChange}
                    placeholder="Annual Income"
                  />
                </div>
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
                    <option value="loan">Education Loan</option>
                    <option value="sponsor">Family Sponsor</option>
                    <option value="business">Business Income</option>
                    <option value="mixed">Mixed Sources</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Expenses (for Study/Work visas) */}
            {(formData.visaType === 'study' || formData.visaType === 'work') && (
              <Card>
                <CardHeader>
                  <CardTitle>Expected Expenses</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.visaType === 'study' && (
                    <Input
                      name="tuitionFees"
                      value={formData.tuitionFees}
                      onChange={handleInputChange}
                      placeholder="Annual Tuition Fees"
                    />
                  )}
                  <Input
                    name="livingCosts"
                    value={formData.livingCosts}
                    onChange={handleInputChange}
                    placeholder="Monthly Living Costs"
                  />
                  <Input
                    name="accommodationCosts"
                    value={formData.accommodationCosts}
                    onChange={handleInputChange}
                    placeholder="Monthly Accommodation Costs"
                  />
                  <Input
                    name="otherExpenses"
                    value={formData.otherExpenses}
                    onChange={handleInputChange}
                    placeholder="Other Expenses (travel, insurance, etc.)"
                  />
                </CardContent>
              </Card>
            )}

            {/* Sponsor Information */}
            {formData.sourceOfFunds === 'sponsor' && (
              <Card>
                <CardHeader>
                  <CardTitle>Sponsor Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    name="sponsorName"
                    value={formData.sponsorName}
                    onChange={handleInputChange}
                    placeholder="Sponsor Name"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      name="sponsorRelationship"
                      value={formData.sponsorRelationship}
                      onChange={handleInputChange}
                      placeholder="Relationship (e.g., Father)"
                    />
                    <Input
                      name="sponsorIncome"
                      value={formData.sponsorIncome}
                      onChange={handleInputChange}
                      placeholder="Sponsor Annual Income"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dependents */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  name="dependents"
                  value={formData.dependents}
                  onChange={handleInputChange}
                  placeholder="Number of Dependents (if applicable)"
                  type="number"
                />
              </CardContent>
            </Card>

            <Button
              onClick={handleCalculate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculate Financial Capacity
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          <Card className="lg:sticky lg:top-8 h-fit">
            <CardHeader>
              <CardTitle>Calculation Results</CardTitle>
            </CardHeader>
            <CardContent>
              {calculation ? (
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className={`p-4 rounded-lg border-2 flex items-center space-x-3 ${getStatusColor(calculation.status)}`}>
                    {getStatusIcon(calculation.status)}
                    <div>
                      <div className="font-bold text-lg">
                        {calculation.status === 'sufficient' ? '✅ Sufficient Funds' :
                         calculation.status === 'mostly_sufficient' ? '⚠️ Mostly Sufficient' :
                         calculation.status === 'partially_sufficient' ? '⚠️ Partially Sufficient' :
                         calculation.status === 'insufficient' ? '❌ Insufficient Funds' :
                         'Status Unknown'}
                      </div>
                      <div className="text-sm">Sufficiency Score: {calculation.sufficiencyScore}%</div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Financial Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Required:</span>
                          <span className="font-bold">
                            {calculation.minimumRequired?.currency || 'USD'} {calculation.minimumRequired?.amount?.toLocaleString() || '0'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available Funds:</span>
                          <span className="font-bold">
                            {calculation.availableFunds?.currency || 'USD'} {calculation.availableFunds?.amount?.toLocaleString() || '0'}
                          </span>
                        </div>
                        {calculation.gapAnalysis?.hasGap && (
                          <div className="flex justify-between text-red-600">
                            <span>Gap:</span>
                            <span className="font-bold">
                              {calculation.gapAnalysis.gapAmount?.toLocaleString() || '0'} ({calculation.gapAnalysis.gapPercentage || 0}%)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Breakdown */}
                    {calculation.minimumRequired?.breakdown && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Cost Breakdown</h3>
                        <div className="space-y-2 text-sm">
                          {calculation.minimumRequired.breakdown.tuition && (
                            <div className="flex justify-between">
                              <span>Tuition:</span>
                              <span>{calculation.minimumRequired.currency} {calculation.minimumRequired.breakdown.tuition.toLocaleString()}</span>
                            </div>
                          )}
                          {calculation.minimumRequired.breakdown.livingCosts && (
                            <div className="flex justify-between">
                              <span>Living Costs:</span>
                              <span>{calculation.minimumRequired.currency} {calculation.minimumRequired.breakdown.livingCosts.toLocaleString()}</span>
                            </div>
                          )}
                          {calculation.minimumRequired.breakdown.accommodation && (
                            <div className="flex justify-between">
                              <span>Accommodation:</span>
                              <span>{calculation.minimumRequired.currency} {calculation.minimumRequired.breakdown.accommodation.toLocaleString()}</span>
                            </div>
                          )}
                          {calculation.minimumRequired.breakdown.otherExpenses && (
                            <div className="flex justify-between">
                              <span>Other Expenses:</span>
                              <span>{calculation.minimumRequired.currency} {calculation.minimumRequired.breakdown.otherExpenses.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {calculation.recommendations && calculation.recommendations.length > 0 && (
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-amber-600" />
                          Recommendations
                        </h3>
                        <ul className="space-y-2 text-sm">
                          {calculation.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Country Requirements */}
                    {calculation.countrySpecificRequirements && calculation.countrySpecificRequirements.length > 0 && (
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Country-Specific Requirements</h3>
                        <ul className="space-y-2 text-sm">
                          {calculation.countrySpecificRequirements.map((req: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Next Steps */}
                    {calculation.nextSteps && calculation.nextSteps.length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Next Steps</h3>
                        <ul className="space-y-2 text-sm">
                          {calculation.nextSteps.map((step: string, idx: number) => (
                            <li key={idx} className="flex items-start">
                              <span className="mr-2">✓</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Summary */}
                    {calculation.summary && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                        <p className="text-sm text-gray-700">{calculation.summary}</p>
                      </div>
                    )}
                  </div>

                  {/* Feedback Widget */}
                  <FeedbackWidget
                    documentId={`financial_calculator_${Date.now()}`}
                    documentType="financial_calculator"
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                  
                  {/* Success Tracker */}
                  <SuccessTracker
                    documentId={`financial_calculator_${Date.now()}`}
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Calculation Yet</h4>
                  <p className="text-gray-600 text-sm">Fill in your financial information and calculate your capacity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

