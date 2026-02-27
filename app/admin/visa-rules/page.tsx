'use client';

/**
 * Admin: Visa Intelligence Rules Database
 *
 * This is the control room for the verified visa requirements database.
 * - View all 20+ seeded immigration routes
 * - Edit any requirement in-place (JSON editor + form fields)
 * - Mark routes as active/inactive
 * - Review and resolve monitoring alerts
 * - See full version history per route
 *
 * Access: system_admin role only (enforced in backend via requireAdmin middleware)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Globe,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Shield,
  Database,
  Bell,
  Plus,
  ChevronRight,
  Loader2,
  History,
  ExternalLink,
  CheckCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

// ─── types ───────────────────────────────────────────────────────────────────
interface RouteRow {
  id: string;
  routeKey: string;
  displayName: string;
  originCountry: string;
  destinationCountry: string;
  visaType: string;
  version: number;
  isActive: boolean;
  lastVerifiedAt: string;
  lastVerifiedBy: string;
  updatedAt: string;
  _count: { alerts: number };
}

interface FullRoute extends RouteRow {
  requirements: any[];
  financialThresholds: any;
  processingTime: any;
  knownGotchas: string[];
  criticalPath: string[];
  officialSources: any[];
  summary: string;
  changeNotes: string;
  history: HistoryEntry[];
  alerts: AlertEntry[];
}

interface HistoryEntry {
  id: string;
  version: number;
  changeNotes: string;
  changedBy: string;
  createdAt: string;
}

interface AlertEntry {
  id: string;
  routeKey: string;
  sourceUrl: string;
  alertType: string;
  severity: string;
  description: string;
  createdAt: string;
  isResolved: boolean;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function VerificationBadge({ lastVerifiedAt }: { lastVerifiedAt: string }) {
  const days = daysSince(lastVerifiedAt);
  if (days <= 30) return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">✓ Fresh</Badge>;
  if (days <= 90) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">⚠ {days}d ago</Badge>;
  return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">🔴 {days}d ago</Badge>;
}

// ─── main component ───────────────────────────────────────────────────────────
export default function VisaRulesAdminPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Lists
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Filter
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Edit dialog
  const [selectedRoute, setSelectedRoute] = useState<FullRoute | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editSummary, setEditSummary] = useState('');
  const [editChangeNotes, setEditChangeNotes] = useState('');
  const [editRequirementsJson, setEditRequirementsJson] = useState('');
  const [editKnownGotchas, setEditKnownGotchas] = useState('');
  const [editCriticalPath, setEditCriticalPath] = useState('');
  const [jsonError, setJsonError] = useState('');

  // ── auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (user && user.role !== 'org_admin' && user.role !== 'system_admin') {
      router.push('/dashboard/immigration');
    }
  }, [user, router]);

  // ── debounced search ────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── fetch routes ─────────────────────────────────────────────────────────
  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await apiClient.get<{ routes: RouteRow[]; total: number }>(
        `/api/admin/visa-rules?${params.toString()}`
      );
      if (res.success && res.data) {
        setRoutes(res.data.routes);
        setTotal(res.data.total);
      }
    } catch {
      toast.error('Failed to load visa rules');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  // ── fetch alerts ─────────────────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const res = await apiClient.get<AlertEntry[]>('/api/admin/visa-rules/alerts');
      if (res.success && res.data) setAlerts(res.data);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);
  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // ── open edit dialog ──────────────────────────────────────────────────────
  const openEdit = async (row: RouteRow) => {
    try {
      const res = await apiClient.get<FullRoute>(`/api/admin/visa-rules/${row.id}`);
      if (res.success && res.data) {
        const r = res.data;
        setSelectedRoute(r);
        setEditSummary(r.summary || '');
        setEditChangeNotes('');
        setEditRequirementsJson(JSON.stringify(r.requirements, null, 2));
        setEditKnownGotchas(Array.isArray(r.knownGotchas) ? r.knownGotchas.join('\n') : '');
        setEditCriticalPath(Array.isArray(r.criticalPath) ? r.criticalPath.join('\n') : '');
        setJsonError('');
        setEditDialogOpen(true);
      }
    } catch {
      toast.error('Failed to load route details');
    }
  };

  // ── save edit ─────────────────────────────────────────────────────────────
  const saveEdit = async () => {
    if (!selectedRoute) return;

    // Validate JSON
    let parsedRequirements: any[];
    try {
      parsedRequirements = JSON.parse(editRequirementsJson);
      if (!Array.isArray(parsedRequirements)) throw new Error('Must be an array');
      setJsonError('');
    } catch (e: any) {
      setJsonError(`JSON error: ${e.message}`);
      return;
    }

    setSaving(true);
    try {
      const res = await apiClient.put(`/api/admin/visa-rules/${selectedRoute.id}`, {
        summary: editSummary,
        requirements: parsedRequirements,
        knownGotchas: editKnownGotchas.split('\n').map((s) => s.trim()).filter(Boolean),
        criticalPath: editCriticalPath.split('\n').map((s) => s.trim()).filter(Boolean),
        changeNotes: editChangeNotes,
      });

      if (res.success) {
        toast.success(`✅ ${selectedRoute.displayName} updated to v${(selectedRoute.version ?? 0) + 1}`);
        setEditDialogOpen(false);
        fetchRoutes();
      } else {
        toast.error(res.message || 'Save failed');
      }
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── toggle active ─────────────────────────────────────────────────────────
  const toggleActive = async (route: RouteRow) => {
    try {
      await apiClient.put(`/api/admin/visa-rules/${route.id}`, {
        isActive: !route.isActive,
        changeNotes: `Admin ${route.isActive ? 'deactivated' : 'activated'} route`,
      });
      toast.success(`Route ${route.isActive ? 'deactivated' : 'activated'}`);
      fetchRoutes();
    } catch {
      toast.error('Toggle failed');
    }
  };

  // ── resolve alert ─────────────────────────────────────────────────────────
  const resolveAlert = async (alertId: string) => {
    try {
      await apiClient.post(`/api/admin/visa-rules/alerts/${alertId}/resolve`, {
        resolutionNote: 'Reviewed and confirmed — no rule change required',
      });
      toast.success('Alert resolved');
      fetchAlerts();
    } catch {
      toast.error('Failed to resolve alert');
    }
  };

  // ─── render ───────────────────────────────────────────────────────────────
  const unresolved = alerts.filter((a) => !a.isResolved).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Visa Intelligence Database</h1>
              <p className="text-sm text-gray-500">Ground truth for the RAG pre-document intelligence layer</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {unresolved > 0 && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                <Bell className="w-3 h-3 mr-1" />
                {unresolved} alert{unresolved > 1 ? 's' : ''}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={fetchRoutes}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-blue-500 bg-blue-50 p-1.5 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold">{total}</p>
                  <p className="text-xs text-gray-500">Routes Seeded</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-500 bg-green-50 p-1.5 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold">{routes.filter((r) => r.isActive).length}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500 bg-amber-50 p-1.5 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold">
                    {routes.filter((r) => daysSince(r.lastVerifiedAt) > 60).length}
                  </p>
                  <p className="text-xs text-gray-500">Need Re-verify</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-500 bg-red-50 p-1.5 rounded-lg" />
                <div>
                  <p className="text-2xl font-bold">{unresolved}</p>
                  <p className="text-xs text-gray-500">Open Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="routes">
          <TabsList>
            <TabsTrigger value="routes">
              <Database className="w-4 h-4 mr-2" />
              Routes ({total})
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
              {unresolved > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {unresolved}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="guide">
              <Shield className="w-4 h-4 mr-2" />
              Admin Guide
            </TabsTrigger>
          </TabsList>

          {/* ── ROUTES TAB ─────────────────────────────────────── */}
          <TabsContent value="routes" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Immigration Routes</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search routes..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs font-medium">Route</TableHead>
                        <TableHead className="text-xs font-medium">Visa Type</TableHead>
                        <TableHead className="text-xs font-medium">Version</TableHead>
                        <TableHead className="text-xs font-medium">Last Verified</TableHead>
                        <TableHead className="text-xs font-medium">Alerts</TableHead>
                        <TableHead className="text-xs font-medium">Status</TableHead>
                        <TableHead className="text-xs font-medium text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routes.map((route) => (
                        <TableRow key={route.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{route.displayName}</p>
                              <p className="text-xs text-gray-400 font-mono">{route.routeKey}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-600">{route.visaType}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">v{route.version}</Badge>
                          </TableCell>
                          <TableCell>
                            <VerificationBadge lastVerifiedAt={route.lastVerifiedAt} />
                          </TableCell>
                          <TableCell>
                            {route._count.alerts > 0 ? (
                              <Badge className="bg-amber-100 text-amber-700 text-xs">
                                {route._count.alerts} open
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">None</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => toggleActive(route)}
                              className={`text-xs px-2 py-0.5 rounded-full border ${
                                route.isActive
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-gray-100 text-gray-500 border-gray-200'
                              }`}
                            >
                              {route.isActive ? '● Active' : '○ Inactive'}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(route)}
                              className="h-7 text-xs"
                            >
                              <Edit3 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ALERTS TAB ─────────────────────────────────────── */}
          <TabsContent value="alerts" className="mt-4">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Update Alerts</CardTitle>
                <CardDescription className="text-xs">
                  Generated by the monitoring cron job when official source pages change.
                  Review each alert, update the route if the rules changed, then resolve.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alertsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : alerts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <CheckCheck className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No open alerts — all sources look current.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`border rounded-lg p-4 ${
                          alert.severity === 'critical'
                            ? 'border-red-200 bg-red-50'
                            : alert.severity === 'high'
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                className={
                                  alert.severity === 'critical'
                                    ? 'bg-red-100 text-red-700'
                                    : alert.severity === 'high'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-600'
                                }
                              >
                                {alert.severity}
                              </Badge>
                              <span className="text-xs font-mono text-gray-500">{alert.routeKey}</span>
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 mb-2">{alert.description}</p>
                            <a
                              href={alert.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {alert.sourceUrl}
                            </a>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolveAlert(alert.id)}
                            className="text-xs shrink-0"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── GUIDE TAB ─────────────────────────────────────── */}
          <TabsContent value="guide" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    How the RAG layer works
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <p>When a case officer opens a case in Doc Studio, the system:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs ml-2">
                    <li>Builds a <code className="bg-gray-100 px-1 rounded">routeKey</code> from origin + destination + visa type</li>
                    <li>Looks up this table for a verified match</li>
                    <li>If found and verified within 90 days → serves the DB data directly (fast, accurate)</li>
                    <li>If not found → falls back to GPT-4o (slower, but functional)</li>
                    <li>Frontend shows a "Verified" badge for DB data vs "AI Generated" warning</li>
                  </ol>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-3">
                    ⚠ AI fallback data is good but NOT guaranteed. Always verify new routes before they serve real clients.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    Maintenance schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 space-y-2">
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span><strong>Weekly</strong>: Monitoring cron checks all official source URLs for page changes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-0.5">⚠</span>
                      <span><strong>When alert fires</strong>: You get notified, review here, update the route, resolve the alert</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">→</span>
                      <span><strong>Quarterly</strong>: Manual review of all active routes. Update lastVerifiedAt after checking official sources.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 mt-0.5">+</span>
                      <span><strong>New route</strong>: Use the seed file as a template. Every new route = one seed entry + this admin panel.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-600" />
                    Adding a new route (no backend code needed)
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <p className="mb-3">Two options:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-xs">
                      <p className="font-medium mb-2">Option A: Seed file (recommended for batches)</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Copy an existing route block in <code className="bg-white px-1 rounded border">backend/prisma/seed-visa-requirements.ts</code></li>
                        <li>Update all fields</li>
                        <li>Run: <code className="bg-white px-1 rounded border">npx ts-node prisma/seed-visa-requirements.ts</code></li>
                        <li>Route appears here immediately</li>
                      </ol>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs">
                      <p className="font-medium mb-2">Option B: API (for one-off additions)</p>
                      <p className="text-gray-500 mb-1">POST <code className="bg-white px-1 rounded border">/api/admin/visa-rules</code> with the full route object.</p>
                      <p className="text-gray-500">Admin panel form editor coming in next sprint.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── EDIT DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-blue-600" />
              {selectedRoute?.displayName}
              <Badge variant="outline" className="text-xs ml-2">v{selectedRoute?.version}</Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedRoute && (
            <div className="space-y-5 mt-2">

              {/* Summary */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">Summary</Label>
                <Textarea
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                  placeholder="One paragraph describing what this application involves and key challenges..."
                />
              </div>

              {/* Known Gotchas */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  Known Gotchas / Refusal Triggers
                  <span className="text-gray-400 font-normal ml-2">(one per line)</span>
                </Label>
                <Textarea
                  value={editKnownGotchas}
                  onChange={(e) => setEditKnownGotchas(e.target.value)}
                  rows={4}
                  className="text-sm resize-none font-mono"
                  placeholder="Each gotcha on its own line..."
                />
              </div>

              {/* Critical Path */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  Critical Path (Action Order)
                  <span className="text-gray-400 font-normal ml-2">(one step per line)</span>
                </Label>
                <Textarea
                  value={editCriticalPath}
                  onChange={(e) => setEditCriticalPath(e.target.value)}
                  rows={4}
                  className="text-sm resize-none font-mono"
                  placeholder="Step 1: Start X because it takes Y days..."
                />
              </div>

              {/* Requirements JSON */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  Requirements Array
                  <span className="text-gray-400 font-normal ml-2">(JSON — edit carefully)</span>
                </Label>
                <Textarea
                  value={editRequirementsJson}
                  onChange={(e) => {
                    setEditRequirementsJson(e.target.value);
                    setJsonError('');
                  }}
                  rows={18}
                  className={`text-xs resize-none font-mono ${jsonError ? 'border-red-400' : ''}`}
                />
                {jsonError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {jsonError}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Fields per item: id, category, name, description, isMandatory, isAiGeneratable, officialSource, estimatedDays, notes, urgencyLevel (critical|high|normal|low)
                </p>
              </div>

              {/* Change Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700">
                  Change Notes <span className="text-gray-400 font-normal">(what changed and why)</span>
                </Label>
                <Input
                  value={editChangeNotes}
                  onChange={(e) => setEditChangeNotes(e.target.value)}
                  placeholder="e.g. Updated financial threshold to match Jan 2025 UKVI guidance"
                  className="text-sm"
                />
              </div>

              {/* Version History (read-only) */}
              {selectedRoute.history && selectedRoute.history.length > 0 && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                    <History className="w-3 h-3" />
                    Version History (last 10)
                  </p>
                  <div className="space-y-1.5">
                    {selectedRoute.history.map((h) => (
                      <div key={h.id} className="flex items-start gap-3 text-xs text-gray-500">
                        <Badge variant="outline" className="text-xs shrink-0">v{h.version}</Badge>
                        <span className="text-gray-400">{format(new Date(h.createdAt), 'dd MMM yyyy HH:mm')}</span>
                        <span className="text-gray-400">by {h.changedBy}</span>
                        <span>{h.changeNotes || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save & Increment Version
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
