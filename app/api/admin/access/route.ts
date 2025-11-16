import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const provided = String(body?.password || '');

    const gatePassword = process.env.ADMIN_ACCESS_PASSWORD || '';
    if (!gatePassword) {
      return NextResponse.json(
        { success: false, error: 'Admin access password not configured' },
        { status: 500 }
      );
    }

    if (provided !== gatePassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Optional: login as configured admin user to obtain JWT for existing admin pages
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    let token: string | null = null;
    let refreshToken: string | null = null;

    if (adminEmail && adminPassword) {
      try {
        const resp = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: adminEmail, password: adminPassword }),
        });
        const data = await resp.json();
        if (resp.ok && data?.success && data?.data?.token) {
          token = data.data.token;
          refreshToken = data.data.refreshToken || null;
        }
      } catch {}
    }

    const response = NextResponse.json({
      success: true,
      data: token
        ? { token, refreshToken }
        : {},
    });

    // Set gate cookie so middleware allows access to /admin
    response.cookies.set('admin_gate_ok', 'true', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/admin',
      maxAge: 60 * 60 * 6, // 6 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}



