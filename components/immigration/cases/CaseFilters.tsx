'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface CaseFiltersProps {
  onFilterChange?: () => void;
}

export default function CaseFilters({ onFilterChange }: CaseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [visaType, setVisaType] = useState(searchParams.get('visaType') || 'all');
  const [destination, setDestination] = useState(searchParams.get('destination') || 'all');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'all');

  const hasActiveFilters = 
    search !== '' ||
    status !== 'all' ||
    visaType !== 'all' ||
    destination !== 'all' ||
    priority !== 'all';

  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    params.set('page', '1'); // Reset to first page on filter change
    router.push(`?${params.toString()}`);
    onFilterChange?.();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    updateURL({ search: value });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    updateURL({ status: value });
  };

  const handleVisaTypeChange = (value: string) => {
    setVisaType(value);
    updateURL({ visaType: value });
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    updateURL({ destination: value });
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value);
    updateURL({ priority: value });
  };

  const clearAll = () => {
    setSearch('');
    setStatus('all');
    setVisaType('all');
    setDestination('all');
    setPriority('all');
    router.push('/dashboard/immigration/cases');
    onFilterChange?.();
  };

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search cases..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Status */}
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="refused">Refused</SelectItem>
          </SelectContent>
        </Select>

        {/* Visa Type */}
        <Select value={visaType} onValueChange={handleVisaTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Visa Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="skilled_worker">Skilled Worker</SelectItem>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="visitor">Visitor</SelectItem>
            <SelectItem value="work_permit">Work Permit</SelectItem>
          </SelectContent>
        </Select>

        {/* Destination */}
        <Select value={destination} onValueChange={handleDestinationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Destination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Destinations</SelectItem>
            <SelectItem value="UK">UK</SelectItem>
            <SelectItem value="Canada">Canada</SelectItem>
            <SelectItem value="USA">USA</SelectItem>
            <SelectItem value="Germany">Germany</SelectItem>
            <SelectItem value="UAE">UAE</SelectItem>
            <SelectItem value="Australia">Australia</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select value={priority} onValueChange={handlePriorityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={clearAll}>
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
