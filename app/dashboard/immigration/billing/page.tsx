'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { immigrationApi } from '@/lib/api/immigration';
import CurrentPlanCard from '@/components/immigration/billing/CurrentPlanCard';
import PricingPlans from '@/components/immigration/billing/PricingPlans';
import PaymentMethodSelector from '@/components/immigration/billing/PaymentMethodSelector';
import BillingHistory from '@/components/immigration/billing/BillingHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; cycle: 'monthly' | 'annual' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [subscriptionRes, plansRes] = await Promise.all([
        immigrationApi.getSubscriptionDetails(),
        immigrationApi.getPlans(),
      ]);

      if (subscriptionRes.success && subscriptionRes.data) {
        setSubscription(subscriptionRes.data);
      }

      if (plansRes.success && plansRes.data) {
        setPlans(plansRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (planId: string, billingCycle: 'monthly' | 'annual') => {
    setSelectedPlan({ id: planId, cycle: billingCycle });
    setIsPaymentDialogOpen(true);
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await immigrationApi.cancelSubscription();
      if (response.success) {
        toast.success('Subscription cancelled successfully');
        await fetchData();
      } else {
        toast.error(response.error || 'Failed to cancel subscription');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription');
    }
  };

  // Check if user is org_admin
  useEffect(() => {
    if (user && user.role !== 'org_admin' && !organization) {
      router.push('/dashboard/immigration');
    }
  }, [user, organization, router]);

  if (user && user.role !== 'org_admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const selectedPlanData = selectedPlan
    ? plans.find((p) => p.id === selectedPlan.id)
    : null;
  const amount = selectedPlanData
    ? selectedPlan?.cycle === 'annual'
      ? selectedPlanData.priceAnnual
      : selectedPlanData.price
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and payment methods</p>
      </div>

      {/* Current Plan */}
      <CurrentPlanCard
        subscription={subscription}
        onUpgrade={() => {}}
        onCancel={handleCancelSubscription}
      />

      {/* Pricing Plans */}
      {(subscription?.status === 'trial' || subscription?.plan === 'starter') && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Upgrade Your Plan</h2>
            <p className="text-gray-600">Choose the plan that best fits your needs</p>
          </div>
          <PricingPlans
            plans={plans}
            currentPlan={subscription?.plan}
            onSelectPlan={handleSelectPlan}
          />
        </div>
      )}

      {/* Billing History */}
      <BillingHistory invoices={subscription?.invoices || []} />

      {/* Payment Method Dialog */}
      {selectedPlan && (
        <PaymentMethodSelector
          isOpen={isPaymentDialogOpen}
          onClose={() => {
            setIsPaymentDialogOpen(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan.id}
          billingCycle={selectedPlan.cycle}
          amount={amount}
        />
      )}
    </div>
  );
}
