'use client';

import React, { useState } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const originCountries = [
  { group: '🌍 Africa', countries: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Zimbabwe', 'Uganda', 'Tanzania', 'Cameroon', 'Senegal', 'Rwanda', 'Zambia', 'Ivory Coast', 'Mozambique', 'Angola'] },
  { group: '🌍 Rest of World', countries: ['India', 'Pakistan', 'Philippines', 'Bangladesh', 'China', 'Brazil', 'USA', 'UK', 'France', 'Germany'] },
];

const destinationCountries = [
  'United Kingdom',
  'Canada',
  'United States',
  'Germany',
  'UAE',
  'Australia',
  'Netherlands',
  'Ireland',
];

const visaTypes = [
  { value: 'student', label: 'Student Visa' },
  { value: 'skilled_worker', label: 'Skilled Worker' },
  { value: 'family', label: 'Family Reunification' },
  { value: 'visitor', label: 'Visitor/Tourist' },
  { value: 'work_permit', label: 'Work Permit' },
  { value: 'business', label: 'Business Visa' },
];

function generateChecklistName(visaType: string | null, destination: string | null): string {
  if (!visaType || !destination) return 'Document Checklist';
  const visaLabel = visaTypes.find((v) => v.value === visaType)?.label || visaType;
  return `${visaLabel} - ${destination}`;
}

interface CreateChecklistDialogProps {
  caseId: string;
  onSuccess: () => void;
}

export default function CreateChecklistDialog({ caseId, onSuccess }: CreateChecklistDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiItems, setAiItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    visaType: '',
    originCountry: '',
    destinationCountry: '',
    additionalContext: '',
  });

  const handleVisaTypeChange = (value: string) => {
    setFormData({
      ...formData,
      visaType: value,
      name: generateChecklistName(value, formData.destinationCountry || null),
    });
  };

  const handleDestinationChange = (value: string) => {
    setFormData({
      ...formData,
      destinationCountry: value,
      name: generateChecklistName(formData.visaType || null, value || null),
    });
  };

  const handleGenerateAI = async () => {
    if (!formData.visaType || !formData.originCountry || !formData.destinationCountry) {
      toast.error('Please fill in visa type, origin country, and destination country');
      return;
    }

    try {
      setIsGenerating(true);
      const response = await immigrationApi.generateAIChecklist({
        visaType: formData.visaType,
        originCountry: formData.originCountry,
        destinationCountry: formData.destinationCountry,
        caseId,
        additionalContext: formData.additionalContext || undefined,
      });

      if (response.success && response.data) {
        setAiItems(response.data.items);
        setSelectedItems(new Set(response.data.items.map((item: any, idx: number) => idx.toString())));
        toast.success('Checklist generated successfully');
      } else {
        toast.error(response.error || 'Failed to generate checklist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate checklist');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAIChecklist = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item');
      return;
    }

    try {
      setIsSubmitting(true);
      // The checklist is already created by the AI endpoint if caseId was provided
      // We just need to refresh
      toast.success('Checklist created successfully');
      setIsOpen(false);
      setFormData({ name: '', visaType: '', originCountry: '', destinationCountry: '', additionalContext: '' });
      setAiItems([]);
      setSelectedItems(new Set());
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save checklist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.visaType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await immigrationApi.createChecklist({
        caseId,
        name: formData.name,
        visaType: formData.visaType,
        originCountry: formData.originCountry || undefined,
        destinationCountry: formData.destinationCountry || undefined,
      });

      if (response.success) {
        toast.success('Checklist created successfully');
        setIsOpen(false);
        setFormData({ name: '', visaType: '', originCountry: '', destinationCountry: '', additionalContext: '' });
        onSuccess();
      } else {
        toast.error(response.error || 'Failed to create checklist');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create checklist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Checklist</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Document Checklist</DialogTitle>
        </DialogHeader>
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'manual' | 'ai')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
          <div>
            <Label>Checklist Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter checklist name"
            />
          </div>

          <div>
            <Label>Visa Type *</Label>
            <Select value={formData.visaType} onValueChange={handleVisaTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select visa type" />
              </SelectTrigger>
              <SelectContent>
                {visaTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Origin Country</Label>
            <Select
              value={formData.originCountry}
              onValueChange={(value) => setFormData({ ...formData, originCountry: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select origin country" />
              </SelectTrigger>
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
          </div>

          <div>
            <Label>Destination Country</Label>
            <Select
              value={formData.destinationCountry}
              onValueChange={handleDestinationChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination country" />
              </SelectTrigger>
              <SelectContent>
                {destinationCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

            <p className="text-sm text-gray-500">
              Default items will be generated based on visa type
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Checklist
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <div>
              <Label>Visa Type *</Label>
              <Select value={formData.visaType} onValueChange={handleVisaTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visa type" />
                </SelectTrigger>
                <SelectContent>
                  {visaTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Origin Country *</Label>
              <Select
                value={formData.originCountry}
                onValueChange={(value) => setFormData({ ...formData, originCountry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select origin country" />
                </SelectTrigger>
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
            </div>

            <div>
              <Label>Destination Country *</Label>
              <Select
                value={formData.destinationCountry}
                onValueChange={handleDestinationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination country" />
                </SelectTrigger>
                <SelectContent>
                  {destinationCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Additional Context</Label>
              <Textarea
                value={formData.additionalContext}
                onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
                placeholder="Any specific circumstances? e.g. self-employed, gap years, previous refusals"
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerateAI}
              disabled={isGenerating || !formData.visaType || !formData.originCountry || !formData.destinationCountry}
              className="w-full bg-[#0F2557] hover:bg-[#0a1d42] text-amber-500"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI is generating your checklist...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with AI
                </>
              )}
            </Button>

            {aiItems.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">Preview Generated Items</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {aiItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedItems.has(idx.toString())}
                        onCheckedChange={(checked) => {
                          const newSet = new Set(selectedItems);
                          if (checked) {
                            newSet.add(idx.toString());
                          } else {
                            newSet.delete(idx.toString());
                          }
                          setSelectedItems(newSet);
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <Badge variant={item.isRequired ? 'default' : 'secondary'} className="text-xs">
                            {item.isRequired ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-amber-600 mt-1">Note: {item.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleGenerateAI}
                    disabled={isGenerating}
                  >
                    Regenerate
                  </Button>
                  <Button
                    onClick={handleSaveAIChecklist}
                    disabled={isSubmitting || selectedItems.size === 0}
                    className="flex-1"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Checklist ({selectedItems.size} items)
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
