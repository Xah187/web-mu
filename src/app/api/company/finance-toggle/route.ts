import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || 'https://mushrf.net';

export async function GET(request: NextRequest) {
  try {
    // استخراج Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // استخراج معرف الشركة من query parameters
    const { searchParams } = new URL(request.url);
    const idCompany = searchParams.get('idCompany');

    if (!idCompany) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    console.log('Finance Toggle API - Company ID:', idCompany);
    console.log('Finance Toggle API - Auth Header exists:', !!authHeader);

    // استدعاء الـ backend API مباشرة مع تمرير الـ token
    const backendUrl = `${BACKEND_BASE_URL}/api/company/OpenOrCloseopreationStopfinance?idCompany=${idCompany}`;
    
    console.log('Finance Toggle API - Backend URL:', backendUrl);

    const response = await axios.get(backendUrl, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('Finance Toggle API - Backend Response Status:', response.status);
    console.log('Finance Toggle API - Backend Response Data:', response.data);

    return NextResponse.json(response.data, { status: response.status });

  } catch (error: any) {
    console.error('Finance Toggle API Error:', error);
    
    if (error.response) {
      // خطأ من الـ backend
      console.error('Backend Error Status:', error.response.status);
      console.error('Backend Error Data:', error.response.data);
      
      return NextResponse.json(
        error.response.data || { error: 'Backend error' },
        { status: error.response.status }
      );
    } else if (error.request) {
      // خطأ في الشبكة
      console.error('Network Error:', error.message);
      return NextResponse.json(
        { error: 'Network error - unable to reach backend' },
        { status: 503 }
      );
    } else {
      // خطأ آخر
      console.error('Unknown Error:', error.message);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}
