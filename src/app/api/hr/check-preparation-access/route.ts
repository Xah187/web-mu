import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Call backend API to check special preparation access (like mobile app)
    const response = await fetch(`${process.env.BACKEND_URL}/HR/openViliteduser?PhoneNumber=${phoneNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      hasAccess: data.success || false,
      data: data.data || null,
    });

  } catch (error) {
    console.error('Error in check preparation access API:', error);
    return NextResponse.json(
      { error: 'Internal server error', hasAccess: false },
      { status: 500 }
    );
  }
}
