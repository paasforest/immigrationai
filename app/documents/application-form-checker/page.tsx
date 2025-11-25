'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ClipboardList, Loader, Plus, Trash2, CheckCircle, AlertTriangle, FileWarning, StickyNote, Copy } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FormField {
  label: string;
  value: string;
}

interface FormSection {
  title: string;
  fields: FormField[];
}

export default function ApplicationFormCheckerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [formData, setFormData] = useState({
    applicantName: '',
    targetCountry: '',
    visaType: 'study',
    submissionType: 'online',
    formVersion: '',
    attachments: '',
    concerns: ''
  });
  const [sections, setSections] = useState<FormSection[]>([
    { title: 'Personal Information', fields: [{ label: '', value: '' }] }
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSectionChange = (index: number, value: string) => {
    const updated = [...sections];
    updated[index].title = value;
    setSections(updated);
  };

  const handleFieldChange = (sectionIndex: number, fieldIndex: number, key: 'label' | 'value', value: string) => {
    const updated = [...sections];
    updated[sectionIndex].fields[fieldIndex][key] = value;
    setSections(updated);
  };

  const addSection = () => {
    setSections([...sections, { title: '', fields: [{ label: '', value: '' }] }]);
  };

  const removeSection = (index: number) => {
    if (sections.length === 1) return;
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  };

  const addField = (sectionIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].fields.push({ label: '', value: '' });
    setSections(updated);
  };

  const removeField = (sectionIndex: number, fieldIndex: number) => {
    const updated = [...sections];
    if (updated[sectionIndex].fields.length === 1) return;
    updated[sectionIndex].fields.splice(fieldIndex, 1);
    setSections(updated);
  };

  const handleAnalyze = async () => {
    if (!formData.applicantName || !formData.targetCountry || !formData.visaType) {
      alert('Please fill in applicant name, target country, and visa type.');
      return;
    }

    if (sections.some(section => section.fields.some(field => !field.label.trim()))) {
      alert('Every field must have a label.');
      return;
    }

    setIsLoading(true);
    setReport(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/application-form-checker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          applicantName: formData.applicantName,
          targetCountry: formData.targetCountry,
          visaType: formData.visaType,
          submissionType: formData.submissionType,
          formVersion: formData.formVersion || undefined,
          attachments: formData.attachments
            ? formData.attachments.split(',').map(a => a.trim()).filter(Boolean)
            : undefined,
          concerns: formData.concerns || undefined,
          sections: sections.map(section => ({
            title: section.title || 'Untitled Section',
            fields: section.fields.map(field => ({
              label: field.label,
              value: field.value
            }))
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        setReport(data.data.report);
      } else {
        alert(data.message || 'Failed to analyze form');
      }
    } catch (error) {
      console.error('Application form checker error:', error);
      alert('Failed to analyze form. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = () => {
    if (!report?.summary) return;
    navigator.clipboard.writeText(report.summary);
    alert('Summary copied!');
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'partial':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'incomplete':
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
            <ClipboardList className="w-8 h-8 text-indigo-600" />
            <span>Application Form Pre-Checker</span>
          </h1>
          <p className="text-gray-600">
            Upload your form responses and we’ll flag missing answers, inconsistent data, and common rejection risks.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Case Details</CardTitle>
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
                  <select
                    name="submissionType"
                    value={formData.submissionType}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="online">Online Portal</option>
                    <option value="paper">Paper Form</option>
                    <option value="portal">Visa Application Centre</option>
                    <option value="unknown">Not sure</option>
                  </select>
                  <Input
                    name="formVersion"
                    value={formData.formVersion}
                    onChange={handleInputChange}
                    placeholder="Form Version / Reference"
                  />
                </div>
                <Textarea
                  name="attachments"
                  value={formData.attachments}
                  onChange={handleInputChange}
                  placeholder="List attachments submitted with the form (comma-separated)"
                  rows={2}
                />
                <Textarea
                  name="concerns"
                  value={formData.concerns}
                  onChange={handleInputChange}
                  placeholder="Anything you're unsure about? (e.g., overlapping dates, missing employer info)"
                  rows={2}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle>Form Sections</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Enter each section exactly as it appears on your form.</p>
                </div>
                <Button variant="outline" onClick={addSection} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Section</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {sections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <Input
                        value={section.title}
                        onChange={(e) => handleSectionChange(sectionIndex, e.target.value)}
                        placeholder={`Section Title #${sectionIndex + 1}`}
                      />
                      {sections.length > 1 && (
                        <button
                          onClick={() => removeSection(sectionIndex)}
                          className="p-2 text-gray-500 hover:text-red-600"
                          title="Remove section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {section.fields.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="grid grid-cols-2 gap-3 items-center">
                        <Input
                          value={field.label}
                          onChange={(e) => handleFieldChange(sectionIndex, fieldIndex, 'label', e.target.value)}
                          placeholder="Field label (e.g., Employer Name)"
                        />
                        <div className="flex space-x-2">
                          <Input
                            value={field.value}
                            onChange={(e) => handleFieldChange(sectionIndex, fieldIndex, 'value', e.target.value)}
                            placeholder="Value / Answer"
                          />
                          {section.fields.length > 1 && (
                            <button
                              onClick={() => removeField(sectionIndex, fieldIndex)}
                              className="p-2 text-gray-500 hover:text-red-600"
                              title="Remove field"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <Button variant="ghost" size="sm" onClick={() => addField(sectionIndex)} className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Add Field</span>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Checking Form...
                </>
              ) : (
                <>
                  <ClipboardList className="w-5 h-5 mr-2" />
                  Run Pre-Check
                </>
              )}
            </Button>
          </div>

          <Card className="lg:sticky lg:top-8 h-fit">
            <CardHeader>
              <CardTitle>Completeness Report</CardTitle>
            </CardHeader>
            <CardContent>
              {report ? (
                <div className="space-y-6">
                  <div className={`p-4 rounded-xl border ${getStatusColor(report.completenessStatus)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm text-gray-600">Overall Score</p>
                        <div className="text-4xl font-bold text-gray-900">{report.overallScore ?? 0}/100</div>
                      </div>
                      <FileWarning className="w-10 h-10 text-inherit opacity-60" />
                    </div>
                    <p className="text-sm text-gray-700">{report.summary}</p>
                    <Button variant="ghost" size="sm" onClick={copySummary} className="mt-3 flex items-center space-x-2">
                      <Copy className="w-4 h-4" />
                      <span>Copy summary</span>
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border bg-red-50">
                      <h4 className="font-semibold text-red-900 mb-2">Missing Sections</h4>
                      <ul className="space-y-2 text-sm text-red-900">
                        {report.missingSections?.length ? report.missingSections.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        )) : <li>No missing sections detected.</li>}
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg border bg-amber-50">
                      <h4 className="font-semibold text-amber-900 mb-2">Inconsistencies</h4>
                      <ul className="space-y-2 text-sm text-amber-900">
                        {report.inconsistencies?.length ? report.inconsistencies.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{item}</span>
                          </li>
                        )) : <li>No inconsistencies detected.</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-white">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span>Risk Factors</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {report.riskFactors?.length ? report.riskFactors.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      )) : <li>No risk factors detected.</li>}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2">Recommendations</h4>
                    <ul className="space-y-2 text-sm text-green-900">
                      {report.recommendations?.length ? report.recommendations.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      )) : <li>No recommendations provided.</li>}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <StickyNote className="w-4 h-4 text-indigo-500" />
                      <span>Field-by-Field Checks</span>
                    </h4>
                    <div className="space-y-2">
                      {report.formChecks?.map((check: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900">{check.field}</p>
                            <span className={`text-sm font-semibold ${
                              check.status === 'complete'
                                ? 'text-green-600'
                                : check.status === 'missing'
                                  ? 'text-red-600'
                                  : check.status === 'inconsistent'
                                    ? 'text-amber-600'
                                    : 'text-blue-600'
                            }`}>
                              {check.status?.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{check.details}</p>
                          <p className="text-sm text-gray-900 mt-2 font-medium">Suggested fix:</p>
                          <p className="text-sm text-gray-700">{check.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
                    <ul className="space-y-2 text-sm text-blue-900">
                      {report.nextSteps?.length ? report.nextSteps.map((item: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="mr-2">✓</span>
                          <span>{item}</span>
                        </li>
                      )) : <li>No next steps provided.</li>}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Checklist Yet</h4>
                  <p className="text-gray-600 text-sm">Fill in your form sections and run the pre-check.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

