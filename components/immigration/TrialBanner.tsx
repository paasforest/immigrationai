'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TrialBanner() {
  const { organization } = useOrganization();
  const [dismissed, setDismissed] = useState(false);

  if (!organization || organization.planStatus !== 'trial' || dismissed) {
    return null;
  }

  const trialEndsAt = organization.trialEndsAt ? new Date(organization.trialEndsAt) : null;
  const now = new Date();
  
  let daysRemaining = 0;
  let isExpired = false;
  
  if (trialEndsAt) {
    const diff = trialEndsAt.getTime() - now.getTime();
    daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    isExpired = daysRemaining < 0;
  }

  if (isExpired) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="font-medium">
            Your trial has ended. Upgrade now to keep full access.
          </p>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/immigration/billing">
              <Button size="sm" variant="secondary">
                Upgrade Now
              </Button>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-red-700"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-500 text-white px-4 py-3 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="font-medium">
          Your free trial ends in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} — upgrade to keep full access
        </p>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/immigration/billing">
            <Button size="sm" variant="secondary">
              Upgrade Now
            </Button>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-amber-600"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
