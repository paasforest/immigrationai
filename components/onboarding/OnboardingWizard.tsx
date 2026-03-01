'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { immigrationApi } from '@/lib/api/immigration';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import WelcomeStep from './steps/WelcomeStep';
import OrganizationStep from './steps/OrganizationStep';
import UsageStep from './steps/UsageStep';
import ServicesStep from './steps/ServicesStep';
import TrialStep from './steps/TrialStep';

type Step = 'welcome' | 'organization' | 'usage' | 'services' | 'trial';

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationData, setOrganizationData] = useState<any>(null);
  const [usageData, setUsageData] = useState<any>(null);

  const handleWelcomeNext = () => {
    setCurrentStep('organization');
  };

  const handleOrganizationNext = (data: {
    organizationName: string;
    country: string;
    phone: string;
    billingEmail: string;
  }) => {
    setOrganizationData(data);
    setCurrentStep('usage');
  };

  const handleUsageNext = (data: { teamSize: string; primaryUseCase: string }) => {
    setUsageData(data);
    setCurrentStep('services');
  };

  const handleServicesNext = async (data: { selectedServices: string[] }) => {
    try {
      setIsSubmitting(true);
      const response = await immigrationApi.completeOnboarding({
        organizationName: organizationData.organizationName,
        country: organizationData.country,
        phone: organizationData.phone,
        billingEmail: organizationData.billingEmail,
        teamSize: usageData.teamSize,
        primaryUseCase: usageData.primaryUseCase,
        selectedServices: data.selectedServices,
      });

      if (response.success && response.data) {
        setCurrentStep('trial');
        // Refresh organization context
        window.location.reload();
      } else {
        toast.error(response.error || 'Failed to complete onboarding');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = (): number => {
    switch (currentStep) {
      case 'welcome': return 0;
      case 'organization': return 25;
      case 'usage': return 50;
      case 'services': return 75;
      case 'trial': return 100;
      default: return 0;
    }
  };

  const getStepLabel = (): string => {
    switch (currentStep) {
      case 'organization': return 'Step 1 of 3';
      case 'usage': return 'Step 2 of 3';
      case 'services': return 'Step 3 of 3';
      default: return '';
    }
  };

  const showProgress = currentStep !== 'welcome' && currentStep !== 'trial';

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>{getStepLabel()}</span>
            <span>{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>
      )}

      {/* Steps */}
      {currentStep === 'welcome' && <WelcomeStep onNext={handleWelcomeNext} />}
      {currentStep === 'organization' && (
        <OrganizationStep
          onNext={handleOrganizationNext}
          onBack={() => setCurrentStep('welcome')}
        />
      )}
      {currentStep === 'usage' && (
        <UsageStep
          onNext={handleUsageNext}
          onBack={() => setCurrentStep('organization')}
        />
      )}
      {currentStep === 'services' && (
        <ServicesStep
          onNext={handleServicesNext}
          onBack={() => setCurrentStep('usage')}
        />
      )}
      {currentStep === 'trial' && (
        <TrialStep organizationName={organizationData?.organizationName} />
      )}

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2557] mx-auto mb-4"></div>
            <p className="text-gray-700">Setting up your workspace...</p>
          </div>
        </div>
      )}
    </div>
  );
}
