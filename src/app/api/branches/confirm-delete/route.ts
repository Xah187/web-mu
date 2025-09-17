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
    const { verificationCode } = await request.json();

    if (!verificationCode) {
      return NextResponse.json(
        { success: 'رمز التحقق مطلوب' },
        { status: 400 }
      );
    }

    // Validate code format (4 digits)
    if (!/^\d{4}$/.test(verificationCode)) {
      return NextResponse.json(
        { success: 'رمز التحقق يجب أن يكون 4 أرقام' },
        { status: 400 }
      );
    }

    // Get user session from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: 'رمز المصادقة مطلوب' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Make request to backend API to verify code and delete branch
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.moshrif.app';
    
    const response = await fetch(`${backendUrl}/company/brinsh/Implementedbyopreation?check=${verificationCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: 'تم حذف الفرع بنجاح',
        message: 'تم حذف الفرع وجميع المشاريع المرتبطة به'
      });
    } else {
      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json(
          { success: 'رمز التحقق غير صحيح أو منتهي الصلاحية' },
          { status: 400 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          { success: 'ليس لديك صلاحية لحذف هذا الفرع' },
          { status: 403 }
        );
      } else {
        return NextResponse.json(
          { success: data.success || 'فشل في حذف الفرع' },
          { status: response.status }
        );
      }
    }
  } catch (error) {
    console.error('Error confirming branch deletion:', error);
    return NextResponse.json(
      { success: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}
