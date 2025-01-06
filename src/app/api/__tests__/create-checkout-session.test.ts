import { NextRequest } from 'next/server'
import { POST } from '../create-checkout-session/route'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { stripe } from '@/lib/stripe'

// Mock Firebase Admin
jest.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
    batch: jest.fn(() => ({
      update: jest.fn(),
      commit: jest.fn(),
    })),
  },
}))

// Mock Stripe
jest.mock('@/lib/stripe', () => ({
  stripe: {
    customers: {
      create: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

describe('POST /api/create-checkout-session', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Create a new mock request with authorization header and price ID
    mockRequest = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
      },
    })

    // Mock the json method
    jest.spyOn(mockRequest, 'json').mockResolvedValue({
      priceId: 'price_123',
    })

    // Mock Firebase Auth to return a valid token by default
    ;(adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({
      uid: 'test-uid',
      email: 'test@example.com',
    })
  })

  describe('Request Body Validation', () => {
    it('returns 400 when request body is empty', async () => {
      const requestWithEmptyBody = new NextRequest('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })
      jest.spyOn(requestWithEmptyBody, 'json').mockResolvedValue(null)

      const response = await POST(requestWithEmptyBody)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: { message: 'Invalid request body' },
      })
    })

    it('returns 400 when request body is not JSON', async () => {
      const requestWithInvalidJson = new NextRequest('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })
      jest.spyOn(requestWithInvalidJson, 'json').mockRejectedValue(new Error('Invalid JSON'))

      const response = await POST(requestWithInvalidJson)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: { message: 'Invalid request body' },
      })
    })

    it('returns 400 when request body has unexpected fields', async () => {
      const requestWithExtraFields = new NextRequest('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })
      jest.spyOn(requestWithExtraFields, 'json').mockResolvedValue({
        priceId: 'price_123',
        unexpectedField: 'should not be here',
        anotherField: 123,
      })

      const response = await POST(requestWithExtraFields)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: { message: 'Invalid request body' },
      })
    })
  })

  it('returns 401 when authorization header is missing', async () => {
    const requestWithoutAuth = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
    })
    jest.spyOn(requestWithoutAuth, 'json').mockResolvedValue({ priceId: 'price_123' })

    const response = await POST(requestWithoutAuth)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({
      error: { message: 'Missing authorization header' },
    })
  })

  it('returns 401 when authorization header is invalid', async () => {
    const requestWithInvalidAuth = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      headers: {
        authorization: 'InvalidHeader',
      },
    })
    jest.spyOn(requestWithInvalidAuth, 'json').mockResolvedValue({ priceId: 'price_123' })

    const response = await POST(requestWithInvalidAuth)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({
      error: { message: 'Missing authorization header' },
    })
  })

  it('returns 400 when price ID is missing', async () => {
    const requestWithoutPriceId = new NextRequest('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
      },
    })
    jest.spyOn(requestWithoutPriceId, 'json').mockResolvedValue({ priceId: undefined })

    const response = await POST(requestWithoutPriceId)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      error: { message: 'Missing price ID' },
    })
  })

  it('creates new customer and checkout session when no customer ID exists', async () => {
    // Mock Firestore to return no customer ID
    const mockGet = jest.fn().mockResolvedValue({ exists: true, ref: {}, data: () => ({}) })
    ;(adminDb.collection as jest.Mock).mockImplementation(() => ({
      doc: jest.fn().mockReturnValue({
        get: mockGet,
      }),
    }))

    // Mock Stripe customer creation
    ;(stripe.customers.create as jest.Mock).mockResolvedValue({
      id: 'cus_123',
    })

    // Mock Stripe checkout session creation
    ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
      url: 'https://checkout.stripe.com/test-session',
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    // Verify customer was created
    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      metadata: {
        firebaseUID: 'test-uid',
      },
    })

    // Verify checkout session was created
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_123',
      line_items: [
        {
          price: 'price_123',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/account?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/pricing',
      subscription_data: {
        metadata: {
          firebaseUID: 'test-uid',
        },
      },
    })

    // Verify response
    expect(response.status).toBe(200)
    expect(data).toEqual({
      url: 'https://checkout.stripe.com/test-session',
    })
  })

  it('uses existing customer ID from user document', async () => {
    // Mock Firestore to return existing customer ID from user document
    const mockUserGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ stripeCustomerId: 'existing_cus_123' }),
    })
    ;(adminDb.collection as jest.Mock).mockImplementation((collection) => ({
      doc: jest.fn().mockReturnValue({
        get: collection === 'users' ? mockUserGet : jest.fn().mockResolvedValue({ exists: false }),
      }),
    }))

    // Mock Stripe checkout session creation
    ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
      url: 'https://checkout.stripe.com/test-session',
    })

    const response = await POST(mockRequest)
    const data = await response.json()

    // Verify customer was not created
    expect(stripe.customers.create).not.toHaveBeenCalled()

    // Verify checkout session was created with existing customer ID
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: 'existing_cus_123',
      })
    )

    // Verify response
    expect(response.status).toBe(200)
    expect(data).toEqual({
      url: 'https://checkout.stripe.com/test-session',
    })
  })

  it('returns 500 when Firebase throws an unexpected error', async () => {
    // Mock Firebase Auth to throw an unexpected error
    (adminAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Unexpected Firebase error'))

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({
      error: { message: 'Invalid token' },
    })
  })

  it('returns 500 when Stripe throws an error', async () => {
    // Mock Firestore to return existing customer ID
    const mockGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ stripeCustomerId: 'cus_123' }),
    })
    ;(adminDb.collection as jest.Mock).mockImplementation(() => ({
      doc: jest.fn().mockReturnValue({
        get: mockGet,
      }),
    }))

    // Mock Stripe to throw an error
    ;(stripe.checkout.sessions.create as jest.Mock).mockRejectedValue(new Error('Stripe error'))

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      error: { message: 'Stripe error' },
    })
  })

  describe('Price ID Validation', () => {
    it('returns 400 when price ID is not a string', async () => {
      const requestWithInvalidPriceId = new NextRequest('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })
      jest.spyOn(requestWithInvalidPriceId, 'json').mockResolvedValue({
        priceId: 123, // number instead of string
      })

      const response = await POST(requestWithInvalidPriceId)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: { message: 'Invalid price ID format' },
      })
    })

    it('returns 400 when price ID does not start with price_', async () => {
      const requestWithInvalidPriceId = new NextRequest('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })
      jest.spyOn(requestWithInvalidPriceId, 'json').mockResolvedValue({
        priceId: 'invalid_123',
      })

      const response = await POST(requestWithInvalidPriceId)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: { message: 'Invalid price ID format' },
      })
    })

    it('returns 400 when price ID is too short', async () => {
      const requestWithInvalidPriceId = new NextRequest('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })
      jest.spyOn(requestWithInvalidPriceId, 'json').mockResolvedValue({
        priceId: 'price_', // missing the actual ID part
      })

      const response = await POST(requestWithInvalidPriceId)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: { message: 'Invalid price ID format' },
      })
    })

    it('returns 400 when price ID contains invalid characters', async () => {
      const requestWithInvalidPriceId = new NextRequest('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          authorization: 'Bearer valid-token',
        },
      })
      jest.spyOn(requestWithInvalidPriceId, 'json').mockResolvedValue({
        priceId: 'price_123$%^', // contains invalid special characters
      })

      const response = await POST(requestWithInvalidPriceId)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: { message: 'Invalid price ID format' },
      })
    })
  })

  describe('Stripe Session Configuration', () => {
    beforeEach(() => {
      // Mock Firestore to return existing customer ID
      const mockUserGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ stripeCustomerId: 'cus_existing' }),
      })
      ;(adminDb.collection as jest.Mock).mockImplementation(() => ({
        doc: jest.fn().mockReturnValue({
          get: mockUserGet,
        }),
      }))

      // Mock successful session creation
      ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
        url: 'https://checkout.stripe.com/test-session',
      })
    })

    it('creates session with correct subscription configuration', async () => {
      const response = await POST(mockRequest)
      await response.json()

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          customer: 'cus_existing',
          line_items: [
            {
              price: 'price_123',
              quantity: 1,
            },
          ],
        })
      )
    })

    it('includes correct success and cancel URLs', async () => {
      const response = await POST(mockRequest)
      await response.json()

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: 'http://localhost:3000/account?session_id={CHECKOUT_SESSION_ID}',
          cancel_url: 'http://localhost:3000/pricing',
        })
      )
    })

    it('includes correct metadata in subscription data', async () => {
      const response = await POST(mockRequest)
      await response.json()

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_data: {
            metadata: {
              firebaseUID: 'test-uid',
            },
          },
        })
      )
    })

    it('handles custom success URL query parameters', async () => {
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000?existing=param'
      
      const response = await POST(mockRequest)
      await response.json()

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: expect.stringContaining('session_id={CHECKOUT_SESSION_ID}'),
        })
      )

      // Reset the environment variable
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    })
  })

  describe('Firebase Token Validation', () => {
    it('returns 401 when token is expired', async () => {
      const requestWithExpiredToken = new NextRequest('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          authorization: 'Bearer expired_token',
        },
      })
      jest.spyOn(requestWithExpiredToken, 'json').mockResolvedValue({
        priceId: 'price_123',
      })

      // Mock Firebase Auth to throw token expired error
      ;(adminAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('auth/id-token-expired'))

      const response = await POST(requestWithExpiredToken)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        error: { message: 'Token expired' },
      })
    })

    it('returns 401 when token is from different Firebase project', async () => {
      const requestWithWrongProject = new NextRequest('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          authorization: 'Bearer wrong_project_token',
        },
      })
      jest.spyOn(requestWithWrongProject, 'json').mockResolvedValue({
        priceId: 'price_123',
      })

      // Mock Firebase Auth to throw project mismatch error
      ;(adminAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('auth/argument-error: Wrong project ID'))

      const response = await POST(requestWithWrongProject)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        error: { message: 'Invalid token' },
      })
    })

    it('returns 401 when token has invalid claims', async () => {
      const requestWithInvalidClaims = new NextRequest('http://localhost:3000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          authorization: 'Bearer token_with_invalid_claims',
        },
      })
      jest.spyOn(requestWithInvalidClaims, 'json').mockResolvedValue({
        priceId: 'price_123',
      })

      // Mock Firebase Auth to throw claims error
      ;(adminAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('auth/claims-too-large'))

      const response = await POST(requestWithInvalidClaims)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({
        error: { message: 'Invalid token' },
      })
    })

    it('verifies token with correct configuration', async () => {
      await POST(mockRequest)

      expect(adminAuth.verifyIdToken).toHaveBeenCalledWith('valid-token')
    })
  })

  describe('Database Operations', () => {
    let mockUpdate: jest.Mock;
    let mockDoc: jest.Mock;

    beforeEach(() => {
      mockUpdate = jest.fn();
      mockDoc = jest.fn(() => ({
        update: mockUpdate,
      }));
      (adminDb.collection as jest.Mock).mockImplementation(() => ({
        doc: mockDoc,
      }));
    })

    it('updates user document with new customer ID', async () => {
      // Mock Firestore to return user document exists but no customer ID
      const mockUserGet = jest.fn().mockResolvedValue({
        exists: true,
        ref: { id: 'test-uid' },
        data: () => ({}),
      })
      ;(adminDb.collection as jest.Mock).mockImplementation(() => ({
        doc: jest.fn().mockReturnValue({
          get: mockUserGet,
        }),
      }))

      // Mock Stripe customer creation
      ;(stripe.customers.create as jest.Mock).mockResolvedValue({
        id: 'new_cus_123',
      })

      await POST(mockRequest)

      // Verify batch update was called with correct data
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          stripeCustomerId: 'new_cus_123',
        })
      )
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('updates both user and profile documents when they exist', async () => {
      // Mock Firestore to return both documents exist but no customer ID
      const mockUserGet = jest.fn().mockResolvedValue({
        exists: true,
        ref: { id: 'test-uid' },
        data: () => ({}),
      })
      const mockProfileGet = jest.fn().mockResolvedValue({
        exists: true,
        ref: { id: 'test-uid' },
        data: () => ({}),
      })
      ;(adminDb.collection as jest.Mock).mockImplementation((collection) => ({
        doc: jest.fn().mockReturnValue({
          get: collection === 'users' ? mockUserGet : mockProfileGet,
        }),
      }))

      // Mock Stripe customer creation
      ;(stripe.customers.create as jest.Mock).mockResolvedValue({
        id: 'new_cus_123',
      })

      await POST(mockRequest)

      // Verify both documents were updated
      expect(mockUpdate).toHaveBeenCalledTimes(2)
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('handles Firestore batch commit failure', async () => {
      // Mock Firestore to return user document exists but no customer ID
      const mockUserGet = jest.fn().mockResolvedValue({
        exists: true,
        ref: { id: 'test-uid' },
        data: () => ({}),
      })
      ;(adminDb.collection as jest.Mock).mockImplementation(() => ({
        doc: jest.fn().mockReturnValue({
          get: mockUserGet,
        }),
      }))

      // Mock Stripe customer creation
      ;(stripe.customers.create as jest.Mock).mockResolvedValue({
        id: 'new_cus_123',
      })

      // Mock batch commit to fail
      mockUpdate.mockRejectedValue(new Error('Batch commit failed'))

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: { message: 'Batch commit failed' },
      })
    })

    it('handles concurrent updates gracefully', async () => {
      // Mock Firestore to simulate a concurrent update
      const mockUserGet = jest.fn().mockResolvedValue({
        exists: true,
        ref: { id: 'test-uid' },
        data: () => ({}),
      })
      ;(adminDb.collection as jest.Mock).mockImplementation(() => ({
        doc: jest.fn().mockReturnValue({
          get: mockUserGet,
        }),
      }))

      // Mock batch commit to fail with a concurrent modification error
      mockUpdate.mockRejectedValue(new Error('Error: 10 ABORTED: The transaction was aborted.'))

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({
        error: { message: 'Error: 10 ABORTED: The transaction was aborted.' },
      })
    })
  })
}) 