'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Loader, Copy, Download } from 'lucide-react';
import FeedbackWidget from '@/components/FeedbackWidget';
import SuccessTracker from '@/components/SuccessTracker';
import PDFDownload from '@/components/PDFDownload';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ItineraryBuilderPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState('');
  
  const [formData, setFormData] = useState({
    applicantName: '',
    targetCountry: '',
    visaType: 'tourist',
    travelDates: '',
    cities: '',
    purpose: '',
    accommodation: '',
    activities: '',
    transportation: '',
    budget: '',
    travelCompanions: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.applicantName || !formData.targetCountry || !formData.travelDates || !formData.cities || !formData.purpose) {
      alert('Please fill required fields: Name, Target Country, Travel Dates, Cities, and Purpose');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-travel-itinerary`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedItinerary(data.data.itinerary);
      } else {
        alert(data.message || 'Failed to generate itinerary');
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert('Failed to generate itinerary. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedItinerary);
    alert('Itinerary copied!');
  };

  const downloadItinerary = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedItinerary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `travel_itinerary_${Date.now()}.txt`;
    element.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            <span>Travel Itinerary Builder</span>
          </h1>
          <p className="text-gray-600">Create a detailed travel itinerary for your visa application</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Travel Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="applicantName"
                  value={formData.applicantName}
                  onChange={handleInputChange}
                  placeholder="Your Full Name *"
                />
                <Input
                  name="targetCountry"
                  value={formData.targetCountry}
                  onChange={handleInputChange}
                  placeholder="Target Country *"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visa Type</label>
                <select
                  name="visaType"
                  value={formData.visaType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tourist">Tourist Visa</option>
                  <option value="visitor">Visitor Visa</option>
                  <option value="business">Business Visa</option>
                  <option value="family">Family Visit</option>
                  <option value="medical">Medical Visa</option>
                  <option value="conference">Conference/Event</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Travel Dates *</label>
                <Input
                  name="travelDates"
                  value={formData.travelDates}
                  onChange={handleInputChange}
                  placeholder="e.g., January 15 - February 5, 2025 (20 days)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cities to Visit *</label>
                <Input
                  name="cities"
                  value={formData.cities}
                  onChange={handleInputChange}
                  placeholder="e.g., Paris, Lyon, Nice (France)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Visit *</label>
                <Textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  placeholder="e.g., Tourism, visiting famous landmarks, experiencing French culture"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation</label>
                <Textarea
                  name="accommodation"
                  value={formData.accommodation}
                  onChange={handleInputChange}
                  placeholder="e.g., Hotel bookings, Airbnb, staying with friends/family (include names and addresses if applicable)"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Planned Activities</label>
                <Textarea
                  name="activities"
                  value={formData.activities}
                  onChange={handleInputChange}
                  placeholder="e.g., Visit Eiffel Tower, Louvre Museum, day trips, cultural events"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transportation</label>
                <Textarea
                  name="transportation"
                  value={formData.transportation}
                  onChange={handleInputChange}
                  placeholder="e.g., Flight tickets, train passes, car rental, local transport"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <Input
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="e.g., $5,000 USD (accommodation, food, activities, transport)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Travel Companions</label>
                <Input
                  name="travelCompanions"
                  value={formData.travelCompanions}
                  onChange={handleInputChange}
                  placeholder="e.g., Solo travel, with spouse, family of 3, friends"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generating Itinerary...
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 mr-2" />
                    Generate Travel Itinerary
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:sticky lg:top-8 h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Itinerary</CardTitle>
                {generatedItinerary && (
                  <div className="flex space-x-2">
                    <button onClick={copyToClipboard} className="p-2 hover:bg-gray-100 rounded-lg" title="Copy">
                      <Copy className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={downloadItinerary} className="p-2 hover:bg-gray-100 rounded-lg" title="Download">
                      <Download className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedItinerary ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 max-h-[600px] overflow-y-auto border border-gray-200">
                    <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm">
                      {generatedItinerary}
                    </pre>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <PDFDownload
                      content={generatedItinerary}
                      filename={`Travel_Itinerary_${formData.targetCountry || 'general'}_${formData.visaType || 'visa'}_${new Date().toISOString().split('T')[0]}.pdf`}
                      title="Travel Itinerary"
                      className="flex-1"
                    />
                    <Button
                      onClick={downloadItinerary}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download TXT
                    </Button>
                  </div>
                  
                  <FeedbackWidget
                    documentId={`travel_itinerary_${Date.now()}`}
                    documentType="travel_itinerary"
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                  
                  <SuccessTracker
                    documentId={`travel_itinerary_${Date.now()}`}
                    country={formData.targetCountry}
                    visaType={formData.visaType}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-300">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Itinerary Generated Yet</h4>
                  <p className="text-gray-600 text-sm">Fill in your travel details and generate the itinerary</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

