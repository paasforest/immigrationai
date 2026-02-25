'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Users, Building2, Building } from 'lucide-react';
import { GraduationCap, Briefcase, Heart, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsageStepProps {
  onNext: (data: { teamSize: string; primaryUseCase: string }) => void;
  onBack: () => void;
}

const teamSizeOptions = [
  { value: 'just_me', label: 'Just me', icon: User, emoji: '👤' },
  { value: '2_5', label: '2-5 people', icon: Users, emoji: '👥' },
  { value: '6_20', label: '6-20 people', icon: Building2, emoji: '🏢' },
  { value: '20_plus', label: '20+ people', icon: Building, emoji: '🏙️' },
];

const useCaseOptions = [
  { value: 'student_visas', label: 'Student Visas', icon: GraduationCap, emoji: '🎓' },
  { value: 'work_permits', label: 'Work Permits', icon: Briefcase, emoji: '💼' },
  { value: 'family', label: 'Family Reunification', icon: Heart, emoji: '❤️' },
  { value: 'mixed', label: 'Mixed/All types', icon: Globe, emoji: '🌍' },
];

export default function UsageStep({ onNext, onBack }: UsageStepProps) {
  const [teamSize, setTeamSize] = useState<string>('');
  const [primaryUseCase, setPrimaryUseCase] = useState<string>('');

  const handleSubmit = () => {
    if (!teamSize || !primaryUseCase) return;
    onNext({ teamSize, primaryUseCase });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">How will you use Immigration AI?</h2>
        <p className="text-gray-600">Help us tailor your experience</p>
      </div>

      <div className="space-y-8">
        {/* Team Size */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Team Size</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {teamSizeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.value}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    teamSize === option.value
                      ? 'border-2 border-[#0F2557] bg-[#0F2557]/5'
                      : 'border hover:border-gray-300'
                  )}
                  onClick={() => setTeamSize(option.value)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{option.emoji}</div>
                    <p className="text-sm font-medium">{option.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Primary Use Case */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Primary Use Case</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {useCaseOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Card
                  key={option.value}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    primaryUseCase === option.value
                      ? 'border-2 border-[#0F2557] bg-[#0F2557]/5'
                      : 'border hover:border-gray-300'
                  )}
                  onClick={() => setPrimaryUseCase(option.value)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{option.emoji}</div>
                    <p className="text-sm font-medium">{option.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-8">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-[#0F2557] hover:bg-[#0a1d42]"
          disabled={!teamSize || !primaryUseCase}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
