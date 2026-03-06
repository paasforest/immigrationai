'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  ShieldCheck,
  Target,
  FileText,
  TrendingUp,
  Activity,
  Store,
  ArrowLeft,
  Shield,
  ChevronRight,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const navSections = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/organizations', label: 'Organizations', icon: Building2 },
      { href: '/admin/marketplace', label: 'Marketplace', icon: Store },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/payments', label: 'Payments', icon: DollarSign },
      { href: '/admin/verifications', label: 'Verifications', icon: ShieldCheck },
      { href: '/admin/users', label: 'Users', icon: Users },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { href: '/admin/utm-analytics', label: 'UTM Analytics', icon: Target },
      { href: '/admin/documents', label: 'Documents', icon: FileText },
      { href: '/admin/revenue', label: 'Revenue', icon: TrendingUp },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/system', label: 'System Health', icon: Activity },
      { href: '/admin/visa-rules', label: 'Visa Rules', icon: FileCheck },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user, pathname]);

  const checkAdminAccess = async () => {
    // /admin/login: dedicated admin entry — render login if not authenticated
    if (pathname === '/admin/login') {
      if (!user) {
        setIsAdmin(null); // Renders login page
        return;
      }
      // User is logged in — verify admin and redirect
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/api/admin/payments/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      } catch {
        router.replace('/dashboard');
      }
      return;
    }

    // Other /admin/* routes: require auth
    if (!user) {
      router.replace('/admin/login');
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/admin/payments/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setIsAdmin(true);
      } else {
        // Non-admin (agency/user) — redirect to their dashboard
        setIsAdmin(false);
        router.replace('/dashboard');
      }
    } catch {
      setIsAdmin(false);
      router.replace('/dashboard');
    }
  };

  // /admin/login without user: render login page (no sidebar)
  if (pathname === '/admin/login' && !user) {
    return <>{children}</>;
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 animate-pulse text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-all duration-200',
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              <span className="font-semibold text-white">Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronRight
              className={cn('w-4 h-4 transition-transform', sidebarCollapsed && 'rotate-180')}
            />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {navSections.map((section) => (
            <div key={section.label} className="mb-6">
              {!sidebarCollapsed && (
                <p className="px-4 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                          isActive
                            ? 'bg-blue-600/20 text-blue-300 border-l-2 border-blue-500'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'
                        )}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {!sidebarCollapsed && 'Back to Home'}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
