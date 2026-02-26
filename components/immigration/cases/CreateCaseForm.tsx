'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { immigrationApi } from '@/lib/api/immigration';
import { OrgUser } from '@/types/immigration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const createCaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  visaType: z.enum(['student', 'skilled_worker', 'family', 'visitor', 'work_permit', 'business']),
  originCountry: z.string().min(1, 'Origin country is required'),
  destinationCountry: z.string().min(1, 'Destination country is required'),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).default('normal'),
  assignedProfessionalId: z.string().optional(),
  submissionDeadline: z.date().optional(),
  notes: z.string().optional(),
});

type CreateCaseFormValues = z.infer<typeof createCaseSchema>;

const originCountries = [
  { group: '🌍 Africa', countries: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Zimbabwe', 'Uganda', 'Tanzania', 'Cameroon', 'Senegal', 'Rwanda', 'Zambia', 'Ivory Coast', 'Mozambique', 'Angola'] },
  { group: '🌍 Rest of World', countries: ['India', 'Pakistan', 'Philippines', 'Bangladesh', 'China', 'Brazil', 'USA', 'UK', 'France', 'Germany'] },
];

const destinationCountries = [
  'United Kingdom 🇬🇧',
  'Canada 🇨🇦',
  'United States 🇺🇸',
  'Germany 🇩🇪',
  'UAE 🇦🇪',
  'Australia 🇦🇺',
  'Netherlands 🇳🇱',
  'Ireland 🇮🇪',
];

const visaTypes = [
  { value: 'student', label: 'Student Visa' },
  { value: 'skilled_worker', label: 'Skilled Worker' },
  { value: 'family', label: 'Family Reunification' },
  { value: 'visitor', label: 'Visitor/Tourist' },
  { value: 'work_permit', label: 'Work Permit' },
  { value: 'business', label: 'Business Visa' },
];

const priorities = [
  { value: 'urgent', label: '🔴 Urgent', color: 'text-red-600' },
  { value: 'high', label: '🟠 High', color: 'text-orange-600' },
  { value: 'normal', label: '⚪ Normal', color: 'text-gray-600' },
  { value: 'low', label: '🔵 Low', color: 'text-blue-600' },
];

export default function CreateCaseForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);

  const form = useForm<CreateCaseFormValues>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      priority: 'normal',
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await immigrationApi.getOrgUsers();
        if (response.success && response.data) {
          // Filter to only org_admin and professional roles
          const filtered = response.data.filter(
            (user) => user.organizationRole === 'org_admin' || user.organizationRole === 'professional'
          );
          setOrgUsers(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  const onSubmit = async (data: CreateCaseFormValues) => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...data,
        submissionDeadline: data.submissionDeadline
          ? data.submissionDeadline.toISOString()
          : undefined,
      };

      const response = await immigrationApi.createCase(payload);

      if (response.success && response.data) {
        toast.success('Case created successfully');
        router.push(`/dashboard/immigration/cases/${response.data.id}`);
      } else {
        toast.error(response.error || 'Failed to create case');
      }
    } catch (error: any) {
      console.error('Error creating case:', error);
      toast.error(error.message || 'Failed to create case');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter case title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Visa Type */}
        <FormField
          control={form.control}
          name="visaType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visa Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {visaTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Origin Country */}
        <FormField
          control={form.control}
          name="originCountry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origin Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {originCountries.map((group) => (
                    <div key={group.group}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">
                        {group.group}
                      </div>
                      {group.countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Destination Country */}
        <FormField
          control={form.control}
          name="destinationCountry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {destinationCountries.map((country) => (
                    <SelectItem key={country} value={country.split(' ')[0]}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Assigned Professional */}
        <FormField
          control={form.control}
          name="assignedProfessionalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Professional</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select professional (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {orgUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <span>{user.fullName}</span>
                        <span className="text-xs text-gray-500">
                          ({user.organizationRole === 'org_admin' ? 'Admin' : 'Professional'})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className={priority.color}>{priority.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submission Deadline */}
        <FormField
          control={form.control}
          name="submissionDeadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Submission Deadline</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Case
          </Button>
        </div>
      </form>
    </Form>
  );
}
