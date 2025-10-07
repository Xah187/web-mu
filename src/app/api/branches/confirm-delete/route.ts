import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to confirm branch deletion with verification code
 * Replicates mobile app's Implementedbyopreation functionality
 * 
 * This endpoint:
 * 1. Validates user session
 * 2. Verifies the 4-digit code
 * 3. Deletes all projects associated with the branch
 * 4. Deletes the branch itself
 * 5. Cleans up deletion request record
 * 
 * Mobile app equivalent: Implementedbyopreation in UpdateCompany.js
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== Confirm Delete API Called ===');
    const { verificationCode } = await request.json();
    console.log('Verification code received:', verificationCode);

    if (!verificationCode) {
      console.error('No verification code provided');
      return NextResponse.json(
        { success: 'رمز التحقق مطلوب' },
        { status: 400 }
      );
    }

    // Validate code format (4 digits)
    if (!/^\d{4}$/.test(verificationCode)) {
      console.error('Invalid code format:', verificationCode);
      return NextResponse.json(
        { success: 'رمز التحقق يجب أن يكون 4 أرقام' },
        { status: 400 }
      );
    }

    // Verify JWT and get user session data
    const { verifyJWT } = await import('@/middleware/jwt');
    const authResult = await verifyJWT(request);

    if (!authResult.success || !authResult.user) {
      console.error('JWT verification failed:', authResult.error);
      return NextResponse.json(
        { success: 'رمز المصادقة غير صحيح' },
        { status: 401 }
      );
    }

    const token = authResult.user.accessToken;
    const userData = authResult.user.data;
    console.log('JWT verified successfully');
    console.log('User data:', {
      userName: userData?.userName,
      IDCompany: userData?.IDCompany,
      PhoneNumber: userData?.PhoneNumber
    });

    // Make request to backend API to verify code and delete branch
    // Backend expects req.session.user, so we send X-Session-Data header
    // NOTE: Mobile app uses http://35.247.12.97:8080 directly
    // But web must use https://mushrf.net (which proxies to it)
    const backendUrl = 'https://mushrf.net/api';
    const apiUrl = `${backendUrl}/company/brinsh/Implementedbyopreation?check=${verificationCode}`;

    console.log('Making request to backend:', apiUrl);
    console.log('User data:', {
      userName: userData?.userName,
      IDCompany: userData?.IDCompany,
      PhoneNumber: userData?.PhoneNumber
    });

    // Prepare headers with session data (like HR APIs)
    const sessionData = { user: userData };
    const sessionDataHeader = JSON.stringify(sessionData).replace(/[\u007F-\uFFFF]/g, (c) =>
      '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
    );

    let response;
    let data;

    try {
      console.log('Calling backend API with DELETE method (matching mobile app)...');
      response = await fetch(apiUrl, {
        method: 'DELETE', // Mobile app uses DELETE, not GET!
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Session-Data': sessionDataHeader
        },
      });
      console.log('✅ Backend response received, status:', response.status);
    } catch (fetchError: any) {
      console.error('❌ Fetch error:', fetchError);
      console.error('Fetch error message:', fetchError.message);
      return NextResponse.json(
        { success: `خطأ في الاتصال بالخادم: ${fetchError.message}` },
        { status: 500 }
      );
    }

    console.log('Backend response status:', response.status);
    console.log('Backend response statusText:', response.statusText);
    console.log('Backend response ok:', response.ok);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

    try {
      const responseText = await response.text();
      console.log('Backend response text length:', responseText.length);
      console.log('Backend response text:', responseText.substring(0, 500)); // First 500 chars

      if (!responseText) {
        console.error('Empty response from backend');
        return NextResponse.json(
          { success: 'استجابة فارغة من الخادم' },
          { status: 500 }
        );
      }

      data = JSON.parse(responseText);
      console.log('Backend response data:', JSON.stringify(data, null, 2));
    } catch (parseError: any) {
      console.error('Failed to parse response:', parseError);
      console.error('Parse error message:', parseError.message);
      return NextResponse.json(
        { success: `خطأ في تحليل استجابة الخادم: ${parseError.message}` },
        { status: 500 }
      );
    }

    if (response.ok) {
      console.log('✅✅✅ Branch deletion confirmed successfully! ✅✅✅');
      console.log('Backend confirmed deletion with message:', data?.success);
      console.log('⚠️ NOTE: If branch still exists, backend may not have found deletion request in database');
      console.log('⚠️ Check backend logs for SELECTTableBranchdeletionRequests result');
      return NextResponse.json({
        success: data?.success || 'تم حذف الفرع بنجاح',
        message: data?.message || 'تم حذف الفرع وجميع المشاريع المرتبطة به'
      });
    } else {
      console.error('❌ Backend request failed with status:', response.status);
      console.error('Backend error data:', data);

      // Handle specific error cases
      if (response.status === 404) {
        console.log('Code not found or expired');
        return NextResponse.json(
          { success: data?.success || data?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية' },
          { status: 400 }
        );
      } else if (response.status === 403) {
        console.log('Permission denied');
        return NextResponse.json(
          { success: data?.success || data?.message || 'ليس لديك صلاحية لحذف هذا الفرع' },
          { status: 403 }
        );
      } else if (response.status === 400) {
        console.log('Bad request');
        return NextResponse.json(
          { success: data?.success || data?.message || 'طلب غير صحيح' },
          { status: 400 }
        );
      } else {
        console.log('Other error:', response.status, data);
        return NextResponse.json(
          { success: data?.success || data?.message || `فشل في حذف الفرع (${response.status})` },
          { status: response.status }
        );
      }
    }
  } catch (error: any) {
    console.error('=== CRITICAL ERROR in confirm-delete API ===');
    console.error('Error type:', typeof error);
    console.error('Error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    console.error('Error name:', error?.name);

    return NextResponse.json(
      {
        success: `خطأ في الخادم: ${error?.message || 'خطأ غير معروف'}`,
        error: error?.message,
        type: error?.name
      },
      { status: 500 }
    );
  }
}
