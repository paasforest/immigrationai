'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, FileCheck, List, ArrowRight, Sparkles, Globe, Shield, Zap, Menu, X } from 'lucide-react';

export default function ImmigrationAILanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "SOP Generator",
      description: "Create compelling Statements of Purpose tailored to your destination and purpose with AI assistance."
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Cover Letter Writer",
      description: "Generate professional embassy cover letters that highlight your qualifications effectively."
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "SOP Reviewer",
      description: "Get instant feedback and improvement suggestions on your existing documents."
    },
    {
      icon: <List className="w-6 h-6" />,
      title: "Document Checklist",
      description: "Never miss a requirement with country-specific visa document checklists."
    }
  ];

  const stats = [
    { value: "10K+", label: "Documents Generated" },
    { value: "95%", label: "Success Rate" },
    { value: "150+", label: "Countries Supported" },
    { value: "24/7", label: "AI Availability" }
  ];

  const pricingTiers = [
    {
      name: "Starter Plan",
      monthlyPrice: 149,
      yearlyPrice: 1500,
      features: [
        "3 Visa Eligibility Checks per month",
        "2 Document Types (SOP, Cover Letter)",
        "PDF Downloads",
        "Basic Support",
        "Email support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Entry Plan",
      monthlyPrice: 299,
      yearlyPrice: 3000,
      features: [
        "10 Visa Eligibility Checks per month",
        "5 Document Types",
        "Basic Interview Practice (5 sessions/month)",
        "English Test Practice (IELTS only)",
        "Priority email support",
        "PDF Downloads"
      ],
      cta: "Get Started",
      popular: true
    },
    {
      name: "Professional Plan",
      monthlyPrice: 699,
      yearlyPrice: 6500,
      features: [
        "Unlimited Visa Eligibility Checks",
        "All Document Types (8+ types)",
        "Relationship Proof Kit",
        "AI Photo Analysis",
        "Unlimited Interview Practice",
        "Full English Test Practice",
        "Interview Questions Database",
        "Agent Dashboard"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Enterprise Plan",
      monthlyPrice: 1499,
      yearlyPrice: 15000,
      features: [
        "Everything in Professional",
        "Unlimited Team Members",
        "Advanced Analytics Dashboard",
        "Bulk Document Processing",
        "Priority Phone Support",
        "Dedicated Account Manager",
        "SLA Guarantee (99.9% uptime)"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const getPrice = (tier: any) => {
    return billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice;
  };

  const getPeriod = () => {
    return billingCycle === 'yearly' ? '/year' : '/month';
  };

  const getSavings = (tier: any) => {
    if (billingCycle === 'yearly') {
      const monthlyTotal = tier.monthlyPrice * 12;
      const savings = monthlyTotal - tier.yearlyPrice;
      const percentage = Math.round((savings / monthlyTotal) * 100);
      return percentage;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Immigration AI
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
              <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 bg-white rounded-lg shadow-lg mt-2">
              <a href="#features" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">Features</a>
              <a href="#pricing" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">Pricing</a>
              <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">About</a>
              <Link href="/auth/login" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">Login</Link>
              <Link href="/auth/signup" className="w-full block mt-2 mx-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg text-center">
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by Advanced AI</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Immigration Journey,
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Simplified</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Generate professional SOPs, cover letters, and visa documents in minutes. 
              AI-powered tools trusted by thousands of successful applicants worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-all">
                Watch Demo
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              No credit card required • 3 starter documents • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive AI-powered tools designed specifically for immigration document preparation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Immigration AI?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Built by immigration experts and powered by cutting-edge AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
              <p className="text-blue-100">Your data is encrypted and never shared. GDPR compliant.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
              <p className="text-blue-100">Generate professional documents in under 2 minutes.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Global Coverage</h3>
              <p className="text-blue-100">Support for 150+ countries and all major visa types.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  Save up to 17%
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingTiers.map((tier, idx) => (
              <div 
                key={idx}
                className={`bg-white rounded-2xl p-8 shadow-lg border-2 transition-all transform hover:scale-105 ${
                  tier.popular 
                    ? 'border-blue-600 relative' 
                    : 'border-gray-100'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">R{getPrice(tier).toLocaleString()}</span>
                    <span className="text-gray-600 ml-2">{getPeriod()}</span>
                  </div>
                  {billingCycle === 'yearly' && getSavings(tier) > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-green-600 font-medium">
                        Save {getSavings(tier)}% vs monthly
                      </span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  tier.popular
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of successful applicants who trust Immigration AI
          </p>
          <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center space-x-2">
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Immigration AI</span>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered immigration document assistance for your success.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2024 Immigration AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
