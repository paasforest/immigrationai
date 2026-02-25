'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { getServices } from '@/lib/api/publicIntake';
import { type Service, type ProfessionalSpecialization } from '@/types/immigration';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ServiceSpecializationCard from './ServiceSpecializationCard';
import { toast } from 'sonner';

export default function SpecializationManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [specializations, setSpecializations] = useState<ProfessionalSpecialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [servicesData, specsData] = await Promise.all([
        getServices(),
        immigrationApi.getMySpecializations(),
      ]);

      if (servicesData) {
        setServices(servicesData as unknown as Service[]);
      }
      if (specsData.success && specsData.data) {
        setSpecializations(specsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load specializations');
    } finally {
      setIsLoading(false);
    }
  };

  const getSpecializationForService = (serviceId: string) => {
    return specializations.find((s) => s.serviceId === serviceId);
  };


  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2557] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading specializations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => {
        const spec = getSpecializationForService(service.id);
        return (
          <ServiceSpecializationCard
            key={service.id}
            service={service}
            specialization={spec}
            onUpdate={fetchData}
          />
        );
      })}
    </div>
  );
}
