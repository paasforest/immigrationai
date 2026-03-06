'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Debug: show API base URL in console
    console.debug('[AdminLogin] API_BASE_URL:', API_BASE_URL);

    try {
      const result = await login(formData);
      console.debug('[AdminLogin] login result:', { success: result.success, hasUser: !!result.user, error: result.error });

      if (result.success && result.user) {
        const adminCheckUrl = `${API_BASE_URL}/api/admin/payments/stats`;
        console.debug('[AdminLogin] checking admin access:', adminCheckUrl);

        let adminCheck: Response;
        try {
          adminCheck = await fetch(adminCheckUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
          });
        } catch (netErr: any) {
          console.error('[AdminLogin] network error calling admin check:', netErr?.message ?? netErr);
          setError('Cannot reach the server. Check your connection and try again.');
          setLoading(false);
          return;
        }

        const status = adminCheck.status;
        const statusText = adminCheck.statusText;
        let bodyText = '';
        try {
          bodyText = await adminCheck.text();
        } catch (_) {}
        console.debug('[AdminLogin] admin check response:', { status, statusText, body: bodyText || '(empty)' });

        if (adminCheck.ok) {
          router.push('/admin');
        } else {
          console.warn('[AdminLogin] admin check failed:', status, bodyText);
          setError('Platform admin access only. Consultants and clients sign in at the main login.');
          await logout();
          // No reload — console stays so you can read the logs
        }
      } else {
        console.warn('[AdminLogin] login failed:', result.error);
        setError(result.error || 'Login failed');
      }
    } catch (err: any) {
      console.error('[AdminLogin] unexpected error:', err?.message ?? err);
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <p className="text-gray-600 mt-2">Sign in to access the admin dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@immigrationai.co.za"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Sign In
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Consultant or client?{' '}
              <a href="/auth/login" className="text-blue-600 hover:underline">
                Sign in here
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}





