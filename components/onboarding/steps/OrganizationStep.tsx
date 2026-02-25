'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

interface OrganizationStepProps {
  onNext: (data: {
    organizationName: string;
    country: string;
    phone: string;
    billingEmail: string;
  }) => void;
  onBack: () => void;
}

const africanCountries = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Zimbabwe',
  'Uganda', 'Tanzania', 'Cameroon', 'Senegal', 'Rwanda', 'Zambia',
  'Ivory Coast', 'Mozambique', 'Angola', 'Sudan', 'Malawi', 'Mali',
  'Burkina Faso', 'Niger', 'Madagascar', 'Chad', 'Somalia', 'Guinea',
  'Benin', 'Burundi', 'Tunisia', 'Togo', 'Sierra Leone', 'Libya',
  'Mauritania', 'Eritrea', 'Gambia', 'Botswana', 'Namibia', 'Gabon',
  'Lesotho', 'Guinea-Bissau', 'Equatorial Guinea', 'Mauritius',
  'Eswatini', 'Djibouti', 'Comoros', 'Cape Verde', 'Sao Tome and Principe',
  'Seychelles',
];

const otherCountries = [
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'China', 'Brazil', 'Other',
];

export default function OrganizationStep({ onNext, onBack }: OrganizationStepProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    organizationName: '',
    country: '',
    phone: '',
    billingEmail: user?.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationName || !formData.country || !formData.billingEmail) {
      return;
    }
    onNext(formData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell us about your organization</h2>
        <p className="text-gray-600">This information helps us personalize your experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="organizationName">Organization/Agency Name *</Label>
          <Input
            id="organizationName"
            value={formData.organizationName}
            onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
            placeholder="e.g. ABC Immigration Services"
            required
          />
          <p className="text-xs text-gray-500 mt-1">This is how your clients will see you</p>
        </div>

        <div>
          <Label htmlFor="country">Country *</Label>
          <Select
            value={formData.country}
            onValueChange={(value) => setFormData({ ...formData, country: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              <div>
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                  🌍 Africa
                </div>
                {africanCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </div>
              <div>
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                  🌎 Other
                </div>
                {otherCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+27 12 345 6789"
          />
        </div>

        <div>
          <Label htmlFor="billingEmail">Billing Email *</Label>
          <Input
            id="billingEmail"
            type="email"
            value={formData.billingEmail}
            onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
            placeholder="billing@example.com"
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#0F2557] hover:bg-[#0a1d42]"
            disabled={!formData.organizationName || !formData.country || !formData.billingEmail}
          >
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
