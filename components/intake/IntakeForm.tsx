'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPublicProfile } from '@/lib/api/publicIntake';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { submitIntake, type Service } from '@/lib/api/publicIntake';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, AlertTriangle, AlertOctagon, Lock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { LanguageProvider, LanguagePills, useLanguage } from '@/lib/i18n/LanguageContext';
import { type LanguageCode } from '@/lib/i18n/translations';

const intakeSchema = z.object({
  applicantName: z.string().min(2, 'Name required'),
  applicantEmail: z.string().email('Valid email required'),
  applicantPhone: z.string().optional(),
  applicantCountry: z.string().min(1, 'Country required'),
  destinationCountry: z.string().min(1, 'Destination required'),
  urgencyLevel: z.enum(['normal', 'soon', 'urgent', 'emergency']),
  description: z.string().min(20, 'Please provide at least 20 characters'),
});

type IntakeFormValues = z.infer<typeof intakeSchema>;

interface IntakeFormProps {
  service: Service;
  preferredSpecialist?: string;
}

const countryCodes = [
  { code: '+234', country: 'NG' },
  { code: '+233', country: 'GH' },
  { code: '+254', country: 'KE' },
  { code: '+27', country: 'ZA' },
  { code: '+251', country: 'ET' },
  { code: '+263', country: 'ZW' },
  { code: '+256', country: 'UG' },
  { code: '+255', country: 'TZ' },
  { code: '+44', country: 'UK' },
  { code: '+1', country: 'US/CA' },
];

const originCountries = [
  // Africa
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Zimbabwe',
  'Uganda', 'Tanzania', 'Cameroon', 'Senegal', 'Rwanda', 'Zambia',
  'Angola', 'Mozambique', 'Egypt', 'Morocco', 'Tunisia',
  // Asia
  'India', 'China', 'Philippines', 'Pakistan', 'Bangladesh', 'Sri Lanka',
  'Nepal', 'Indonesia', 'Vietnam', 'Thailand', 'Malaysia',
  // Latin America
  'Brazil', 'Colombia', 'Mexico', 'Peru', 'Argentina', 'Chile',
  'Ecuador', 'Venezuela',
  // Middle East
  'Saudi Arabia', 'UAE', 'Jordan', 'Lebanon',
  // Europe
  'Ukraine', 'Russia', 'Turkey', 'Poland',
  // Other
  'United States', 'United Kingdom', 'Australia', 'Canada',
  'Other',
].sort();

const destinationCountries = [
  { value: 'United Kingdom', label: 'UK 🇬🇧' },
  { value: 'Canada', label: 'Canada 🇨🇦' },
  { value: 'United States', label: 'USA 🇺🇸' },
  { value: 'Germany', label: 'Germany 🇩🇪' },
  { value: 'UAE', label: 'UAE 🇦🇪' },
  { value: 'Australia', label: 'Australia 🇦🇺' },
  { value: 'Netherlands', label: 'Netherlands 🇳🇱' },
  { value: 'Ireland', label: 'Ireland 🇮🇪' },
  { value: 'France', label: 'France 🇫🇷' },
  { value: 'Portugal', label: 'Portugal 🇵🇹' },
  { value: 'Spain', label: 'Spain 🇪🇸' },
  { value: 'New Zealand', label: 'New Zealand 🇳🇿' },
  { value: 'Sweden', label: 'Sweden 🇸🇪' },
  { value: 'Norway', label: 'Norway 🇳🇴' },
  { value: 'Denmark', label: 'Denmark 🇩🇰' },
  { value: 'Switzerland', label: 'Switzerland 🇨🇭' },
  { value: 'Belgium', label: 'Belgium 🇧🇪' },
  { value: 'Poland', label: 'Poland 🇵🇱' },
  { value: 'Italy', label: 'Italy 🇮🇹' },
  { value: 'South Africa', label: 'South Africa 🇿🇦' },
  { value: 'Singapore', label: 'Singapore 🇸🇬' },
  { value: 'Japan', label: 'Japan 🇯🇵' },
  { value: 'South Korea', label: 'South Korea 🇰🇷' },
  { value: 'Other', label: 'Other 🌍' },
];

