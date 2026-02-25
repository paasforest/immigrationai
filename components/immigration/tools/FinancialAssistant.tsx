'use client';

import React, { useState } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, AlertTriangle, Copy, Download, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const currencies = ['NGN', 'GHS', 'KES', 'ZAR', 'USD', 'GBP', 'EUR', 'CAD'];
const incomeTypes = [
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'business', label: 'Business owner' },
  { value: 'family_sponsor', label: 'Family sponsored' },
  { value: 'mixed', label: 'Mixed' },
];

const destinationCountries = [
  'United Kingdom',
  'Canada',
  'United States',
  'Germany',
  'UAE',
  'Australia',
  'Netherlands',
  'Ireland',
];

const visaTypes = [
  { value: 'student', label: 'Student Visa' },
  { value: 'skilled_worker', label: 'Skilled Worker' },
  { value: 'family', label: 'Family Reunification' },
  { value: 'visitor', label: 'Visitor/Tourist' },
  { value: 'work_permit', label: 'Work Permit' },
];

export default function FinancialAssistant() {
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [sponsorLetter, setSponsorLetter] = useState<string>('');

  const [formData, setFormData] = useState({
    // Step 1
    monthlyIncome: '',
    currency: 'NGN',
    incomeType: 'employed',
    bankStatementMonths: '6',
    employmentDetails: '',

    // Step 2
    destinationCountry: '',
    visaType: '',
    durationOfStay: '',
    sponsorRelationship: '',
    sponsorCountry: '',
  });

  const handleAnalyze = async () => {
    if (!formData.monthlyIncome || !formData.destinationCountry || !formData.visaType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsAnalyzing(true);
      const response = await immigrationApi.analyzeFinancialDocs({
        monthlyIncome: parseFloat(formData.monthlyIncome),
        incomeType: formData.incomeType,
        bankStatementMonths: parseInt(formData.bankStatementMonths),
        destinationCountry: formData.destinationCountry,
        visaType: formData.visaType,
        currency: formData.currency,
        sponsorRelationship: formData.sponsorRelationship || undefined,
      });

      if (response.success && response.data) {
        setAnalysisResult(response.data);
        setStep(3);
      } else {
        toast.error(response.error || 'Failed to analyze financial profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze financial profile');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateSponsorLetter = async () => {
    if (!formData.sponsorRelationship) {
      toast.error('Please provide sponsor relationship');
      return;
    }

    try {
      setIsAnalyzing(true);
      const response = await immigrationApi.generateSponsorLetter({
        sponsorName: 'Sponsor Name', // Would come from form
        sponsorRelationship: formData.sponsorRelationship,
        sponsorOccupation: 'Occupation', // Would come from form
        sponsorCountry: formData.sponsorCountry || formData.currency,
        applicantName: 'Applicant Name', // Would come from form
        visaType: formData.visaType,
        destinationCountry: formData.destinationCountry,
        travelPurpose: 'Travel purpose', // Would come from form
        travelDuration: formData.durationOfStay,
      });

      if (response.success && response.data) {
        setSponsorLetter(response.data.letter);
        setStep(4);
      } else {
        toast.error(response.error || 'Failed to generate sponsor letter');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate sponsor letter');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Step 1 - Income Profile */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Income Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Monthly Income *</Label>
                <Input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  placeholder="Enter monthly income"
                />
              </div>
              <div>
                <Label>Currency *</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Income Type *</Label>
              <Select
                value={formData.incomeType}
                onValueChange={(value) => setFormData({ ...formData, incomeType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {incomeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Bank Statement Availability *</Label>
              <Select
                value={formData.bankStatementMonths}
                onValueChange={(value) => setFormData({ ...formData, bankStatementMonths: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 month</SelectItem>
                  <SelectItem value="3">3 months</SelectItem>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Employment Status Details (Optional)</Label>
              <Textarea
                value={formData.employmentDetails}
                onChange={(e) => setFormData({ ...formData, employmentDetails: e.target.value })}
                placeholder="Additional details about your employment..."
                rows={3}
              />
            </div>

            <Button onClick={() => setStep(2)} className="w-full">
              Next: Application Details
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2 - Application Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Application Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Destination Country *</Label>
                <Select
                  value={formData.destinationCountry}
                  onValueChange={(value) => setFormData({ ...formData, destinationCountry: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinationCountries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visa Type *</Label>
                <Select
                  value={formData.visaType}
                  onValueChange={(value) => setFormData({ ...formData, visaType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    {visaTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Duration of Stay</Label>
              <Input
                value={formData.durationOfStay}
                onChange={(e) => setFormData({ ...formData, durationOfStay: e.target.value })}
                placeholder="e.g. 2 years, 6 months"
              />
            </div>

            {formData.incomeType === 'family_sponsor' && (
              <>
                <div>
                  <Label>Sponsor Relationship</Label>
                  <Input
                    value={formData.sponsorRelationship}
                    onChange={(e) => setFormData({ ...formData, sponsorRelationship: e.target.value })}
                    placeholder="e.g. Parent, Sibling, Spouse"
                  />
                </div>
                <div>
                  <Label>Sponsor Country</Label>
                  <Input
                    value={formData.sponsorCountry}
                    onChange={(e) => setFormData({ ...formData, sponsorCountry: e.target.value })}
                    placeholder="Sponsor's country"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze My Financial Profile'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 - AI Analysis Results */}
      {step === 3 && analysisResult && (
        <div className="space-y-6">
          {/* Eligibility Indicator */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {analysisResult.meetsRequirements ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                    <div>
                      <h3 className="text-xl font-bold text-green-600">Meets Requirements</h3>
                      <p className="text-gray-600">Your financial profile appears sufficient</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-12 h-12 text-red-600" />
                    <div>
                      <h3 className="text-xl font-bold text-red-600">May Not Meet Requirements</h3>
                      <p className="text-gray-600">Your financial profile may need strengthening</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Minimum Required</p>
                  <p className="text-2xl font-bold">${analysisResult.minimumRequired?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your Estimated Amount</p>
                  <p className="text-2xl font-bold">${analysisResult.currentAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gap</p>
                  <p className={`text-2xl font-bold ${(analysisResult.currentAmount || 0) < (analysisResult.minimumRequired || 0) ? 'text-red-600' : 'text-green-600'}`}>
                    ${((analysisResult.minimumRequired || 0) - (analysisResult.currentAmount || 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  {analysisResult.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm">{rec}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Warning Flags */}
          {analysisResult.warningFlags && analysisResult.warningFlags.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Warning Flags</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {analysisResult.warningFlags.map((flag: string, idx: number) => (
                    <li key={idx} className="text-sm text-red-800">{flag}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Cover Letter Template */}
          {analysisResult.coverLetterTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-sm font-sans">
                    {analysisResult.coverLetterTemplate}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleCopy(analysisResult.coverLetterTemplate)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(analysisResult.coverLetterTemplate, 'cover-letter.txt')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download as .txt
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generate Sponsor Letter */}
          {formData.incomeType === 'family_sponsor' && (
            <Card>
              <CardContent className="p-6">
                <Button onClick={handleGenerateSponsorLetter} disabled={isAnalyzing} className="w-full">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Sponsor Letter'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 4 - Sponsor Letter */}
      {step === 4 && sponsorLetter && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Sponsor Letter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <pre className="whitespace-pre-wrap text-sm font-sans">{sponsorLetter}</pre>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleCopy(sponsorLetter)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload(sponsorLetter, 'sponsor-letter.txt')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download as .txt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
