'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Loader, Download, Copy, FileText, AlertCircle, Clock, DollarSign, Calendar } from 'lucide-react';
import PDFDownload from '@/components/PDFDownload';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ChecklistPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [checklist, setChecklist] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    targetCountry: 'canada',
    visaType: 'study_permit',
  });

  // Country-specific visa types (same as visa-checker)
  const getVisaTypes = (country: string) => {
    const visaTypes: { [key: string]: { value: string; label: string }[] } = {
      'canada': [
        { value: 'study_permit', label: 'Study Permit' },
        { value: 'work_permit', label: 'Work Permit' },
        { value: 'express_entry', label: 'Express Entry (PR)' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'family_sponsorship', label: 'Family Sponsorship' },
        { value: 'startup_visa', label: 'Startup Visa' },
        { value: 'investor_visa', label: 'Investor Visa' }
      ],
      'usa': [
        { value: 'f1_student', label: 'F-1 Student Visa' },
        { value: 'h1b_work', label: 'H-1B Work Visa' },
        { value: 'l1_transfer', label: 'L-1 Intracompany Transfer' },
        { value: 'o1_extraordinary', label: 'O-1 Extraordinary Ability' },
        { value: 'eb1_priority', label: 'EB-1 Priority Worker' },
        { value: 'eb2_advanced', label: 'EB-2 Advanced Degree' },
        { value: 'eb3_skilled', label: 'EB-3 Skilled Worker' },
        { value: 'b1_b2_visitor', label: 'B-1/B-2 Visitor Visa' },
        { value: 'k1_fiance', label: 'K-1 Fiancé Visa' },
        { value: 'cr1_spouse', label: 'CR-1 Spouse Visa' }
      ],
      'uk': [
        { value: 'student_visa', label: 'Student Visa (Tier 4)' },
        { value: 'skilled_worker', label: 'Skilled Worker Visa' },
        { value: 'global_talent', label: 'Global Talent Visa' },
        { value: 'startup_visa', label: 'Startup Visa' },
        { value: 'innovator_visa', label: 'Innovator Visa' },
        { value: 'family_visa', label: 'Family Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'ancestry_visa', label: 'Ancestry Visa' }
      ],
      'australia': [
        { value: 'student_visa_500', label: 'Student Visa (500)' },
        { value: 'skilled_migration_189', label: 'Skilled Migration (189)' },
        { value: 'skilled_migration_190', label: 'Skilled Migration (190)' },
        { value: 'temporary_work_482', label: 'Temporary Work (482)' },
        { value: 'partner_visa', label: 'Partner Visa' },
        { value: 'parent_visa', label: 'Parent Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'working_holiday', label: 'Working Holiday Visa' }
      ],
      'germany': [
        { value: 'student_visa', label: 'Student Visa' },
        { value: 'work_visa', label: 'Work Visa' },
        { value: 'blue_card', label: 'EU Blue Card' },
        { value: 'family_reunion', label: 'Family Reunion' },
        { value: 'freelancer_visa', label: 'Freelancer Visa' },
        { value: 'job_seeker', label: 'Job Seeker Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' }
      ],
      'ireland': [
        { value: 'stamp_2', label: 'Stamp 2 (Student Visa)' },
        { value: 'stamp_1', label: 'Stamp 1 (Work Permit)' },
        { value: 'stamp_1g', label: 'Stamp 1G (Critical Skills/Graduate)' },
        { value: 'stamp_4', label: 'Stamp 4 (Family Reunion/Spouse)' },
        { value: 'stamp_3', label: 'Stamp 3 (Family Member of Worker)' },
        { value: 'stamp_0', label: 'Stamp 0 (Visitor/Retiree)' },
        { value: 'stamp_5', label: 'Stamp 5 (Long-term Residency)' }
      ],
      'schengen': [
        { value: 'type_a_transit', label: 'Type A (Airport Transit)' },
        { value: 'type_c_tourism', label: 'Type C (Tourism/Business)' },
        { value: 'type_c_family', label: 'Type C (Family Visit)' },
        { value: 'type_d_work', label: 'Type D (Work Permit)' },
        { value: 'type_d_student', label: 'Type D (Student Visa)' },
        { value: 'type_d_family', label: 'Type D (Family Reunion)' },
        { value: 'ltv_visa', label: 'LTV (Limited Territorial)' }
      ],
      'new_zealand': [
        { value: 'skilled_migrant', label: 'Skilled Migrant (Residence)' },
        { value: 'student_visa', label: 'Student Visa' },
        { value: 'working_holiday', label: 'Working Holiday Visa' },
        { value: 'partner_visa', label: 'Partner Visa' },
        { value: 'parent_visa', label: 'Parent Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'work_visa', label: 'Work Visa' },
        { value: 'investor_visa', label: 'Investor Visa' }
      ],
      'singapore': [
        { value: 'employment_pass', label: 'Employment Pass' },
        { value: 's_pass', label: 'S Pass' },
        { value: 'singapore_work_permit', label: 'Work Permit' },
        { value: 'student_pass', label: 'Student Pass' },
        { value: 'family_visa', label: 'Family Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'pr_application', label: 'Permanent Residence' },
        { value: 'entrepreneur_pass', label: 'Entrepreneur Pass' }
      ],
      'uae': [
        { value: 'employment_visa', label: 'Employment Visa' },
        { value: 'investor_visa', label: 'Investor Visa' },
        { value: 'student_visa', label: 'Student Visa' },
        { value: 'family_visa', label: 'Family Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'freelancer_visa', label: 'Freelancer Visa' },
        { value: 'golden_visa', label: 'Golden Visa (Long-term)' },
        { value: 'transit_visa', label: 'Transit Visa' }
      ],
      'netherlands': [
        { value: 'highly_skilled_migrant', label: 'Highly Skilled Migrant' },
        { value: 'student_visa', label: 'Student Visa' },
        { value: 'family_reunion', label: 'Family Reunion' },
        { value: 'startup_visa', label: 'Startup Visa' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'work_visa', label: 'Work Visa' },
        { value: 'eu_blue_card', label: 'EU Blue Card' },
        { value: 'orientation_year', label: 'Orientation Year' }
      ],
      'japan': [
        { value: 'japan_work_visa', label: 'Work Visa' },
        { value: 'student_visa', label: 'Student Visa' },
        { value: 'spouse_visa', label: 'Spouse Visa' },
        { value: 'highly_skilled_professional', label: 'Highly Skilled Professional' },
        { value: 'visitor_visa', label: 'Visitor Visa' },
        { value: 'family_visa', label: 'Family Visa' },
        { value: 'investor_visa', label: 'Investor Visa' },
        { value: 'japan_working_holiday', label: 'Working Holiday' }
      ],
      'south_korea': [
        { value: 'e2_work', label: 'E-2 (Work Visa)' },
        { value: 'd2_student', label: 'D-2 (Student Visa)' },
        { value: 'f6_spouse', label: 'F-6 (Spouse Visa)' },
        { value: 'f4_overseas_korean', label: 'F-4 (Overseas Korean)' },
        { value: 'c3_visitor', label: 'C-3 (Visitor Visa)' },
        { value: 'e7_specialty', label: 'E-7 (Specialty Occupation)' },
        { value: 'f2_resident', label: 'F-2 (Resident Visa)' },
        { value: 'd8_investor', label: 'D-8 (Investor Visa)' }
      ]
    };
    return visaTypes[country] || visaTypes['canada'];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'targetCountry') {
      const newVisaTypes = getVisaTypes(value);
      setFormData({ 
        ...formData, 
        [name]: value,
        visaType: newVisaTypes[0]?.value || 'study_permit'
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleGenerate = async () => {
    if (!formData.targetCountry || !formData.visaType) {
      alert('Please select both country and visa type');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/checklists?country=${encodeURIComponent(formData.targetCountry)}&visa_type=${encodeURIComponent(formData.visaType)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setChecklist(data.data.checklist);
      } else {
        alert(data.message || 'Failed to generate checklist');
      }
    } catch (error) {
      console.error('Error generating checklist:', error);
      alert('Failed to generate checklist. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!checklist) return;
    
    const text = formatChecklistForText(checklist);
    navigator.clipboard.writeText(text);
    alert('Checklist copied to clipboard!');
  };

  const formatChecklistForText = (checklist: any): string => {
    let text = `VISA DOCUMENT CHECKLIST\n`;
    text += `Country: ${checklist.country || formData.targetCountry}\n`;
    text += `Visa Type: ${checklist.visaType || formData.visaType}\n\n`;
    
    if (checklist.requirements?.mandatory) {
      text += `MANDATORY DOCUMENTS:\n`;
      checklist.requirements.mandatory.forEach((doc: any, index: number) => {
        text += `${index + 1}. ${doc.document}\n`;
        if (doc.description) text += `   ${doc.description}\n`;
        if (doc.specifications) text += `   Requirements: ${doc.specifications}\n`;
        text += `\n`;
      });
    }
    
    if (checklist.requirements?.optional) {
      text += `\nOPTIONAL DOCUMENTS:\n`;
      checklist.requirements.optional.forEach((doc: any, index: number) => {
        text += `${index + 1}. ${doc.document}\n`;
        if (doc.description) text += `   ${doc.description}\n`;
        if (doc.specifications) text += `   Requirements: ${doc.specifications}\n`;
        text += `\n`;
      });
    }
    
    if (checklist.processing_time) {
      text += `\nPROCESSING TIME: ${checklist.processing_time}\n`;
    }
    
    if (checklist.fees) {
      text += `FEES: ${checklist.fees}\n`;
    }
    
    if (checklist.validity) {
      text += `VALIDITY: ${checklist.validity}\n`;
    }
    
    if (checklist.requirements?.additional_notes) {
      text += `\nADDITIONAL NOTES:\n`;
      checklist.requirements.additional_notes.forEach((note: string) => {
        text += `• ${note}\n`;
      });
    }
    
    return text;
  };

  const formatChecklistForPDF = (checklist: any): string => {
    let html = `<h1>Visa Document Checklist</h1>`;
    html += `<p><strong>Country:</strong> ${checklist.country || formData.targetCountry}</p>`;
    html += `<p><strong>Visa Type:</strong> ${checklist.visaType || formData.visaType}</p>`;
    
    if (checklist.requirements?.mandatory) {
      html += `<h2>Mandatory Documents</h2><ul>`;
      checklist.requirements.mandatory.forEach((doc: any) => {
        html += `<li><strong>${doc.document}</strong>`;
        if (doc.description) html += `<br>${doc.description}`;
        if (doc.specifications) html += `<br><em>Requirements: ${doc.specifications}</em>`;
        html += `</li>`;
      });
      html += `</ul>`;
    }
    
    if (checklist.requirements?.optional) {
      html += `<h2>Optional Documents</h2><ul>`;
      checklist.requirements.optional.forEach((doc: any) => {
        html += `<li><strong>${doc.document}</strong>`;
        if (doc.description) html += `<br>${doc.description}`;
        if (doc.specifications) html += `<br><em>Requirements: ${doc.specifications}</em>`;
        html += `</li>`;
      });
      html += `</ul>`;
    }
    
    if (checklist.processing_time) {
      html += `<p><strong>Processing Time:</strong> ${checklist.processing_time}</p>`;
    }
    
    if (checklist.fees) {
      html += `<p><strong>Fees:</strong> ${checklist.fees}</p>`;
    }
    
    if (checklist.validity) {
      html += `<p><strong>Validity:</strong> ${checklist.validity}</p>`;
    }
    
    if (checklist.requirements?.additional_notes) {
      html += `<h2>Additional Notes</h2><ul>`;
      checklist.requirements.additional_notes.forEach((note: string) => {
        html += `<li>${note}</li>`;
      });
      html += `</ul>`;
    }
    
    return html;
  };

  const downloadChecklist = () => {
    if (!checklist) return;
    
    const text = formatChecklistForText(checklist);
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `visa_checklist_${formData.targetCountry}_${formData.visaType}_${new Date().toISOString().split('T')[0]}.txt`;
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
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <span>Document Checklist Generator</span>
          </h1>
          <p className="text-gray-600">Get a comprehensive list of required documents for your visa application</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Select Visa Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Country *</label>
                <select
                  name="targetCountry"
                  value={formData.targetCountry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="canada">Canada</option>
                  <option value="usa">USA</option>
                  <option value="uk">UK</option>
                  <option value="australia">Australia</option>
                  <option value="germany">Germany</option>
                  <option value="ireland">Ireland</option>
                  <option value="schengen">Schengen</option>
                  <option value="new_zealand">New Zealand</option>
                  <option value="singapore">Singapore</option>
                  <option value="uae">UAE</option>
                  <option value="netherlands">Netherlands</option>
                  <option value="japan">Japan</option>
                  <option value="south_korea">South Korea</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visa Type *</label>
                <select
                  name="visaType"
                  value={formData.visaType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {getVisaTypes(formData.targetCountry).map((visa) => (
                    <option key={visa.value} value={visa.value}>
                      {visa.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generating Checklist...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Generate Checklist
                  </>
                )}
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> This checklist is AI-generated and includes all mandatory documents, optional supporting documents, processing times, fees, and country-specific requirements.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Generated Checklist */}
          <Card className="lg:sticky lg:top-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Checklist</CardTitle>
                {checklist && (
                  <div className="flex space-x-2">
                    <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg" title="Copy">
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={downloadChecklist} className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {checklist ? (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {checklist.country || formData.targetCountry} - {checklist.visaType || formData.visaType}
                    </h3>
                    {checklist.processing_time && (
                      <div className="flex items-center space-x-2 text-sm text-gray-700 mb-1">
                        <Clock className="w-4 h-4" />
                        <span><strong>Processing Time:</strong> {checklist.processing_time}</span>
                      </div>
                    )}
                    {checklist.fees && (
                      <div className="flex items-center space-x-2 text-sm text-gray-700 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span><strong>Fees:</strong> {checklist.fees}</span>
                      </div>
                    )}
                    {checklist.validity && (
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span><strong>Validity:</strong> {checklist.validity}</span>
                      </div>
                    )}
                  </div>

                  {/* Mandatory Documents */}
                  {checklist.requirements?.mandatory && checklist.requirements.mandatory.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Mandatory Documents
                      </h3>
                      <div className="space-y-3">
                        {checklist.requirements.mandatory.map((doc: any, index: number) => (
                          <div key={index} className="bg-red-50 border-l-4 border-red-500 rounded p-3">
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{doc.document}</h4>
                                {doc.description && (
                                  <p className="text-sm text-gray-700 mt-1">{doc.description}</p>
                                )}
                                {doc.specifications && (
                                  <p className="text-xs text-gray-600 mt-1 italic">
                                    <strong>Requirements:</strong> {doc.specifications}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optional Documents */}
                  {checklist.requirements?.optional && checklist.requirements.optional.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-yellow-700 mb-3 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Optional Supporting Documents
                      </h3>
                      <div className="space-y-3">
                        {checklist.requirements.optional.map((doc: any, index: number) => (
                          <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 rounded p-3">
                            <div className="flex items-start space-x-2">
                              <FileText className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{doc.document}</h4>
                                {doc.description && (
                                  <p className="text-sm text-gray-700 mt-1">{doc.description}</p>
                                )}
                                {doc.specifications && (
                                  <p className="text-xs text-gray-600 mt-1 italic">
                                    <strong>Requirements:</strong> {doc.specifications}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {checklist.requirements?.additional_notes && checklist.requirements.additional_notes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-blue-700 mb-3">Additional Notes</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <ul className="space-y-2">
                          {checklist.requirements.additional_notes.map((note: string, index: number) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                              <span className="text-blue-600 mt-1">•</span>
                              <span>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Download Options */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <PDFDownload
                      content={formatChecklistForPDF(checklist)}
                      filename={`Visa_Checklist_${formData.targetCountry}_${formData.visaType}_${new Date().toISOString().split('T')[0]}.pdf`}
                      title="Visa Document Checklist"
                      className="flex-1"
                    />
                    <Button
                      onClick={downloadChecklist}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download TXT
                    </Button>
                  </div>
                  
                  {/* Feedback Widget */}
                  <FeedbackWidget
                    documentId={`checklist_${Date.now()}`}
                    documentType="checklist"
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                  
                  {/* Success Tracker */}
                  <SuccessTracker
                    documentId={`checklist_${Date.now()}`}
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Checklist Generated Yet</h4>
                  <p className="text-gray-600 text-sm mb-4">Select your country and visa type, then click "Generate Checklist"</p>
                  <div className="bg-yellow-50 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-yellow-900">
                      <strong>Important:</strong> This checklist includes all required documents, processing times, fees, and country-specific requirements to help you prepare a complete application.
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

