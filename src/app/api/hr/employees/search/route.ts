import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/middleware/jwt';
import { Api } from '@/lib/api/axios';

export async function GET(request: NextRequest) {
  try {
    // Verify locally to build session header; always forward incoming Authorization
    const authResult = await verifyJWT(request);
    const fwdAuthHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const backendBase = ((process.env.BACKEND_URL && process.env.BACKEND_URL.length > 0) ? process.env.BACKEND_URL : Api).replace(/\/+$/,'');

    // Use BringuserHR endpoint like mobile app (parameter name is userName not search)
    let apiUrl = `${backendBase}/api/HR/BringuserHR?userName=${encodeURIComponent(query)}`;

    // Prepare headers: always forward Authorization if present, add X-Session-Data if we decoded JWT
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (fwdAuthHeader) {
      headers.Authorization = fwdAuthHeader;
    }
    if ((authResult as any)?.success && (authResult as any)?.user?.accessToken) {
      const sessionData = { user: (authResult as any).user.data };
      const sessionDataHeader = JSON.stringify(sessionData).replace(/[\u007F-\uFFFF]/g, (c) =>
        '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
      );
      headers['X-Session-Data'] = sessionDataHeader;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const ct = response.headers.get('content-type') || '';
      return ct.includes('application/json')
        ? NextResponse.json(await response.json().catch(() => ({})), { status: response.status })
        : NextResponse.json({ error: await response.text().catch(() => 'Backend error') }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in employee search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
