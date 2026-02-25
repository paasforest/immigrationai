'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import CreateCaseForm from '@/components/immigration/cases/CreateCaseForm';

export default function NewCasePage() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link href="/dashboard/immigration/cases">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cases
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Case</h1>
        <p className="text-gray-600 mt-1">Create a new immigration case</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
            <CardDescription>
              Fill in the information below to create a new case
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCaseForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
