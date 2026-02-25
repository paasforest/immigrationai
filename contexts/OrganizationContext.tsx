'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { immigrationApi } from '@/lib/api/immigration';
import { Organization } from '@/types/immigration';

interface OrganizationContextType {
  organization: Organization | null;
  isLoading: boolean;
  error: string | null;
  refreshOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrganization = async () => {
    // Only fetch if user is authenticated
    if (!user) {
      setOrganization(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await immigrationApi.getMyOrganization();
      
      if (response.success && response.data) {
        setOrganization(response.data);
      } else if (response.error && response.error.includes('404')) {
        // User has no organization yet - this is OK, set to null
        setOrganization(null);
      } else {
        setError(response.error || 'Failed to load organization');
        setOrganization(null);
      }
    } catch (err: any) {
      console.error('Failed to load organization:', err);
      setError(err.message || 'Failed to load organization');
      setOrganization(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();
  }, [user]);

  const refreshOrganization = async () => {
    await loadOrganization();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        isLoading,
        error,
        refreshOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
