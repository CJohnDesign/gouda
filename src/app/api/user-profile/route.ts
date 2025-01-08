import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb, assertFirebaseAdmin } from '@/firebase/admin'
import { type FirebaseError } from 'firebase-admin'

interface AuthError extends FirebaseError {
  code: 'auth/id-token-expired' | 'auth/id-token-revoked' | 'auth/invalid-id-token' | 'auth/argument-error' | string
}

interface ExtendedError extends Error {
  code?: string
}

export async function GET(request: NextRequest) {
  try {
    console.log('[user-profile] API route invoked')
    console.log('[user-profile] Request details:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    })

    // First, ensure Firebase Admin is properly initialized
    try {
      console.log('[user-profile] Checking Firebase Admin initialization')
      assertFirebaseAdmin()
      console.log('[user-profile] Firebase Admin initialization verified')
    } catch (initError) {
      console.error('[user-profile] Firebase Admin initialization error:', initError)
      console.error('[user-profile] Initialization error details:', {
        message: initError instanceof Error ? initError.message : 'Unknown error',
        stack: initError instanceof Error ? initError.stack : undefined,
        type: typeof initError,
        keys: initError && typeof initError === 'object' ? Object.keys(initError) : []
      })
      return NextResponse.json(
        { 
          error: 'Firebase Admin not initialized',
          details: initError instanceof Error ? initError.message : 'Unknown initialization error',
          type: typeof initError
        },
        { status: 500 }
      )
    }

    console.log('[user-profile] Starting request handling')
    console.log('[user-profile] Request headers:', {
      authorization: request.headers.has('Authorization'),
      contentType: request.headers.get('Content-Type'),
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent'),
      allHeaders: Object.fromEntries(request.headers.entries())
    })
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('[user-profile] Auth header present:', !!authHeader)
    console.log('[user-profile] Auth header format:', authHeader ? {
      startsWithBearer: authHeader.startsWith('Bearer '),
      length: authHeader.length,
      truncated: `${authHeader.substring(0, 20)}...${authHeader.substring(authHeader.length - 20)}`
    } : 'No auth header')

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[user-profile] Missing or invalid authorization header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Verify the Firebase ID token
    const idToken = authHeader.split('Bearer ')[1]
    try {
      console.log('[user-profile] Verifying Firebase token')
      
      // Check if Firebase Admin is initialized
      if (!adminAuth) {
        console.error('[user-profile] Firebase Admin Auth is not initialized')
        return NextResponse.json(
          { 
            error: 'Firebase Admin not initialized',
            details: 'The server is not properly configured to handle authentication'
          },
          { status: 500 }
        )
      }

      // Verify and decode the token with checks
      console.log('[user-profile] Attempting to verify token')
      const decodedToken = await adminAuth.verifyIdToken(idToken, true)
      console.log('[user-profile] Token verified successfully for user:', decodedToken.uid)
      
      // Check if the token is expired
      const tokenExpirationTime = decodedToken.exp * 1000 // Convert to milliseconds
      const currentTime = Date.now()
      console.log('[user-profile] Token expiration check:', {
        expirationTime: new Date(tokenExpirationTime).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
        isExpired: currentTime >= tokenExpirationTime
      })

      if (currentTime >= tokenExpirationTime) {
        console.log('[user-profile] Token has expired')
        return NextResponse.json(
          { error: 'Token has expired', code: 'auth/id-token-expired' },
          { status: 401 }
        )
      }

      const uid = decodedToken.uid
      console.log('[user-profile] Processing request for user:', uid)

      // Get user profile from Firestore
      try {
        console.log('[user-profile] Attempting to fetch user document from Firestore')
        
        // Check if Firestore is initialized
        if (!adminDb) {
          console.error('[user-profile] Firebase Admin Firestore is not initialized')
          return NextResponse.json(
            { 
              error: 'Firestore not initialized',
              details: 'The server is not properly configured to access the database'
            },
            { status: 500 }
          )
        }

        console.log('[user-profile] Querying Firestore for user:', uid)
        const userDoc = await adminDb.collection('users').doc(uid).get()
        console.log('[user-profile] Firestore query completed. Document exists:', userDoc.exists)
        
        if (!userDoc.exists) {
          // Create a new user profile if it doesn't exist
          console.log('[user-profile] Creating new user profile')
          const newUser = {
            id: uid,
            uid: uid,
            email: decodedToken.email || '',
            name: decodedToken.name || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            playlists: [],
            favoriteSongs: [],
            favoriteArtists: [],
            favoriteAlbums: [],
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
          
          try {
            console.log('[user-profile] Attempting to create new user document')
            await adminDb.collection('users').doc(uid).set(newUser)
            console.log('[user-profile] New user profile created successfully')
            return NextResponse.json(newUser)
          } catch (setError) {
            console.error('[user-profile] Error creating new user profile:', setError)
            console.error('[user-profile] Error details:', {
              message: setError instanceof Error ? setError.message : 'Unknown error',
              stack: setError instanceof Error ? setError.stack : undefined,
              code: (setError as ExtendedError).code
            })
            return NextResponse.json(
              { 
                error: 'Failed to create user profile', 
                details: setError instanceof Error ? setError.message : 'Unknown error',
                stack: setError instanceof Error ? setError.stack : undefined
              },
              { status: 500 }
            )
          }
        }

        console.log('[user-profile] Returning existing user profile')
        const userData = userDoc.data()
        console.log('[user-profile] Profile data keys:', Object.keys(userData || {}))
        return NextResponse.json(userData)
      } catch (firestoreError) {
        console.error('[user-profile] Error accessing Firestore:', firestoreError)
        console.error('[user-profile] Error details:', {
          message: firestoreError instanceof Error ? firestoreError.message : 'Unknown error',
          stack: firestoreError instanceof Error ? firestoreError.stack : undefined,
          code: (firestoreError as ExtendedError).code
        })
        return NextResponse.json(
          { 
            error: 'Database access error', 
            details: firestoreError instanceof Error ? firestoreError.message : 'Unknown error',
            stack: firestoreError instanceof Error ? firestoreError.stack : undefined
          },
          { status: 500 }
        )
      }
    } catch (error) {
      console.error('[user-profile] Error verifying token:', error)
      console.error('[user-profile] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        code: (error as ExtendedError).code
      })

      // Handle specific Firebase Auth errors
      if (error && typeof error === 'object' && 'code' in error) {
        const authError = error as AuthError
        console.log('[user-profile] Firebase Auth error code:', authError.code)
        switch (authError.code) {
          case 'auth/id-token-expired':
            return NextResponse.json(
              { error: 'Token has expired', code: authError.code },
              { status: 401 }
            )
          case 'auth/id-token-revoked':
            return NextResponse.json(
              { error: 'Token has been revoked', code: authError.code },
              { status: 401 }
            )
          case 'auth/invalid-id-token':
            return NextResponse.json(
              { error: 'Invalid token format', code: authError.code },
              { status: 401 }
            )
          case 'auth/argument-error':
            return NextResponse.json(
              { error: 'Invalid token argument', code: authError.code },
              { status: 400 }
            )
          default:
            return NextResponse.json(
              { error: 'Authentication failed', code: authError.code },
              { status: 401 }
            )
        }
      }

      return NextResponse.json(
        { 
          error: 'Invalid authentication token',
          details: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('[user-profile] Unhandled error in API route:', error)
    console.error('[user-profile] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as ExtendedError).code,
      type: typeof error,
      keys: error && typeof error === 'object' ? Object.keys(error) : []
    })
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined,
        type: typeof error
      },
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
    try {
      // Verify and decode the token with checks
      const decodedToken = await adminAuth.verifyIdToken(idToken, true)
      
      // Check if the token is expired
      const tokenExpirationTime = decodedToken.exp * 1000 // Convert to milliseconds
      if (Date.now() >= tokenExpirationTime) {
        return NextResponse.json(
          { error: 'Token has expired', code: 'auth/id-token-expired' },
          { status: 401 }
        )
      }

      const uid = decodedToken.uid

      // Get the update data from request body
      const updateData = await request.json()

      // Update the user profile in Firestore
      try {
        await adminDb.collection('users').doc(uid).update({
          ...updateData,
          updatedAt: new Date().toISOString()
        })

        return NextResponse.json({ success: true })
      } catch (updateError) {
        console.error('Error updating user profile:', updateError)
        return NextResponse.json(
          { 
            error: 'Failed to update profile in database',
            details: updateError instanceof Error ? updateError.message : 'Unknown error'
          },
          { status: 500 }
        )
      }
    } catch (error) {
      console.error('Error verifying token:', error)
      
      // Handle specific Firebase Auth errors
      if (error && typeof error === 'object' && 'code' in error) {
        const authError = error as AuthError
        switch (authError.code) {
          case 'auth/id-token-expired':
            return NextResponse.json(
              { error: 'Token has expired', code: authError.code },
              { status: 401 }
            )
          case 'auth/id-token-revoked':
            return NextResponse.json(
              { error: 'Token has been revoked', code: authError.code },
              { status: 401 }
            )
          case 'auth/invalid-id-token':
            return NextResponse.json(
              { error: 'Invalid token format', code: authError.code },
              { status: 401 }
            )
          case 'auth/argument-error':
            return NextResponse.json(
              { error: 'Invalid token argument', code: authError.code },
              { status: 400 }
            )
          default:
            return NextResponse.json(
              { error: 'Authentication failed', code: authError.code },
              { status: 401 }
            )
        }
      }
      
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error in user-profile API:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to update profile',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
} 