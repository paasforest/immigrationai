'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { immigrationApi } from '@/lib/api/immigration';
import PortalCaseCard from '@/components/portal/PortalCaseCard';
import PortalDocumentUpload from '@/components/portal/PortalDocumentUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FolderOpen, MessageSquare, Upload, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function getGreeting(lang: string): string {
  const hour = new Date().getHours();
  const greetings: Record<string, [string, string, string]> = {
    en: ['Good morning', 'Good afternoon', 'Good evening'],
    fr: ['Bonjour', 'Bonjour', 'Bonsoir'],
    pt: ['Bom dia', 'Boa tarde', 'Boa noite'],
    ar: ['صباح الخير', 'مساء الخير', 'مساء الخير'],
    es: ['Buenos días', 'Buenas tardes', 'Buenas noches'],
    zh: ['早上好', '下午好', '晚上好'],
  };
  const parts = greetings[lang] ?? greetings['en'];
  if (hour < 12) return parts[0];
  if (hour < 18) return parts[1];
  return parts[2];
}

export default function PortalDashboardPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await immigrationApi.getApplicantDashboard();
      if (response.success && response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    // This would be handled by the specific upload context
    // For now, just refresh
    await fetchDashboard();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F2557]"></div>
        <span className="ml-3 text-gray-500">{t('ui.loading')}</span>
      </div>
    );
  }

  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const greeting = getGreeting(lang);

  // Calculate overall progress based on case stages
  // Each case moves through 4 stages: created(0%) → in_progress(33%) → submitted(67%) → approved/decided(100%)
  const activeCases = dashboardData?.activeCases || [];
  const overallProgress = (() => {
    if (activeCases.length === 0) return 0;
    const stageScore: Record<string, number> = {
      open: 10,
      in_progress: 33,
      submitted: 67,
      approved: 100,
      refused: 100,
      closed: 100,
    };
    const total = activeCases.reduce(
      (sum: number, c: any) => sum + (stageScore[c.status] ?? 10),
      0
    );
    return Math.round(total / activeCases.length);
  })();

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Here&apos;s an overview of your immigration cases</p>
      </div>

      {/* Active Cases */}
      {dashboardData?.activeCases && dashboardData.activeCases.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('case.myCase')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.activeCases.map((caseItem: any) => (
              <PortalCaseCard key={caseItem.id} caseData={caseItem} />
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">{t('portal.noCasesTitle')}</h3>
            <p className="text-gray-600">{t('portal.noCasesBody')}</p>
          </CardContent>
        </Card>
      )}

      {/* Pending Documents */}
      {dashboardData?.pendingChecklistItems && dashboardData.pendingChecklistItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {t('portal.pendingDocs')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.pendingChecklistItems.slice(0, 5).map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.checklistName} • {item.case.referenceNumber}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    asChild
                    className="bg-[#0F2557] hover:bg-[#0a1d42]"
                  >
                    <Link href={`/portal/cases/${item.case.id}?tab=documents&item=${item.id}`}>
                      {t('case.uploadDoc')}
                    </Link>
                  </Button>
                </div>
              ))}
              {dashboardData.pendingChecklistItems.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{dashboardData.pendingChecklistItems.length - 5} {t('portal.moreItems')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Messages */}
      {dashboardData?.recentMessages && dashboardData.recentMessages.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {t('case.messages')}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/portal/messages">{t('ui.viewAll')} →</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentMessages.slice(0, 3).map((message: any) => (
                <div key={message.id} className="p-3 border rounded-lg">
                  <p className="text-sm">{message.content.substring(0, 100)}...</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t('portal.appProgress')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{t('portal.overallProgress')}</span>
                <span className="text-sm text-gray-600">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#0F2557]">
                  {dashboardData?.activeCases?.length || 0}
                </p>
                <p className="text-xs text-gray-600">{t('portal.activeCases')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {dashboardData?.pendingChecklistItems?.length || 0}
                </p>
                <p className="text-xs text-gray-600">{t('portal.pendingItems')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData?.unreadMessages || 0}
                </p>
                <p className="text-xs text-gray-600">{t('portal.unreadMessages')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
