'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Target, Loader, Copy, Calendar, Flag, CheckCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ReapplicationStrategyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [formData, setFormData] = useState({
    applicantName: '',
    targetCountry: '',
    visaType: 'study',
    desiredSubmissionDate: '',
    priorityLevel: 'normal',
    correctedConcerns: '',
    improvementsSinceRefusal: '',
    strategyFocus: '',
    previousReport: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.applicantName || !formData.targetCountry || !formData.visaType) {
      alert('Please fill in applicant name, target country, and visa type.');
      return;
    }

    setIsLoading(true);
    setReport(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/reapplication-strategy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          applicantName: formData.applicantName,
          targetCountry: formData.targetCountry,
          visaType: formData.visaType,
          desiredSubmissionDate: formData.desiredSubmissionDate || undefined,
          priorityLevel: formData.priorityLevel as 'normal' | 'urgent',
          correctedConcerns: formData.correctedConcerns
            ? formData.correctedConcerns.split('\n').map(item => item.trim()).filter(Boolean)
            : undefined,
          improvementsSinceRefusal: formData.improvementsSinceRefusal || undefined,
          strategyFocus: formData.strategyFocus || undefined,
          previousReport: formData.previousReport
            ? (() => {
                try {
                  return JSON.parse(formData.previousReport);
                } catch {
                  return undefined;
                }
              })()
            : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.data.report);
      } else {
        alert(data.message || 'Failed to build strategy');
      }
    } catch (error) {
      console.error('Reapplication strategy error:', error);
      alert('Failed to build strategy. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = () => {
    if (!report?.submissionPlan?.length) return;
    navigator.clipboard.writeText(report.submissionPlan.join('\n'));
    alert('Submission plan copied!');
  };

  const getUrgencyBadge = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-green-100 text-green-700';
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
            <Target className="w-8 h-8 text-indigo-600" />
            <span>Reapplication Strategy Builder</span>
          </h1>
          <p className="text-gray-600">
            Transform your refusal into a phased plan with milestones, risk mitigation, and submission playbook.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Strategy Inputs</CardTitle>
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
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    name="desiredSubmissionDate"
                    value={formData.desiredSubmissionDate}
                    onChange={handleInputChange}
                    placeholder="Target submission date (YYYY-MM-DD)"
                  />
                  <select
                    name="priorityLevel"
                    value={formData.priorityLevel}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <Textarea
                  name="correctedConcerns"
                  value={formData.correctedConcerns}
                  onChange={handleInputChange}
                  placeholder="Which officer concerns have you already fixed? (One per line)"
                  rows={3}
                />
                <Textarea
                  name="improvementsSinceRefusal"
                  value={formData.improvementsSinceRefusal}
                  onChange={handleInputChange}
                  placeholder="What improvements have you made since the last refusal?"
                  rows={3}
                />
                <Textarea
                  name="strategyFocus"
                  value={formData.strategyFocus}
                  onChange={handleInputChange}
                  placeholder="Strategy focus (e.g., funds, ties, new sponsor, employer support)"
                  rows={2}
                />
                <Textarea
                  name="previousReport"
                  value={formData.previousReport}
                  onChange={handleInputChange}
                  placeholder="Optional: paste JSON output from Visa Rejection Analyzer for deeper context"
                  rows={4}
                />
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Building Strategy...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 mr-2" />
                  Build Reapplication Strategy
                </>
              )}
            </Button>
          </div>

          <Card className="lg:sticky lg:top-8 h-fit">
            <CardHeader>
              <CardTitle>Execution Blueprint</CardTitle>
            </CardHeader>
            <CardContent>
              {report ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl border bg-white flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Readiness Score</p>
                      <div className="text-4xl font-bold text-gray-900">{report.readinessScore ?? 0}/100</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyBadge(report.urgency)}`}>
                      {report.urgency?.toUpperCase() || 'MEDIUM'}
                    </span>
                  </div>

                  <div className="p-4 rounded-lg border bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-2">Key Milestones</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {report.keyMilestones?.length ? report.keyMilestones.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      )) : <li>No milestones generated.</li>}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Checklist</span>
                    </h4>
                    <div className="space-y-2">
                      {report.checklist?.length ? report.checklist.map((item: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">{item.item}</p>
                            <span className={`text-xs font-semibold ${
                              item.status === 'complete' ? 'text-green-600' :
                              item.status === 'in_progress' ? 'text-amber-600' :
                              'text-rose-600'
                            }`}>
                              {item.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 mt-1">Impact: {item.impact}</p>
                          <p className="text-sm text-gray-700 mt-2">{item.details}</p>
                        </div>
                      )) : <p className="text-sm text-gray-600">No checklist items.</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Strategy Pillars</h4>
                    <div className="space-y-2">
                      {report.strategyPillars?.length ? report.strategyPillars.map((pillar: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                          <p className="font-semibold text-gray-900">{pillar.pillar}</p>
                          <ul className="list-disc pl-5 text-sm text-gray-700 mt-2">
                            {pillar.actions?.map((action: string, idx2: number) => (
                              <li key={idx2}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )) : <p className="text-sm text-gray-600">No pillars provided.</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span>Timeline</span>
                    </h4>
                    <div className="space-y-2">
                      {report.timeline?.length ? report.timeline.map((item: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">{item.phase}</p>
                            <span className="text-xs text-gray-500">{item.dueDate || 'Next'}</span>
                          </div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">Owner: {item.owner || 'Applicant'}</p>
                          <ul className="list-disc pl-5 text-sm text-gray-700 mt-2">
                            {item.tasks?.map((task: string, idx2: number) => (
                              <li key={idx2}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      )) : <p className="text-sm text-gray-600">No timeline generated.</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Risk Mitigation</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700">
                      {report.riskMitigation?.length ? report.riskMitigation.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      )) : <li>No risk mitigation steps listed.</li>}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">Submission Plan</h4>
                    <ul className="list-disc pl-5 text-sm text-blue-900">
                      {report.submissionPlan?.length ? report.submissionPlan.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      )) : <li>No submission plan provided.</li>}
                    </ul>
                    <Button variant="ghost" size="sm" onClick={copySummary} className="mt-3 flex items-center space-x-2">
                      <Copy className="w-4 h-4" />
                      <span>Copy plan</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <Flag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Strategy Yet</h4>
                  <p className="text-gray-600 text-sm">Provide your post-refusal details to generate a reapplication plan.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

