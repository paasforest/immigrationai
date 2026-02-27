'use client';

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building2,
  Loader2,
  Copy,
  Mail,
  CheckCircle,
  Upload,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { immigrationApi } from '@/lib/api/immigration';

interface PaymentMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
  billingCycle: 'monthly' | 'annual';
  amount: number; // in cents
}

interface BankDetails {
  bank: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  reference: string;
  amount: string;
  plan: string;
  instructions: string[];
}

export default function PaymentMethodSelector({
  isOpen,
  onClose,
  plan,
  billingCycle,
  amount,
}: PaymentMethodSelectorProps) {
  const [step, setStep] = useState<'confirm' | 'details' | 'upload' | 'done'>('confirm');
  const [isLoading, setIsLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const planLabel = `${plan.charAt(0).toUpperCase() + plan.slice(1)} – ${billingCycle === 'monthly' ? 'Monthly' : 'Annual'}`;
  const amountDisplay = `R${(amount / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

  const handleGetBankDetails = async () => {
    setIsLoading(true);
    try {
      const response = await immigrationApi.initiatePayment({ plan, paymentMethod: 'bank_transfer', billingCycle });
      if (response.success && response.data?.bankDetails) {
        setBankDetails(response.data.bankDetails);
        setStep('details');
      } else {
        toast.error(response.error || 'Failed to generate payment details');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!bankDetails) return;
    const text = [
      `Bank: ${bankDetails.bank}`,
      `Account Name: ${bankDetails.accountName}`,
      `Account Number: ${bankDetails.accountNumber}`,
      `Branch Code: ${bankDetails.branchCode}`,
      `Reference: ${bankDetails.reference}`,
      `Amount: R${bankDetails.amount}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Banking details copied to clipboard');
  };

  const handleEmail = () => {
    if (!bankDetails) return;
    const subject = `ImmigrationAI Payment – ${planLabel}`;
    const body = [
      `Please use these details to complete your EFT payment:`,
      ``,
      `Bank: ${bankDetails.bank}`,
      `Account Name: ${bankDetails.accountName}`,
      `Account Number: ${bankDetails.accountNumber}`,
      `Branch Code: ${bankDetails.branchCode}`,
      `Reference: ${bankDetails.reference}  ← use exactly as shown`,
      `Amount: R${bankDetails.amount}`,
      ``,
      `Plan: ${planLabel}`,
    ].join('\n');
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleUploadProof = async (file: File) => {
    setUploadLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const formData = new FormData();
      formData.append('proof', file);

      const res = await fetch(`${API_BASE}/api/payments/upload-proof`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        setProofUploaded(true);
        setStep('done');
        toast.success('Proof uploaded! We\'ll activate your account within 1–2 business days.');
      } else {
        toast.error(json.message || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUploadProof(file);
  };

  const handleClose = () => {
    setStep('confirm');
    setBankDetails(null);
    setProofUploaded(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0F2557]" />
            EFT / Bank Transfer
          </DialogTitle>
        </DialogHeader>

        {/* ── Step 1: Confirm ── */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold text-gray-900">{planLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-lg text-[#0F2557]">{amountDisplay}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              We'll generate your unique reference number. Use it when making the EFT so we can match your payment automatically.
            </p>
            <Button
              onClick={handleGetBankDetails}
              disabled={isLoading}
              className="w-full bg-[#0F2557] hover:bg-[#1a3570]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Building2 className="w-4 h-4 mr-2" />}
              Get Banking Details
            </Button>
          </div>
        )}

        {/* ── Step 2: Bank details ── */}
        {step === 'details' && bankDetails && (
          <div className="space-y-4">
            <div className="bg-gray-50 border rounded-lg p-4 space-y-3 text-sm">
              {[
                ['Bank', bankDetails.bank],
                ['Account Name', bankDetails.accountName],
                ['Account Number', bankDetails.accountNumber],
                ['Branch Code', bankDetails.branchCode],
                ['Amount', `R${bankDetails.amount}`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
              <div className="pt-2 border-t flex justify-between items-center">
                <span className="text-gray-500">Reference</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F2557] font-mono text-base tracking-wider">{bankDetails.reference}</span>
                  <Badge className="bg-amber-100 text-amber-800 text-[10px]">USE EXACTLY</Badge>
                </div>
              </div>
            </div>

            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800 text-xs">
                ⚠ Always use <strong>{bankDetails.reference}</strong> as your reference. Without it we cannot match your payment.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1">
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleEmail} className="flex-1">
                <Mail className="w-3.5 h-3.5 mr-1.5" /> Email Me
              </Button>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2 text-center">Already paid? Upload your proof to activate faster.</p>
              <Button
                onClick={() => setStep('upload')}
                variant="outline"
                className="w-full border-[#0F2557] text-[#0F2557]"
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Proof of Payment
              </Button>
            </div>

            <p className="text-[10px] text-gray-400 text-center">
              Account activates within 1–2 business days after payment is verified
            </p>
          </div>
        )}

        {/* ── Step 3: Upload proof ── */}
        {step === 'upload' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload your bank transfer confirmation (screenshot or PDF). This speeds up verification to a few hours.
            </p>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#0F2557] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-[#0F2557] mx-auto" />
              ) : (
                <>
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF — max 5 MB</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="ghost" size="sm" onClick={() => setStep('details')} className="w-full text-gray-500">
              ← Back to banking details
            </Button>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === 'done' && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Proof Received!</h3>
              <p className="text-sm text-gray-600 mt-1">
                Our team will verify your payment and activate your account within <strong>1–2 business days</strong>.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-800">
              You'll receive an email at your registered address once activated.
            </div>
            <Button onClick={handleClose} className="w-full bg-[#0F2557] hover:bg-[#1a3570]">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
