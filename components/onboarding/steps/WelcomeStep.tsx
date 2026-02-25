'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen, Sparkles, Users } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-8 py-12">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-gray-900">
          Welcome to Immigration AI
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Let&apos;s set up your immigration workspace in 2 minutes
        </p>
      </div>

      {/* Value Propositions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <div className="w-12 h-12 bg-[#0F2557] rounded-lg flex items-center justify-center mb-4 mx-auto">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Manage all your cases in one place</h3>
          <p className="text-sm text-gray-600">
            Organize, track, and collaborate on immigration cases effortlessly
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <div className="w-12 h-12 bg-[#0F2557] rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-2">AI-powered document checklists</h3>
          <p className="text-sm text-gray-600">
            Generate personalized checklists tailored to each visa application
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <div className="w-12 h-12 bg-[#0F2557] rounded-lg flex items-center justify-center mb-4 mx-auto">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Collaborate with your team</h3>
          <p className="text-sm text-gray-600">
            Work together seamlessly with your colleagues and clients
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="space-y-4 mt-12">
        <Button
          onClick={onNext}
          size="lg"
          className="bg-[#0F2557] hover:bg-[#0a1d42] text-white px-12 py-6 text-lg"
        >
          Get Started
        </Button>
        <p className="text-sm text-gray-500">
          14-day free trial · No credit card required
        </p>
      </div>
    </div>
  );
}
