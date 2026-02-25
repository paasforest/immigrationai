'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FolderOpen,
  Plus,
  Users,
  CheckSquare,
  FileText,
  MessageSquare,
  UserCog,
  CreditCard,
  Menu,
  Landmark,
  Inbox,
  UserCircle,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import TrialBanner from '@/components/immigration/TrialBanner';
import NotificationPanel from '@/components/immigration/notifications/NotificationPanel';
import { Badge } from '@/components/ui/badge';
import { immigrationApi } from '@/lib/api/immigration';
import { useEffect, useState } from 'react';

const navigation = [
  {
    title: 'MAIN',
    items: [
      { href: '/dashboard/immigration/leads', label: 'Leads', icon: Inbox, badge: true },
      { href: '/dashboard/immigration/leads/analytics', label: 'Lead Analytics', icon: BarChart2, subItem: true },
      { href: '/dashboard/immigration', label: 'Overview', icon: LayoutDashboard },
      { href: '/dashboard/immigration/cases', label: 'All Cases', icon: FolderOpen },
      { href: '/dashboard/immigration/cases/new', label: 'New Case', icon: Plus },
    ],
  },
  {
    title: 'CLIENTS',
    items: [
      { href: '/dashboard/immigration/clients', label: 'Clients', icon: Users },
    ],
  },
  {
    title: 'WORK',
    items: [
      { href: '/dashboard/immigration/tasks', label: 'Tasks', icon: CheckSquare },
      { href: '/dashboard/immigration/documents', label: 'Documents', icon: FileText },
      { href: '/dashboard/immigration/messages', label: 'Messages', icon: MessageSquare },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { href: '/dashboard/immigration/tools/financial-assistant', label: 'Financial Assistant', icon: Landmark },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { href: '/dashboard/immigration/team', label: 'Team', icon: UserCog },
      { href: '/dashboard/immigration/billing', label: 'Billing', icon: CreditCard },
    ],
    adminOnly: true,
  },
  {
    title: 'SETTINGS',
    items: [
      { href: '/dashboard/immigration/profile', label: 'My Profile', icon: UserCircle },
    ],
  },
];

export default function ImmigrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingLeadsCount, setPendingLeadsCount] = useState(0);

  const isAdmin = user?.organizationRole === 'org_admin';

  useEffect(() => {
    if (user && user.organizationRole !== 'applicant') {
      fetchPendingLeads();
      const interval = setInterval(fetchPendingLeads, 5 * 60 * 1000); // Every 5 minutes
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchPendingLeads = async () => {
    try {
      const response = await immigrationApi.getMyLeads('pending');
      if (response.success && response.data) {
        const count = response.data.assignments?.length || 0;
        setPendingLeadsCount(count);
      }
    } catch (error) {
      // Silently fail - leads count is not critical
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard/immigration') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-navy-600">
        <h2 className="text-white font-semibold text-lg">Immigration</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigation.map((section) => {
          if (section.adminOnly && !isAdmin) return null;
          
          return (
            <div key={section.title}>
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const showBadge = item.badge && pendingLeadsCount > 0;
                  const isSubItem = (item as any).subItem;
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                          isSubItem ? 'pl-8' : '',
                          active
                            ? 'bg-navy-700 text-white border-l-[3px] border-amber-500'
                            : 'text-gray-300 hover:bg-navy-700 hover:text-white'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        {showBadge && (
                          <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {pendingLeadsCount}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TrialBanner />
      
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4 bg-white border-b">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[220px] p-0 bg-[#0F2557] border-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-[220px] bg-[#0F2557] fixed left-0 top-0 h-screen overflow-y-auto">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-[220px] min-h-screen">
          {/* Top bar with notifications */}
          <div className="sticky top-0 z-40 bg-white border-b px-6 py-3 flex items-center justify-end">
            <NotificationPanel />
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
