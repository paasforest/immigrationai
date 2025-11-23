'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Home, Loader, Copy, Download } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';
import PDFDownload from '@/components/PDFDownload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function TiesToHomeCountryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState('');
  
  const [formData, setFormData] = useState({
    applicantName: '',
    targetCountry: '',
    visaType: 'visitor',
    homeCountry: '',
    // Financial Ties
    bankAccounts: '',
    investments: '',
    propertyOwnership: '',
    incomeSources: '',
    // Employment Ties
    employmentStatus: '',
    jobDetails: '',
    businessOwnership: '',
    businessDetails: '',
    // Family Ties
    spouseInHomeCountry: '',
    childrenInHomeCountry: '',
    dependentsInHomeCountry: '',
    parentsInHomeCountry: '',
    familyDetails: '',
    // Property Ties
    landOwnership: '',
    houseOwnership: '',
    vehicleOwnership: '',
    propertyDetails: '',
    // Social Ties
    communityInvolvement: '',
    memberships: '',
    socialConnections: '',
    // Educational Ties
    ongoingStudies: '',
    enrolledCourses: '',
    educationalCommitments: '',
    // Additional
    previousTravelHistory: '',
    returnTicket: '',
    accommodationProof: '',
    otherTies: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.applicantName || !formData.targetCountry || !formData.homeCountry) {
      alert('Please fill required fields: Name, Target Country, and Home Country');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-ties-to-home-country`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedDocument(data.data.document);
      } else {
        alert(data.message || 'Failed to generate document');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Failed to generate document. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDocument);
    alert('Document copied!');
  };

  const downloadDocument = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedDocument], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `ties_to_home_country_${Date.now()}.txt`;
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
            <Home className="w-8 h-8 text-blue-600" />
            <span>Ties to Home Country Demonstrator</span>
          </h1>
          <p className="text-gray-600">Demonstrate your strong connections to your home country for visa applications</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="applicantName"
                    value={formData.applicantName}
                    onChange={handleInputChange}
                    placeholder="Your Full Name *"
                  />
                  <Input
                    name="homeCountry"
                    value={formData.homeCountry}
                    onChange={handleInputChange}
                    placeholder="Home Country *"
                  />
                </div>
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
                    <option value="visitor">Visitor Visa</option>
                    <option value="tourist">Tourist Visa</option>
                    <option value="business">Business Visa</option>
                    <option value="family">Family Visit</option>
                    <option value="medical">Medical Visa</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Financial Ties */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Ties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  name="bankAccounts"
                  value={formData.bankAccounts}
                  onChange={handleInputChange}
                  placeholder="Bank accounts in home country (e.g., Savings account with $X, Checking account)"
                  rows={2}
                />
                <Textarea
                  name="investments"
                  value={formData.investments}
                  onChange={handleInputChange}
                  placeholder="Investments (e.g., Stocks, bonds, mutual funds)"
                  rows={2}
                />
                <Textarea
                  name="propertyOwnership"
                  value={formData.propertyOwnership}
                  onChange={handleInputChange}
                  placeholder="Property ownership (e.g., Real estate, commercial property)"
                  rows={2}
                />
                <Textarea
                  name="incomeSources"
                  value={formData.incomeSources}
                  onChange={handleInputChange}
                  placeholder="Income sources (e.g., Salary, rental income, dividends)"
                  rows={2}
                />
              </CardContent>
            </Card>

            {/* Employment Ties */}
            <Card>
              <CardHeader>
                <CardTitle>Employment Ties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleInputChange}
                  placeholder="Employment Status (e.g., Full-time, Part-time, Self-employed)"
                />
                <Textarea
                  name="jobDetails"
                  value={formData.jobDetails}
                  onChange={handleInputChange}
                  placeholder="Job details (Company, position, duration, salary)"
                  rows={3}
                />
                <Input
                  name="businessOwnership"
                  value={formData.businessOwnership}
                  onChange={handleInputChange}
                  placeholder="Business ownership (Yes/No, type of business)"
                />
                <Textarea
                  name="businessDetails"
                  value={formData.businessDetails}
                  onChange={handleInputChange}
                  placeholder="Business details (Name, registration, employees, revenue)"
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Family Ties */}
            <Card>
              <CardHeader>
                <CardTitle>Family Ties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  name="spouseInHomeCountry"
                  value={formData.spouseInHomeCountry}
                  onChange={handleInputChange}
                  placeholder="Spouse in home country (Name, occupation)"
                />
                <Input
                  name="childrenInHomeCountry"
                  value={formData.childrenInHomeCountry}
                  onChange={handleInputChange}
                  placeholder="Children in home country (Names, ages)"
                />
                <Input
                  name="dependentsInHomeCountry"
                  value={formData.dependentsInHomeCountry}
                  onChange={handleInputChange}
                  placeholder="Dependents in home country"
                />
                <Input
                  name="parentsInHomeCountry"
                  value={formData.parentsInHomeCountry}
                  onChange={handleInputChange}
                  placeholder="Parents in home country (Names, relationship)"
                />
                <Textarea
                  name="familyDetails"
                  value={formData.familyDetails}
                  onChange={handleInputChange}
                  placeholder="Additional family details"
                  rows={2}
                />
              </CardContent>
            </Card>

            {/* Property Ties */}
            <Card>
              <CardHeader>
                <CardTitle>Property Ties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  name="landOwnership"
                  value={formData.landOwnership}
                  onChange={handleInputChange}
                  placeholder="Land ownership (Location, size, value)"
                />
                <Input
                  name="houseOwnership"
                  value={formData.houseOwnership}
                  onChange={handleInputChange}
                  placeholder="House ownership (Address, value, mortgage status)"
                />
                <Input
                  name="vehicleOwnership"
                  value={formData.vehicleOwnership}
                  onChange={handleInputChange}
                  placeholder="Vehicle ownership (Type, registration)"
                />
                <Textarea
                  name="propertyDetails"
                  value={formData.propertyDetails}
                  onChange={handleInputChange}
                  placeholder="Additional property details"
                  rows={2}
                />
              </CardContent>
            </Card>

            {/* Social Ties */}
            <Card>
              <CardHeader>
                <CardTitle>Social Ties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  name="communityInvolvement"
                  value={formData.communityInvolvement}
                  onChange={handleInputChange}
                  placeholder="Community involvement (Volunteer work, community organizations)"
                  rows={2}
                />
                <Textarea
                  name="memberships"
                  value={formData.memberships}
                  onChange={handleInputChange}
                  placeholder="Memberships (Clubs, associations, professional organizations)"
                  rows={2}
                />
                <Textarea
                  name="socialConnections"
                  value={formData.socialConnections}
                  onChange={handleInputChange}
                  placeholder="Social connections (Friends, extended family, social networks)"
                  rows={2}
                />
              </CardContent>
            </Card>

            {/* Educational Ties */}
            <Card>
              <CardHeader>
                <CardTitle>Educational Ties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  name="ongoingStudies"
                  value={formData.ongoingStudies}
                  onChange={handleInputChange}
                  placeholder="Ongoing studies (Program, institution, completion date)"
                />
                <Input
                  name="enrolledCourses"
                  value={formData.enrolledCourses}
                  onChange={handleInputChange}
                  placeholder="Enrolled courses (Course names, duration)"
                />
                <Textarea
                  name="educationalCommitments"
                  value={formData.educationalCommitments}
                  onChange={handleInputChange}
                  placeholder="Educational commitments (Scholarships, research projects, academic obligations)"
                  rows={2}
                />
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  name="previousTravelHistory"
                  value={formData.previousTravelHistory}
                  onChange={handleInputChange}
                  placeholder="Previous travel history (Countries visited, return history)"
                  rows={2}
                />
                <Input
                  name="returnTicket"
                  value={formData.returnTicket}
                  onChange={handleInputChange}
                  placeholder="Return ticket (Booked/Planned, date)"
                />
                <Input
                  name="accommodationProof"
                  value={formData.accommodationProof}
                  onChange={handleInputChange}
                  placeholder="Accommodation proof (Hotel booking, host details)"
                />
                <Textarea
                  name="otherTies"
                  value={formData.otherTies}
                  onChange={handleInputChange}
                  placeholder="Other ties to home country"
                  rows={2}
                />
              </CardContent>
            </Card>

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Generating Document...
                </>
              ) : (
                <>
                  <Home className="w-5 h-5 mr-2" />
                  Generate Ties to Home Country Document
                </>
              )}
            </Button>
          </div>

          <Card className="lg:sticky lg:top-8 h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Document</CardTitle>
                {generatedDocument && (
                  <div className="flex space-x-2">
                    <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg" title="Copy">
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={downloadDocument} className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedDocument ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto border border-gray-200">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
                      {generatedDocument}
                    </pre>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <PDFDownload
                      content={generatedDocument}
                      filename={`Ties_to_Home_Country_${formData.targetCountry || 'general'}_${formData.visaType || 'visa'}_${new Date().toISOString().split('T')[0]}.pdf`}
                      title="Ties to Home Country Document"
                      className="flex-1"
                    />
                    <Button
                      onClick={downloadDocument}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download TXT
                    </Button>
                  </div>
                  
                  <FeedbackWidget
                    documentId={`ties_to_home_country_${Date.now()}`}
                    documentType="ties_to_home_country"
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                  
                  <SuccessTracker
                    documentId={`ties_to_home_country_${Date.now()}`}
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Document Generated Yet</h4>
                  <p className="text-gray-600 text-sm">Fill in your ties to home country and generate the document</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

