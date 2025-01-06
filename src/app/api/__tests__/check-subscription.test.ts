import { NextRequest } from 'next/server'
import { GET } from '../check-subscription/route'
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
  },
}))

// Mock Stripe
jest.mock('@/lib/stripe', () => ({
  stripe: {
    subscriptions: {
      list: jest.fn(),
    },
  },
}))

// Mock NextRequest
const createMockRequest = (headers?: Record<string, string>) => {
  return {
    headers: {
      get: (name: string) => headers?.[name] || null,
    },
  } as unknown as NextRequest
}

describe('GET /api/check-subscription', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Create a new mock request with authorization header
    mockRequest = createMockRequest({
      authorization: 'Bearer valid-token',
    })
  })

  it('returns 401 when authorization header is missing', async () => {
    const requestWithoutAuth = createMockRequest()
    const response = await GET(requestWithoutAuth)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({
      error: { message: 'Missing authorization header' },
    })
  })

  it('returns 401 when authorization header is invalid', async () => {
    const requestWithInvalidAuth = createMockRequest({
      authorization: 'InvalidHeader',
    })
    const response = await GET(requestWithInvalidAuth)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({
      error: { message: 'Missing authorization header' },
    })
  })

  it('returns 404 when no Stripe customer is found', async () => {
    // Mock Firebase Auth to return a valid token
    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'test-uid' })

    // Mock Firestore to return no customer ID
    const mockGet = jest.fn().mockResolvedValue({ exists: false })
    ;(adminDb.collection as jest.Mock).mockImplementation(() => ({
      doc: jest.fn().mockReturnValue({
        get: mockGet,
      }),
    }))

    const response = await GET(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({
      error: { message: 'No Stripe customer found' },
    })
  })

  it('returns active subscription when found in user document', async () => {
    // Mock Firebase Auth to return a valid token
    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'test-uid' })

    // Mock Firestore to return a customer ID from user document
    const mockUserGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ stripeCustomerId: 'cus_123' }),
    })
    ;(adminDb.collection as jest.Mock).mockImplementation((collection) => ({
      doc: jest.fn().mockReturnValue({
        get: collection === 'users' ? mockUserGet : jest.fn().mockResolvedValue({ exists: false }),
      }),
    }))

    // Mock Stripe to return an active subscription
    ;(stripe.subscriptions.list as jest.Mock).mockResolvedValue({
      data: [{ id: 'sub_123', status: 'active' }],
    })

    const response = await GET(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      active: true,
      subscription: { id: 'sub_123', status: 'active' },
    })
  })

  it('returns active subscription when found in profile document', async () => {
    // Mock Firebase Auth to return a valid token
    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'test-uid' })

    // Mock Firestore to return a customer ID from profile document
    const mockUserGet = jest.fn().mockResolvedValue({ exists: false })
    const mockProfileGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ stripeCustomerId: 'cus_123' }),
    })
    ;(adminDb.collection as jest.Mock).mockImplementation((collection) => ({
      doc: jest.fn().mockReturnValue({
        get: collection === 'users' ? mockUserGet : mockProfileGet,
      }),
    }))

    // Mock Stripe to return an active subscription
    ;(stripe.subscriptions.list as jest.Mock).mockResolvedValue({
      data: [{ id: 'sub_123', status: 'active' }],
    })

    const response = await GET(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      active: true,
      subscription: { id: 'sub_123', status: 'active' },
    })
  })

  it('returns inactive status when no active subscriptions found', async () => {
    // Mock Firebase Auth to return a valid token
    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'test-uid' })

    // Mock Firestore to return a customer ID
    const mockGet = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({ stripeCustomerId: 'cus_123' }),
    })
    ;(adminDb.collection as jest.Mock).mockImplementation(() => ({
      doc: jest.fn().mockReturnValue({
        get: mockGet,
      }),
    }))

    // Mock Stripe to return no active subscriptions
    ;(stripe.subscriptions.list as jest.Mock).mockResolvedValue({
      data: [],
    })

    const response = await GET(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      active: false,
      subscription: null,
    })
  })

  it('returns 500 when Firebase throws an error', async () => {
    // Mock Firebase Auth to throw an error
    (adminAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Firebase error'))

    const response = await GET(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      error: { message: 'Firebase error' },
    })
  })

  it('returns 500 when Stripe throws an error', async () => {
    // Mock Firebase Auth to return a valid token
    (adminAuth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'test-uid' })

    // Mock Firestore to return a customer ID
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
    ;(stripe.subscriptions.list as jest.Mock).mockRejectedValue(new Error('Stripe error'))

    const response = await GET(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      error: { message: 'Stripe error' },
    })
  })
}) 