'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Building, CreditCard, X, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PaymentProofUpload from './PaymentProofUpload';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountNumber?: string;
}

export default function PaymentModal({ isOpen, onClose, accountNumber: propAccountNumber }: PaymentModalProps) {
  const { user } = useAuth();
  const [accountNumber, setAccountNumber] = useState<string>(propAccountNumber || '');
  const [loading, setLoading] = useState(false);

  // Update account number when prop changes
  React.useEffect(() => {
    if (propAccountNumber) {
      setAccountNumber(propAccountNumber);
    }
  }, [propAccountNumber]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl font-bold">Payment Information</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Number Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Your Account Number
            </h3>
            
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">Account Number:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-lg font-bold text-blue-600 bg-white px-3 py-1 rounded border">
                      {accountNumber || 'Loading...'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(accountNumber)}
                      className="h-8 px-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bank Details Section */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-gray-600" />
              Bank Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Bank:</span>
                <p className="font-semibold">First National Bank (FNB)</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Account Name:</span>
                <p className="font-semibold">Immigration AI (Pty) Ltd</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Account Number:</span>
                <p className="font-mono font-semibold">1234567890</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Branch Code:</span>
                <p className="font-mono font-semibold">250655</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-600">Reference:</span>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded border">
                    {accountNumber || 'Not available'}
                  </span>
                  {accountNumber && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(accountNumber)}
                      className="h-8 px-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2">Payment Instructions</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Use your Account Number as the reference</li>
              <li>• Make payment from any South African bank</li>
              <li>• Upload proof of payment below for instant activation</li>
              <li>• Your account will be activated immediately</li>
              <li>• Keep proof of payment for your records</li>
            </ul>
          </div>

          {/* Money-Back Guarantee */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 mb-1">100% Money-Back Guarantee</h4>
                <p className="text-sm text-green-800">
                  Not satisfied with our service? Get a full refund within 7 days, no questions asked. 
                  We're confident you'll love our platform, or your money back.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Proof Upload */}
          <div>
            <PaymentProofUpload 
              onUploadSuccess={() => {
                // Close modal after successful upload
                onClose();
                // Refresh the page to show updated account status
                window.location.reload();
              }}
            />
          </div>

          {/* Support Information */}
          <div className="text-center bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Need help? Contact support with your Account Number: <strong>{accountNumber || 'Not available'}</strong>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
