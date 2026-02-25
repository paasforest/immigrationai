'use client';

import { useState } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Copy, Printer, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const africanCountries = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Ethiopia',
  'Uganda',
  'Tanzania',
  'Zimbabwe',
];

const destinationCountries = ['UK', 'Canada', 'USA', 'Germany', 'UAE'];

const qualificationLevels = [
  'Certificate',
  'Diploma',
  "Bachelor's Degree",
  "Master's Degree",
  'PhD',
  'Professional Qualification',
];

export default function AICredentialGuide() {
  const [formData, setFormData] = useState({
    originCountry: '',
    destinationCountry: '',
    qualificationLevel: '',
    fieldOfStudy: '',
    universityName: '',
  });
  const [guide, setGuide] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    if (
      !formData.originCountry ||
      !formData.destinationCountry ||
      !formData.qualificationLevel ||
      !formData.fieldOfStudy ||
      !formData.universityName
    ) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await immigrationApi.generateCredentialGuide(formData);
      if (response.success && response.data) {
        setGuide(response.data.guide);
      } else {
        setError('Unable to generate guide. Please try again.');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      setError('Unable to generate guide. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(guide);
    toast.success('Guide copied to clipboard');
  };

  const handlePrint = () => {
    window.print();
  };

  const formatGuide = (text: string) => {
    // Split by numbered sections
    const sections = text.split(/(?=\d+\.\s)/);
    return sections.filter((s) => s.trim());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Your Credential Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Origin Country</Label>
              <Select
                value={formData.originCountry}
                onValueChange={(value) =>
                  setFormData({ ...formData, originCountry: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select origin country" />
                </SelectTrigger>
                <SelectContent>
                  {africanCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Destination Country</Label>
              <Select
                value={formData.destinationCountry}
                onValueChange={(value) =>
                  setFormData({ ...formData, destinationCountry: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination country" />
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
          </div>

          <div>
            <Label>Qualification Level</Label>
            <Select
              value={formData.qualificationLevel}
              onValueChange={(value) =>
                setFormData({ ...formData, qualificationLevel: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select qualification level" />
              </SelectTrigger>
              <SelectContent>
                {qualificationLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Field of Study</Label>
            <Input
              placeholder="e.g., Computer Science, Business Administration"
              value={formData.fieldOfStudy}
              onChange={(e) =>
                setFormData({ ...formData, fieldOfStudy: e.target.value })
              }
            />
          </div>

          <div>
            <Label>University Name</Label>
            <Input
              placeholder="e.g., University of Lagos"
              value={formData.universityName}
              onChange={(e) =>
                setFormData({ ...formData, universityName: e.target.value })
              }
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-[#0F2557] hover:bg-[#0F2557]/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                ✨ Generate My Guide
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#0F2557] mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900">
              Generating your personalised guide...
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This usually takes 10-15 seconds
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {guide && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Your Credential Evaluation Roadmap</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {formData.qualificationLevel} in {formData.fieldOfStudy} from {formData.universityName} → {formData.destinationCountry}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              {formatGuide(guide).map((section, index) => {
                const match = section.match(/^(\d+)\.\s(.+)/);
                if (match) {
                  const [, number, content] = match;
                  return (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-[#0F2557] text-white flex-shrink-0">
                          {number}
                        </Badge>
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap text-gray-900">{content.trim()}</p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <p key={index} className="whitespace-pre-wrap text-gray-900 mb-4">
                    {section.trim()}
                  </p>
                );
              })}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerate}
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
