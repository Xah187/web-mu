import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

interface JWTVerificationResult {
  success: boolean;
  user?: {
    accessToken: string;
    sessionId: string;
    data: any;
  };
  error?: string;
}

export async function verifyJWT(request: NextRequest): Promise<JWTVerificationResult> {
  try {
    // Get auth token from Authorization header (same as mobile app)
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'No auth token found'
      };
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return {
        success: false,
        error: 'Invalid token format'
      };
    }

    // Validate JWT token with backend (same as backend middleware/jwt.js)
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_KEY);

      return {
        success: true,
        user: {
          accessToken: token,
          sessionId: '',
          data: decoded // Contains user session data like backend req.session.user
        }
      };
    } catch (jwtError) {
      console.error('JWT decode error:', jwtError);
      return {
        success: false,
        error: 'Invalid JWT token'
      };
    }

  } catch (error) {
    console.error('JWT verification error:', error);
    return {
      success: false,
      error: 'JWT verification failed'
    };
  }
}
