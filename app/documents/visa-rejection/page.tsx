'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, AlertTriangle, FileText, Loader, ClipboardList, Copy } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function VisaRejectionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [formData, setFormData] = useState({
    applicantName: '',
    targetCountry: '',
    visaType: 'study',
    rejectionDate: '',
    rejectionReason: '',
    rejectionLetter: '',
    previousAttempts: '0',
    documentsSubmitted: '',
    concerns: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async () => {
    if (!formData.applicantName || !formData.targetCountry || !formData.visaType) {
      alert('Please fill in applicant name, target country, and visa type.');
      return;
    }
    if (!formData.rejectionLetter && !formData.rejectionReason) {
      alert('Please paste the rejection letter or at least the stated reason.');
      return;
    }

    setIsLoading(true);
    setReport(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/visa-rejection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          applicantName: formData.applicantName,
          targetCountry: formData.targetCountry,
          visaType: formData.visaType,
          rejectionDate: formData.rejectionDate || undefined,
          rejectionReason: formData.rejectionReason || undefined,
          rejectionLetter: formData.rejectionLetter || undefined,
          previousAttempts: parseInt(formData.previousAttempts || '0', 10) || 0,
          documentsSubmitted: formData.documentsSubmitted
            ? formData.documentsSubmitted.split(',').map(item => item.trim()).filter(Boolean)
            : undefined,
          concerns: formData.concerns || undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.data.report);
      } else {
        alert(data.message || 'Failed to analyze rejection');
      }
    } catch (error) {
      console.error('Visa rejection analyzer error:', error);
      alert('Failed to analyze rejection. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = () => {
    if (!report?.rootCauseSummary) return;
    navigator.clipboard.writeText(report.rootCauseSummary);
    alert('Summary copied!');
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
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
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <span>Visa Rejection Analyzer</span>
          </h1>
          <p className="text-gray-600">
            Paste your refusal letter and we’ll pinpoint the officer’s concerns, missing evidence, and exact fixes for your reapplication.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Refusal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleInputChange}
                  placeholder="Applicant Full Name *"
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
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    name="rejectionDate"
                    value={formData.rejectionDate}
                    onChange={handleInputChange}
                    placeholder="Rejection Date (YYYY-MM-DD)"
                  />
                  <Input
                    name="previousAttempts"
                    value={formData.previousAttempts}
                    onChange={handleInputChange}
                    placeholder="Previous Attempts (#)"
                    type="number"
                    min="0"
                  />
                </div>
                <Textarea
                  name="rejectionReason"
                  value={formData.rejectionReason}
                  onChange={handleInputChange}
                  placeholder="Stated reason in the refusal letter (optional if you paste the letter)"
                  rows={2}
                />
                <Textarea
                  name="rejectionLetter"
                  value={formData.rejectionLetter}
                  onChange={handleInputChange}
                  placeholder="Paste the full refusal letter text here"
                  rows={8}
                />
                <Textarea
                  name="documentsSubmitted"
                  value={formData.documentsSubmitted}
                  onChange={handleInputChange}
                  placeholder="Documents you submitted (comma-separated)"
                  rows={2}
                />
                <Textarea
                  name="concerns"
                  value={formData.concerns}
                  onChange={handleInputChange}
                  placeholder="Anything else we should know? (e.g., new sponsor, updated funds, improved ties)"
                  rows={2}
                />
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Rejection...
                </>
              ) : (
                <>
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Analyze Rejection Letter
                </>
              )}
            </Button>
          </div>

          <Card className="lg:sticky lg:top-8 h-fit">
            <CardHeader>
              <CardTitle>Reapplication Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              {report ? (
                <div className="space-y-6">
                  <div className={`p-4 rounded-xl border ${getSeverityColor(report.severity)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-gray-600">Root Cause</p>
                        <p className="text-sm text-gray-900">{report.rootCauseSummary}</p>
                      </div>
                      <AlertTriangle className="w-10 h-10 text-inherit opacity-70" />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Confidence: {(report.confidence * 100).toFixed(0)}%</p>
                    <Button variant="ghost" size="sm" onClick={copySummary} className="mt-3 flex items-center space-x-2">
                      <Copy className="w-4 h-4" />
                      <span>Copy summary</span>
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-red-50">
                      <h4 className="font-semibold text-red-900 mb-2">Officer Concerns</h4>
                      <ul className="space-y-2 text-sm text-red-900">
                        {report.officerConcerns?.length ? report.officerConcerns.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        )) : <li>No concerns listed.</li>}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg border bg-amber-50">
                      <h4 className="font-semibold text-amber-900 mb-2">Missing Evidence</h4>
                      <ul className="space-y-2 text-sm text-amber-900">
                        {report.missingEvidence?.length ? report.missingEvidence.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        )) : <li>No missing evidence detected.</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-white">
                    <h4 className="font-semibold text-gray-900 mb-2">Recommended Fixes</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {report.recommendedFixes?.length ? report.recommendedFixes.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      )) : <li>No recommendations provided.</li>}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">Immediate Next Steps</h4>
                    <ul className="space-y-2 text-sm text-blue-900">
                      {report.nextSteps?.length ? report.nextSteps.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">✓</span>
                          <span>{item}</span>
                        </li>
                      )) : <li>No next steps provided.</li>}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Reapplication Timeline</h4>
                    <div className="space-y-2">
                      {report.timeline?.length ? report.timeline.map((item: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                          <span className="text-sm text-gray-900">{item.step}</span>
                          <span className="text-xs font-semibold text-gray-500">{item.dueBy || 'Next'}</span>
                        </div>
                      )) : <p className="text-sm text-gray-600">No timeline provided.</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Reapplication Checklist</h4>
                    <div className="space-y-2">
                      {report.reapplicationChecklist?.length ? report.reapplicationChecklist.map((item: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">{item.item}</p>
                            <span className={`text-xs font-semibold ${
                              item.status === 'required' ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {item.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{item.details}</p>
                        </div>
                      )) : <p className="text-sm text-gray-600">No checklist items provided.</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Yet</h4>
                  <p className="text-gray-600 text-sm">Paste your rejection letter to see the officer’s concerns and winning fixes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

