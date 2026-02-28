'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { immigrationApi } from '@/lib/api/immigration';
import {
  Award,
  Search,
  GraduationCap,
  Building2,
  FileText,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

const ORIGIN_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Zimbabwe',
  'Ethiopia', 'Egypt', 'Morocco', 'Cameroon', 'Tanzania',
  'Uganda', 'Zambia', 'Senegal', 'Côte d\'Ivoire', 'India',
];

const DESTINATION_COUNTRIES = [
  'UK', 'Canada', 'USA', 'Australia', 'Germany', 'France',
  'Netherlands', 'UAE', 'New Zealand', 'Ireland', 'Sweden',
];

const QUALIFICATION_LEVELS = [
  'Certificate', 'Diploma', 'Bachelor\'s Degree', 'Honours Degree',
  'Master\'s Degree', 'PhD / Doctorate', 'Professional Certificate',
  'Trade Certificate',
];

interface EvaluationBody {
  name: string;
  country: string;
  website: string;
  processTime: string;
  fee: string;
  accepts: string[];
  notes: string;
}

interface UniversityResult {
  university: string;
  country: string;
  recognized: boolean;
  notes?: string;
}

export default function CredentialsPage() {
  const [activeTab, setActiveTab] = useState<'evaluators' | 'universities' | 'guide'>('evaluators');

  // Evaluators state
  const [evalDestination, setEvalDestination] = useState('');
  const [evalBodies, setEvalBodies] = useState<EvaluationBody[]>([]);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalSearched, setEvalSearched] = useState(false);

  // University check state
  const [uniName, setUniName] = useState('');
  const [uniCountry, setUniCountry] = useState('');
  const [uniResults, setUniResults] = useState<UniversityResult[]>([]);
  const [uniLoading, setUniLoading] = useState(false);
  const [uniSearched, setUniSearched] = useState(false);

  // Guide state
  const [guideOrigin, setGuideOrigin] = useState('');
  const [guideDestination, setGuideDestination] = useState('');
  const [guideQualLevel, setGuideQualLevel] = useState('');
  const [guideField, setGuideField] = useState('');
  const [guideUniversity, setGuideUniversity] = useState('');
  const [guide, setGuide] = useState('');
  const [guideLoading, setGuideLoading] = useState(false);

  const handleEvalSearch = async () => {
    if (!evalDestination) return;
    setEvalLoading(true);
    setEvalSearched(true);
    try {
      const res = await immigrationApi.getEvaluationBodies(evalDestination);
      if (res.success) setEvalBodies(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setEvalLoading(false);
    }
  };

  const handleUniSearch = async () => {
    if (!uniName) return;
    setUniLoading(true);
    setUniSearched(true);
    try {
      const res = await immigrationApi.checkUniversityRecognition(uniName, uniCountry || undefined);
      if (res.success) setUniResults(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setUniLoading(false);
    }
  };

  const handleGenerateGuide = async () => {
    if (!guideOrigin || !guideDestination || !guideQualLevel || !guideField || !guideUniversity) return;
    setGuideLoading(true);
    try {
      const res = await immigrationApi.generateCredentialGuide({
        originCountry: guideOrigin,
        destinationCountry: guideDestination,
        qualificationLevel: guideQualLevel,
        fieldOfStudy: guideField,
        universityName: guideUniversity,
      });
      if (res.success) setGuide(res.data?.guide || '');
    } catch (e) {
      console.error(e);
    } finally {
      setGuideLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Credential Evaluation</h1>
        <p className="text-gray-600 mt-1">
          Find evaluation bodies, check university recognition, and generate personalised credential guides for your clients.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          {[
            { id: 'evaluators', label: 'Evaluation Bodies', icon: Building2 },
            { id: 'universities', label: 'University Check', icon: GraduationCap },
            { id: 'guide', label: 'AI Guide', icon: Sparkles },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors text-sm font-medium ${
                activeTab === id
                  ? 'border-[#0F2557] text-[#0F2557]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Evaluation Bodies Tab */}
      {activeTab === 'evaluators' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label>Destination Country</Label>
                  <Select value={evalDestination} onValueChange={setEvalDestination}>
                    <SelectTrigger>
                      <SelectValue placeholder="Where is the client going?" />
                    </SelectTrigger>
                    <SelectContent>
                      {DESTINATION_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="bg-[#0F2557] hover:bg-[#0a1a3d]"
                  onClick={handleEvalSearch}
                  disabled={evalLoading || !evalDestination}
                >
                  {evalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                  Find Evaluators
                </Button>
              </div>
            </CardContent>
          </Card>

          {evalSearched && (
            evalLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F2557]" />
              </div>
            ) : evalBodies.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600">No evaluation bodies found for {evalDestination}</p>
                  <p className="text-sm text-gray-500 mt-1">Try a different destination country</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evalBodies.map((body, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{body.name}</h3>
                        <Badge variant="outline">{body.country}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <p className="text-gray-500 text-xs">Processing Time</p>
                          <p className="font-medium text-gray-800">{body.processTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Fee</p>
                          <p className="font-medium text-gray-800">{body.fee}</p>
                        </div>
                      </div>

                      {body.accepts && body.accepts.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Accepts qualifications from:</p>
                          <div className="flex flex-wrap gap-1">
                            {body.accepts.map((country) => (
                              <Badge key={country} variant="secondary" className="text-xs">
                                {country}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {body.notes && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded mb-3">{body.notes}</p>
                      )}

                      {body.website && (
                        <a
                          href={body.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-[#0F2557] hover:text-amber-600 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit Website
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {!evalSearched && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { country: 'Canada', body: 'WES (World Education Services)', note: 'Most widely accepted for Express Entry' },
                { country: 'UK', body: 'UK ENIC (formerly NARIC)', note: 'Official UK government recognition service' },
                { country: 'Australia', body: 'NOOSR / AITSL / AEI-NOOSR', note: 'Depends on profession and state' },
              ].map(({ country, body, note }) => (
                <Card key={country} className="bg-gradient-to-br from-[#0F2557]/5 to-transparent">
                  <CardContent className="p-4">
                    <Badge className="mb-2 bg-[#0F2557]">{country}</Badge>
                    <p className="font-semibold text-gray-900 text-sm">{body}</p>
                    <p className="text-xs text-gray-500 mt-1">{note}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* University Check Tab */}
      {activeTab === 'universities' && (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-2 space-y-2">
                  <Label>University Name</Label>
                  <Input
                    placeholder="e.g. University of Lagos"
                    value={uniName}
                    onChange={(e) => setUniName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUniSearch()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country (optional)</Label>
                  <Select value={uniCountry} onValueChange={setUniCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any country</SelectItem>
                      {ORIGIN_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="mt-4 bg-[#0F2557] hover:bg-[#0a1a3d]"
                onClick={handleUniSearch}
                disabled={uniLoading || !uniName}
              >
                {uniLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Check Recognition
              </Button>
            </CardContent>
          </Card>

          {uniSearched && (
            uniLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0F2557]" />
              </div>
            ) : uniResults.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 font-medium">No results found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Try a different spelling or use the AI Guide tab for a personalised report.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {uniResults.map((uni, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{uni.university}</h3>
                        <p className="text-sm text-gray-500">{uni.country}</p>
                        {uni.notes && (
                          <p className="text-sm text-gray-600 mt-1">{uni.notes}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {uni.recognized ? (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Recognised
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Not Listed
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* AI Guide Tab */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Generate Personalised Credential Guide
              </CardTitle>
              <p className="text-sm text-gray-500">
                AI generates a step-by-step credential evaluation guide tailored to your client's specific situation.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Origin Country *</Label>
                  <Select value={guideOrigin} onValueChange={setGuideOrigin}>
                    <SelectTrigger>
                      <SelectValue placeholder="Where qualifications are from" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIGIN_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Destination Country *</Label>
                  <Select value={guideDestination} onValueChange={setGuideDestination}>
                    <SelectTrigger>
                      <SelectValue placeholder="Where recognition is needed" />
                    </SelectTrigger>
                    <SelectContent>
                      {DESTINATION_COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Qualification Level *</Label>
                  <Select value={guideQualLevel} onValueChange={setGuideQualLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALIFICATION_LEVELS.map((q) => (
                        <SelectItem key={q} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Field of Study *</Label>
                  <Input
                    placeholder="e.g. Computer Science, Nursing, Law"
                    value={guideField}
                    onChange={(e) => setGuideField(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>University Name *</Label>
                  <Input
                    placeholder="e.g. University of Nairobi"
                    value={guideUniversity}
                    onChange={(e) => setGuideUniversity(e.target.value)}
                  />
                </div>
              </div>

              <Button
                className="mt-4 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={handleGenerateGuide}
                disabled={
                  guideLoading ||
                  !guideOrigin || !guideDestination ||
                  !guideQualLevel || !guideField || !guideUniversity
                }
              >
                {guideLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating guide...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate Credential Guide</>
                )}
              </Button>
            </CardContent>
          </Card>

          {guide && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Credential Evaluation Guide
                  <Badge className="ml-auto bg-amber-500 text-white">AI Generated</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {guide}
                  </pre>
                </div>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <strong>Disclaimer:</strong> This guide is AI-generated for reference purposes only.
                    Always verify requirements with the official evaluation body and destination country authorities.
                    Requirements may change — check official sources before advising clients.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!guide && !guideLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-amber-50 to-transparent border-amber-200">
                <CardContent className="p-4">
                  <Award className="w-8 h-8 text-amber-500 mb-2" />
                  <h3 className="font-semibold text-gray-900">What's included in the guide</h3>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    {[
                      'Which evaluation body to use and why',
                      'Exact documents required',
                      'Attestation & apostille steps',
                      'Realistic timeline & costs',
                      'Common mistakes to avoid',
                      'Profession-specific requirements',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#0F2557]/5 to-transparent">
                <CardContent className="p-4">
                  <GraduationCap className="w-8 h-8 text-[#0F2557] mb-2" />
                  <h3 className="font-semibold text-gray-900">Supported corridors</h3>
                  <p className="text-sm text-gray-500 mt-1 mb-2">Guide generation works for all origin countries to:</p>
                  <div className="flex flex-wrap gap-1">
                    {DESTINATION_COUNTRIES.map((c) => (
                      <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
