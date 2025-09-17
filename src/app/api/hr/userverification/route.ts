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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // CheckIn or CheckOut

    if (!type || !['CheckIn', 'CheckOut'].includes(type)) {
      return NextResponse.json({ error: 'نوع التحضير غير صحيح' }, { status: 400 });
    }

    console.log('Checking user verification for:', {
      type: type
    });

    // Get today's date in YY-MM-DD format (same as mobile app)
    // const today = new Date();
    // const formattedDate = today.toISOString().slice(2, 10); // YY-MM-DD format

    // Resolve backend base URL: prefer env, fallback to public Api constant
    const backendBase = ((process.env.BACKEND_URL && process.env.BACKEND_URL.length > 0) ? process.env.BACKEND_URL : Api).replace(/\/+$/,'');

    // Check user's preparation status for today
    const apiUrl = `${backendBase}/api/HR/Userverification?type=${type}`;

    console.log('Calling backend API:', apiUrl);
    console.log('Backend base URL:', backendBase);
    console.log('With token:', authResult.user.accessToken ? 'Token exists' : 'No token');

    // Create session data for backend (same as backend req.session.user)
    const sessionData = {
      user: authResult.user.data // This contains the decoded JWT data
    };

    console.log('Sending session data to backend:', sessionData);
    // Make header value ASCII-safe by escaping non-ASCII as \uXXXX (so it can be sent in HTTP headers)
    const sessionDataHeader = JSON.stringify(sessionData).replace(/[\u007F-\uFFFF]/g, (c) =>
      '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
    );


    // Retry mechanism like mobile app (10 retries with exponential delay)
    let response;
    let lastError;
    const maxRetries = 10;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authResult.user.accessToken}`,
            'X-Session-Data': sessionDataHeader, // ASCII-escaped JSON session data for header
          },
          // Add timeout like mobile app
          signal: AbortSignal.timeout(30000), // 30 seconds timeout
        });

        // If successful, break out of retry loop
        if (response.ok) {
          break;
        }

        // If 500 error, retry (like mobile app axiosRetry condition)
        if (response.status === 500 && attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed with 500 error, retrying...`);
          lastError = new Error(`Server error: ${response.status}`);
          // Exponential delay: 2^attempt * 1000ms
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }

        // For other errors, don't retry
        break;

      } catch (error: any) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error?.message || 'Unknown error');

        // Retry on network errors (like mobile app)
        if (attempt < maxRetries && (error?.name === 'AbortError' || error?.message?.includes('fetch'))) {
          // Exponential delay: 2^attempt * 1000ms
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }

        // If not retryable error or max retries reached, break
        break;
      }
    }

    if (!response) {
      throw lastError || new Error('تعذر الاتصال بالخادم بعد عدة محاولات');
    }

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);

      // Same as mobile app - always return 200 with success: false
      return NextResponse.json({
        success: false,
        message: `خطأ في الخادم: ${response.status}`
      });
    }

    const data = await response.json();
    console.log('User verification result:', data);

    return NextResponse.json({
      success: data.success,
      token: data.token,
      nameFile: data.nameFile,
      message: data.message
    });

  } catch (error) {
    console.error('Error in user verification API:', error);
    // Align with mobile app behavior: never throw to client; return success:false
    return NextResponse.json({
      success: false,
      message: 'تعذر الاتصال بالخادم، حاول مرة أخرى'
    });
  }
}
