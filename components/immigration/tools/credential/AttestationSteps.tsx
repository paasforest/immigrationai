'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
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

const destinationFlags: Record<string, string> = {
  UK: '🇬🇧',
  Canada: '🇨🇦',
  USA: '🇺🇸',
  Germany: '🇩🇪',
  UAE: '🇦🇪',
};

export default function AttestationSteps() {
  const [originCountry, setOriginCountry] = useState<string>('');
  const [destinationCountry, setDestinationCountry] = useState<string>('');
  const [attestationData, setAttestationData] = useState<any>(null);
  const [evaluationBodies, setEvaluationBodies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (originCountry && destinationCountry) {
      fetchAttestationSteps();
      fetchEvaluationBodies();
    } else {
      setAttestationData(null);
      setEvaluationBodies([]);
    }
  }, [originCountry, destinationCountry]);

  const fetchAttestationSteps = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getAttestationSteps(originCountry, destinationCountry);
      if (response.success && response.data) {
        setAttestationData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching attestation steps:', error);
      toast.error('Failed to fetch attestation steps');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEvaluationBodies = async () => {
    try {
      const response = await immigrationApi.getEvaluationBodies(destinationCountry);
      if (response.success && response.data) {
        setEvaluationBodies(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching evaluation bodies:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Origin Country</label>
          <Select value={originCountry} onValueChange={setOriginCountry}>
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
          <label className="text-sm font-medium mb-2 block">Destination Country</label>
          <Select value={destinationCountry} onValueChange={setDestinationCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select destination country" />
            </SelectTrigger>
            <SelectContent>
              {destinationCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  {destinationFlags[country]} {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading attestation steps...</p>
        </div>
      )}

      {!isLoading && attestationData && (
        <div className="space-y-6">
          {/* Apostille Badge */}
          <div className="flex items-center gap-2">
            {attestationData.apostilleAvailable ? (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Apostille Available
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Embassy Legalization Required
              </Badge>
            )}
          </div>

          {/* Steps Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Attestation Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attestationData.steps.map((step: string, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0F2557] text-white flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-900">{step}</p>
                    </div>
                  </div>
                ))}
                {destinationCountry && (
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0F2557] text-white flex items-center justify-center font-semibold">
                      {attestationData.steps.length + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-gray-900 flex items-center gap-2">
                        <span className="text-xl">{destinationFlags[destinationCountry]}</span>
                        Submit to {destinationCountry}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {(attestationData.notes || attestationData.destinationNote) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                {attestationData.notes || attestationData.destinationNote}
              </p>
            </div>
          )}

          {/* Evaluation Bodies */}
          {evaluationBodies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Bodies for {destinationCountry}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {evaluationBodies.map((body, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {body.name}
                          {index === 0 && (
                            <Badge className="bg-[#0F2557] text-white text-xs">
                              Most Recommended
                            </Badge>
                          )}
                        </h4>
                        {body.description && (
                          <p className="text-sm text-gray-600 mt-1">{body.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {body.cost && <span>Cost: {body.cost}</span>}
                      {body.processingTime && <span>Time: {body.processingTime}</span>}
                    </div>
                    {body.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(body.url, '_blank')}
                      >
                        Visit Website
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!isLoading && !attestationData && originCountry && destinationCountry && (
        <div className="text-center py-8 text-gray-600">
          No attestation information available for this combination
        </div>
      )}
    </div>
  );
}
