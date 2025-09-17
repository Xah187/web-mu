import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/middleware/jwt';
import { Api } from '@/lib/api/axios';

export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const authResult = await verifyJWT(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    console.log('Loading HR users with preparation access');

    // Resolve backend base URL: prefer env, fallback to public Api constant
    const backendBase = ((process.env.BACKEND_URL && process.env.BACKEND_URL.length > 0) ? process.env.BACKEND_URL : Api).replace(/\/+$/,'');

    // Get users who have preparation access
    const apiUrl = `${backendBase}/api/HR/BringUserprepare`;

    console.log('Calling backend API:', apiUrl);

    // Create session data for backend (same as backend req.session.user)
    const sessionData = {
      user: authResult.user.data // This contains the decoded JWT data
    };

    // Make header value ASCII-safe by escaping non-ASCII as \uXXXX
    const sessionDataHeader = JSON.stringify(sessionData).replace(/[\u007F-\uFFFF]/g, (c) =>
      '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
    );

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authResult.user.accessToken}`,
        'X-Session-Data': sessionDataHeader,
      },
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      return NextResponse.json({
        success: false,
        message: `خطأ في الخادم: ${response.status}`
      });
    }

    const data = await response.json();
    console.log('HR users result:', data);

    return NextResponse.json({
      success: true,
      data: data.data || []
    });

  } catch (error) {
    console.error('Error in HR users API:', error);
    return NextResponse.json({
      success: false,
      message: 'تعذر الاتصال بالخادم، حاول مرة أخرى'
    });
  }
}
