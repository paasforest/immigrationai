'use client';

import React from 'react';
import Link from 'next/link';
import { ClipboardCheck, FileText, Mic, Shield, Users, Zap } from 'lucide-react';

const pillars = [
  {
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    title: 'Document Studio',
    description:
      'Guided SOP, cover letter, and support-letter workflows with reusable templates, saved sessions, and PDF export.',
  },
  {
    icon: <Mic className="w-6 h-6 text-blue-600" />,
    title: 'Interview Coach',
    description:
      'Scenario-based practice with AI scoring, answer structure tips, and notes your team can review before mock sessions.',
  },
  {
    icon: <ClipboardCheck className="w-6 h-6 text-blue-600" />,
    title: 'Admin & Tracking',
    description:
      'Payment verification, UTM analytics, and role-based access so internal teams can monitor conversions and compliance.',
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

export default function AboutPage() {
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
            analytics. Everything lives on Supabase + Node.js, and every feature ships with documentation inside the product and
            in the repository.
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

        <section className="bg-white border rounded-3xl px-6 sm:px-10 py-10 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-blue-600 font-semibold uppercase tracking-wide mb-2">How we ship</p>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Practical, API-first, well documented</h2>
            <p className="text-slate-600 mb-4">
              We commit every guide, admin checklist, and deployment note to the repo. Users see the same instructions inside the
              product that we follow internally. When something changes—payment flow, interview feedback logic, Supabase rules—we
              document it immediately.
            </p>
            <div className="space-y-3 text-slate-700 text-sm">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-blue-600 mt-1" />
                Backend runs on Hetzner + Node.js with Supabase Postgres; frontend runs on Vercel with Edge caching.
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-blue-600 mt-1" />
                AI features use OpenAI plus custom templates stored in the repo so teams can review or adjust prompts.
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-blue-600 mt-1" />
                Admin users control access, reset tokens, and view UTM sources without leaving the dashboard.
              </div>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">What you can count on</h3>
            <ul className="space-y-3 text-slate-700 text-sm">
              <li>✅ Clear language about what the software does (and does not do).</li>
              <li>✅ Templates you can edit, duplicate, and share with teammates.</li>
              <li>✅ Interview practice history and AI feedback saved per user.</li>
              <li>✅ Admin logs for payments, document uploads, and analytics.</li>
            </ul>
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


