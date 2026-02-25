'use client';

import { useState } from 'react';
import { checkIntakeStatus, type StatusResult } from '@/lib/api/publicIntake';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Loader2,
  Eye,
  CheckCircle2,
  Info,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface StatusCheckerProps {
  initialRef?: string;
}

export default function StatusChecker({ initialRef }: StatusCheckerProps) {
  const [referenceNumber, setReferenceNumber] = useState(initialRef || '');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<StatusResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber || !email) {
      setError('Please enter both reference number and email');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const data = await checkIntakeStatus(referenceNumber, email);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Reference number or email not found');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!result) return null;

    switch (result.status) {
      case 'pending_assignment':
        return (
          <Card className="bg-amber-50 border border-amber-200 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Loader2 className="w-6 h-6 text-amber-600 animate-spin flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Finding Your Specialist</h3>
                  <p className="text-amber-800 text-sm">
                    We are matching you with the best available specialist. This usually takes a
                    few hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'assigned':
        return (
          <Card className="bg-blue-50 border border-blue-200 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Eye className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Specialist Found</h3>
                  <p className="text-blue-800 text-sm">
                    A specialist has been assigned and is reviewing your case. You will hear from
                    them within 24 hours.
                  </p>
                  {result.expiresAt && (
                    <p className="text-xs text-blue-700 mt-2">
                      Assignment expires: {new Date(result.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'converted':
        return (
          <Card className="bg-green-50 border border-green-200 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Specialist Assigned!</h3>
                  <p className="text-green-800 text-sm mb-3">
                    Your specialist has accepted your case. Check your email for their contact
                    details.
                  </p>
                  {result.caseReference && (
                    <div className="inline-flex items-center gap-2 bg-[#0F2557] bg-opacity-10 rounded-full px-3 py-1">
                      <span className="text-xs font-mono text-[#0F2557] font-semibold">
                        Case: {result.caseReference}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'declined_all':
      case 'no_match_found':
        return (
          <Card className="bg-[#0F2557] bg-opacity-5 border border-[#0F2557] border-opacity-20 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-[#0F2557] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-[#0F2557] mb-2">We&apos;re Working On It</h3>
                  <p className="text-gray-700 text-sm">
                    Our team is personally reviewing your request. We will contact you directly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="bg-gray-50 border border-gray-200 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Status: {result.status}</h3>
                  <p className="text-gray-700 text-sm">
                    Your request is being processed. We&apos;ll update you soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow rounded-xl">
        <CardContent className="p-6 max-w-md mx-auto">
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="INT-2025-847392"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email used when submitting"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#0F2557] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Status'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-50 border border-red-200 rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Error</h3>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="mt-6">
          {getStatusDisplay()}
          <div className="mt-4 text-center text-sm text-gray-600">
            <p>
              Submitted: {new Date(result.submittedAt).toLocaleDateString()} at{' '}
              {new Date(result.submittedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
