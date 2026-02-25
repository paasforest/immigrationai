'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UniversityLookup from './credential/UniversityLookup';
import AttestationSteps from './credential/AttestationSteps';
import AICredentialGuide from './credential/AICredentialGuide';

export default function CredentialEvaluator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('university');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['university', 'attestation', 'guide'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="university">🎓 University Lookup</TabsTrigger>
        <TabsTrigger value="attestation">📋 Attestation Steps</TabsTrigger>
        <TabsTrigger value="guide">✨ AI Guide</TabsTrigger>
      </TabsList>

      <TabsContent value="university" className="mt-6">
        <UniversityLookup />
      </TabsContent>

      <TabsContent value="attestation" className="mt-6">
        <AttestationSteps />
      </TabsContent>

      <TabsContent value="guide" className="mt-6">
        <AICredentialGuide />
      </TabsContent>
    </Tabs>
  );
}
