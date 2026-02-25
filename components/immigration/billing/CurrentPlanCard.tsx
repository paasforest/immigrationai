'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { CreditCard, Calendar, XCircle } from 'lucide-react';

interface CurrentPlanCardProps {
  subscription: any;
  onUpgrade?: () => void;
  onCancel?: () => void;
}

const planColors: Record<string, { bg: string; text: string }> = {
  starter: { bg: 'bg-gray-100', text: 'text-gray-800' },
  professional: { bg: 'bg-blue-100', text: 'text-blue-800' },
  agency: { bg: 'bg-[#0F2557]', text: 'text-white' },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  trial: { bg: 'bg-amber-100', text: 'text-amber-800' },
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
};

export default function CurrentPlanCard({ subscription, onUpgrade, onCancel }: CurrentPlanCardProps) {
  const planColor = planColors[subscription?.plan || 'starter'] || planColors.starter;
  const statusColor = statusColors[subscription?.status || 'trial'] || statusColors.trial;
  const isTrial = subscription?.status === 'trial';
  const isCancelled = subscription?.status === 'cancelled';
  const daysRemaining = subscription?.daysRemaining || 0;
  const isUrgent = daysRemaining <= 3 && daysRemaining > 0;

  const progressValue = isTrial && subscription?.currentPeriodEnd
    ? Math.max(0, Math.min(100, ((14 - daysRemaining) / 14) * 100))
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Current Plan</CardTitle>
          <Badge className={`${planColor.bg} ${planColor.text}`}>
            {subscription?.plan ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Starter'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Status</span>
            <Badge className={`${statusColor.bg} ${statusColor.text}`}>
              {subscription?.status ? subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1) : 'Trial'}
            </Badge>
          </div>
        </div>

        {/* Trial Progress */}
        {isTrial && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {daysRemaining > 0 ? `${daysRemaining} days remaining in your trial` : 'Trial expired'}
              </span>
              <span className={`text-sm font-medium ${isUrgent ? 'text-red-600' : 'text-gray-600'}`}>
                {daysRemaining} days
              </span>
            </div>
            <Progress 
              value={progressValue} 
              className={`h-2 ${isUrgent ? 'bg-red-100' : ''}`}
            />
          </div>
        )}

        {/* Active Subscription */}
        {!isTrial && !isCancelled && subscription?.currentPeriodEnd && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Next billing date:</span>
              <span className="font-medium">
                {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">
                R{subscription.amount?.toLocaleString()} / {subscription.billingCycle || 'month'}
              </span>
            </div>
          </div>
        )}

        {/* Current Period */}
        {subscription?.currentPeriodStart && subscription?.currentPeriodEnd && (
          <div className="text-sm text-gray-600">
            <p>
              Current period: {format(new Date(subscription.currentPeriodStart), 'MMM d')} - {format(new Date(subscription.currentPeriodEnd), 'MMM d, yyyy')}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {!isCancelled && subscription?.plan !== 'agency' && (
            <Button onClick={onUpgrade} className="flex-1 bg-[#0F2557] hover:bg-[#0a1d42]">
              Upgrade Plan
            </Button>
          )}
          {!isCancelled && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your subscription will remain active until {subscription?.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy') : 'the end of your billing period'}. 
                    You'll lose access to premium features after that date.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onCancel}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
