import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/middleware/jwt';
import { Api } from '@/lib/api/axios';

export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authResult = await verifyJWT(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: 'غير مصرح'
      }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received HR users management data:', body);

    const { idArray } = body;

    if (!idArray || !Array.isArray(idArray) || idArray.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'بيانات ناقصة'
      }, { status: 400 });
    }

    // Validate idArray structure
    for (const item of idArray) {
      if (!item.id || !item.action || !['add', 'cancel'].includes(item.action)) {
        return NextResponse.json({
          success: false,
          message: 'بنية البيانات غير صحيحة'
        }, { status: 400 });
      }
    }

    console.log('Processing HR users operations:', idArray);

    // Resolve backend base URL: prefer env, fallback to public Api constant
    const backendBase = ((process.env.BACKEND_URL && process.env.BACKEND_URL.length > 0) ? process.env.BACKEND_URL : Api).replace(/\/+$/,'');

    // Create session data for backend (same as backend req.session.user)
    const sessionData = {
      user: authResult.user.data // This contains the decoded JWT data
    };

    console.log('Sending session data to backend:', sessionData);
    // Make header value ASCII-safe by escaping non-ASCII as \uXXXX
    const sessionDataHeader = JSON.stringify(sessionData).replace(/[\u007F-\uFFFF]/g, (c) =>
      '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
    );

    // Send to backend API (same endpoint as mobile app)
    const preparationData = {
      idArray
    };

    console.log('Sending to backend:', preparationData);

    // Retry mechanism like mobile app (3 retries with exponential delay)
    let response;
    let lastError;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        response = await fetch(`${backendBase}/api/HR/addOrcansleUserfromuserPrepare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authResult.user.accessToken}`,
            'X-Session-Data': sessionDataHeader,
          },
          body: JSON.stringify(preparationData),
          signal: AbortSignal.timeout(30000), // 30 seconds timeout
        });

        // If successful, break out of retry loop
        if (response.ok) {
          break;
        }

        // If 500 error, retry
        if (response.status === 500 && attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed with 500 error, retrying...`);
          lastError = new Error(`Server error: ${response.status}`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }

        // For other errors, don't retry
        break;

      } catch (error: any) {
        lastError = error;
        console.log(`Attempt ${attempt} failed:`, error?.message || 'Unknown error');

        // Retry on network errors
        if (attempt < maxRetries && (error?.name === 'AbortError' || error?.message?.includes('fetch'))) {
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
      return NextResponse.json({
        success: false,
        message: `خطأ في الخادم: ${response.status}`
      });
    }

    const data = await response.json();
    console.log('HR users management result:', data);

    return NextResponse.json({
      success: true,
      message: data.success || 'تم تحديث صلاحيات التحضير بنجاح'
    });

  } catch (error) {
    console.error('Error in HR users management API:', error);
    return NextResponse.json({
      success: false,
      message: 'تعذر الاتصال بالخادم، حاول مرة أخرى'
    });
  }
}
