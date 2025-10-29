'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Send, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp
} from 'lucide-react';

interface SuccessTrackerProps {
  documentId?: string;
  country: string;
  visaType: string;
  onStatusUpdated?: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const statusOptions = [
  { value: 'preparing', label: '📝 Preparing Documents', icon: FileText, color: 'text-blue-600' },
  { value: 'submitted', label: '📮 Submitted', icon: Send, color: 'text-yellow-600' },
  { value: 'interview', label: '🎤 Interview Scheduled', icon: Calendar, color: 'text-purple-600' },
  { value: 'approved', label: '✅ Approved!', icon: CheckCircle, color: 'text-green-600' },
  { value: 'rejected', label: '❌ Rejected', icon: XCircle, color: 'text-red-600' },
];

export default function SuccessTracker({ 
  documentId, 
  country, 
  visaType,
  onStatusUpdated 
}: SuccessTrackerProps) {
  const [currentStatus, setCurrentStatus] = useState<string>('preparing');
  const [outcome, setOutcome] = useState<string>('');
  const [outcomeDate, setOutcomeDate] = useState<string>('');
  const [processingDays, setProcessingDays] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);

  useEffect(() => {
    // Load existing application status
    loadApplicationStatus();
  }, [documentId, country, visaType]);

  const loadApplicationStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/my-applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const app = data.data.find((a: any) => 
          a.country === country && a.visaType === visaType
        );
        if (app) {
          setCurrentStatus(app.status);
          setOutcome(app.outcome || '');
          setOutcomeDate(app.outcomeDate ? app.outcomeDate.split('T')[0] : '');
          setProcessingDays(app.processingTimeDays || 0);
          setNotes(app.notes || '');
        }
      }
    } catch (error) {
      console.error('Error loading application status:', error);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/application-status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          documentId,
          status: newStatus,
          country,
          visaType,
          outcome: newStatus === 'approved' || newStatus === 'rejected' ? newStatus : undefined,
          outcomeDate: (newStatus === 'approved' || newStatus === 'rejected') ? outcomeDate : undefined,
          processingTimeDays: processingDays || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentStatus(newStatus);
        onStatusUpdated?.();
        
        if (newStatus === 'approved' || newStatus === 'rejected') {
          setShowOutcomeForm(true);
        }
      } else {
        alert('Failed to update status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please check your connection.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.icon : FileText;
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'text-gray-600';
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Track Your Application</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          {country.toUpperCase()} {visaType.replace('_', ' ').toUpperCase()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          {React.createElement(getStatusIcon(currentStatus), { 
            className: `w-6 h-6 ${getStatusColor(currentStatus)}` 
          })}
          <div>
            <p className="font-medium text-gray-900">
              {statusOptions.find(opt => opt.value === currentStatus)?.label}
            </p>
            <p className="text-sm text-gray-500">
              Current Status
            </p>
          </div>
        </div>

        {/* Status Update Buttons */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Update Status:</p>
          <div className="grid grid-cols-2 gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => handleStatusUpdate(option.value)}
                disabled={isUpdating || currentStatus === option.value}
                variant={currentStatus === option.value ? "default" : "outline"}
                className={`text-xs ${
                  currentStatus === option.value 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Outcome Form */}
        {(currentStatus === 'approved' || currentStatus === 'rejected') && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium text-gray-900">Application Outcome Details</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outcome Date
                </label>
                <input
                  type="date"
                  value={outcomeDate}
                  onChange={(e) => setOutcomeDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processing Time (days)
                </label>
                <input
                  type="number"
                  value={processingDays}
                  onChange={(e) => setProcessingDays(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g., 45"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={2}
                placeholder="Any additional details about your application..."
              />
            </div>

            <Button
              onClick={() => handleStatusUpdate(currentStatus)}
              disabled={isUpdating}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600"
            >
              {isUpdating ? 'Updating...' : 'Save Outcome Details'}
            </Button>
          </div>
        )}

        {isUpdating && (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Clock className="w-4 h-4 animate-spin" />
            <span className="text-sm">Updating status...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
