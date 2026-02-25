'use client';

import { useState, useEffect } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { type Service, type ProfessionalSpecialization } from '@/types/immigration';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const originCountries = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Ethiopia',
  'Zimbabwe',
  'Uganda',
  'Tanzania',
  'Cameroon',
  'Senegal',
  'Rwanda',
  'Zambia',
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

interface ServiceSpecializationCardProps {
  service: Service;
  specialization: ProfessionalSpecialization | undefined;
  onUpdate: () => void;
}

export default function ServiceSpecializationCard({
  service,
  specialization,
  onUpdate,
}: ServiceSpecializationCardProps) {
  const [isExpanded, setIsExpanded] = useState(!!specialization);
  const [originCorridors, setOriginCorridors] = useState<string[]>(
    specialization?.originCorridors || []
  );
  const [destinationCorridors, setDestinationCorridors] = useState<string[]>(
    specialization?.destinationCorridors || []
  );
  const [maxConcurrentLeads, setMaxConcurrentLeads] = useState<number>(
    specialization?.maxConcurrentLeads || 10
  );
  const [yearsExperience, setYearsExperience] = useState<number | undefined>(
    specialization?.yearsExperience
  );
  const [bio, setBio] = useState<string>(specialization?.bio || '');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (specialization) {
      setOriginCorridors(specialization.originCorridors);
      setDestinationCorridors(specialization.destinationCorridors);
      setMaxConcurrentLeads(specialization.maxConcurrentLeads);
      setYearsExperience(specialization.yearsExperience);
      setBio(specialization.bio || '');
      setIsExpanded(true);
    }
  }, [specialization]);

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      setIsExpanded(true);
    } else {
      if (specialization) {
        setShowDeleteConfirm(true);
      } else {
        setIsExpanded(false);
      }
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await immigrationApi.upsertSpecialization({
        serviceId: service.id,
        originCorridors,
        destinationCorridors,
        maxConcurrentLeads,
        yearsExperience,
        bio: bio.trim() || undefined,
        isAcceptingLeads: true,
      });

      if (response.success) {
        toast.success('✓ Saved', { duration: 2000 });
        onUpdate();
      } else {
        toast.error('Failed to save specialization');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save specialization');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!specialization) return;

    try {
      const response = await immigrationApi.deleteSpecialization(specialization.id);
      if (response.success) {
        toast.success('Specialization removed');
        setIsExpanded(false);
        onUpdate();
      } else {
        toast.error('Failed to delete specialization');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete specialization');
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Card className="border rounded-xl mb-4">
        <CardContent className="p-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="font-bold">{service.name}</span>
            </div>
            <Switch checked={!!specialization} onCheckedChange={handleToggle} />
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <p className="text-sm text-gray-500">
                Leave origin and destination empty to accept from any country or any destination
              </p>

              {/* Origin Countries */}
              <div>
                <Label className="mb-3 block">Origin countries (where clients apply from)</Label>
                <div className="flex items-center gap-2 mb-3">
                  <Checkbox
                    id={`any-origin-${service.id}`}
                    checked={originCorridors.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setOriginCorridors([]);
                      }
                    }}
                  />
                  <Label htmlFor={`any-origin-${service.id}`} className="cursor-pointer">
                    Any country
                  </Label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {originCountries.map((country) => (
                    <div key={country} className="flex items-center gap-2">
                      <Checkbox
                        id={`origin-${service.id}-${country}`}
                        checked={originCorridors.includes(country)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setOriginCorridors([...originCorridors, country]);
                          } else {
                            setOriginCorridors(originCorridors.filter((c) => c !== country));
                          }
                        }}
                        disabled={originCorridors.length === 0}
                      />
                      <Label
                        htmlFor={`origin-${service.id}-${country}`}
                        className="cursor-pointer text-sm"
                      >
                        {country}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination Countries */}
              <div>
                <Label className="mb-3 block">Destinations you cover</Label>
                <div className="flex items-center gap-2 mb-3">
                  <Checkbox
                    id={`any-dest-${service.id}`}
                    checked={destinationCorridors.length === 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setDestinationCorridors([]);
                      }
                    }}
                  />
                  <Label htmlFor={`any-dest-${service.id}`} className="cursor-pointer">
                    Any destination
                  </Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {destinationCountries.map((country) => (
                    <div key={country} className="flex items-center gap-2">
                      <Checkbox
                        id={`dest-${service.id}-${country}`}
                        checked={destinationCorridors.includes(country)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDestinationCorridors([...destinationCorridors, country]);
                          } else {
                            setDestinationCorridors(
                              destinationCorridors.filter((c) => c !== country)
                            );
                          }
                        }}
                        disabled={destinationCorridors.length === 0}
                      />
                      <Label
                        htmlFor={`dest-${service.id}-${country}`}
                        className="cursor-pointer text-sm"
                      >
                        {country}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Max Concurrent Leads and Experience */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`max-leads-${service.id}`}>Max concurrent leads</Label>
                  <Input
                    id={`max-leads-${service.id}`}
                    type="number"
                    min={1}
                    max={50}
                    value={maxConcurrentLeads}
                    onChange={(e) => setMaxConcurrentLeads(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor={`experience-${service.id}`}>Years experience (optional)</Label>
                  <Input
                    id={`experience-${service.id}`}
                    type="number"
                    min={0}
                    value={yearsExperience || ''}
                    onChange={(e) =>
                      setYearsExperience(e.target.value ? Number(e.target.value) : undefined)
                    }
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor={`bio-${service.id}`}>
                  Service bio (optional) - Your experience with {service.name}
                </Label>
                <Textarea
                  id={`bio-${service.id}`}
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={`Your experience with ${service.name}...`}
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">{bio.length}/300 characters</p>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-[#0F2557] text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save ${service.name} Settings`
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop receiving {service.name} leads?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? You will no longer receive leads for this service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
