'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, Users, FileCheck, MessageSquare, Bell, 
  TrendingUp, Shield, Zap, Globe, ArrowRight, 
  Menu, X, CheckCircle, Building, Target, 
  Clock, BarChart3, Lock, Cloud, Smartphone, Sparkles,
  FolderOpen
} from 'lucide-react';

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Case Management",
      description: "Organize and track all client cases in one centralized dashboard. Set deadlines, assign team members, and monitor progress in real-time."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Lead Routing",
      description: "Automatically match incoming client inquiries with the right professional based on specialization, availability, and expertise."
    },
    {
      icon: <FileCheck className="w-6 h-6" />,
      title: "Document Management",
      description: "AI-powered checklists, secure document uploads, and automated tracking of required documents for each visa type."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Collaboration",
      description: "Invite team members, assign roles, and collaborate seamlessly on complex cases with built-in messaging and task management."
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Client Communication",
      description: "Built-in messaging system keeps all client communications organized within each case. No more lost emails or missed updates."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics & Reporting",
      description: "Track case success rates, team performance, and business metrics with comprehensive analytics and reporting tools."
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Client Portal",
      description: "Give clients secure access to track their case progress, upload documents, and communicate with your team 24/7."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Notifications",
      description: "Never miss a deadline with automated reminders for document requests, submission dates, and important case updates."
    }
  ];

  const stats = [
    { value: "500+", label: "Active Cases", subtext: "managed daily" },
    { value: "50+", label: "Immigration Agencies", subtext: "trust our platform" },
    { value: "95%", label: "Client Satisfaction", subtext: "from agencies" },
    { value: "24/7", label: "Platform Availability", subtext: "always accessible" }
  ];

  const benefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Save Time",
      description: "Reduce case management time by 60% with automated workflows and AI-powered checklists."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Scale Your Practice",
      description: "Handle 3x more cases with the same team. Grow your business without hiring more staff."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Stay Compliant",
      description: "Never miss a deadline or required document. Automated tracking ensures full compliance."
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Work Anywhere",
      description: "Access your cases from any device. Cloud-based platform works on desktop, tablet, or mobile."
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Sign Up Your Agency",
      description: "Create your organization account and invite your team members. Set up your profile and specializations.",
      icon: <Building className="w-8 h-8" />
    },
    {
      step: 2,
      title: "Accept Leads or Create Cases",
      description: "Get matched with qualified leads automatically, or create cases manually for your existing clients.",
      icon: <Target className="w-8 h-8" />
    },
    {
      step: 3,
      title: "Manage Everything in One Place",
      description: "Track documents, set tasks, communicate with clients, and monitor progress all from your dashboard.",
      icon: <Briefcase className="w-8 h-8" />
    },
    {
      step: 4,
      title: "Scale Your Business",
      description: "Use analytics to optimize your operations and grow your practice efficiently.",
      icon: <TrendingUp className="w-8 h-8" />
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Founder, Global Immigration Services",
      text: "We've doubled our case capacity since using this platform. The automated lead routing alone saves us 10 hours per week.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Senior Consultant, Visa Experts",
      text: "The client portal has transformed how we work. Clients can upload documents themselves, which frees up our team to focus on strategy.",
      rating: 5
    },
    {
      name: "Amina Patel",
      role: "Director, Africa Immigration Hub",
      text: "Best investment we've made. The analytics help us identify bottlenecks and improve our success rates significantly.",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "Is this platform only for large agencies?",
      answer: "No! Our Starter plan is perfect for solo practitioners and small teams. You can start with just one user and scale as you grow."
    },
    {
      question: "How does the lead routing work?",
      answer: "When a client submits an inquiry through our marketplace, our AI automatically matches them with the best professional based on specialization, availability, and success rates. You can accept or decline leads."
    },
    {
      question: "Can clients access their cases?",
      answer: "Yes! Every case includes a secure client portal where clients can view progress, upload documents, and message your team. This reduces back-and-forth emails significantly."
    },
    {
      question: "What if I already have clients?",
      answer: "You can manually create cases for existing clients. The platform works whether you get leads from our marketplace or bring your own clients."
    },
    {
      question: "Is my client data secure?",
      answer: "Absolutely. We use enterprise-grade encryption, regular security audits, and comply with data protection regulations. Your client data is never shared with third parties."
    },
    {
      question: "Can I try before committing?",
      answer: "Yes! All plans include a 14-day free trial. No credit card required. You can explore all features and see if it fits your workflow."
    }
  ];

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
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Immigration Platform
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
              <Link href="/find-a-specialist" className="text-gray-700 hover:text-blue-600 transition-colors">For Applicants</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About</Link>
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition-colors">Login</Link>
              <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                Start Free Trial
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
              <Link href="/find-a-specialist" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">For Applicants</Link>
              <Link href="/about" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">About</Link>
              <Link href="/auth/login" className="block px-4 py-2 text-gray-700 hover:bg-blue-50">Login</Link>
              <Link href="/auth/signup" className="w-full block mt-2 mx-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg text-center">
                Start Free Trial
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Built for Immigration Professionals</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Manage Immigration Cases
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Like Never Before</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              The all-in-one platform for immigration agencies and professionals. 
              Manage cases, route leads, collaborate with your team, and scale your practice—all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#features" className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2">
                <span>See How It Works</span>
              </Link>
            </div>

            <div className="flex flex-col items-center space-y-3 mt-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>14-day free trial</span>
                <span>•</span>
                <span>No credit card required</span>
                <span>•</span>
                <span>Cancel anytime</span>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-4 py-2 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-green-800 font-semibold text-sm">Trusted by 50+ Immigration Agencies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.subtext}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and start managing cases more efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
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
              Everything You Need to Manage Cases
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed specifically for immigration professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Immigration Agencies Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join leading agencies who have transformed their operations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Leading Immigration Agencies
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how agencies are transforming their operations
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <CheckCircle key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">&quot;{testimonial.text}&quot;</p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose the plan that fits your agency size. All plans include a 14-day free trial.
          </p>
          <Link 
            href="/pricing" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center space-x-2"
          >
            <span>View Pricing Plans</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our platform
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <details className="group">
                  <summary className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer">
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <ArrowRight className="w-5 h-5 text-gray-500 transform group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Immigration Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join leading agencies who are managing cases more efficiently
          </p>
          <Link href="/auth/signup" className="bg-white text-blue-600 px-10 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center space-x-2">
            <span>Start Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-blue-100 text-sm mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Immigration Platform</span>
              </div>
              <p className="text-sm text-gray-400">
                The all-in-one case management platform for immigration professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/find-a-specialist" className="hover:text-white transition-colors">For Applicants</Link></li>
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
            © 2024 Immigration Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
