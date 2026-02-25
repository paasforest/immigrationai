'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getServices, type Service } from '@/lib/api/publicIntake';
import IntakeForm from '@/components/intake/IntakeForm';
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
  CheckCircle2,
  ShieldCheck,
  Star,
} from 'lucide-react';

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

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceSlug = params.serviceSlug as string;
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchService();
  }, [serviceSlug]);

  const fetchService = async () => {
    try {
      setIsLoading(true);
      const services = await getServices();
      const found = services.find((s) => s.slug === serviceSlug);
      if (!found) {
        router.push('/get-help');
        return;
      }
      setService(found);
    } catch (error) {
      console.error('Failed to fetch service:', error);
      router.push('/get-help');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-3">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return null;
  }

  const Icon = getServiceIcon(service.caseType);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left Panel */}
          <div className="lg:col-span-2 lg:sticky lg:top-8 lg:self-start">
            <Link
              href="/get-help"
              className="text-[#0F2557] text-sm mb-6 inline-flex items-center hover:underline"
            >
              ← All Services
            </Link>

            <Card className="shadow rounded-2xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#0F2557]" />
                </div>
                <h1 className="text-2xl font-bold text-[#0F2557] mb-3">{service.name}</h1>
                <p className="text-gray-600 mb-6">{service.description}</p>

                <div className="border-t border-b py-6 my-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      Typically {service.estimatedTimeline || '4-12 weeks'}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
                    What's included
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Professional case assessment',
                      'Document review and guidance',
                      'Direct specialist communication',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t flex gap-4">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Verified Specialist</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Expert Matched</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tell us about your situation
            </h2>
            <p className="text-gray-600 mb-8">2 minutes · No account required</p>

            <Card className="shadow rounded-2xl">
              <CardContent className="p-8">
                <IntakeForm
                  service={service}
                  preferredSpecialist={searchParams.get('preferredSpecialist') || undefined}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
