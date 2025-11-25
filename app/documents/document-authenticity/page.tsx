'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Shield, Loader, Plus, Trash2, AlertTriangle, CheckCircle, ClipboardList, Download, Copy } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface DocumentInput {
  type: string;
  issuingCountry: string;
  issuingAuthority: string;
  issueDate: string;
  expirationDate: string;
  referenceNumber: string;
  verificationDetails: string;
  concerns: string;
}

export default function DocumentAuthenticityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [documents, setDocuments] = useState<DocumentInput[]>([
    {
      type: '',
      issuingCountry: '',
      issuingAuthority: '',
      issueDate: '',
      expirationDate: '',
      referenceNumber: '',
      verificationDetails: '',
      concerns: ''
    }
  ]);

  const [formData, setFormData] = useState({
    applicantName: '',
    targetCountry: '',
    visaType: 'study',
    riskConcerns: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDocumentChange = (index: number, field: keyof DocumentInput, value: string) => {
    const updated = [...documents];
    updated[index][field] = value;
    setDocuments(updated);
  };

  const addDocument = () => {
    setDocuments([
      ...documents,
      {
        type: '',
        issuingCountry: '',
        issuingAuthority: '',
        issueDate: '',
        expirationDate: '',
        referenceNumber: '',
        verificationDetails: '',
        concerns: ''
      }
    ]);
  };

  const removeDocument = (index: number) => {
    if (documents.length === 1) return;
    const updated = [...documents];
    updated.splice(index, 1);
    setDocuments(updated);
  };

  const handleAnalyze = async () => {
    if (!formData.applicantName || !formData.targetCountry || !formData.visaType) {
      alert('Please complete applicant details.');
      return;
    }

    if (documents.some(doc => !doc.type.trim())) {
      alert('Each document must have a type/name.');
      return;
    }

    setIsLoading(true);
    setReport(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/document-authenticity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...formData,
          documents: documents.map(doc => ({
            ...doc,
            type: doc.type.trim(),
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.data.report);
      } else {
        alert(data.message || 'Failed to generate checklist');
      }
    } catch (error) {
      console.error('Document authenticity error:', error);
      alert('Failed to generate checklist. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = () => {
    if (!report?.summary) return;
    navigator.clipboard.writeText(report.summary);
    alert('Summary copied!');
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
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
            <Shield className="w-8 h-8 text-indigo-600" />
            <span>Document Authenticity Checklist</span>
          </h1>
          <p className="text-gray-600">Detect potential forgery risks, missing verifications, and embassy red flags before you submit.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Applicant & Case Details</CardTitle>
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
                <Textarea
                  name="riskConcerns"
                  value={formData.riskConcerns}
                  onChange={handleInputChange}
                  placeholder="Anything you’re worried about? (e.g., old documents, missing stamps)"
                  rows={2}
                />
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Notes for the authenticity analyst (translation info, legalization plans, etc.)"
                  rows={2}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle>Documents for Verification</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Add each document that needs an authenticity check.</p>
                </div>
                <Button variant="outline" onClick={addDocument} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Document</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {documents.map((doc, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">Document #{idx + 1}</h4>
                      {documents.length > 1 && (
                        <button
                          onClick={() => removeDocument(idx)}
                          className="p-2 text-gray-500 hover:text-red-600"
                          title="Remove document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input
                        value={doc.type}
                        onChange={(e) => handleDocumentChange(idx, 'type', e.target.value)}
                        placeholder="Document Type (e.g., Bank Statement) *"
                      />
                      <Input
                        value={doc.issuingCountry}
                        onChange={(e) => handleDocumentChange(idx, 'issuingCountry', e.target.value)}
                        placeholder="Issuing Country"
                      />
                      <Input
                        value={doc.issuingAuthority}
                        onChange={(e) => handleDocumentChange(idx, 'issuingAuthority', e.target.value)}
                        placeholder="Issuing Authority (Bank, University, etc.)"
                      />
                      <Input
                        value={doc.referenceNumber}
                        onChange={(e) => handleDocumentChange(idx, 'referenceNumber', e.target.value)}
                        placeholder="Reference/Certificate Number"
                      />
                      <Input
                        value={doc.issueDate}
                        onChange={(e) => handleDocumentChange(idx, 'issueDate', e.target.value)}
                        placeholder="Issue Date (YYYY-MM-DD)"
                      />
                      <Input
                        value={doc.expirationDate}
                        onChange={(e) => handleDocumentChange(idx, 'expirationDate', e.target.value)}
                        placeholder="Expiration Date (if any)"
                      />
                    </div>
                    <Textarea
                      value={doc.verificationDetails}
                      onChange={(e) => handleDocumentChange(idx, 'verificationDetails', e.target.value)}
                      placeholder="Verification details (notarization, apostille, embassy stamp, translation certification, etc.)"
                      rows={2}
                    />
                    <Textarea
                      value={doc.concerns}
                      onChange={(e) => handleDocumentChange(idx, 'concerns', e.target.value)}
                      placeholder="Known issues or concerns (e.g., scanned copy, translated version)"
                      rows={2}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Generating Authenticity Checklist...
                </>
              ) : (
                <>
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Analyze Documents
                </>
              )}
            </Button>
          </div>

          <Card className="lg:sticky lg:top-8 h-fit">
            <CardHeader>
              <CardTitle>Authenticity Findings</CardTitle>
            </CardHeader>
            <CardContent>
              {report ? (
                <div className="space-y-6">
                  <div className={`p-4 rounded-xl border ${getRiskColor(report.riskLevel)}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-gray-500">Overall Score</p>
                        <div className="text-4xl font-bold">{report.overallScore ?? 0}/100</div>
                      </div>
                      <Shield className="w-10 h-10 text-inherit opacity-70" />
                    </div>
                    <p className="text-sm mt-3">{report.summary}</p>
                    <Button variant="ghost" size="sm" onClick={copySummary} className="mt-3 flex items-center space-x-2">
                      <Copy className="w-4 h-4" />
                      <span>Copy summary</span>
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-rose-50">
                      <h4 className="font-semibold text-rose-900 mb-2 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Red Flags</span>
                      </h4>
                      <ul className="space-y-2 text-sm text-rose-800">
                        {report.redFlags?.length ? report.redFlags.map((flag: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{flag}</span>
                          </li>
                        )) : <li>No red flags detected.</li>}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg border bg-amber-50">
                      <h4 className="font-semibold text-amber-900 mb-2">Required Verifications</h4>
                      <ul className="space-y-2 text-sm text-amber-900">
                        {report.requiredVerifications?.length ? report.requiredVerifications.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        )) : <li>No additional verification steps listed.</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-white">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Recommendations</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {report.recommendations?.length ? report.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{rec}</span>
                        </li>
                      )) : <li>Provide more document details to receive tailored recommendations.</li>}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Document-by-Document Checks</h4>
                    <div className="space-y-3">
                      {report.documentChecks?.map((doc: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-900">{doc.type}</p>
                              <p className="text-sm text-gray-500">{doc.status?.toUpperCase()} • {doc.score ?? 0}/100</p>
                            </div>
                            <div className="text-sm font-semibold text-gray-600">{doc.status}</div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="font-semibold text-gray-700">Issues / Alerts</p>
                              <ul className="list-disc pl-5 text-gray-600">
                                {doc.issues?.length ? doc.issues.map((issue: string, idx2: number) => (
                                  <li key={idx2}>{issue}</li>
                                )) : <li>No issues detected.</li>}
                              </ul>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700">Verification Guidance</p>
                              <ul className="list-disc pl-5 text-gray-600">
                                {doc.verificationGuidance?.length ? doc.verificationGuidance.map((guide: string, idx2: number) => (
                                  <li key={idx2}>{guide}</li>
                                )) : <li>No additional verification guidance.</li>}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2">Next Steps</h4>
                    <ul className="space-y-2 text-sm text-green-900">
                      {report.nextSteps?.length ? report.nextSteps.map((step: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">✓</span>
                          <span>{step}</span>
                        </li>
                      )) : <li>No next steps provided.</li>}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Checklist Yet</h4>
                  <p className="text-gray-600 text-sm">Add your documents and generate the authenticity checklist.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

