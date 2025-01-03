import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { adminApp, db, auth } from '@/firebase/admin';
import { inviteUserToChannel, sendWelcomeMessage } from '@/lib/telegram';

export async function GET() {
  console.log('Starting GET request...');
  try {
    // Get auth token
    const headersList = await headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      console.log('No token provided');
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

    // Verify token and get user ID
    const decodedToken = await auth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user document
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    if (!userData) {
      console.log('User data not found for ID:', userId);
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

  } catch (error: any) {
    console.error('Error in GET request:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: { 
          message: 'Internal server error',
          details: error?.message || 'An unexpected error occurred'
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
    const allowedFields = ['displayName', 'firstName', 'lastName', 'phoneNumber', 'location', 'bio', 'telegramUsername'];
    const sanitizedData = Object.fromEntries(
      Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
    );

    // Add updatedAt timestamp
    sanitizedData.updatedAt = new Date();

    // Update user document
    await db.collection('users').doc(userId).update(sanitizedData);
    console.log('User document updated:', sanitizedData);

    // If telegramUsername is provided and user has active subscription, invite to channel
    if (sanitizedData.telegramUsername && typeof sanitizedData.telegramUsername === 'string') {
        console.log('Telegram username provided:', sanitizedData.telegramUsername);
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (userData?.subscriptionStatus === 'Active') {
            const channelId = 'j2wKdI8p38w1NmQ5'; // Channel username or ID without the + prefix
            console.log('Inviting user to channel...');
            
            // Remove @ prefix if present
            const cleanUsername = sanitizedData.telegramUsername.replace(/^@/, '');
            
            // First try welcome message
            const welcomeSent = await sendWelcomeMessage(cleanUsername);
            if (welcomeSent) {
                // If welcome message was successful, send the invite
                await inviteUserToChannel(cleanUsername, channelId);
                console.log('Invite and welcome message sent');
            } else {
                console.error('Failed to send welcome message - user might not exist or bot might not have permission');
            }
        }
    }

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in PATCH request:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error?.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 