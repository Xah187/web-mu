import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to initiate branch deletion process
 * Replicates mobile app's Branchdeletionprocedures functionality
 * 
 * This endpoint:
 * 1. Validates user session
 * 2. Generates a 4-digit verification code
 * 3. Stores the deletion request in database
 * 4. Sends SMS with verification code
 * 
 * Mobile app equivalent: Branchdeletionprocedures in UpdateCompany.js
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Branch delete request API called');
    const { branchId } = await request.json();
    console.log('Received branchId:', branchId);

    if (!branchId) {
      console.error('No branchId provided');
      return NextResponse.json(
        { success: 'معرف الفرع مطلوب' },
        { status: 400 }
      );
    }

    // Get user session from headers
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid auth header');
      return NextResponse.json(
        { success: 'رمز المصادقة مطلوب' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token extracted, length:', token.length);

    // Make request to backend API - matching mobile app exactly
    // NOTE: Mobile app uses http://35.247.12.97:8080 directly
    // But web must use https://mushrf.net (which proxies to it)
    const backendUrl = 'https://mushrf.net/api';
    const apiUrl = `${backendUrl}/company/brinsh/deleteBranch?IDBrach=${branchId}`;
    console.log('Making request to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

    let data;
    try {
      const responseText = await response.text();
      console.log('Backend response text:', responseText);
      data = JSON.parse(responseText);
      console.log('Backend response data:', data);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      return NextResponse.json(
        { success: 'خطأ في استجابة الخادم' },
        { status: 500 }
      );
    }

    if (response.ok) {
      console.log('Branch deletion request successful');
      return NextResponse.json({
        success: 'تم إرسال رمز التحقق إلى هاتفك',
        message: 'يرجى إدخال الرمز المرسل لتأكيد حذف الفرع'
      });
    } else {
      console.error('Backend request failed:', response.status, data);
      return NextResponse.json(
        { success: data.success || 'فشل في إرسال رمز التحقق' },
        { status: response.status }
      );
    }
  } catch (error: any) {
    console.error('Error initiating branch deletion:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { success: error.message || 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
