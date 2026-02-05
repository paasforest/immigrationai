'use client';

import React from 'react';
import Link from 'next/link';
import { ClipboardCheck, FileText, Mic, Shield, Users, Zap, CheckCircle } from 'lucide-react';

const pillars = [
  {
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    title: 'SOP Generator',
    description:
      'Create compelling Statements of Purpose tailored to each destination and intent with structured AI prompts and saved drafts.',
  },
  {
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    title: 'Cover Letter Writer',
    description:
      'Generate embassy-ready letters that highlight qualifications, sponsorship strength, and travel history in minutes.',
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-blue-600" />,
    title: 'SOP Reviewer',
    description:
      'Upload an existing draft and get immediate scoring plus actionable edits before the next consultation.',
  },
  {
    icon: <ClipboardCheck className="w-6 h-6 text-blue-600" />,
    title: 'Document Checklist',
    description:
      'Country-specific requirement tracking so applicants and admins never miss a proof-of-funds letter or police clearance.',
  },
  {
    icon: <Mic className="w-6 h-6 text-blue-600" />,
    title: 'Interview & Test Coach',
    description:
      'Mock interview sessions, IELTS-style questions, and AI feedback history to spot weak spots early.',
  },
  {
    icon: <ClipboardCheck className="w-6 h-6 text-blue-600" />,
    title: 'Admin & Tracking',
    description:
      'Manual payment approval, eligibility logs, and UTM analytics so finance and marketing stay aligned.',
  },
];

const solutions = [
  {
    label: 'Applicants & students',
    detail: 'Draft cleaner statements, check requirements, and rehearse interviews without waiting on email replies.',
  },
  {
    label: 'Consultants & agencies',
    detail: 'Standardize templates, keep reviewers in sync, and manage multiple clients inside one admin console.',
  },
  {
    label: 'Mobility & HR teams',
    detail: 'Blend internal processes with AI guidance, export summaries, and prove payment or document status in minutes.',
  },
];

export default function AboutPageClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-blue-600 font-semibold mb-2 uppercase tracking-wide">About Immigration AI</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Immigration tooling that stays honest</h1>
          <p className="text-lg text-slate-600">
            We do one thing well: give applicants and administrators a workspace to prepare documents, collect reviews, and
            keep immigration tasks moving. No inflated metrics, no unrealistic promises—just practical software.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <section className="bg-white rounded-3xl border shadow-sm px-6 sm:px-10 py-10">
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">What the product includes today</h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            Immigration AI started as a SOP helper. It now covers document building, interview prep, payment tracking, and admin
            analytics. The entire workspace runs on secured infrastructure, and every feature ships with documentation inside the
            product and in the repository.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-6">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow mb-3">{pillar.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{pillar.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 text-white rounded-3xl px-8 py-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-blue-300 font-semibold uppercase text-xs tracking-[0.25em] mb-3">Who we build for</p>
              <h2 className="text-3xl font-bold mb-4">Applicants on one side, admins on the other</h2>
              <p className="text-slate-200 leading-relaxed">
                Individuals care about writing and confidence. Admins care about traceability and speed. Immigration AI threads
                both needs together: the same platform powers interview coaching for applicants and payment verification for
                admins, without bolting on third-party tools.
              </p>
            </div>
            <div className="space-y-4 bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
              {solutions.map((item) => (
                <div key={item.label} className="flex gap-3">
                  <Users className="w-5 h-5 text-blue-300 mt-1" />
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="text-sm text-slate-300">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border rounded-3xl px-6 sm:px-10 py-10">
          <p className="text-blue-600 font-semibold uppercase tracking-wide mb-4 text-center">
            Everything You Need to Succeed
          </p>
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            Comprehensive AI-powered tools for real immigration work
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-6">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow mb-3">{pillar.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{pillar.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border rounded-3xl px-6 sm:px-10 py-10">
          <p className="text-blue-600 font-semibold uppercase tracking-wide mb-4 text-center">
            Plans built for every workload
          </p>
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            Start small and scale into admin controls when you need them
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 border rounded-2xl bg-slate-50">
              <p className="text-sm font-semibold text-blue-600 uppercase mb-1">Starter</p>
              <p className="text-3xl font-bold text-slate-900">R149<span className="text-base font-normal text-slate-500">/month</span></p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>• 3 Visa Eligibility Checks per month</li>
                <li>• 2 Document Types (SOP, Cover Letter)</li>
                <li>• PDF downloads & basic email support</li>
              </ul>
            </div>
            <div className="p-6 border rounded-2xl bg-white shadow-lg relative">
              <span className="absolute -top-3 right-6 text-xs font-semibold bg-blue-600 text-white px-3 py-1 rounded-full">Most Popular</span>
              <p className="text-sm font-semibold text-blue-600 uppercase mb-1">Entry</p>
              <p className="text-3xl font-bold text-slate-900">R299<span className="text-base font-normal text-slate-500">/month</span></p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>• 10 Eligibility Checks per month</li>
                <li>• 5 Document Types + PDF exports</li>
                <li>• Basic interview practice & IELTS support</li>
                <li>• Priority email support</li>
              </ul>
            </div>
            <div className="p-6 border rounded-2xl bg-slate-50">
              <p className="text-sm font-semibold text-blue-600 uppercase mb-1">Professional</p>
              <p className="text-3xl font-bold text-slate-900">R699<span className="text-base font-normal text-slate-500">/month</span></p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>• Unlimited Eligibility Checks</li>
                <li>• All 8+ Document Types + Relationship Proof Kit</li>
                <li>• AI Photo Analysis & Interview Question Bank</li>
                <li>• Unlimited interview practice & full English prep</li>
                <li>• Agent dashboard & team controls</li>
              </ul>
            </div>
            <div className="p-6 border rounded-2xl bg-white">
              <p className="text-sm font-semibold text-blue-600 uppercase mb-1">Enterprise</p>
              <p className="text-3xl font-bold text-slate-900">R1,499<span className="text-base font-normal text-slate-500">/month</span></p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>• Everything in Professional</li>
                <li>• Unlimited team members & advanced analytics</li>
                <li>• Bulk document processing & manual payment verification</li>
                <li>• Dedicated account manager & SLA-backed support</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white border rounded-3xl px-6 sm:px-10 py-12 text-center shadow-sm">
          <p className="text-blue-600 font-semibold tracking-wide uppercase mb-3">Ready to work with it?</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Launch your Immigration AI workspace</h2>
          <p className="text-slate-600 max-w-3xl mx-auto mb-8">
            Start with the plan that matches your workload. Grow into admin tools when you need payment verification, team
            access, or analytics. Need something custom? Talk to us and we will show exactly what it will take.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/20"
            >
              View Pricing & Plans
            </Link>
            <a
              href="mailto:hello@immigrationai.co.za"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold bg-white hover:border-slate-300"
            >
              Talk to our team
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
