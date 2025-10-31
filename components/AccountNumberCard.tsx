'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PaymentModal from './PaymentModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AccountNumberCard() {
  const { user } = useAuth();
  const [accountNumber, setAccountNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAccountNumber();
    }
  }, [user]);

  const fetchAccountNumber = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/payments/account-number`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccountNumber(data.accountNumber);
        setError(null);
      } else {
        setError('Failed to fetch account number');
      }
    } catch (error) {
      setError('Error fetching account number');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Your Account Number</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          ) : error ? (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <Button size="sm" variant="outline" onClick={fetchAccountNumber}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Account Number Display */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Account Number</p>
                    <p className="text-2xl font-bold text-blue-600 font-mono">
                      {accountNumber}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(accountNumber || '')}
                    className="h-8 px-3"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                size="lg"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                View Payment Details & Upload Proof
              </Button>

              {/* Support */}
              <div className="text-center space-y-3">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-800 font-semibold flex items-center justify-center">
                    <span>🛡️ 100% Money-Back Guarantee</span>
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Not satisfied? Full refund within 7 days
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Need help? Contact support with your Account Number: <strong>{accountNumber}</strong>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        accountNumber={accountNumber || ''}
      />
    </>
  );
}