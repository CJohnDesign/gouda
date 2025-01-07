import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/firebase/admin'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Verify the Firebase ID token
    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Get user profile from Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get()
    
    if (!userDoc.exists) {
      // Create a new user profile if it doesn't exist
      const newUser = {
        id: uid,
        email: decodedToken.email || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          isPublished: false,
          isFeatured: false,
          isPrivate: true,
          isDeleted: false,
          isDraft: false,
          isPending: false,
          isApproved: false,
          isRejected: false,
          isHidden: false,
        }
      }
      
      await adminDb.collection('users').doc(uid).set(newUser)
      return NextResponse.json(newUser)
    }

    return NextResponse.json(userDoc.data())
  } catch (error) {
    console.error('Error in user-profile API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Verify the Firebase ID token
    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Get the update data from request body
    const updateData = await request.json()

    // Update the user profile in Firestore
    await adminDb.collection('users').doc(uid).update({
      ...updateData,
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
} 