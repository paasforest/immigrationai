'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import SpecializationManager from '@/components/immigration/profile/SpecializationManager';
import PublicProfileForm from '@/components/immigration/profile/PublicProfileForm';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Professional Profile</h1>
        <p className="text-gray-600 mt-1">
          Configure your specializations and profile to receive matched leads
        </p>
      </div>

      <Card className="bg-[#0F2557] text-white">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Complete your profile to start receiving leads</p>
              <p className="text-sm text-blue-100 mt-1">
                Professionals with verified profiles receive significantly more matched leads
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="specializations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="specializations">My Specializations</TabsTrigger>
          <TabsTrigger value="profile">Public Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="specializations" className="mt-6">
          <SpecializationManager />
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <PublicProfileForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
