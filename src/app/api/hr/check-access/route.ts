import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '@/lib/api/axios';

/**
 * Check if user has HR access permissions
 * Matches mobile app's openViliteduser API call
 */
export async function GET(request: NextRequest) {
  try {
    // Get authorization token from request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'غير مصرح', hasAccess: false },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Call backend API to check HR permissions (matching mobile app)
    const response = await axiosInstance.get('/HR/openViliteduser', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // Return the result from backend
    return NextResponse.json({
      hasAccess: response.data?.success || false,
      message: response.data?.message || ''
    });

  } catch (error: any) {
    console.error('Error checking HR access:', error);
    
    // Return false on error (user doesn't have access)
    return NextResponse.json(
      { 
        error: error.message || 'خطأ في التحقق من الصلاحيات',
        hasAccess: false 
      },
      { status: error.response?.status || 500 }
    );
  }
}

