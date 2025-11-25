'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileCheck, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function DocumentConsistencyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [documents, setDocuments] = useState([{ type: '', content: '' }]);
  
  const [formData, setFormData] = useState({
    applicantName: '',
    targetCountry: '',
    visaType: 'study',
    keyFields: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDocumentChange = (idx: number, field: string, value: string) => {
    const updated = [...documents];
    updated[idx] = { ...updated[idx], [field]: value };
    setDocuments(updated);
  };

  const addDocument = () => {
    setDocuments([...documents, { type: '', content: '' }]);
  };

  const removeDocument = (idx: number) => {
    setDocuments(documents.filter((_, i) => i !== idx));
  };

  const handleCheck = async () => {
    if (!formData.applicantName || !formData.targetCountry || !formData.visaType) {
      alert('Please fill in applicant name, target country, and visa type.');
      return;
    }
    if (documents.length < 2) {
      alert('Please provide at least 2 documents to compare.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/document-consistency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          applicantName: formData.applicantName,
          targetCountry: formData.targetCountry,
          visaType: formData.visaType,
          documents: documents.filter(d => d.type && d.content),
          keyFields: formData.keyFields ? formData.keyFields.split(',').map(f => f.trim()) : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.data.report);
      } else {
        alert(data.message || 'Failed to check consistency');
      }
    } catch (error) {
      console.error('Consistency check error:', error);
      alert('Failed to check consistency. Please check backend connection.');
    } finally {
      setIsLoading(false);
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
            <FileCheck className="w-8 h-8 text-blue-600" />
            <span>Document Consistency Checker</span>
          </h1>
          <p className="text-gray-600">Check consistency across multiple documents before submission</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input name="applicantName" value={formData.applicantName} onChange={handleInputChange} placeholder="Applicant Name *" />
                <div className="grid grid-cols-2 gap-4">
                  <Input name="targetCountry" value={formData.targetCountry} onChange={handleInputChange} placeholder="Target Country *" />
                  <select name="visaType" value={formData.visaType} onChange={handleInputChange} className="px-3 py-2 border rounded-md">
                    <option value="study">Study Visa</option>
                    <option value="work">Work Visa</option>
                    <option value="visitor">Visitor Visa</option>
                  </select>
                </div>
                <Input name="keyFields" value={formData.keyFields} onChange={handleInputChange} placeholder="Key Fields to Check (comma-separated)" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents to Compare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {documents.map((doc, idx) => (
                  <div key={idx} className="border p-4 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Document {idx + 1}</h4>
                      {documents.length > 1 && (
                        <Button variant="outline" size="sm" onClick={() => removeDocument(idx)}>Remove</Button>
                      )}
                    </div>
                    <Input placeholder="Document Type (e.g., Passport, SOP, Bank Statement)" value={doc.type} onChange={(e) => handleDocumentChange(idx, 'type', e.target.value)} />
                    <Textarea placeholder="Paste document content or key information here" value={doc.content} onChange={(e) => handleDocumentChange(idx, 'content', e.target.value)} rows={4} />
                  </div>
                ))}
                <Button variant="outline" onClick={addDocument}>Add Another Document</Button>
              </CardContent>
            </Card>

            <Button onClick={handleCheck} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
              {isLoading ? <><Loader className="w-5 h-5 mr-2 animate-spin" /> Checking...</> : <><FileCheck className="w-5 h-5 mr-2" /> Check Consistency</>}
            </Button>
          </div>

          <Card className="lg:sticky lg:top-8 h-fit">
            <CardHeader>
              <CardTitle>Consistency Report</CardTitle>
            </CardHeader>
            <CardContent>
              {report ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${report.status === 'fully_consistent' ? 'bg-green-50 border-green-200' : report.status === 'mostly_consistent' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="text-2xl font-bold">{report.consistencyScore}%</div>
                    <div className="text-sm">Consistency Score</div>
                  </div>
                  {report.inconsistencies?.length > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Inconsistencies Found</h4>
                      {report.inconsistencies.map((item: any, idx: number) => (
                        <div key={idx} className="mb-2 text-sm">
                          <strong>{item.field}</strong> ({item.severity}): {item.description}
                          <div className="text-xs text-gray-600 mt-1">{item.recommendation}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {report.strengths?.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Strengths</h4>
                      <ul className="text-sm space-y-1">
                        {report.strengths.map((item: string, idx: number) => (
                          <li key={idx}>✓ {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report.recommendations?.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <ul className="text-sm space-y-1">
                        {report.recommendations.map((item: string, idx: number) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report.summary && <p className="text-sm text-gray-700">{report.summary}</p>}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">No report yet. Add documents and check consistency.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
