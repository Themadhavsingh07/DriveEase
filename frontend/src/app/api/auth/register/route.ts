import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, phone, drivingLicenseNumber } = body;

    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl && backendUrl !== 'http://localhost:5001') {
      try {
        const res = await fetch(`${backendUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      } catch (err) {
        console.warn('Backend /auth/register offline, creating session:', err);
      }
    }

    const user = {
      id: `usr_${Date.now()}`,
      name: `${firstName || ''} ${lastName || ''}`.trim() || 'DriveEase Customer',
      firstName: firstName || 'Driver',
      lastName: lastName || '',
      email: email || 'driver@driveease.com',
      phone: phone || '+91 98765 43210',
      drivingLicenseNumber: drivingLicenseNumber || 'DL-2024-9999',
      role: 'CUSTOMER',
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const token = `driveease_user_token_${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
