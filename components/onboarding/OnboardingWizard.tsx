'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { immigrationApi } from '@/lib/api/immigration';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import WelcomeStep from './steps/WelcomeStep';
import OrganizationStep from './steps/OrganizationStep';
import UsageStep from './steps/UsageStep';
import TrialStep from './steps/TrialStep';

type Step = 'welcome' | 'organization' | 'usage' | 'trial';

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [organizationData, setOrganizationData] = useState<any>(null);

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

  const handleUsageNext = async (data: { teamSize: string; primaryUseCase: string }) => {
    try {
      setIsSubmitting(true);
      const response = await immigrationApi.completeOnboarding({
        organizationName: organizationData.organizationName,
        country: organizationData.country,
        phone: organizationData.phone,
        billingEmail: organizationData.billingEmail,
        teamSize: data.teamSize,
        primaryUseCase: data.primaryUseCase,
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
      case 'welcome':
        return 0;
      case 'organization':
        return 33;
      case 'usage':
        return 66;
      case 'trial':
        return 100;
      default:
        return 0;
    }
  };

  const getStepNumber = (): number => {
    switch (currentStep) {
      case 'organization':
        return 1;
      case 'usage':
        return 2;
      case 'trial':
        return 3;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      {currentStep !== 'welcome' && currentStep !== 'trial' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step {getStepNumber()} of 2</span>
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
