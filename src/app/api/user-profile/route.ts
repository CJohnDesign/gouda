import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/firebase/admin';

export async function GET() {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json(
        { error: { message: 'No token provided', statusCode: 401 } },
        { status: 401 }
      );
    }

    // Verify Firebase token
    const decodedToken = await getAuth(adminApp).verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get user profile from Firestore
    const db = getFirestore(adminApp);
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData) {
      return NextResponse.json(
        { error: { message: 'User profile not found', statusCode: 404 } },
        { status: 404 }
      );
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', statusCode: 500 } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json(
        { error: { message: 'No token provided', statusCode: 401 } },
        { status: 401 }
      );
    }

    // Verify Firebase token
    const decodedToken = await getAuth(adminApp).verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get update data from request body
    const updates = await request.json();

    // Update Firestore profile
    const db = getFirestore(adminApp);
    await db.collection('users').doc(userId).update({
      ...updates,
      updatedAt: new Date()
    });

    // Update Firebase Auth display name
    if (updates.displayName !== undefined) {
      await getAuth(adminApp).updateUser(userId, {
        displayName: updates.displayName
      });
    }

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', statusCode: 500 } },
      { status: 500 }
    );
  }
} 