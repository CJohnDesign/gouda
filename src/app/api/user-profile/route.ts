import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { adminApp, db, auth } from '@/firebase/admin';

export async function GET() {
  console.log('Starting GET request...');
  try {
    // Get auth token
    const headersList = await headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];
    console.log('Token exists:', !!token);
    console.log('Token:', token?.substring(0, 10) + '...');

    if (!token) {
      console.log('No token provided');
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify token and get user ID
    console.log('Verifying token...');
    const decodedToken = await auth.verifyIdToken(token);
    console.log('Token verified successfully');
    const userId = decodedToken.uid;
    console.log('User ID:', userId);

    // Get user document
    console.log('Getting Firestore document...');
    const userDoc = await db.collection('users').doc(userId).get();
    console.log('Document exists:', userDoc.exists);

    // If no user document exists, create one
    if (!userDoc.exists) {
      console.log('Creating new user document...');
      const userData = {
        uid: userId,
        email: decodedToken.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        subscriptionStatus: 'Unpaid',
        displayName: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        profilePicUrl: '',
        location: '',
        bio: '',
        stripeCustomerId: ''
      };

      await db.collection('users').doc(userId).set(userData);
      console.log('New user document created');
      return new NextResponse(
        JSON.stringify({
          ...userData,
          createdAt: userData.createdAt.toISOString(),
          updatedAt: userData.updatedAt.toISOString()
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Return existing user data
    const userData = userDoc.data();
    console.log('Got user data:', !!userData);
    console.log('User data fields:', userData ? Object.keys(userData) : 'null');
    
    if (!userData) {
      console.log('User data is null');
      return new NextResponse(
        JSON.stringify({ error: 'User data not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Convert dates to ISO strings for JSON
    const processedData = {
      ...userData,
      createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: userData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    };

    console.log('Sending response...');
    return new NextResponse(
      JSON.stringify(processedData),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in GET request:', error?.message || error);
    if (error?.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error?.message || 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 