function IntakeFormInner({ service, preferredSpecialist }: IntakeFormProps) {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [countryCode, setCountryCode] = useState('+27');
  const [specialistName, setSpecialistName] = useState<string>('');

  useEffect(() => {
    if (preferredSpecialist) {
      fetchSpecialistName();
    }
  }, [preferredSpecialist]);

  const fetchSpecialistName = async () => {
    if (!preferredSpecialist) return;
    try {
      const profile = await getPublicProfile(preferredSpecialist);
      setSpecialistName(profile.displayName);
    } catch (error) {
      console.error('Failed to fetch specialist:', error);
    }
  };

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      urgencyLevel: 'normal',
    },
  });

  const { register, handleSubmit, formState, trigger, watch, setValue } = form;
  const { errors } = formState;
  const description = watch('description') || '';

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await trigger(['applicantName', 'applicantEmail', 'applicantCountry']);
      if (isValid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const isValid = await trigger(['destinationCountry', 'urgencyLevel', 'description']);
      if (isValid) {
        setCurrentStep(3);
      }
    }
  };

  // ── Silent Eligibility Scoring ──
  // Fires in background on submission. Score attached to intake lead data.
  // NOT shown to the applicant. Used for lead routing and pricing on the backend.
  const runSilentEligibility = async (
    originCountry: string,
    destinationCountry: string
  ): Promise<number | null> => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      // Infer a common visa type from the service name for scoring
      const visaTypeGuess = service.name?.toLowerCase().includes('student')
        ? 'Student Visa'
        : service.name?.toLowerCase().includes('work') || service.name?.toLowerCase().includes('skilled')
        ? 'Skilled Worker Visa'
        : service.name?.toLowerCase().includes('family')
        ? 'Family Visa'
        : 'Standard Visitor Visa';

      const res = await fetch(`${API_BASE}/api/eligibility/silent-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originCountry,
          destinationCountry,
          visaType: visaTypeGuess,
        }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? (json.data?.score ?? null) : null;
    } catch {
      return null; // Silent — never block the form submission
    }
  };

  const onSubmit = async (data: IntakeFormValues) => {
    try {
      setIsSubmitting(true);
      setError('');

      const phone = data.applicantPhone
        ? `${countryCode}${data.applicantPhone.replace(/\D/g, '')}`
        : undefined;

      // Fire silent eligibility check in parallel — does NOT block submission
      const eligibilityScorePromise = runSilentEligibility(
        data.applicantCountry,
        data.destinationCountry
      );

      const [result, eligibilityScore] = await Promise.all([
        submitIntake({
          serviceId: service.id,
          applicantName: data.applicantName,
          applicantEmail: data.applicantEmail,
          applicantPhone: phone,
          applicantCountry: data.applicantCountry,
          destinationCountry: data.destinationCountry,
          urgencyLevel: data.urgencyLevel,
          description: data.description,
          additionalData: {
            ...(preferredSpecialist ? { preferredSpecialist } : {}),
            preferredLanguage: lang, // store client language preference
            // Score is silently attached — used by routing engine and pricing
            _eligibilityScore: undefined, // will be set after both complete
          },
        }),
        eligibilityScorePromise,
      ]);

      // If we got an eligibility score and the lead was created, update it silently
      if (eligibilityScore !== null && result.id) {
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
          await fetch(`${API_BASE}/api/intake/${result.id}/eligibility-score`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eligibilityScore }),
          });
        } catch {
          // Silently ignore — score update is best-effort
        }
      }

      router.push(`/get-help/confirmation?ref=${result.referenceNumber}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Preferred Specialist Notice */}
      {preferredSpecialist && specialistName && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <div className="w-8 h-8 bg-[#0F2557] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {specialistName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              You are requesting {specialistName}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Final match depends on availability
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((step) => {
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;
          const Icon = isCompleted ? CheckCircle2 : null;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-[#0F2557] border-[#0F2557] text-white'
                      : 'bg-gray-200 border-gray-300 text-gray-500'
                  }`}
                >
                  {Icon ? <Icon className="w-5 h-5" /> : <span>{step}</span>}
                </div>
                <span className="text-xs mt-2 text-gray-600">
                  {step === 1 ? 'Your Details' : step === 2 ? 'Your Case' : 'Review'}
                </span>
              </div>
              {step < 3 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Your Details */}
      {currentStep === 1 && (
        <div className="space-y-4">
          {/* Language selector — always visible on step 1 */}
          <div className="pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{t('intake.language')}</span>
            </div>
            <LanguagePills />
          </div>

          <div>
            <Label htmlFor="applicantName">{t('intake.name')} *</Label>
            <Input
              id="applicantName"
              {...register('applicantName')}
              placeholder="Enter your full name"
            />
            {errors.applicantName && (
              <p className="text-sm text-red-600 mt-1">{errors.applicantName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="applicantEmail">{t('intake.email')} *</Label>
            <Input
              id="applicantEmail"
              type="email"
              {...register('applicantEmail')}
              placeholder="your.email@example.com"
            />
            {errors.applicantEmail && (
              <p className="text-sm text-red-600 mt-1">{errors.applicantEmail.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="applicantPhone">{t('intake.phone')}</Label>
            <div className="flex gap-2">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((cc) => (
                    <SelectItem key={cc.code} value={cc.code}>
                      {cc.code} {cc.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="applicantPhone"
                type="tel"
                {...register('applicantPhone')}
                placeholder="Phone number"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="applicantCountry">{t('intake.currentCountry')} *</Label>
            <Select
              value={watch('applicantCountry') || ''}
              onValueChange={(value) => setValue('applicantCountry', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {originCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.applicantCountry && (
              <p className="text-sm text-red-600 mt-1">{errors.applicantCountry.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={handleNext}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Your Case */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="destinationCountry">Destination Country *</Label>
            <Select
              value={watch('destinationCountry') || ''}
              onValueChange={(value) => setValue('destinationCountry', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {destinationCountries.map((dest) => (
                  <SelectItem key={dest.value} value={dest.value}>
                    {dest.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.destinationCountry && (
              <p className="text-sm text-red-600 mt-1">{errors.destinationCountry.message}</p>
            )}
          </div>

          <div>
            <Label>Urgency Level *</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {[
                {
                  value: 'normal',
                  icon: Clock,
                  label: 'Standard',
                  subtext: 'No immediate rush',
                  color: 'border-gray-200',
                },
                {
                  value: 'soon',
                  icon: Clock,
                  label: 'Soon',
                  subtext: 'Within 1-2 months',
                  color: 'border-blue-200',
                },
                {
                  value: 'urgent',
                  icon: AlertTriangle,
                  label: 'Urgent',
                  subtext: 'Within 2-4 weeks',
                  color: 'border-amber-200',
                },
                {
                  value: 'emergency',
                  icon: AlertOctagon,
                  label: 'Emergency',
                  subtext: 'Immediate help needed',
                  color: 'border-red-200',
                },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = watch('urgencyLevel') === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('urgencyLevel', option.value as any)}
                    className={`border-2 rounded-xl p-4 text-left transition-all ${
                      isSelected
                        ? `${option.color} bg-blue-50 border-[#0F2557]`
                        : 'border-gray-200 hover:border-gray-300'
                    } ${option.value === 'emergency' && isSelected ? 'animate-pulse' : ''}`}
                  >
                    <Icon
                      className={`w-5 h-5 mb-2 ${
                        option.value === 'normal'
                          ? 'text-gray-600'
                          : option.value === 'soon'
                          ? 'text-blue-600'
                          : option.value === 'urgent'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    />
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{option.subtext}</div>
                  </button>
                );
              })}
            </div>
            {errors.urgencyLevel && (
              <p className="text-sm text-red-600 mt-1">{errors.urgencyLevel.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Describe Your Situation *</Label>
            <Textarea
              id="description"
              rows={5}
              {...register('description')}
              placeholder="Tell us about your immigration needs, timeline, and any specific challenges you're facing..."
            />
            <div className="flex justify-between mt-1">
              <p className="text-xs text-gray-500">
                {description.length} characters · 20 minimum
              </p>
              <p
                className={`text-xs ${
                  description.length >= 20 ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {description.length >= 20 ? '✓' : ''}
              </p>
            </div>
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
              ← Back
            </Button>
            <Button type="button" onClick={handleNext}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <Card className="bg-gray-50">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Service</h3>
                <p className="text-gray-700">{service.name}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Your Details</h3>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => setCurrentStep(1)}
                  >
                    Edit
                  </Button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Name:</strong> {watch('applicantName')}
                  </p>
                  <p>
                    <strong>Email:</strong> {watch('applicantEmail')}
                  </p>
                  {watch('applicantPhone') && (
                    <p>
                      <strong>Phone:</strong> {countryCode} {watch('applicantPhone')}
                    </p>
                  )}
                  <p>
                    <strong>Country:</strong> {watch('applicantCountry')}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Your Case</h3>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => setCurrentStep(2)}
                  >
                    Edit
                  </Button>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <strong>Destination:</strong> {watch('destinationCountry')}
                  </p>
                  <p>
                    <strong>Urgency:</strong>{' '}
                    <span className="capitalize">{watch('urgencyLevel')}</span>
                  </p>
                  <p>
                    <strong>Description:</strong>{' '}
                    {watch('description')?.slice(0, 100)}
                    {watch('description') && watch('description').length > 100 ? '...' : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-600 flex items-start gap-2">
            <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Your information is only shared with your matched specialist. We never sell your
              data.
            </p>
          </div>

          <p className="text-xs text-gray-400 text-center">
            By submitting you agree to our Terms of Service
          </p>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#0F2557] text-white py-4 rounded-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {t('intake.submitting')}
              </>
            ) : (
              t('intake.submit') + ' →'
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

// Wrap with LanguageProvider so the form is self-contained with language detection
export default function IntakeForm(props: IntakeFormProps) {
  return (
    <LanguageProvider>
      <IntakeFormInner {...props} />
    </LanguageProvider>
  );
}
