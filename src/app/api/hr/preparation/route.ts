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
    const lastID = searchParams.get('lastID') || '0';

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Backend expects monthly key YYYY-MM (matches SQLite strftime("%Y-%m"))
    let formattedDate = date;

    // If date includes day (YYYY-MM-DD), normalize to YYYY-MM
    if (/^\d{4}-\d{2}(-\d{2})?$/.test(date)) {
      try {
        const d = new Date(date.length === 7 ? `${date}-01` : date);
        if (!isNaN(d.getTime())) {
          const year = d.getUTCFullYear();
          const month = String(d.getUTCMonth() + 1).padStart(2, '0');
          formattedDate = `${year}-${month}`;
        }
      } catch (e) {
        console.error('Date parsing error:', e);
      }
    }

    // Convert yy-MM to YYYY-MM if provided
    if (/^\d{2}-\d{2}$/.test(formattedDate)) {
      const [yy, mm] = formattedDate.split('-');
      formattedDate = `20${yy}-${mm}`;
    }

    const backendBase = ((process.env.BACKEND_URL && process.env.BACKEND_URL.length > 0) ? process.env.BACKEND_URL : Api).replace(/\/+$/,'');

    let apiUrl = `${backendBase}/api/HR/BringHR?Dateday=${formattedDate}&LastID=${lastID}`;

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

    // If phoneNumber is provided, use SearchHR endpoint instead
    if (phoneNumber) {
      apiUrl = `${backendBase}/api/HR/SearchHR?Dateday=${formattedDate}&LastID=${lastID}&PhoneNumber=${phoneNumber}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // Try to forward backend error/body and status instead of masking as 500
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errJson = await response.json().catch(() => ({}));
        return NextResponse.json(errJson || { error: 'Backend error' }, { status: response.status });
      } else {
        const errText = await response.text().catch(() => 'Backend error');
        return NextResponse.json({ error: errText }, { status: response.status });
      }
    }

    const data = await response.json();

    // Safely parse file JSON fields if they are valid JSON strings
    const safeParse = (val: any) => {
      if (val == null) return null;
      if (typeof val !== 'string') return val;
      try { return JSON.parse(val); } catch { return null; }
    };

    const processedData = Array.isArray(data?.data)
      ? data.data.map((item: any) => ({
          ...item,
          CheckInFile: safeParse(item?.CheckInFile),
          CheckoutFile: safeParse(item?.CheckoutFile),
        }))
      : [];

    return NextResponse.json({
      success: true,
      data: processedData,
    });

  } catch (error) {
    console.error('Error in preparation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    console.log('Received preparation data:', body);

    const { PhoneNumber, type, DateDay, Checktime, CheckFile } = body;

    if (!PhoneNumber || !type || !DateDay || !Checktime || !CheckFile) {
      return NextResponse.json({
        success: false,
        message: 'بيانات ناقصة'
      }, { status: 400 });
    }

    // Derive DateDay in UTC to match backend Userverification logic (uses UTC date)
    // Prefer using provided Checktime; fallback to current time
    let convertedDateDay = '';
    try {
      const base = Checktime ? new Date(Checktime) : new Date();
      if (!isNaN(base.getTime())) {
        const yyyy = base.getUTCFullYear();
        const mm = String(base.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(base.getUTCDate()).padStart(2, '0');
        convertedDateDay = `${yyyy}-${mm}-${dd}`;
      }
    } catch {}
    // Fallback: if still empty, normalize incoming DateDay to YYYY-MM-DD
    if (!convertedDateDay) {
      if (DateDay && DateDay.length === 8 && DateDay.includes('-')) {
        const parts = DateDay.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          const year = parseInt(parts[0]) + 2000;
          convertedDateDay = `${year}-${parts[1]}-${parts[2]}`;
        }
      } else if (DateDay && DateDay.length === 10) {
        convertedDateDay = DateDay;
      } else {
        const now = new Date();
        const yyyy = now.getUTCFullYear();
        const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(now.getUTCDate()).padStart(2, '0');
        convertedDateDay = `${yyyy}-${mm}-${dd}`;
      }
    }

    // Send to backend API (same endpoint as mobile app)
    const preparationData = {
      PhoneNumber,
      type,
      DateDay: convertedDateDay, // Use converted date
      Checktime,
      CheckFile
    };

    console.log('Sending to backend:', preparationData);

    const backendBase = ((process.env.BACKEND_URL && process.env.BACKEND_URL.length > 0) ? process.env.BACKEND_URL : Api).replace(/\/+$/,'');

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
        response = await fetch(`${backendBase}/api/HR/Preparation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authResult.user.accessToken}`,
            'X-Session-Data': sessionDataHeader, // ASCII-escaped JSON session data for header
          },
          body: JSON.stringify(preparationData),
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

    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Backend error response:', errorText);

      return NextResponse.json({
        success: false,
        message: 'خطأ في الخادم'
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('Backend response:', data);

    return NextResponse.json({
      success: true,
      message: type === 'CheckIn' ? 'تم تسجيل الدخول بنجاح' : 'تم تسجيل الخروج بنجاح',
      data: data
    });

  } catch (error) {
    console.error('Error in preparation POST API:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء معالجة الطلب'
      },
      { status: 500 }
    );
  }
}