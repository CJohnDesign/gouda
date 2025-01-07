import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth, db, initAdmin } from '@/firebase/admin';
import { inviteUserToChannel, sendWelcomeMessage } from '@/lib/telegram';

// Initialize Firebase Admin
initAdmin();

// Define error interface
interface ApiError extends Error {
  code?: string;
  details?: string;
}

export async function GET() {
  try {
    // Get auth token
    const headersList = await headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      console.error('No authorization token provided');
      return new NextResponse(
        JSON.stringify({ 
          error: { 
            message: 'No token provided',
            details: 'Authorization token is required'
          } 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Verify token and get user ID
      const decodedToken = await auth.verifyIdToken(token);
      const userId = decodedToken.uid;
      console.log('Token verified for user:', userId);

      // Get user document
      const userDoc = await db.collection('users').doc(userId).get();
      console.log('Firestore query completed, document exists:', userDoc.exists);
      
      const userData = userDoc.data();
      
      if (!userData) {
        console.error('No user data found for ID:', userId);
        return new NextResponse(
          JSON.stringify({ 
            error: { 
              message: 'User data not found',
              details: 'No user profile exists for this account'
            } 
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new NextResponse(
        JSON.stringify(userData),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } catch (tokenError) {
      console.error('Error verifying token:', tokenError);
      return new NextResponse(
        JSON.stringify({ 
          error: { 
            message: 'Invalid token',
            details: tokenError instanceof Error ? tokenError.message : 'Token verification failed'
          } 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    console.error('Unhandled error in user profile API:', error);
    const apiError = error as ApiError;
    return new NextResponse(
      JSON.stringify({ 
        error: { 
          message: 'Internal server error',
          details: apiError.message || 'An unexpected error occurred',
          code: apiError.code
        } 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Get auth token
    const headersList = await headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify token and get user ID
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get update data
    const updateData = await request.json();

    // Fields that are allowed to be updated
    const allowedFields = ['telegramUsername', 'firstName', 'lastName', 'phoneNumber', 'location', 'bio'];
    const sanitizedData = Object.fromEntries(
      Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
    );

    // Add updatedAt timestamp
    sanitizedData.updatedAt = new Date();

    // Update user document
    await db.collection('users').doc(userId).update(sanitizedData);

    // Handle Telegram integration
    if (sanitizedData.telegramUsername && typeof sanitizedData.telegramUsername === 'string') {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (userData?.subscriptionStatus === 'Active') {
            const channelId = 'j2wKdI8p38w1NmQ5';
            const cleanUsername = sanitizedData.telegramUsername.replace(/^@/, '');
            
            const welcomeSent = await sendWelcomeMessage(cleanUsername);
            if (welcomeSent) {
                await inviteUserToChannel(cleanUsername, channelId);
            }
        }
    }

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const apiError = error as ApiError;
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: apiError.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 