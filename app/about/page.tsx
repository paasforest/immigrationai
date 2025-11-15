'use client';

import React from 'react';
import { CheckCircle, Globe, Shield, Target, Users, Award } from 'lucide-react';

const stats = [
  { label: 'Documents generated', value: '18,000+' },
  { label: 'Visa categories covered', value: '150+' },
  { label: 'Global partners', value: '42' },
];

const values = [
  {
    icon: <Shield className="w-6 h-6 text-blue-600" />,
    title: 'Trust & Compliance',
    description:
      'Every workflow is reviewed by licensed immigration experts in the US, UK, Canada, Australia, Germany, and EU member states.',
  },
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: 'Human + AI Collaboration',
    description:
      'We combine deep legal expertise with advanced AI models to deliver accurate, context-aware immigration advice.',
  },
  {
    icon: <Globe className="w-6 h-6 text-blue-600" />,
    title: 'Global Access',
    description:
      'Immigration AI is available 24/7 across 90+ countries, supporting users in multiple languages and time zones.',
  },
];

const milestones = [
  {
    year: '2023',
    title: 'Foundation',
    description:
      'Immigration AI launches with a small team of immigration lawyers, product designers, and AI researchers.',
  },
  {
    year: '2024',
    title: 'Scale',
    description:
      'We partner with education agents, relocation specialists, and global talent networks, surpassing 10,000 users.',
  },
  {
    year: '2025',
    title: 'Enterprise',
    description:
      'Launch of the Admin Platform, UTM analytics, payment verification, and compliance-grade document intelligence.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-blue-600 font-semibold mb-2 tracking-wide uppercase">About Immigration AI</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Modern immigration, powered by intelligence and integrity
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl">
            Immigration AI helps applicants, lawyers, and global teams navigate the visa journey with
            precision-built AI, robust compliance tooling, and human expertise on demand.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {/* Mission */}
        <section className="bg-white rounded-3xl shadow-sm border px-6 sm:px-10 py-10">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-blue-600 font-semibold mb-2">Our mission</p>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Make immigration predictable, transparent, and fast</h2>
              <p className="text-slate-600 leading-relaxed">
                Immigration is difficult because policy, paperwork, and timelines change constantly. We built Immigration AI
                to deliver personalized, compliant workflows for students, families, founders, and global teams. From SOP
                generation to payment verification, every feature is built with one goal: help people move across borders
                confidently.
              </p>
            </div>
            <div className="grid gap-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-6 flex items-center justify-between"
                >
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                    <p className="text-slate-500">{item.label}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="bg-white border rounded-2xl px-6 py-7 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{value.title}</h3>
              <p className="text-slate-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </section>

        {/* Story */}
        <section className="bg-slate-900 text-white rounded-3xl px-8 py-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-blue-300 font-semibold mb-2 tracking-wide uppercase">Our story</p>
              <h2 className="text-3xl font-bold mb-4">Built by immigrants, for immigrants</h2>
              <p className="text-slate-200 leading-relaxed mb-4">
                Our founders have worked inside embassies, law firms, and AI labs. We know the stakes––missing paperwork,
                confusing compliance requirements, or delayed payments can derail someone’s dream.
              </p>
              <p className="text-slate-200 leading-relaxed">
                Immigration AI blends verified policy data with automation so every user can act with clarity. We partner
                with immigration lawyers, global mobility teams, VC-backed startups, and universities to make migration safe,
                fast, and data-driven.
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700 space-y-6">
              {milestones.map((milestone) => (
                <div key={milestone.year} className="flex gap-4">
                  <div className="text-blue-300 font-semibold">{milestone.year}</div>
                  <div>
                    <p className="font-semibold text-white">{milestone.title}</p>
                    <p className="text-slate-300 text-sm">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white border rounded-3xl px-6 py-8">
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">Who we support</h3>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-600 mt-1" />
                Founders applying for startup, innovator, or O-1 visas
              </li>
              <li className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 mt-1" />
                Families pursuing reunification, study permits, or work visas
              </li>
              <li className="flex items-start gap-3">
                <Award className="w-5 h-5 text-blue-600 mt-1" />
                University recruitment teams and licensed immigration lawyers
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-3xl px-6 py-8">
            <h3 className="text-2xl font-semibold mb-3">What makes us different</h3>
            <ul className="space-y-3 text-blue-50">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white mt-1" />
                Live compliance updates mapped to 40+ immigration authorities
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white mt-1" />
                Secure payment verification, document intelligence, and admin tools
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-white mt-1" />
                Deep integrations with Supabase, Stripe, and AI Guardrails
              </li>
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white border rounded-3xl px-6 sm:px-10 py-12 text-center shadow-sm">
          <p className="text-blue-600 font-semibold tracking-wide uppercase mb-3">Ready to move faster?</p>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Launch your immigration workflows in minutes</h2>
          <p className="text-slate-600 max-w-3xl mx-auto mb-8">
            Whether you are a solo applicant, a global HR team, or an immigration firm, Immigration AI gives you
            compliance-ready tooling, document intelligence, and admin oversight from day one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/20"
            >
              View Pricing & Plans
            </a>
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


