'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, MessageSquare, CheckCircle } from 'lucide-react';

interface FeedbackWidgetProps {
  documentId: string;
  documentType: string;
  country?: string;
  visaType?: string;
  onFeedbackSubmitted?: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function FeedbackWidget({ 
  documentId, 
  documentType, 
  country, 
  visaType,
  onFeedbackSubmitted 
}: FeedbackWidgetProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (selectedRating: number) => {
    setRating(selectedRating);
    if (selectedRating <= 3) {
      setShowCommentBox(true);
    }
  };

  const handleSubmit = async () => {
    if (!rating) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/feedback/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          documentId,
          rating,
          comment: comment.trim() || undefined,
          documentType,
          country,
          visaType,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitted(true);
        onFeedbackSubmitted?.();
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Thank you for your feedback!</span>
        </div>
        <p className="text-sm text-green-600 mt-1">
          Your input helps us improve our AI-generated documents.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Was this document helpful?
        </p>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className={`p-2 rounded-lg transition-all ${
                rating === star
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
              disabled={isSubmitting}
            >
              {star <= 2 ? (
                <ThumbsDown className="w-5 h-5" />
              ) : star <= 3 ? (
                <MessageSquare className="w-5 h-5" />
              ) : (
                <ThumbsUp className="w-5 h-5" />
              )}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Not helpful</span>
          <span>Very helpful</span>
        </div>
      </div>

      {showCommentBox && (
        <div className="mb-4">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How can we improve this document? What specific changes would make it better?"
            rows={3}
            className="w-full"
          />
        </div>
      )}

      {rating && (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          {isSubmitting ? (
            'Submitting...'
          ) : (
            'Submit Feedback'
          )}
        </Button>
      )}
    </div>
  );
}
