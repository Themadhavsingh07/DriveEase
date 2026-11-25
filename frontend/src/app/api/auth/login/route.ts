import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. If external backend is configured in production, attempt forwarding
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl && backendUrl !== 'http://localhost:5001') {
      try {
        const res = await fetch(`${backendUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      } catch (err) {
        console.warn('Forwarding to backend failed, checking verified credentials:', err);
      }
    }

    // 2. Verified admin credentials
    if (email === 'madhavvats@gmail.com' && password === 'admin123') {
      const user = {
        id: 'usr_admin_madhav_001',
        name: 'Madhav Vats',
        firstName: 'Madhav',
        lastName: 'Vats',
        email: 'madhavvats@gmail.com',
        role: 'ADMIN',
        phone: '+91 98765 43210',
        drivingLicenseNumber: 'DL-ADMIN-2024-9988',
        emailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      const token = 'driveease_admin_jwt_session_token_2026';
      return NextResponse.json({
        success: true,
        message: 'Admin authentication successful',
        data: {
          user,
          token,
        },
      });
    }

    // 3. Verified customer credentials
    if (
      (email === 'customer@driveease.com' && password === 'password123') ||
      (email && password === 'password123')
    ) {
      const user = {
        id: 'usr_customer_demo_002',
        name: email.split('@')[0].replace('.', ' '),
        firstName: email.split('@')[0],
        lastName: 'Customer',
        email,
        role: 'CUSTOMER',
        phone: '+91 98765 43211',
        drivingLicenseNumber: 'DL-CUST-2024-1122',
        emailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      const token = 'driveease_customer_jwt_session_token_2026';
      return NextResponse.json({
        success: true,
        message: 'Customer authentication successful',
        data: {
          user,
          token,
        },
      });
    }

    // 4. Invalid credentials
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid email or password. Please use the verified demo accounts (Fill Customer or Fill Admin).',
      },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || 'Authentication processing error',
      },
      { status: 500 }
    );
  }
}
