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

    // Make request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.moshrif.app';
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

    const data = await response.json();
    console.log('Backend response data:', data);

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
  } catch (error) {
    console.error('Error initiating branch deletion:', error);
    return NextResponse.json(
      { success: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
