'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  RefreshCw, 
  Building,
  User,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchAccount, setSearchAccount] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [manualAccount, setManualAccount] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualReference, setManualReference] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState('');

  useEffect(() => {
    fetchPendingPayments();
    fetchStats();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/payments/pending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');

    if (!manualAccount.trim()) {
      setManualError('Account number is required');
      return;
    }

    const parsedAmount = parseFloat(manualAmount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setManualError('Amount must be a positive number');
      return;
    }

    try {
      setManualLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/payments/manual-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          accountNumber: manualAccount.trim(),
          amount: parsedAmount,
          bankReference: manualReference.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Payment verified and plan activated successfully!');
        setManualAccount('');
        setManualAmount('');
        setManualReference('');
        fetchPendingPayments();
        fetchStats();
      } else {
        setManualError(data.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Manual verification failed:', error);
      setManualError('Failed to verify payment');
    } finally {
      setManualLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/payments/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const searchByAccount = async () => {
    if (!searchAccount.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/admin/payments/search/${searchAccount}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setPayments(data.data);
      }
    } catch (error) {
      console.error('Failed to search payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          notes: verificationNotes
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Payment verified successfully!');
        setSelectedPayment(null);
        setVerificationNotes('');
        fetchPendingPayments();
        fetchStats();
      } else {
        alert('Failed to verify payment: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to verify payment:', error);
      alert('Failed to verify payment');
    }
  };

  const rejectPayment = async (paymentId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          reason: rejectionReason
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Payment rejected successfully!');
        setSelectedPayment(null);
        setRejectionReason('');
        fetchPendingPayments();
        fetchStats();
      } else {
        alert('Failed to reject payment: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to reject payment:', error);
      alert('Failed to reject payment');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Verification</h1>
          <p className="text-gray-600">Manage and verify customer payments</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Payments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total_payments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending_payments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed_payments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">R{(stats.total_revenue / 100).toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Manual verification form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Manual Bank Transfer Verification</CardTitle>
          </CardHeader>
          <CardContent>
            {manualError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{manualError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleManualVerify} className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="manual-account">Account Number</Label>
                <Input
                  id="manual-account"
                  value={manualAccount}
                  onChange={(e) => setManualAccount(e.target.value)}
                  placeholder="e.g. PA12345"
                  required
                />
              </div>
              <div>
                <Label htmlFor="manual-amount">Amount Received (ZAR)</Label>
                <Input
                  id="manual-amount"
                  type="number"
                  step="0.01"
                  value={manualAmount}
                  onChange={(e) => setManualAmount(e.target.value)}
                  placeholder="e.g. 149"
                  required
                />
              </div>
              <div>
                <Label htmlFor="manual-reference">Bank Reference (optional)</Label>
                <Input
                  id="manual-reference"
                  value={manualReference}
                  onChange={(e) => setManualReference(e.target.value)}
                  placeholder="e.g. POP123"
                />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" disabled={manualLoading}>
                  {manualLoading ? 'Verifying...' : 'Confirm Payment & Activate Plan'}
                </Button>
              </div>
            </form>
            <p className="text-xs text-slate-500 mt-3">
              Use this form for deposits that appear in your bank statement. The system will match the account number with
              the pending subscription and activate the user automatically.
            </p>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex space-x-4">
              <Input
                placeholder="Search by account number (e.g., MA12367)"
                value={searchAccount}
                onChange={(e) => setSearchAccount(e.target.value)}
                className="flex-1"
              />
              <Button onClick={searchByAccount}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" onClick={fetchPendingPayments}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending payments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{payment.full_name}</p>
                            <p className="text-sm text-gray-600">{payment.email}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Account Number</p>
                            <p className="font-mono font-semibold text-blue-600">{payment.account_number}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Plan</p>
                            <p className="font-semibold capitalize">{payment.plan}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Amount</p>
                            <p className="font-semibold">R{(payment.amount / 100).toFixed(2)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="text-sm">{new Date(payment.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedPayment(payment)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPayment(payment)}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Payment Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Customer: {selectedPayment.full_name}</p>
                  <p className="text-sm text-gray-600">Account: {selectedPayment.account_number}</p>
                  <p className="text-sm text-gray-600">Plan: {selectedPayment.plan}</p>
                  <p className="text-sm text-gray-600">Amount: R{(selectedPayment.amount / 100).toFixed(2)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes
                  </label>
                  <Textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add notes about the verification..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={() => verifyPayment(selectedPayment.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verify Payment
                  </Button>
                  <Button
                    onClick={() => rejectPayment(selectedPayment.id)}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject Payment
                  </Button>
                  <Button
                    onClick={() => setSelectedPayment(null)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}





