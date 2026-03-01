'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowLeft, ArrowRight } from 'lucide-react';

const ALL_SERVICES = [
  { id: 'visa_application', name: 'Visa Application', icon: '🛂', description: 'Tourist, business, work, student visas to any country' },
  { id: 'visa_appeal', name: 'Visa Appeal / Refusal', icon: '⚖️', description: 'Represent clients after visa refusals and rejections' },
  { id: 'work_permit', name: 'Work Permit', icon: '💼', description: 'Employment authorisation and work permit applications' },
  { id: 'study_permit', name: 'Study Permit / Student Visa', icon: '🎓', description: 'Student visas and study permits worldwide' },
  { id: 'family_reunification', name: 'Family Reunification', icon: '👨‍👩‍👧', description: 'Spousal, dependent, and family reunion applications' },
  { id: 'eu_verification', name: 'EU Free Movement / EEA Rights', icon: '🇪🇺', description: 'Non-EU family members of EU citizens exercising free movement' },
  { id: 'criminal_inadmissibility', name: 'Criminal Inadmissibility', icon: '🔓', description: 'Overcome criminal record barriers to immigration' },
  { id: 'police_clearance', name: 'Police Clearance Certificate', icon: '📋', description: 'Police clearance certificates for immigration purposes' },
];

interface Props {
  onNext: (data: { selectedServices: string[] }) => void;
  onBack: () => void;
}

export default function ServicesStep({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelected(ALL_SERVICES.map(s => s.id));
  const clearAll = () => setSelected([]);

  const handleNext = () => {
    if (selected.length === 0) {
      // If none selected, default to all
      onNext({ selectedServices: ALL_SERVICES.map(s => s.id) });
    } else {
      onNext({ selectedServices: selected });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What services do you offer?</h2>
        <p className="text-gray-600">
          Select the services you specialise in. You will only receive leads that match your selected services.
          You can change this later in your profile.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={clearAll}>Clear all</Button>
        <Button variant="ghost" size="sm" onClick={selectAll}>Select all</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ALL_SERVICES.map(service => {
          const isSelected = selected.includes(service.id);
          return (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all border-2 ${isSelected ? 'border-[#0F2557] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => toggle(service.id)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="text-2xl mt-0.5">{service.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-gray-900">{service.name}</p>
                    {isSelected
                      ? <CheckCircle2 className="w-5 h-5 text-[#0F2557] shrink-0" />
                      : <Circle className="w-5 h-5 text-gray-300 shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(id => {
            const s = ALL_SERVICES.find(sv => sv.id === id);
            return s ? <Badge key={id} variant="default" className="bg-[#0F2557]">{s.icon} {s.name}</Badge> : null;
          })}
        </div>
      )}

      {selected.length === 0 && (
        <p className="text-sm text-amber-600 text-center">
          💡 No services selected — if you skip this, you will be assigned to all services by default.
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={handleNext} className="flex-1 bg-[#0F2557] hover:bg-[#1a3a7a] text-white">
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
