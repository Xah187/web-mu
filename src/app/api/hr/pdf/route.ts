import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/middleware/jwt';
import { Api } from '@/lib/api/axios';

export async function GET(request: NextRequest) {
  try {
    // Verify locally to build session header; always forward incoming Authorization
    const authResult = await verifyJWT(request);
    const fwdAuthHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const phoneNumber = searchParams.get('phoneNumber');

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    const backendBase = ((process.env.BACKEND_URL && process.env.BACKEND_URL.length > 0) ? process.env.BACKEND_URL : Api).replace(/\/+$/,'');

    // Use HRpdf endpoint like mobile app
    let apiUrl = `${backendBase}/api/HR/HRpdf?Dateday=${date}`;
    if (phoneNumber) {
      apiUrl += `&PhoneNumber=${phoneNumber}`;
    }

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

    // Backend returns JSON with file URL, not PDF directly
    const data = await response.json();

    if (data.success && data.url) {
      // Return the file URL so frontend can download from URLFIL
      return NextResponse.json({ success: true, url: data.url });
    } else {
      return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in PDF generation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
