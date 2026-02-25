'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getServices, type Service } from '@/lib/api/publicIntake';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Scale,
  Shield,
  FileSearch,
  Globe,
  GraduationCap,
  Briefcase,
  Heart,
  Clock,
} from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

function getServiceIcon(caseType: string) {
  const iconMap: Record<string, any> = {
    visa_application: FileText,
    visa_appeal: Scale,
    criminal_inadmissibility: Shield,
    police_clearance: FileSearch,
    eu_verification: Globe,
    study_permit: GraduationCap,
    work_permit: Briefcase,
    family_reunification: Heart,
  };
  return iconMap[caseType] || FileText;
}

export default function ServiceGrid() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getServices();
      setServices(data);
    } catch (err: any) {
      console.error('Failed to fetch services:', err);
      setError(err.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <Skeleton className="h-14 w-14 rounded-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchServices} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => {
        const Icon = getServiceIcon(service.caseType);
        return (
          <Link key={service.id} href={`/get-help/${service.slug}`}>
            <Card className="border-l-4 border-transparent hover:border-l-4 hover:border-[#0F2557] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full flex flex-col">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#0F2557]" />
                </div>

                <h3 className="font-bold text-xl text-[#0F2557] mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2 flex-1 mb-3">
                  {service.description}
                </p>

                {service.estimatedTimeline && (
                  <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 rounded-full px-3 py-1 text-xs w-fit mt-3">
                    <Clock className="w-3 h-3" />
                    {service.estimatedTimeline}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t">
                  <span className="text-[#0F2557] font-medium hover:underline">
                    Get Started →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
