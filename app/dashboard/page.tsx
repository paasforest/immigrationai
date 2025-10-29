'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileCheck, CheckCircle, List, LogOut, User, Mail, Plane, DollarSign, Target, MessageSquare, BarChart3, Heart, Package, Camera, Mic, BookOpen, Globe, Award, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import AccountNumberCard from '@/components/AccountNumberCard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

    // Plan-based feature access
  const getFeatureAccess = (feature: any) => {
    const userPlan = user?.subscriptionPlan || 'starter';
    
    // Define plan hierarchy
    const planLevels = {
      'starter': 1,
      'entry': 2, 
      'professional': 3,
      'enterprise': 4
    };
    
    const userLevel = planLevels[userPlan as keyof typeof planLevels] || 1;
    
    // Features available to all plans
    if (!feature.premium && !feature.enterprise) {
      return { accessible: true, reason: null };
    }
    
    // Premium features require professional or enterprise
    if (feature.premium && !feature.enterprise) {
      if (userLevel >= 3) {
        return { accessible: true, reason: null };
      } else {
        return { 
          accessible: false, 
          reason: 'Requires Professional plan or higher' 
        };
      }
    }
    
    // Enterprise features require enterprise plan
    if (feature.enterprise) {
      if (userLevel >= 4) {
        return { accessible: true, reason: null };
      } else {
        return { 
          accessible: false, 
          reason: 'Requires Enterprise plan' 
        };
      }
    }
    
    return { accessible: true, reason: null };
  };

