import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const date = searchParams.get('date');

    if (!phoneNumber || !date) {
      return NextResponse.json({ error: 'Phone number and date are required' }, { status: 400 });
    }

    // Format date to match mobile app format (yy-MM)
    // Handle both full date strings and yy-MM format like mobile app
    let formattedDate = date;

    // If date looks like a full date (YYYY-MM-DD or similar), convert to yy-MM
    if (date.includes('-') && date.length > 5) {
      try {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear().toString().slice(-2);
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          formattedDate = `${year}-${month}`;
        }
      } catch (error) {
        console.error('Date parsing error:', error);
        // If parsing fails, assume it's already in yy-MM format
      }
    }

    // Call backend API for PDF generation (like mobile app)
    const response = await fetch(`${process.env.BACKEND_URL}/HR/HRpdf?PhoneNumber=${phoneNumber}&Dateday=${formattedDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    // Check if response is PDF
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      // Return PDF blob
      const pdfBuffer = await response.arrayBuffer();
      
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="preparation-report-${phoneNumber}-${formattedDate}.pdf"`,
        },
      });
    } else {
      // Return JSON response
      const data = await response.json();
      return NextResponse.json(data);
    }

  } catch (error) {
    console.error('Error in PDF generation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
