'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Building2, Loader2, Copy, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { immigrationApi } from '@/lib/api/immigration';

interface PaymentMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
  billingCycle: 'monthly' | 'annual';
  amount: number;
}

interface BankDetails {
  bank: string;
  accountNumber: string;
  accountName: string;
  reference: string;
}

export default function PaymentMethodSelector({
  isOpen,
  onClose,
  plan,
  billingCycle,
  amount,
}: PaymentMethodSelectorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const handlePaymentMethod = async (method: string) => {
    try {
      setIsProcessing(true);
      const response = await immigrationApi.initiatePayment({
        plan,
        paymentMethod: method,
        billingCycle,
      });

      if (response.success && response.data) {
        if (method === 'bank_transfer' && response.data.bankDetails) {
          setBankDetails(response.data.bankDetails);
          setShowBankDetails(true);
        } else if (response.data.paymentUrl) {
          // Redirect to payment provider
          window.location.href = response.data.paymentUrl;
        } else if (response.data.clientSecret) {
          // Handle Stripe payment intent
          toast.info('Stripe integration coming soon');
        }
      } else {
        toast.error(response.error || 'Failed to initiate payment');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyBankDetails = () => {
    if (!bankDetails) return;
    const text = `Bank: ${bankDetails.bank}\nAccount: ${bankDetails.accountNumber}\nAccount Name: ${bankDetails.accountName}\nReference: ${bankDetails.reference}`;
    navigator.clipboard.writeText(text);
    toast.success('Banking details copied to clipboard');
  };

  const handleEmailBankDetails = () => {
    if (!bankDetails) return;
    const subject = 'Banking Details for Payment';
    const body = `Please use the following banking details to complete your payment:\n\nBank: ${bankDetails.bank}\nAccount Number: ${bankDetails.accountNumber}\nAccount Name: ${bankDetails.accountName}\nReference: ${bankDetails.reference}\n\nAmount: R${amount.toLocaleString()}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (showBankDetails && bankDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bank Transfer Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div>
                <p className="text-sm text-gray-600">Bank</p>
                <p className="font-medium">{bankDetails.bank}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="font-medium font-mono">{bankDetails.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Name</p>
                <p className="font-medium">{bankDetails.accountName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reference</p>
                <p className="font-medium font-mono">{bankDetails.reference}</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-bold text-lg">R{amount.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopyBankDetails} className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                Copy Details
              </Button>
              <Button variant="outline" onClick={handleEmailBankDetails} className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Email Me
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Payment will be activated within 1-2 business days after receipt
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Payment Method</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Card
            className="cursor-pointer hover:border-[#0F2557] transition-colors"
            onClick={() => handlePaymentMethod('payfast')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Pay with PayFast</p>
                  <p className="text-sm text-gray-500">Visa, Mastercard, EFT, Instant EFT</p>
                </div>
              </div>
              {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-[#0F2557] transition-colors"
            onClick={() => handlePaymentMethod('yoco')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Pay with Yoco</p>
                  <p className="text-sm text-gray-500">Card payments</p>
                </div>
              </div>
              {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-[#0F2557] transition-colors"
            onClick={() => handlePaymentMethod('stripe')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Pay with Card (International)</p>
                  <p className="text-sm text-gray-500">For non-South African cards</p>
                </div>
              </div>
              {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-[#0F2557] transition-colors"
            onClick={() => handlePaymentMethod('bank_transfer')}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Bank Transfer (EFT)</p>
                  <p className="text-sm text-gray-500">Manual — 1-2 business days to activate</p>
                </div>
              </div>
              {isProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