const features = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "SOP Generator",
      description: "Generate compelling Statements of Purpose with AI",
      href: "/documents/sop",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "SOP Reviewer",
      description: "Get AI feedback and quality scores",
      href: "/documents/review",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "AI Chat Assistant",
      description: "Ask immigration questions to AI expert",
      href: "/documents/ai-chat",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <List className="w-8 h-8" />,
      title: "Visa Eligibility",
      description: "Check your visa eligibility with AI",
      href: "/documents/visa-checker",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Generator",
      description: "Professional emails for embassies",
      href: "/documents/email-generator",
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "Support Letters",
      description: "Invitation, sponsorship, employment letters",
      href: "/documents/support-letter",
      color: "from-violet-500 to-purple-500"
    },
    {
      icon: <Plane className="w-8 h-8" />,
      title: "Travel History",
      description: "Format travel records professionally",
      href: "/documents/travel-history",
      color: "from-sky-500 to-cyan-500"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Financial Letter",
      description: "Justify funds for visa application",
      href: "/documents/financial-letter",
      color: "from-emerald-500 to-green-500"
    },
        {
          icon: <Target className="w-8 h-8" />,
          title: "Purpose of Visit",
          description: "Explain your visit intent clearly",
          href: "/documents/purpose-of-visit",
          color: "from-rose-500 to-pink-500"
        },
        {
          icon: <BarChart3 className="w-8 h-8" />,
          title: "Analytics Dashboard",
          description: "View feedback and success rates",
          href: "/analytics",
          color: "from-indigo-500 to-purple-500"
        },
        {
          icon: <Heart className="w-8 h-8" />,
          title: "Relationship Proof Kit",
          description: "Organize relationship evidence professionally",
          href: "/documents/proofkit",
          color: "from-pink-500 to-rose-500",
          badge: "NEW",
          premium: true
        },
        {
          icon: <Camera className="w-8 h-8" />,
          title: "Visa Interview Practice Coach",
          description: "Practice with real consulate questions + AI feedback",
          href: "/documents/mock-interview",
          color: "from-purple-500 to-violet-500",
          badge: "HOT",
          premium: true
        },
        {
          icon: <BookOpen className="w-8 h-8" />,
          title: "Interview Questions Database",
          description: "500+ real questions by visa type, difficulty & category",
          href: "/documents/interview-questions",
          color: "from-blue-500 to-indigo-500",
          badge: "NEW",
          premium: true
        },
        {
          icon: <Target className="w-8 h-8" />,
          title: "Interview Response Builder",
          description: "Craft perfect answers using AI and the STAR method",
          href: "/documents/interview-response-builder",
          color: "from-green-500 to-emerald-500",
          badge: "HOT",
          premium: true
        },
        {
          icon: <Globe className="w-8 h-8" />,
          title: "English Test Practice",
          description: "Practice IELTS, TOEFL & CELPIP speaking with AI scoring",
          href: "/documents/english-test-practice",
          color: "from-orange-500 to-red-500",
          badge: "NEW",
          premium: true
        },
        {
          icon: <BarChart3 className="w-8 h-8" />,
          title: "Analytics Dashboard",
          description: "Advanced analytics, usage tracking, and performance metrics",
          href: "/documents/analytics",
          color: "from-purple-500 to-indigo-600",
          badge: "ENTERPRISE",
          premium: true,
          enterprise: true
        },
        {
          icon: <Users className="w-8 h-8" />,
          title: "Team Management",
          description: "Manage team members, roles, and permissions",
          href: "/documents/team-management",
          color: "from-blue-500 to-cyan-600",
          badge: "ENTERPRISE",
          premium: true,
          enterprise: true
        },
        {
          icon: <Zap className="w-8 h-8" />,
          title: "Bulk Processing",
          description: "Process multiple documents efficiently for high-volume operations",
          href: "/documents/bulk-processing",
          color: "from-green-500 to-emerald-600",
          badge: "ENTERPRISE",
          premium: true,
          enterprise: true
        },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Immigration AI
          </h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">{user.email}</span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.fullName || 'there'}! 👋
          </h2>
          <p className="text-gray-600">
            You're on the <span className="font-semibold">{user.subscriptionPlan || 'Entry'}</span> plan
          </p>
        </div>

        {/* Account Number Card */}
        <div className="mb-8">
          <AccountNumberCard />
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, idx) => {
            const access = getFeatureAccess(feature);
            
            return (
              <div key={idx}>
                {access.accessible ? (
                  <Link href={feature.href}>
                    <Card className={`hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer h-full relative ${
                      feature.premium ? 'ring-2 ring-pink-200 bg-gradient-to-br from-pink-50 to-rose-50' : ''
                    } ${feature.enterprise ? 'ring-2 ring-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50' : ''}`}>
                      {feature.badge && (
                        <div className={`absolute -top-2 -right-2 text-white text-xs font-bold px-2 py-1 rounded-full ${
                          feature.enterprise 
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                            : 'bg-gradient-to-r from-pink-500 to-rose-500'
                        }`}>
                          {feature.badge}
                        </div>
                      )}
                      <CardHeader>
                        <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                          {feature.icon}
                        </div>
                        <CardTitle className="text-2xl flex items-center space-x-2">
                          <span>{feature.title}</span>
                          {feature.premium && (
                            <span className={`text-xs text-white px-2 py-1 rounded-full ${
                              feature.enterprise 
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                                : 'bg-gradient-to-r from-pink-500 to-rose-500'
                            }`}>
                              {feature.enterprise ? 'ENTERPRISE' : 'PRO'}
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className={`w-full ${
                          feature.premium 
                            ? feature.enterprise
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
                              : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600'
                            : ''
                        }`}>
                          {feature.premium 
                            ? feature.enterprise 
                              ? 'Enterprise Plan Required →' 
                              : 'Upgrade to Access →'
                            : 'Get Started →'
                          }
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className="opacity-60 cursor-not-allowed h-full relative">
                    {feature.badge && (
                      <div className={`absolute -top-2 -right-2 text-white text-xs font-bold px-2 py-1 rounded-full ${
                        feature.enterprise 
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                          : 'bg-gradient-to-r from-pink-500 to-rose-500'
                      }`}>
                        {feature.badge}
                      </div>
                    )}
                    <CardHeader>
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-2xl flex items-center space-x-2">
                        <span>{feature.title}</span>
                        {feature.premium && (
                          <span className={`text-xs text-white px-2 py-1 rounded-full ${
                            feature.enterprise 
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                              : 'bg-gradient-to-r from-pink-500 to-rose-500'
                          }`}>
                            {feature.enterprise ? 'ENTERPRISE' : 'PRO'}
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">{access.reason}</p>
                        <Link href="/pricing">
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                            Upgrade Plan
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {user.subscriptionPlan === 'starter' ? '3' : '∞'}
                </div>
                <div className="text-sm text-gray-600">Documents Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {user.subscriptionStatus}
                </div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600">Documents Created</div>
              </div>
            </div>
            
            {user.subscriptionPlan === 'starter' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Upgrade to Pro</strong> for unlimited documents and advanced features!
                </p>
                <Link href="/subscription">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    View Plans
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

